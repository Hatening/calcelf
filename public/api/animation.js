const { getUser, admin } = require('../lib/supabase');
const { allow } = require('../lib/rate');
const { responses } = require('../lib/openai');
const { detectArchetype, layoutDirective, partsBin } = require('../lib/anim-parts');

// ============================================================
// v5.8.4 独立动画（把题目原文直接交给模型，模型自己解题并写一整页 HTML，贴近 DeepSeek 网页聊天效果）
// 1) 动画已并入解题权益，不单独扣 Credits（仍需注册，匿名不可用）。
// 2) 默认 DeepSeek：主 deepseek-v4.1-flash，失败/不完整自动用 deepseek-v4-pro 兜底。
// 3) 输出上限默认 0 = 不传 max_tokens（用模型默认最大值），不限制字符数。
// 所有模型/上限/超时均可被环境变量覆盖。
// ============================================================
const PRIMARY_MODEL = process.env.ANIMATION_FREE_MODEL || process.env.ANIMATION_MODEL || 'deepseek-flash';
const FALLBACK_MODEL = process.env.ANIMATION_FREE_FALLBACK_MODEL || process.env.ANIMATION_FALLBACK_MODEL || 'deepseek-v4-pro';
// 默认 0 = 不传 max_tokens，让平台使用该模型支持的最大输出（不做我们这侧的限制）；
// 如需显式上限，设置环境变量 ANIMATION_FREE_MAX_TOKENS 为正数即可。
const MAX_TOKENS_RAW = process.env.ANIMATION_FREE_MAX_TOKENS != null ? process.env.ANIMATION_FREE_MAX_TOKENS : 0;
const MAX_TOKENS = Number(MAX_TOKENS_RAW); // 0/NaN 时不发送 max_tokens
const TIMEOUT_MS = Number(process.env.ANIMATION_FREE_TIMEOUT_MS || 58000);
// 创造性与推理：temperature 默认 0.8（灵动又不至于乱）；DeepSeek-V4 默认就开思考，
// reasoning_effort 默认 high（可选 low/high/max）。均可被环境变量覆盖。
const TEMPERATURE = process.env.ANIMATION_FREE_TEMPERATURE != null ? Number(process.env.ANIMATION_FREE_TEMPERATURE) : 0.8;
const REASONING_EFFORT = process.env.ANIMATION_FREE_REASONING_EFFORT || 'high';

function buildPrompt(b, fixNotes) {
  // 独立动画：以题目原文为唯一依据。上游给了参考解法就要求数值一致；
  // 若没有（解题思路为空），由动画模型自己正确求解并自检。
  const sols = Array.isArray(b.solutions)
    ? b.solutions.filter(x => x && ((Array.isArray(x.steps) && x.steps.length) || x.answer || x.final_answer || x.sol))
    : [];
  const solutionLine = sols.length
    ? `Reference solution (the numbers and final answer MUST match exactly; build your own concrete animation around them): ${JSON.stringify(sols.slice(0, 3))}`
    : `No reference solution is provided. Solve this problem YOURSELF, correctly: identify what is given and what is asked, show the key derivation steps, reach the final answer, and include a short verification that confirms the answer.`;
  // v5.9：先判版式，再给强制版式指令（竖式题必须竖排对齐，绝不允许横式）
  const arch = detectArchetype(b.problem);
  const directive = layoutDirective(arch);
  const repairBlock = fixNotes
    ? `*** REPAIR REQUIRED *** A previous attempt was rejected because: ${fixNotes}\nFix EVERY issue, reuse the matching pieces from the PARTS KIT, and output ONE complete valid HTML document.\n`
    : '';
  return `Think silently. Output ONLY the final HTML document. No reasoning, no notes, no markdown code fences.
${repairBlock}You are an expert K-12 teacher AND a senior creative front-end developer. You are given ONE problem; solve it and turn it into a single self-contained interactive HTML page that animates the solution step by step, so a child can see and understand WHY the answer is correct.

Language for EVERY visible label and sentence: ${b.language || 'en'} (never mix languages; correct UTF-8, no mojibake). Stage: ${b.stage || 'prefer_not'}.
Problem (the recognized / typed / spoken problem text — this is the single source of truth):
${String(b.problem || '').slice(0, 6000)}
${solutionLine}

${directive}

=== GENERAL VISUAL RULES ===
- Do NOT just make generic text cards. Draw the real things and quantities from the problem, and animate their changes.
- Use inline SVG (preferred) plus CSS transitions / vanilla JS. Every logical step must be a visible change of the objects, not a paragraph of text.
- For standard objects (frog/snail/tree/well/kid/dog/sun/moon/scale/axes/fraction bar) prefer the ready-made snippets in the PARTS KIT instead of drawing them from scratch (a plain colored dot is not an object).
- Each actor keeps ONE stable identity for the whole timeline; moving it only changes its position, it must never be deleted/recreated or vanish mid-motion.

=== DESIGN SYSTEM ===
- Light friendly background, centered content max-width 880px, generous spacing; rounded cards (border-radius ~20px) with soft shadows.
- Rounded, kid-friendly type; large readable text; calm palette (blue #2563eb, amber #f59e0b, green #16a34a, red #ef4444); numbers in tabular style.
- A stage/canvas area where objects move; below it a short explanation; a thin progress bar; rounded control buttons.

=== BEHAVIOR ===
- Provide Previous / Next / Auto Play-Pause / Restart controls and a step indicator. Auto Play may run by default.
- Each step stays on screen for about 5000 ms (5 seconds) before advancing; objects glide with ~0.6-0.9s ease transitions. Keep motion slow, gentle, readable; respect prefers-reduced-motion.
- Buttons are real <button> elements with working handlers.

${partsBin()}

=== STRICT OUTPUT RULES ===
1. Output ONLY a complete HTML document, starting with <!DOCTYPE html> and ending with </html>. No fences, no explanation.
2. Everything inline (<style>, <script>, inline SVG). No external URLs/CDN/fonts/network requests, no eval, no nested iframes.
3. Responsive (phone + desktop); width:100%; let the page grow taller rather than using fixed-height inner scrollbars.
4. NEVER print source code or spec text on screen (no "<svg", "<path", "viewBox", "Ground line:", etc.). All visible text is a real label in the requested language.
5. Be COMPLETE: do not truncate; the final answer and the verification must be shown.`;
}

// v5.9：给出上一次输出为什么不合格的简短英文诊断（喂给修复/兜底调用）
function diagnose(raw) {
  const x = String(raw || '');
  const h = repairHtml(extractHtml(x));
  const notes = [];
  if (!x.trim()) notes.push('the model returned an empty response');
  if (!h) {
    notes.push('no complete HTML document was found (must start with <!DOCTYPE html> and end with </html>)');
  } else {
    if (h.length < 1500) notes.push('the document is too short / truncated — finish the whole page');
    if ((h.match(/<button\b/gi) || []).length < 2) notes.push('add working Previous/Next/Auto/Restart <button> controls');
    if (!/<svg\b/i.test(h) && !/@keyframes|animation:|transition:|requestAnimationFrame/.test(h)) notes.push('include a real visual stage (inline SVG / animated board), not only text');
    const txt = visibleText(h);
    if (/viewBox|<(path|circle|rect|polygon|polyline|svg|html|body|button)\b|Ground line:/.test(txt)) notes.push('markup/source is leaking onto the screen (keep code inside <style>/<script>)');
    if (/box-sizing|grid-template|document\.getElementById|querySelector|addEventListener/.test(txt)) notes.push('JavaScript/CSS source text is visible on screen — hide it');
  }
  if (/```/.test(x)) notes.push('remove markdown code fences and output raw HTML only');
  return notes.length ? notes.join('; ') : 'the output did not pass validation; produce a complete, concrete, self-contained page';
}

// 从模型输出中提取真正的 HTML 文档（模型可能先输出思考/再用 ```html 包成品）
function extractHtml(raw) {
  let x = String(raw || '').replace(/\r/g, '');
  const fences = [...x.matchAll(/```(?:html|HTML)?\s*([\s\S]*?)```/g)].map(m => m[1]);
  const htmlFences = fences.filter(t => /<!DOCTYPE\s+html/i.test(t) || /<html[\s>]/i.test(t));
  if (htmlFences.length) {
    x = htmlFences.sort((a, b) => b.length - a.length)[0];
  } else {
    x = x.replace(/```[a-zA-Z]*\s*[\s\S]*?```/g, ' ');
  }
  const doctypeIdx = x.search(/<!DOCTYPE\s+html/i);
  const htmlIdx = x.search(/<html[\s>]/i);
  let startIdx = doctypeIdx >= 0 ? doctypeIdx : htmlIdx;
  if (startIdx < 0) return '';
  let h = x.slice(startIdx);
  const close = h.search(/<\/html>/i);
  if (close >= 0) h = h.slice(0, close + '</html>'.length);
  h = h.replace(/```[a-zA-Z]*/g, '').replace(/```/g, '');
  return h.trim();
}

// 删除把源码/说明误当正文的 pre/code 块
function repairHtml(h) {
  return h
    .replace(/<pre\b[\s\S]*?<\/pre>/gi, (m) => (/<svg|viewBox|<path|box-sizing|grid-template|function\s*\(|```|#?\s*css|\.\w+\{/i.test(m) ? '' : m))
    .replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, (m) => (/<svg|viewBox|<path|box-sizing|grid-template|function\s*\(|\{/i.test(m) ? '' : m));
}

function decodeEntities(t) {
  return String(t).replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&amp;/gi, '&').replace(/&#0?3?9;/g, "'").replace(/&quot;/gi, '"');
}

function visibleText(h) {
  return decodeEntities(
    h.replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<script[\s\S]*?<\/script>/gi, ' ')
     .replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ')
  );
}

// 合格判定：完整文档 + 真实可渲染舞台 + 交互按钮 + 无源码/思考泄漏
function isValidHtml(h) {
  if (!h || h.length < 1500) return false;
  if (!/<!DOCTYPE\s+html/i.test(h) || !/<html[\s>]/i.test(h) || !/<\/html>/i.test(h) || !/<body[\s>]/i.test(h)) return false;
  if (/```/.test(h)) return false;
  const buttons = (h.match(/<button\b/gi) || []).length;
  if (buttons < 2) return false;
  const hasStage = /<svg\b/i.test(h) || /@keyframes|animation:|transition:|requestAnimationFrame/.test(h);
  if (!hasStage) return false;
  const txt = visibleText(h);
  if (/viewBox|<(path|circle|rect|polygon|polyline|svg|html|body|button)\b|Ground line:|Note:\s*Stage|white rounded card/i.test(txt)) return false;
  if (/box-sizing|grid-template|font-family\s*:|document\.getElementById|querySelector|addEventListener|function\s+[a-zA-Z_]|const\s+\w+\s*=|let\s+\w+\s*=|=>\s*[{]/.test(txt)) return false;
  if (/\bLet me\b|\bI(?:'|’)ll\b|\bI will\b|\bActually\b|Let(?:'|’)s (make|write|implement|add|put)|I can|I need to/i.test(txt)) return false;
  return true;
}

async function generateOnce(model, b, fixNotes) {
  const extra = {};
  if (Number.isFinite(TEMPERATURE)) extra.temperature = TEMPERATURE;
  if (REASONING_EFFORT) extra.reasoning_effort = REASONING_EFFORT;
  const r = await responses(
    [{ role: 'user', content: buildPrompt(b, fixNotes) }],
    model,
    MAX_TOKENS,
    TIMEOUT_MS,
    extra
  );
  let raw = String(r.text || '');
  if (!raw && r.reasoning) raw = String(r.reasoning || '');
  const h = repairHtml(extractHtml(raw));
  if (!isValidHtml(h)) {
    console.error('[animation] invalid/short output from', model, 'raw.length=', raw.length, 'head=', raw.slice(0, 160));
    return { h: null, usage: r.usage || {}, model, rawLength: raw.length, raw };
  }
  return { h, usage: r.usage || {}, model };
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
    } catch (e) { console.error('[animation] rate limiter error:', e.message); }

    const b = req.body || {};
    let out;
    let fallbackUsed = false;
    try {
      out = await generateOnce(PRIMARY_MODEL, b);
    } catch (e1) {
      console.error('[animation] primary failed:', PRIMARY_MODEL, e1.message);
      out = { h: null, usage: {}, model: PRIMARY_MODEL, raw: '' };
    }
    if (!out.h) {
      fallbackUsed = true;
      // v5.9：把第一次输出的具体缺陷写进兜底 prompt，让 PRO 模型"带着问题重画"
      const fixNotes = diagnose(out.raw || '');
      try {
        out = await generateOnce(FALLBACK_MODEL, b, fixNotes);
      } catch (e2) {
        console.error('[animation] fallback failed:', FALLBACK_MODEL, e2.message);
        out = { h: null, usage: {}, model: FALLBACK_MODEL };
      }
    }

    // 彻底失败：返回 200 eligible:false，让前端（混合模式）回退静态步骤卡，而不是报错
    if (!out.h) return res.status(200).json({ eligible: false });

    let remaining = null;
    try {
      const sb = admin();
      const { data: profile } = await sb.from('profiles')
        .select('credits_monthly,credits_paid,credits_bonus').eq('id', u.id).single();
      remaining = (profile?.credits_monthly || 0) + (profile?.credits_paid || 0) + (profile?.credits_bonus || 0);
      await sb.from('solve_usage').insert({
        user_id: u.id, service: 'animation', credits_charged: 0,
        model: out.model + (fallbackUsed ? '(fallback)' : ''),
        input_tokens: out.usage?.input_tokens || null,
        output_tokens: out.usage?.output_tokens || null
      });
    } catch (e) { console.error('[animation] usage log failed:', e.message); }

    res.status(200).json({ eligible: true, html: out.h, credits: remaining, model: out.model, fallback: fallbackUsed });
  } catch (e) {
    console.error('[animation] fatal:', e);
    res.status(500).json({ error: e.message });
  }
};
