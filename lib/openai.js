const DASHSCOPE_API_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = 'https://ws-v6ybxxoq10457erd.us-east-1.maas.aliyuncs.com/compatible-mode/v1';

async function responses(input, model, maxOutputTokens = 6000) {
  const apiUrl = `${BASE_URL}/chat/completions`;
  const body = {
    model: model,
    messages: input.map(item => ({
      role: item.role,
      content: typeof item.content === 'string' ? item.content : JSON.stringify(item.content)
    })),
    max_tokens: maxOutputTokens
  };
  const r = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${DASHSCOPE_API_KEY}` },
    body: JSON.stringify(body)
  });
  const t = await r.text();
  if (!r.ok) throw Error(`AI ${r.status}: ${t.slice(0,350)}`);
  const j = JSON.parse(t);
  const msg = j.choices?.[0]?.message || {};
  return { text: msg.content || '', reasoning: msg.reasoning_content || '', usage: j.usage || {} };
}

// ===== 新增：流式响应（SSE）=====
// onChunk(chunkText) 每收到一段调用一次；返回完整文本。
async function streamResponses(input, model, maxOutputTokens = 6000, onChunk) {
  const apiUrl = `${BASE_URL}/chat/completions`;
  const body = {
    model: model,
    messages: input.map(item => ({
      role: item.role,
      content: typeof item.content === 'string' ? item.content : JSON.stringify(item.content)
    })),
    max_tokens: maxOutputTokens,
    stream: true
  };
  const r = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${DASHSCOPE_API_KEY}` },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw Error(`AI ${r.status}: stream failed`);

  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
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
          if (onChunk) onChunk(delta);
        }
      } catch(e) {}
    }
  }
  return full;
}

module.exports = { responses, streamResponses };
