const { getUser, admin } = require('../lib/supabase');
const { charge, refund, COST } = require('../lib/credits');
const { ip, hmac, turnstile } = require('../lib/security');
const { allow } = require('../lib/rate');
const { responses, streamResponses } = require('../lib/openai');
const crypto = require('crypto');

function parse(s) {
  const x = String(s || '').replace(/^```json/i, '').replace(/```$/, '').trim();
  try { return JSON.parse(x); } catch (e) {}
  const a = x.indexOf('{'), b = x.lastIndexOf('}');
  if (a >= 0 && b > a) return JSON.parse(x.slice(a, b + 1));
  throw Error('AI output is not valid JSON');
}

// SSE 发送辅助
function sse(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

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
      .select('credits_monthly,credits_paid,credits_bonus,free_solves_today,free_solves_day')
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

    const stage = String(b.stage || 'prefer_not');
    const lang = String(b.language || 'en');
    const manual = String(b.text || '').slice(0, 12000);

    const prompt = `You are CalcElf, an educational AI tutor. Reply in ${lang}. Learning stage: ${stage}. Return JSON only with keys question_text,subject,difficulty,answer,animation_worthy,solutions. solutions has 1-3 genuinely different methods. Use age-appropriate vocabulary. Manual correction: ${manual}.`;

    const parts = [{ type:'input_text', text: prompt }];
    if (b.imageBase64 && !b.forceIgnoreClarification) {
      const mime = ['image/jpeg','image/png','image/webp'].includes(b.imageMime) ? b.imageMime : 'image/jpeg';
      parts.push({ type:'input_image', image_url:`data:${mime};base64,${b.imageBase64}`, detail:'high' });
    }

    // ===== 流式模式（新增）=====
    if (wantsStream) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      });

      sse(res, 'progress', { step: 'recognizing', label: '正在识别题目…' });

      // 调用 AI，流式接收
      try {
        const fullText = await streamResponses(
          [{ role:'user', content: parts }],
          process.env.SOLVE_MODEL || 'deepseek-v4.1-flash',
          8000,
          (chunk) => { sse(res, 'delta', { text: chunk }); }
        );

        sse(res, 'progress', { step: 'solving', label: '正在生成思路…' });
        const result = parse(fullText);
        result.solutions = (result.solutions || []).slice(0, 3);

        if (result.need_clarification) {
          sse(res, 'done', { need_clarification: true, clarification_msg: result.clarification_msg });
        } else {
          sse(res, 'result', { result, credits: c.remaining, is_grace: isGraceMode });
        }
      } catch (e) {
        sse(res, 'error', { message: e.message || 'AI error' });
      }

      res.end();

      // 异步记录用量
      try {
        if (isAnon) await sb.from('profiles').update({ free_solves_today: freeToday+1, free_solves_day: today }).eq('id', u.id);
        await sb.from('solve_usage').insert({ user_id:u.id, service:'solve', credits_charged:(isGraceMode||isAnon)?0:COST.solve });
      } catch(e) {}
      return;
    }

    // ===== 原有非流式模式（保留兼容）=====
    const r = await responses([{ role:'user', content: parts }], process.env.SOLVE_MODEL||'deepseek-v4.1-flash', 8000);
    const result = parse(r.text);
    if (result.need_clarification) {
      if (charged && c && c.ok && !isGraceMode) {
        try { if(c.used_bonus) await refund(u.id,c.used_bonus,'bonus','solve_clarification_refund_bonus',crypto.randomUUID()); } catch(e){}
      }
      return res.status(200).json({ need_clarification:true, clarification_msg:result.clarification_msg });
    }
    result.solutions = (result.solutions||[]).slice(0,3);
    if (isAnon) await sb.from('profiles').update({ free_solves_today:freeToday+1, free_solves_day:today }).eq('id', u.id);
    await sb.from('solve_usage').insert({ user_id:u.id, service:'solve', credits_charged:(isGraceMode||isAnon)?0:COST.solve, model:process.env.SOLVE_MODEL, input_tokens:r.usage?.input_tokens, output_tokens:r.usage?.output_tokens });
    res.status(200).json({ result, credits:c.remaining, is_grace:isGraceMode, is_anonymous:isAnon });

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
