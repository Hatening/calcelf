const { getUser, admin } = require('../lib/supabase');
const { charge, refund, COST } = require('../lib/credits');
const { responsesWithFallback, MODELS } = require('../lib/openai');
const { allow } = require('../lib/rate');
const crypto = require('crypto');

const LIGHT_TIMEOUT_MS = Number(process.env.AI_LIGHT_TIMEOUT_MS || 20000);

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const u = await getUser(req);
    if (!u) return res.status(401).json({ error: 'Sign in required' });
    if (!(await allow(req, u.id, 'chat_m', 60, 12)) || !(await allow(req, u.id, 'chat_h', 3600, 120)))
      return res.status(429).json({ error: 'Too many follow-up questions. Please take a short break.' });
    const b = req.body || {};
    const c = await charge(u.id, COST.chat, 'chat', crypto.randomUUID());
    if (!c.ok) return res.status(402).json({ error: 'Not enough Credits', code: 'INSUFFICIENT_CREDITS' });

    const prompt = `You are CalcElf, a friendly K-12 math tutor. Answer ONLY about the current problem. Language: ${b.language || 'en'}. Learning stage: ${b.stage || 'prefer_not'}. Problem summary: ${String(b.problem_summary || '').slice(0, 6000)}. Student question: ${String(b.question || '').slice(0, 1500)}. Explain the relevant step clearly with simple words a child understands (2-6 short sentences or a few short steps). Do not expose hidden chain-of-thought. Do not ask for identity data. If the question is unrelated to this math problem, gently guide the student back to it.`;

    let r;
    try {
      // v5.7.1：主模型 8~20s 无信号/报错即切备选，不让用户长时间等待
      r = await responsesWithFallback(
        [{ role: 'user', content: prompt }],
        2500,
        [MODELS.light, MODELS.lightFallback],
        LIGHT_TIMEOUT_MS
      );
    } catch (aiErr) {
      console.error('[chat] all models failed:', aiErr.message);
      try {
        if (c.used_bonus) await refund(u.id, c.used_bonus, 'bonus', 'chat_failed_refund_bonus', crypto.randomUUID());
        if (c.used_monthly) await refund(u.id, c.used_monthly, 'monthly', 'chat_failed_refund_monthly', crypto.randomUUID());
        if (c.used_paid) await refund(u.id, c.used_paid, 'paid', 'chat_failed_refund_paid', crypto.randomUUID());
      } catch (e) {}
      return res.status(502).json({ error: 'Tutor is busy, please try again in a moment.' });
    }

    try {
      await admin().from('solve_usage').insert({
        user_id: u.id, service: 'chat', credits_charged: COST.chat, model: r.model,
        input_tokens: r.usage?.input_tokens || null, output_tokens: r.usage?.output_tokens || null
      });
    } catch (e) {}
    res.status(200).json({ answer: r.text, credits: c.remaining, model: r.model });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
