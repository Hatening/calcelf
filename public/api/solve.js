const { getUser, admin } = require('../lib/supabase');
const { charge, refund, COST } = require('../lib/credits');
const { ip, hmac, turnstile } = require('../lib/security');
const { allow } = require('../lib/rate');
const { responses, streamResponses } = require('../lib/openai');
const { verifyResult } = require('../lib/verify');
const crypto = require('crypto');
const JSON_DELIMITER = '@@CALCELF_JSON@@';

// 流式分流器：模型先吐“儿童化讲解纯文本”（实时转发给前端），
// 见到分隔符后，剩余部分才是结构化 JSON。
function makeStreamSplitter(onProse) {
  const D = JSON_DELIMITER;
  let mode = ''; // '' | prose | done | json
  let buf = '', prose = '', jsonRaw = '';
  function feed(chunk) {
    if (!chunk) return;
    if (!mode) {
      const lead = (buf + chunk).trimStart();
      if (lead.startsWith('{')) mode = 'json';
      else if (lead.length) mode = 'prose';
    }
    if (mode === 'json') { jsonRaw += (buf || '') + chunk; buf = ''; return; }
    if (mode !== 'prose') { buf += chunk; return; }
    const text = buf + chunk; buf = '';
    const i = text.indexOf(D);
    if (i >= 0) {
      const head = text.slice(0, i);
      if (head) { prose += head; onProse(head); }
      jsonRaw = text.slice(i + D.length); mode = 'done';
    } else {
      const keep = Math.min(text.length, D.length - 1);
      const emit = text.slice(0, text.length - keep);
      if (emit) { prose += emit; onProse(emit); }
      buf = text.slice(text.length - keep);
    }
  }
  function end() {
    if (mode === 'done' || mode === 'json') jsonRaw += buf;
    else prose += buf;
    return { prose: prose.trim(), jsonRaw: jsonRaw.trim() };
  }
  return { feed, end };
}
// v5.9 模型级联（默认 DeepSeek 官方）：flash（快/省）→ pro（难/格式失败）
const SOLVE_MODEL = process.env.SOLVE_MODEL || 'deepseek-flash';
const SOLVE_STRONG_MODEL = process.env.SOLVE_STRONG_MODEL || 'deepseek-v4-pro';
const SOLVE_SAFETY_MODEL = process.env.SOLVE_SAFETY_MODEL || 'deepseek-v4-pro';
const STREAM_OPTS = {
  firstTokenMs: Number(process.env.AI_STREAM_FIRST_TOKEN_MS || 8000),
  idleMs: Number(process.env.AI_STREAM_IDLE_MS || 15000)
};
const LIGHT_TIMEOUT_MS = Number(process.env.AI_LIGHT_TIMEOUT_MS || 20000);

function tryJSON(t){ try { return JSON.parse(t); } catch (e) { return undefined; } }
function parse(s) {
  let x = String(s || '').trim();
  if (!x) throw Error('AI returned an empty response');
  // 1) fenced code block (with or without json tag)
  const fence = x.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) x = fence[1].trim();
  // 2) direct / trailing-comma tolerant
  let j = tryJSON(x) || tryJSON(x.replace(/,\s*([}\]])/g, '$1'));
  if (j) return j;
  // 3) balanced-brace scan of the first JSON object (ignores prose around it)
  const start = x.indexOf('{');
  if (start >= 0) {
    let depth = 0, inStr = false, esc = false;
    for (let i = start; i < x.length; i++) {
      const ch = x[i];
      if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; }
      else if (ch === '"') inStr = true;
      else if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) {
        const cand = x.slice(start, i + 1).replace(/,\s*([}\]])/g, '$1');
        j = tryJSON(cand); if (j) return j; break;
      } }
    }
  }
  throw Error('AI output is not valid JSON');
}

// SSE 发送辅助
function sse(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function normalizeResult(result){
  const sols=(Array.isArray(result.solutions)?result.solutions:[]).map(m=>{
    const steps=(Array.isArray(m.steps)?m.steps:[]).map((st,idx)=>({
      step:st.step??st.n??st.index??st.num??st.order??(idx+1),
      description:String(st.description??st.text??st.desc??st.content??st.body??st.explanation??'').trim(),
      formula:String(st.formula??st.equation??st.math??st.expression??'').trim()
    })).filter(st=>st.description||st.formula);
    return Object.assign({},m,{steps});
  }).filter(m=>m.steps.length>0).slice(0,3);
  if(!sols.length) throw Error('AI returned no usable solution steps');
  result.solutions=sols;
  if(!result.question_text) result.question_text=result.problem_text||result.question||'';
  return result;
}

// v6.0: 问题哈希（与 rate-animation / asked_questions 一致）
function problemHash(text){ return crypto.createHash('sha256').update(String(text||'').replace(/\s+/g,' ').trim()).digest('hex'); }

module.exports = async (req, res) => {
  let u = null, isAnon = false, c = null, charged = false;
  let isGraceMode = false, freeToday = 0;
  const today = new Date().toISOString().slice(0, 10);

  // 流式模式：先设置 SSE 头
  const wantsStream = req.query && req.query.stream === '1';

  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    u = await getUser(req);
    if (!u) return res.status(401).json({ error: 'Sign in required' });
    isAnon = u.is_anonymous === true;

    const b = req.body || {};
    if (!b.imageBase64 && !String(b.text || '').trim()) return res.status(400).json({ error: 'Please provide a problem' });

    if (!(await turnstile(b.turnstileToken, ip(req)))) return res.status(403).json({ error: 'Human verification required' });

    const mAllow = isAnon ? await allow(req, u.id, 'solve_m', 60, 3) : await allow(req, u.id, 'solve_m', 60, 8);
    const hAllow = isAnon ? await allow(req, u.id, 'solve_h', 3600, 10) : await allow(req, u.id, 'solve_h', 3600, 60);
    if (!mAllow || !hAllow) return res.status(429).json({ error: 'Too many requests.' });

    const reqId = crypto.randomUUID();
    const ih = b.installId ? hmac(b.installId) : null;

    const sb = admin();
    const { data: profile } = await sb.from('profiles')
      .select('credits_monthly,credits_paid,credits_bonus,free_solves_today,free_solves_day,stage_band,explain_level,subject_pref')
      .eq('id', u.id).single();

    freeToday = profile?.free_solves_today || 0;
    if (profile?.free_solves_day !== today) {
      freeToday = 0;
      await sb.from('profiles').update({ free_solves_today: 0, free_solves_day: today }).eq('id', u.id);
    }

    if (isAnon && freeToday >= 3) return res.status(403).json({ error: 'Anonymous free limit reached', code: 'ANON_LIMIT_REACHED' });

    const totalCredits = (profile?.credits_monthly||0) + (profile?.credits_paid||0) + (profile?.credits_bonus||0);
    if (totalCredits <= 0 && !isAnon) return res.status(402).json({ error: 'Not enough Credits', code: 'INSUFFICIENT_CREDITS' });

    if (isAnon || (totalCredits > 0 && totalCredits < COST.solve)) {
      isGraceMode = true;
      if (!isAnon) await sb.from('profiles').update({ credits_monthly:0,credits_paid:0,credits_bonus:0 }).eq('id', u.id);
      c = { ok:true, remaining:0, free:isAnon };
      charged = true;
    } else {
      c = await charge(u.id, COST.solve, 'solve', reqId);
      if (!c || !c.ok) return res.status(402).json({ error:'Not enough Credits', code:'INSUFFICIENT_CREDITS' });
      charged = true;
    }

    const stage = (b.stage && b.stage!=='prefer_not') ? String(b.stage) : String(profile?.stage_band || 'prefer_not');
    const lang = String(b.language || 'en');
    const explainLevel = ['answer_only','steps','detailed'].includes(b.explain_level) ? b.explain_level : String(profile?.explain_level || 'steps');
    const subjectPref = String(b.subject_pref || profile?.subject_pref || '').split(',').map(x=>x.trim()).filter(Boolean);
    const detailRule = explainLevel==='answer_only'
      ? 'DETAIL=answer_only: give the final answer prominently; each solution method may have just 1-2 short steps.'
      : explainLevel==='detailed'
      ? 'DETAIL=detailed: be thorough — provide 2-3 methods, 5-8 steps each, explain WHY each step works, and add one common-mistake warning.'
      : 'DETAIL=steps: standard step-by-step, each method 3-7 clear steps.';
    const subjectRule = subjectPref.length ? ' Student focus subjects (adapt emphasis/vocabulary): '+subjectPref.join(', ')+'.' : '';
    const manual = String(b.text || '').slice(0, 12000);

    const prompt = `You are CalcElf, an educational AI tutor for K-12 students. Reply with ONLY a valid JSON object, no markdown fences, no text before or after. All human-readable strings MUST be written in this language: ${lang}. Learning stage: ${stage}.
Return EXACTLY this shape:
{"question_text":"<clean, complete restatement of the problem>","subject":"<e.g. Math / Physics / Chemistry>","difficulty":"easy|medium|hard","answer":"<the final answer, concise>","animation_worthy":<true for geometry/motion/rate problems that benefit from visualization, else false>,"solutions":[{"name":"<short name of this method, in ${lang}>","recommended":<true for the single best method, else false>,"steps":[{"step":1,"description":"<one clear, complete step written in ${lang}>","formula":"<the formula/equation for this step, plain text and unicode symbols, empty string if none>"}]}]}
Rules: provide 1 to 3 genuinely different solution methods; every step.description must be a non-empty complete sentence; never leave steps empty; do not use LaTex backslashes, use plain unicode; use age-appropriate, encouraging vocabulary. ${detailRule}${subjectRule}
Problem / manual correction to solve:
${manual}`;

    const parts = [{ type:'text', text: prompt }];
    if (b.imageBase64 && !b.forceIgnoreClarification) {
      const mime = ['image/jpeg','image/png','image/webp'].includes(b.imageMime) ? b.imageMime : 'image/jpeg';
      parts.push({ type:'image_url', image_url:{ url:`data:${mime};base64,${b.imageBase64}` } });
    }
    // 精简兜底请求（仅在首次输出无法解析时使用）：1 种解法、最多 5 步，保证先拿到讲解
    const compactParts = [{ type:'text', text: prompt + '\n\nIMPORTANT: Output ONLY the JSON object, compact. Provide EXACTLY ONE solution method with at most 5 short steps. No markdown, no commentary.' }];
    if (b.imageBase64 && !b.forceIgnoreClarification) compactParts.push(parts[parts.length-1]);

    // 流式协议提示词：先输出儿童化讲解纯文本（逐字下发），再分隔符，再严格 JSON
    const jsonShape = '{"question_text":"<clean complete restatement>","subject":"<Math/Physics/Chemistry>","difficulty":"easy|medium|hard","answer":"<final answer, concise>","animation_worthy":<boolean>,"solutions":[{"name":"<short method name in '+lang+'>","recommended":<boolean>,"steps":[{"step":1,"description":"<one complete step sentence in '+lang+'>","formula":"<plain unicode formula or empty string>"}]}]}';
    const streamPrompt = `You are CalcElf, an educational AI tutor for K-12 students. All human-readable text MUST be in language: ${lang}. Learning stage: ${stage}.
Respond in EXACTLY three sections and nothing else:
SECTION 1 — a child-friendly walkthrough as PLAIN TEXT (no JSON, no markdown fences): one short encouraging intro sentence, then numbered lines like "1. ...", each a single clear step a kid can follow. Use plain unicode math (+ − × ÷ = and fractions like 1/4); never use LaTeX backslashes. ${detailRule}${subjectRule}
SECTION 2 — a line containing exactly this token and nothing else:
${JSON_DELIMITER}
SECTION 3 — ONE valid JSON object only (no code fences), EXACTLY this shape:
${jsonShape}
Rules for the JSON: 1 to 3 genuinely different methods; every step.description a non-empty complete sentence; never empty steps; no LaTeX, use plain unicode; age-appropriate encouraging words.
Problem / manual correction to solve:
${manual}`;
    const streamParts = [{ type:'text', text: streamPrompt }];
    if (b.imageBase64 && !b.forceIgnoreClarification) {
      const mime2 = ['image/jpeg','image/png','image/webp'].includes(b.imageMime) ? b.imageMime : 'image/jpeg';
      streamParts.push({ type:'image_url', image_url:{ url:`data:${mime2};base64,${b.imageBase64}` } });
    }

    // ===== 流式模式（新增）=====
    if (wantsStream) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      });

      sse(res, 'progress', { step: 'recognizing' });
      // SSE 心跳：模型思考较久时防止平台/代理因空闲掐断连接
      const hb = setInterval(() => { try { res.write(': ping\n\n'); } catch (_) {} }, 8000);
      try {
        let solvingSent = false;
        let proseDelivered = false;
        const splitter = makeStreamSplitter((proseChunk) => {
          if (!solvingSent) { solvingSent = true; sse(res, 'progress', { step: 'solving' }); }
          if (proseChunk) { proseDelivered = true; sse(res, 'delta', { text: proseChunk }); }
        });
        // 精简 JSON 非流式兜底（按模型级联）
        const compactJson = async (model) => {
          const rf = await responses([{ role:'user', content: compactParts }], model, 4000, LIGHT_TIMEOUT_MS);
          return normalizeResult(parse(rf.text));
        };
        let fullText = '';
        try {
          fullText = await streamResponses(
            [{ role:'user', content: streamParts }],
            SOLVE_MODEL,
            9000,
            (d) => splitter.feed(d),
            STREAM_OPTS
          );
        } catch (streamErr) {
          // 首字超时/空闲超时/连接错误：8s 无信号即切换，不死等
          console.error('[solve] primary stream failed:', SOLVE_MODEL, streamErr.message);
          sse(res, 'progress', { step: 'solving' });
          if (!proseDelivered) {
            // 还没给用户吐过字：用强模型重新走流式，体验不变
            try {
              fullText = await streamResponses(
                [{ role:'user', content: streamParts }],
                SOLVE_STRONG_MODEL, 9000,
                (d) => splitter.feed(d), STREAM_OPTS
              );
            } catch (strongErr) {
              console.error('[solve] strong stream failed:', SOLVE_STRONG_MODEL, strongErr.message);
              const rf = await responses([{ role:'user', content: compactParts }], SOLVE_SAFETY_MODEL, 4000, LIGHT_TIMEOUT_MS);
              fullText = rf.text || '';
            }
          } else {
            // 讲解已流出，只需静默补结构化 JSON：强模型 → 跨厂兜底
            try {
              const rf = await responses([{ role:'user', content: compactParts }], SOLVE_STRONG_MODEL, 4000, LIGHT_TIMEOUT_MS);
              fullText = rf.text || '';
            } catch (strongErr) {
              console.error('[solve] strong compact failed:', strongErr.message);
              const rf = await responses([{ role:'user', content: compactParts }], SOLVE_SAFETY_MODEL, 4000, LIGHT_TIMEOUT_MS);
              fullText = rf.text || '';
            }
          }
        }
        let { prose, jsonRaw } = splitter.end();
        if (!String(fullText||'').trim() && !jsonRaw) {
          sse(res, 'progress', { step: 'solving' });
          const rf = await responses([{ role:'user', content: compactParts }], SOLVE_STRONG_MODEL, 4000, LIGHT_TIMEOUT_MS);
          fullText = rf.text || '';
        }

        let result;
        try {
          result = normalizeResult(parse(jsonRaw || fullText));
        } catch (parseErr) {
          // 解析失败：强模型精简重试，再失败跨厂兜底
          console.error('[solve] JSON parse failed, compact strong:', parseErr.message);
          sse(res, 'progress', { step: 'solving' });
          try { result = await compactJson(SOLVE_STRONG_MODEL); }
          catch (strongErr) {
            console.error('[solve] strong compact parse failed, safety model:', strongErr.message);
            result = await compactJson(SOLVE_SAFETY_MODEL);
          }
        }
        result.walkthrough = prose || '';

        // 确定性验证：算术/一元一次方程；答案对不上 → 强模型重算 → 跨厂再算
        try {
          let v = verifyResult(result);
          if (v.status === 'mismatch') {
            console.error('[solve] verification mismatch, recompute. expected=', v.expected, 'got=', v.got);
            sse(res, 'progress', { step: 'solving' });
            try {
              const nr = await compactJson(SOLVE_STRONG_MODEL);
              const v2 = verifyResult(nr);
              if (v2.status !== 'mismatch') { result = nr; v = v2; }
              else {
                try {
                  const nr2 = await compactJson(SOLVE_SAFETY_MODEL);
                  const v3 = verifyResult(nr2);
                  if (v3.status !== 'mismatch') { result = nr2; v = v3; }
                } catch (safetyErr) { console.error('[solve] safety recompute failed:', safetyErr.message); }
                result.verification = v;
              }
            } catch (strongErr) { result.verification = v; }
          } else {
            result.verification = v;
          }
        } catch (e) { result.verification = { status: 'unverified', reason: e.message }; }

        if (result.need_clarification) {
          sse(res, 'done', { need_clarification: true, clarification_msg: result.clarification_msg });
        } else {
          // v6.0: 落一条 asked_questions 记录（静默失败，不阻断响应）
          let qid = null;
          try {
            const qSource = b.imageBase64 ? 'image' : (b.source === 'voice' ? 'voice' : 'text');
            const qText = result.question_text || manual;
            const { data: qIns } = await sb.from('asked_questions').insert({
              user_id: u.id,
              problem_text: qText,
              problem_hash: problemHash(qText),
              source: qSource,
              lang,
              stage,
              model: SOLVE_MODEL,
              created_at: new Date().toISOString()
            }).select('qid').single();
            qid = qIns?.qid || null;
          } catch (qErr) { console.error('[solve] asked_questions insert failed (non-blocking):', qErr && qErr.message); qid = null; }
          sse(res, 'result', { result, credits: c.remaining, is_grace: isGraceMode, qid });
        }
      } catch (e) {
        console.error('[solve] stream branch error:', e.message);
        try { sse(res, 'error', { message: e.message || 'AI error' }); } catch (_) {}
      } finally {
        clearInterval(hb);
      }

      res.end();

      // 异步记录用量
      try {
        if (isAnon) await sb.from('profiles').update({ free_solves_today: freeToday+1, free_solves_day: today }).eq('id', u.id);
        await sb.from('solve_usage').insert({ user_id:u.id, service:'solve', credits_charged:(isGraceMode||isAnon)?0:COST.solve });
      } catch(e) {}
      return;
    }

    // ===== 原有非流式模式（保留兼容），同样走 flash → pro → glm 级联 =====
    let result, used;
    try {
      used = await responses([{ role:'user', content: parts }], SOLVE_MODEL, 8000);
      result = normalizeResult(parse(used.text));
    } catch (err1) {
      console.error('[solve] non-stream primary failed:', err1.message);
      try {
        used = await responses([{ role:'user', content: parts }], SOLVE_STRONG_MODEL, 8000, 45000);
        result = normalizeResult(parse(used.text));
      } catch (err2) {
        used = await responses([{ role:'user', content: compactParts }], SOLVE_SAFETY_MODEL, 4000, LIGHT_TIMEOUT_MS);
        result = normalizeResult(parse(used.text));
      }
    }
    try {
      let v = verifyResult(result);
      if (v.status === 'mismatch') {
        try {
          const rr = await responses([{ role:'user', content: compactParts }], SOLVE_STRONG_MODEL, 4000, LIGHT_TIMEOUT_MS);
          const nr = normalizeResult(parse(rr.text)); const v2 = verifyResult(nr);
          if (v2.status !== 'mismatch') { result = nr; used = rr; v = v2; }
        } catch (e) {}
      }
      result.verification = v;
    } catch (e) { result.verification = { status:'unverified' }; }
    if (result.need_clarification) {
      if (charged && c && c.ok && !isGraceMode) {
        try { if(c.used_bonus) await refund(u.id,c.used_bonus,'bonus','solve_clarification_refund_bonus',crypto.randomUUID()); } catch(e){}
      }
      return res.status(200).json({ need_clarification:true, clarification_msg:result.clarification_msg });
    }
    if (isAnon) await sb.from('profiles').update({ free_solves_today:freeToday+1, free_solves_day:today }).eq('id', u.id);
    await sb.from('solve_usage').insert({ user_id:u.id, service:'solve', credits_charged:(isGraceMode||isAnon)?0:COST.solve, model:SOLVE_MODEL, input_tokens:used.usage?.input_tokens, output_tokens:used.usage?.output_tokens });
    // v6.0: 落一条 asked_questions 记录（静默失败，不阻断响应）
    let qid = null;
    try {
      const qSource = b.imageBase64 ? 'image' : (b.source === 'voice' ? 'voice' : 'text');
      const qText = result.question_text || manual;
      const { data: qIns } = await sb.from('asked_questions').insert({
        user_id: u.id,
        problem_text: qText,
        problem_hash: problemHash(qText),
        source: qSource,
        lang,
        stage,
        model: SOLVE_MODEL,
        created_at: new Date().toISOString()
      }).select('qid').single();
      qid = qIns?.qid || null;
    } catch (qErr) { console.error('[solve] asked_questions insert failed (non-blocking):', qErr && qErr.message); qid = null; }
    res.status(200).json({ result, credits:c.remaining, is_grace:isGraceMode, is_anonymous:isAnon, qid });

  } catch (e) {
    if (charged && c && c.ok && !isGraceMode && u) {
      try {
        if(c.used_bonus) await refund(u.id,c.used_bonus,'bonus','solve_failed_refund_bonus',crypto.randomUUID());
        if(c.used_monthly) await refund(u.id,c.used_monthly,'monthly','solve_failed_refund_monthly',crypto.randomUUID());
        if(c.used_paid) await refund(u.id,c.used_paid,'paid','solve_failed_refund_paid',crypto.randomUUID());
      } catch(e){}
    }
    console.error('solve error:', e);
    if (wantsStream) { try { sse(res,'error',{message:e.message}); res.end(); } catch(_){} }
    else res.status(500).json({ error:e.message||'Solve error' });
  }
};
