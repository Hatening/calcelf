const { getUser, admin } = require('../lib/supabase');
const { allow } = require('../lib/rate');
const { responses } = require('../lib/openai');
const { buildPlannerPrompt, validatePlan, detectArchetype, isConcretePlan, LIB_VERSION } = require('../lib/anim-plan');
const crypto = require('crypto');

// ============================================================
// v5.7.0 固定动画分镜接口
// 模型只产出受白名单约束的 AnimationPlan JSON，前端用固定渲染器播放；
// 不支持的题型返回 {eligible:false}，前端回退静态步骤卡。
// 不另扣 Credits（已并入解题权益）；匿名用户不可用。
// 可选：Supabase 表 animation_plans 做分镜缓存（无表/无权限时静默跳过）。
// ============================================================
const PRIMARY_MODEL = process.env.ANIMATION_MODEL || 'deepseek-flash';
const FALLBACK_MODEL = process.env.ANIMATION_FALLBACK_MODEL || 'deepseek-v4-pro';
const MAX_TOKENS = Number(process.env.ANIMATION_PLAN_MAX_TOKENS || 3500);

function tryParse(t) {
  const x = String(t || '').trim();
  if (!x) return null;
  const fence = x.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fence ? fence[1].trim() : x;
  try { return JSON.parse(body); } catch (e) {}
  try { return JSON.parse(body.replace(/,\s*([}\]])/g, '$1')); } catch (e) {}
  const s = body.indexOf('{');
  if (s >= 0) {
    let depth = 0, inStr = false, esc = false;
    for (let i = s; i < body.length; i++) {
      const ch = body[i];
      if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; }
      else if (ch === '"') inStr = true;
      else if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) {
        try { return JSON.parse(body.slice(s, i + 1).replace(/,\s*([}\]])/g, '$1')); } catch (e2) {}
        break;
      } }
    }
  }
  return null;
}

function cacheKey(b) {
  const norm = String(b.problem || '').replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 800);
  return crypto.createHash('sha256').update([b.language || 'en', b.stage || '', LIB_VERSION, norm].join('|')).digest('hex');
}

async function readCache(sb, key) {
  try {
    const { data } = await sb.from('animation_plans').select('plan').eq('cache_key', key).maybeSingle();
    return data?.plan || null;
  } catch (e) { return null; }
}
async function writeCache(sb, key, plan, b) {
  try {
    await sb.from('animation_plans').upsert({ cache_key: key, plan, lang: b.language || 'en', created_at: new Date().toISOString() }, { onConflict: 'cache_key' });
  } catch (e) { /* 表未建时静默忽略 */ }
}

// v5.7.1：分镜是小 JSON，单次硬超时 12s，超时即切备选，两轮共 ~25s 后出静态卡
const PLAN_TIMEOUT_MS = Number(process.env.ANIMATION_PLAN_TIMEOUT_MS || 12000);

async function planOnce(model, b, stepCount, amplify) {
  const r = await responses(
    [{ role: 'user', content: buildPlannerPrompt(Object.assign({}, b, { amplify: !!amplify }), stepCount) }],
    model,
    MAX_TOKENS,
    PLAN_TIMEOUT_MS
  );
  const raw = tryParse(r.text || r.reasoning || '');
  if (!raw) return { plan: null, usage: r.usage || {}, model };
  const v = validatePlan(raw, stepCount, b.language);
  let plan = v.eligible ? v.plan : (raw.eligible === false ? { eligible: false } : null);
  if (plan && b.archetype && b.archetype.requireScene === 'wellclimb') {
    const ok = Array.isArray(plan.scenes) && plan.scenes.some(x => x.t === 'wellclimb');
    if (!ok) plan = null;
  }
  return { plan, usage: r.usage || {}, model };
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const u = await getUser(req);
    if (!u) return res.status(401).json({ error: 'Sign in required' });
    if (u.is_anonymous === true) {
      return res.status(403).json({ error: 'Animation requires a registered account', code: 'ANON_ANIMATION_BLOCKED' });
    }
    try {
      const mAllow = await allow(req, u.id, 'anim_m', 60, 8);
      const hAllow = await allow(req, u.id, 'anim_h', 3600, 40);
      if (!mAllow || !hAllow) return res.status(429).json({ error: 'Too many animation requests, please slow down.', code: 'RATE_LIMITED' });
    } catch (e) { console.error('[animation-plan] rate limiter error:', e.message); }

    const b = req.body || {};
    const archetype = detectArchetype(b.problem);
    if (archetype) b.archetype = archetype;
    const solutions = Array.isArray(b.solutions) ? b.solutions : [];
    const stepCount = solutions.reduce((n, s) => n + (Array.isArray(s.steps) ? s.steps.length : 0), 0) || 5;

    const sb = admin();
    const key = cacheKey(b);
    const cached = await readCache(sb, key);
    // v3.4：只接受"明确不合格"或"具象"的缓存；旧版本写入的纯文字/adaptive 分镜视为缓存未命中，重新生成。
    const cachedNegative = cached && cached.eligible === false;
    const cachedConcrete = cached && cached.eligible !== false && isConcretePlan(cached);
    if (cachedNegative || cachedConcrete) {
      let remaining = null;
      try { const { data: profile } = await sb.from('profiles').select('credits_monthly,credits_paid,credits_bonus').eq('id', u.id).single();
        remaining = (profile?.credits_monthly||0)+(profile?.credits_paid||0)+(profile?.credits_bonus||0);
      } catch (e) {}
      return res.status(200).json({ eligible: !!cachedConcrete, plan: cachedConcrete ? cached : undefined, credits: remaining, cached: true, lib: LIB_VERSION });
    }

    let out;
    let fallbackUsed = false;
    try {
      out = await planOnce(PRIMARY_MODEL, b, stepCount, false);
    } catch (e1) {
      console.error('[animation-plan] primary failed:', PRIMARY_MODEL, e1.message);
      out = { plan: null, usage: {}, model: PRIMARY_MODEL };
    }
    if (!out.plan) {
      fallbackUsed = true;
      try { out = await planOnce(FALLBACK_MODEL, b, stepCount); }
      catch (e2) { console.error('[animation-plan] fallback failed:', FALLBACK_MODEL, e2.message); out = { plan: null, usage: {}, model: FALLBACK_MODEL }; }
    }

    // 模型明确不可用 / 两次都失败：统一回退静态步骤卡（200，eligible:false）
    if (!out.plan) {
      await writeCache(sb, key, { eligible: false }, b).catch(() => {});
      return res.status(200).json({ eligible: false, credits: null, cached: false, lib: LIB_VERSION });
    }

    let remaining = null;
    try {
      const { data: profile } = await sb.from('profiles').select('credits_monthly,credits_paid,credits_bonus').eq('id', u.id).single();
      remaining = (profile?.credits_monthly||0)+(profile?.credits_paid||0)+(profile?.credits_bonus||0);
      await sb.from('solve_usage').insert({
        user_id: u.id, service: 'animation_plan', credits_charged: 0,
        model: out.model + (fallbackUsed ? '(fallback)' : ''),
        input_tokens: out.usage?.input_tokens || null, output_tokens: out.usage?.output_tokens || null
      });
    } catch (e) { console.error('[animation-plan] usage log failed:', e.message); }

    if (out.plan.eligible === false || !isConcretePlan(out.plan)) {
      await writeCache(sb, key, { eligible: false }, b).catch(() => {});
      return res.status(200).json({ eligible: false, credits: remaining, cached: false, lib: LIB_VERSION });
    }
    await writeCache(sb, key, out.plan, b).catch(() => {});
    return res.status(200).json({ eligible: true, plan: out.plan, credits: remaining, cached: false, fallback: fallbackUsed, model: out.model, lib: LIB_VERSION });
  } catch (e) {
    console.error('[animation-plan] fatal:', e);
    // 出错也不阻断：前端回退静态步骤卡
    return res.status(200).json({ eligible: false, credits: null, error: e.message });
  }
};
