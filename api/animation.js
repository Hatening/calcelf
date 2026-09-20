const { getUser, admin } = require('../lib/supabase');
const { allow } = require('../lib/rate');
const { responses } = require('../lib/openai');

// ============================================================
// v5.3 动画课件策略
// 1) 动画已并入解题权益，不再单独扣 Credits（仍需注册登录）。
// 2) 默认 qwen3-coder-flash（代码专用、性价比最高）；
//    输出为空/过短/不是完整 HTML 时，自动用 qwen3-coder-plus 兜底一次。
// 3) 输出上限 7500 tokens（prompt 要求成品 < 8000 字符，留足余量）。
// 模型名均可被环境变量覆盖。
// ============================================================
const PRIMARY_MODEL = process.env.ANIMATION_MODEL || 'qwen3-coder-flash';
const FALLBACK_MODEL = process.env.ANIMATION_FALLBACK_MODEL || 'qwen3-coder-plus';
const MAX_TOKENS = Number(process.env.ANIMATION_MAX_TOKENS || 7500);

function buildPrompt(b) {
  return `Create ONE self-contained educational HTML file with inline CSS and JS.
Language: ${b.language || 'en'}; stage: ${b.stage || 'prefer_not'}.

Problem: ${String(b.problem || '').slice(0, 2000)}
Recommended solution: ${JSON.stringify((b.solutions || []).slice(0, 1))}

STRICT OUTPUT RULES:
1. Output ONLY a complete HTML document. Start with <!DOCTYPE html>. End with </html>.
2. No markdown fences. No explanation before or after.
3. No external URLs, no CDN, no network requests, no eval, no iframe, no localStorage.
4. Use max-width: 900px; margin: 0 auto; Do NOT use 100vh.
5. Include three controls: "Next Step", "Auto Play/Pause", "Restart".
6. Keep the whole file under 8000 characters.
7. Use inline SVG or CSS to visualize the solution steps.
8. All visible labels must be in the requested language. Rounded, friendly K12 visual style.`;
}

// 与 v5.2 相同的 HTML 清洗逻辑
function extractHtml(raw) {
  let h = String(raw || '')
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  const doctypeIdx = h.search(/<!DOCTYPE\s+html/i);
  const htmlIdx = h.search(/<html[\s>]/i);
  const startIdx = doctypeIdx >= 0 ? doctypeIdx : (htmlIdx >= 0 ? htmlIdx : -1);
  if (startIdx > 0) h = h.slice(startIdx);
  if (!/<\/html>\s*$/i.test(h)) h = h + '\n</html>';
  return h;
}

// 合格判定：足够长、是完整文档、且包含交互按钮（Next Step 等控件）
function isValidHtml(h) {
  if (!h || h.length < 400) return false;
  if (!/<!DOCTYPE\s+html/i.test(h) || !/<\/html>/i.test(h)) return false;
  const buttons = (h.match(/<button\b/gi) || []).length;
  return buttons >= 2;
}

// 调用指定模型生成一次；返回 { h, usage, model }，不合格时 h=null
async function generateOnce(model, b) {
  const r = await responses(
    [{ role: 'user', content: buildPrompt(b) }],
    model,
    MAX_TOKENS
  );
  let raw = String(r.text || '');
  if (!raw && r.reasoning) raw = String(r.reasoning || '');
  const h = extractHtml(raw);
  if (!isValidHtml(h)) {
    console.error('[animation] invalid/short output from', model, 'raw.length=', raw.length, 'head=', raw.slice(0, 200));
    return { h: null, usage: r.usage || {}, model, rawLength: raw.length };
  }
  return { h, usage: r.usage || {}, model };
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const u = await getUser(req);
    if (!u) return res.status(401).json({ error: 'Sign in required' });

    // 动画为注册用户权益：匿名用户不可用（与 v5.2 一致）
    if (u.is_anonymous === true) {
      return res.status(403).json({
        error: 'Animation requires a registered account',
        code: 'ANON_ANIMATION_BLOCKED'
      });
    }

    // 频率限制（防滥用）：每分钟 8 次、每小时 40 次
    try {
      const mAllow = await allow(req, u.id, 'anim_m', 60, 8);
      const hAllow = await allow(req, u.id, 'anim_h', 3600, 40);
      if (!mAllow || !hAllow) {
        return res.status(429).json({ error: 'Too many animation requests, please slow down.', code: 'RATE_LIMITED' });
      }
    } catch (e) {
      // 限流器自身故障不应阻断核心服务，记录后放行
      console.error('[animation] rate limiter error:', e.message);
    }

    const b = req.body || {};

    // 主模型 → 兜底模型
    let out;
    let fallbackUsed = false;
    try {
      out = await generateOnce(PRIMARY_MODEL, b);
    } catch (e1) {
      console.error('[animation] primary model failed:', PRIMARY_MODEL, e1.message);
      out = { h: null, usage: {}, model: PRIMARY_MODEL };
    }
    if (!out.h) {
      fallbackUsed = true;
      try {
        out = await generateOnce(FALLBACK_MODEL, b);
      } catch (e2) {
        console.error('[animation] fallback model failed:', FALLBACK_MODEL, e2.message);
        out = { h: null, usage: {}, model: FALLBACK_MODEL };
      }
    }
    if (!out.h) {
      return res.status(502).json({ error: 'Animation generation failed, please try again.', code: 'ANIMATION_FAILED' });
    }

    // 不扣费；查询当前余额供前端展示
    let remaining = null;
    try {
      const sb = admin();
      const { data: profile } = await sb
        .from('profiles')
        .select('credits_monthly, credits_paid, credits_bonus')
        .eq('id', u.id)
        .single();
      remaining = (profile?.credits_monthly || 0) + (profile?.credits_paid || 0) + (profile?.credits_bonus || 0);

      // 用量台账：credits_charged 恒为 0，记录实际命中模型与 token，供成本核算
      await sb.from('solve_usage').insert({
        user_id: u.id,
        service: 'animation',
        credits_charged: 0,
        model: out.model + (fallbackUsed ? '(fallback)' : ''),
        input_tokens: out.usage?.input_tokens || null,
        output_tokens: out.usage?.output_tokens || null
      });
    } catch (e) {
      console.error('[animation] usage log failed:', e.message);
    }

    res.status(200).json({ html: out.h, credits: remaining, model: out.model, fallback: fallbackUsed });
  } catch (e) {
    console.error('[animation] fatal:', e);
    res.status(500).json({ error: e.message });
  }
};
