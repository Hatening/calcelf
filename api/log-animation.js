// api/log-animation.js — 解题后回写动画来源/kard 命中结果到 asked_questions
// 静默失败：任何错误都返回 {ok:true}，不阻断前端主流程。
const { getUser, admin } = require('../lib/supabase');
const { allow } = require('../lib/rate');

const ANIM_SOURCES = ['kard', 'free', 'plan', 'static', 'none'];

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const u = await getUser(req);
    if (!u) return res.status(401).json({ error: 'Sign in required' });

    const b = req.body || {};
    const qid = String(b.qid || '').trim();
    if (!qid) return res.status(400).json({ error: 'qid required' });

    const anim_source = String(b.anim_source || '');
    if (!ANIM_SOURCES.includes(anim_source)) {
      return res.status(400).json({ error: 'anim_source must be one of kard/free/plan/static/none' });
    }

    // 限流：60s 窗口 30 次
    const limited = await allow(req, u.id, 'loganim_m', 60, 30);
    if (!limited) return res.status(429).json({ error: 'Too many requests' });

    // 不扣 Credits。回写 family / kard_eligible / anim_source
    const patch = {
      family: b.family != null ? String(b.family) : null,
      kard_eligible: b.kard_eligible === true || b.kard_eligible === 'true' ? true : (b.kard_eligible === false || b.kard_eligible === 'false' ? false : null),
      anim_source
    };
    // 仅在字段非 null 时写入，避免覆盖已有值
    const clean = {};
    if (patch.family != null) clean.family = patch.family;
    if (patch.kard_eligible != null) clean.kard_eligible = patch.kard_eligible;
    clean.anim_source = patch.anim_source;

    const sb = admin();
    await sb.from('asked_questions').update(clean).eq('qid', qid).eq('user_id', u.id);

    return res.status(200).json({ ok: true });
  } catch (e) {
    // 静默失败：不阻断前端
    console.error('[log-animation] silent error:', e && e.message);
    return res.status(200).json({ ok: true });
  }
};
