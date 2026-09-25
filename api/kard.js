// api/kard.js — 知识卡解题端点
// 流程：分类 → 抽参 → 解题 → 校验 → 渲染参数 → 返回 {eligible, type, renderParams, answer, steps}
// 失败返回 {eligible:false, reason, fallback:'free_html'}，前端走受控兜底
const { getUser, admin } = require('../lib/supabase');
const { charge, refund, COST } = require('../lib/credits');
const { ip, hmac, turnstile } = require('../lib/security');
const { allow } = require('../lib/rate');
const { tryKnowledgeCard } = require('../lib/kards/orchestrator');

module.exports = async (req, res) => {
  let u = null, charged = false, c = null;
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    u = await getUser(req);
    if (!u) return res.status(401).json({ error: 'Sign in required' });

    const b = req.body || {};
    const problem = String(b.problem || b.text || '').trim();
    if (!problem) return res.status(400).json({ error: 'No problem provided' });

    // v6.0: turnstile 改为可选 —— kard 在 solve 之后调用，solve 已验证过人机，且 kard 不扣费。
    // 有 token 才校验；无 token 跳过。
    if (b.turnstileToken && !(await turnstile(b.turnstileToken, ip(req)))) return res.status(403).json({ error: 'Human verification required' });

    const mAllow = await allow(req, u.id, 'solve_m', 60, 8);
    const hAllow = await allow(req, u.id, 'solve_h', 3600, 60);
    if (!mAllow || !hAllow) return res.status(429).json({ error: 'Too many requests' });

    const lang = String(b.language || 'en');
    const stage = String(b.stage || 'prefer_not');

    // 知识卡路径（不扣费，扣费在 solve 端点统一处理；这里只做分类+渲染参数）
    const result = await tryKnowledgeCard(problem, { language: lang, stage });

    if (!result.eligible) {
      return res.status(200).json({
        eligible: false,
        reason: result.reason,
        fallback: 'free_html',
        family: result.family || null,
      });
    }

    // ---- board 族结果：edulab board JSON（host=2d/3d/solid/reaction）----
    if (result.isBoard) {
      try {
        const sb = admin();
        await sb.from('kard_cache').upsert({
          cache_key: result.cacheKey,
          family: result.family,
          render_params: result.board,        // board JSON 存 render_params
          answer: result.answer,
          lang,
        }, { onConflict: 'cache_key' }).catch(() => {});
      } catch (e) { /* 表未建时静默 */ }

      return res.status(200).json({
        eligible: true,
        family: result.family,
        host: result.host || 'renderer',
        board: result.board,
        answer: result.answer,
        steps: result.steps || [],
        cached: false,
      });
    }

    // ---- renderer 族结果（原 8 族，保持原返回格式）----
    // 缓存
    try {
      const sb = admin();
      await sb.from('kard_cache').upsert({
        cache_key: result.cacheKey,
        family: result.family,
        render_params: result.result.renderParams,
        answer: result.result.answer,
        lang,
      }, { onConflict: 'cache_key' }).catch(() => {});
    } catch (e) { /* 表未建时静默 */ }

    return res.status(200).json({
      eligible: true,
      family: result.family,
      type: result.result.renderParams?.type,
      renderParams: result.result.renderParams,
      answer: result.result.answer,
      steps: result.result.steps,
      cached: false,
    });
  } catch (e) {
    console.error('[kard] fatal:', e);
    return res.status(200).json({ eligible: false, reason: 'exception', fallback: 'free_html', error: e.message });
  }
};
