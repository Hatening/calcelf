// v5.9：供应商地址与 Key 全部环境化，不再写死阿里云地址。
//   默认走 DeepSeek 官方 OpenAI 兼容端点；也可通过环境变量填回阿里云或任意 OpenAI 兼容服务。
const API_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
const BASE_URL = (
  process.env.DEEPSEEK_BASE_URL ||
  process.env.OPENAI_BASE_URL ||
  process.env.AI_BASE_URL ||
  'https://api.deepseek.com'
).replace(/\/+$/, '');

// 非流式调用；timeoutMs 可按任务传入（聊天/练习等短任务用更短超时）
async function responses(input, model, maxOutputTokens = 6000, timeoutMs, extra = null) {
  const apiUrl = `${BASE_URL}/chat/completions`;
  const body = {
    model: model,
    messages: input.map(item => ({
      role: item.role,
      content: item.content
    }))
  };
  // 只有显式给出正数时才设置 max_tokens；留空/0 则不传，让模型用其默认最大输出
  if (Number(maxOutputTokens) > 0) body.max_tokens = Number(maxOutputTokens);
  // 额外参数（temperature / reasoning_effort / enable_thinking 等），合并进请求体
  if (extra && typeof extra === 'object') Object.assign(body, extra);
  const ctrl = new AbortController();
  const ms = Number(timeoutMs || process.env.AI_FETCH_TIMEOUT_MS || 60000);
  const timer = setTimeout(() => ctrl.abort(), ms);
  let r;
  try {
    r = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${API_KEY}` },
      body: JSON.stringify(body), signal: ctrl.signal
    });
  } catch (e) { clearTimeout(timer); throw Error(e.name==='AbortError' ? 'AI request timeout' : ('AI request failed: '+e.message)); }
  clearTimeout(timer);
  const t = await r.text();
  if (!r.ok) throw Error(`AI ${r.status}: ${t.slice(0,350)}`);
  const j = JSON.parse(t);
  const msg = j.choices?.[0]?.message || {};
  return { text: msg.content || '', reasoning: msg.reasoning_content || '', usage: j.usage || {} };
}

// ===== 流式响应（SSE）=====
// onChunk(chunkText) 每收到一段正文调用一次；返回完整文本。
// opts.firstTokenMs：首字超时（默认 8s，超时即应切换备选模型）
// opts.idleMs：两个正文片段之间的最大空闲（默认 15s）
async function streamResponses(input, model, maxOutputTokens = 6000, onChunk, opts = {}) {
  const firstMs = Number(opts.firstTokenMs || process.env.AI_STREAM_FIRST_TOKEN_MS || 8000);
  const idleMs = Number(opts.idleMs || process.env.AI_STREAM_IDLE_MS || 15000);
  const apiUrl = `${BASE_URL}/chat/completions`;
  const body = {
    model: model,
    messages: input.map(item => ({
      role: item.role,
      content: item.content
    })),
    max_tokens: maxOutputTokens,
    stream: true
  };
  const ctrl = new AbortController();
  let abortReason = '';
  const firstTimer = setTimeout(() => { abortReason = 'AI first-token timeout'; ctrl.abort(); }, firstMs);
  let r;
  try {
    r = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${API_KEY}` },
      body: JSON.stringify(body), signal: ctrl.signal
    });
  } catch (e) {
    clearTimeout(firstTimer);
    throw Error(abortReason || ('AI stream request failed: ' + e.message));
  }
  clearTimeout(firstTimer);
  if (!r.ok) { const tt = await r.text().catch(()=> ''); throw Error(`AI ${r.status}: stream failed ${tt.slice(0,200)}`); }

  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let buffer = '';
  let idleTimer = null;
  let gotContent = false;

  while (true) {
    let chunk;
    const readPromise = reader.read();
    const timeoutPromise = new Promise((_, rej) => { idleTimer = setTimeout(() => rej(Error('idle')), idleMs); });
    try { chunk = await Promise.race([readPromise, timeoutPromise]); }
    catch (e) {
      try { ctrl.abort(); } catch (_) {}
      throw Error(gotContent ? 'AI stream idle timeout' : 'AI first-token timeout');
    }
    finally { clearTimeout(idleTimer); }
    const { done, value } = chunk;
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') continue;
      try {
        const j = JSON.parse(data);
        const delta = j.choices?.[0]?.delta?.content || '';
        if (delta) {
          full += delta;
          gotContent = true;
          if (onChunk) onChunk(delta);
        }
      } catch(e) {}
    }
  }
  return full;
}

// ===== v5.7.1 统一模型表（均可被 Vercel 环境变量覆盖；默认值已内置，不配也能跑）=====
const MODELS = {
  solve: process.env.SOLVE_MODEL || 'deepseek-flash',
  solveStrong: process.env.SOLVE_STRONG_MODEL || 'deepseek-v4-pro',
  solveSafety: process.env.SOLVE_SAFETY_MODEL || 'deepseek-v4-pro',
  // 追问/批改/练习等轻任务：默认跟随解题主模型
  light: process.env.CHAT_MODEL || process.env.SOLVE_MODEL || 'deepseek-flash',
  lightFallback: process.env.LIGHT_FALLBACK_MODEL || 'deepseek-v4-pro',
  // 动画分镜
  anim: process.env.ANIMATION_MODEL || 'deepseek-flash',
  animFallback: process.env.ANIMATION_FALLBACK_MODEL || 'deepseek-v4-pro',
  // 图片识别（deepseek-flash 已原生支持多模态）
  visionFallback: process.env.VISION_FALLBACK_MODEL || 'deepseek-flash'
};

// 按顺序尝试模型；前一个超时/报错/5xx/429 立即切下一个，不死等。
// 返回 { text, reasoning, usage, model }；全部失败抛最后一个错误。
async function responsesWithFallback(input, maxTokens, modelList, timeoutMs) {
  let lastErr = null;
  for (const model of modelList) {
    try {
      const r = await responses(input, model, maxTokens, timeoutMs);
      if (!String(r.text || '').trim()) throw Error('empty response');
      return Object.assign(r, { model });
    } catch (e) {
      lastErr = e;
      console.error('[ai fallback]', model, '→', e.message);
    }
  }
  throw lastErr || Error('All models failed');
}

module.exports = { responses, streamResponses, responsesWithFallback, MODELS };
