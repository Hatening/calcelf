// api/rate-animation.js — 用户对某道题动画质量打 1-5 分（不扣费，可选登录）
// 登录用户按 (user_id, problem_hash) 唯一；匿名按 (device_id, problem_hash) 唯一。
const { getUser, admin } = require('../lib/supabase');
const { allow } = require('../lib/rate');
const crypto = require('crypto');

function problemHash(text) {
  return crypto.createHash('sha256').update(String(text || '').replace(/\s+/g, ' ').trim()).digest('hex');
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const b = req.body || {};

    // 1) 身份：登录优先；否则要求 device_id
    const u = await getUser(req);
    let userId = null, deviceId = null;
    if (u) {
      userId = u.id;
    } else {
      deviceId = String(b.device_id || req.headers['x-device-id'] || '').toString().slice(0, 128);
      if (!deviceId) return res.status(401).json({ error: 'Sign in or provide device_id required' });
    }

    // 2) 校验 rating：必须是 1-5 整数
    const rating = Number(b.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
    }

    // 3) problem_hash
    const problemText = String(b.problem_text || '');
    const problem_hash = problemHash(problemText);
    if (!problem_hash) return res.status(400).json({ error: 'problem_text required' });

    // 4) source 枚举
    const source = String(b.source || '');
    if (!['kard', 'free', 'plan'].includes(source)) {
      return res.status(400).json({ error: 'source must be one of kard/free/plan' });
    }

    const family = b.family != null ? String(b.family) : null;
    const lang = b.lang != null ? String(b.lang) : null;

    // 5) 限流：60s 窗口 15 次
    const limited = await allow(req, userId || deviceId, 'rate_m', 60, 15);
    if (!limited) return res.status(429).json({ error: 'Too many requests' });

    // 6) upsert（不扣 Credits）
    const sb = admin();
    const row = {
      user_id: userId,
      device_id: deviceId,
      problem_hash,
      family,
      source,
      rating,
      lang,
      updated_at: new Date().toISOString()
    };
    const onConflict = userId ? 'user_id,problem_hash' : 'device_id,problem_hash';
    const { error } = await sb.from('animation_ratings').upsert(row, { onConflict });
    if (error) {
      console.error('[rate-animation] upsert error', error);
      return res.status(500).json({ error: 'failed to save rating' });
    }

    return res.status(200).json({ ok: true, thanks: true });
  } catch (e) {
    console.error('[rate-animation] fatal:', e);
    return res.status(500).json({ error: e.message || 'internal error' });
  }
};
