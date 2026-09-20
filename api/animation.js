const { getUser, admin } = require('../lib/supabase');
const { charge, COST } = require('../lib/credits');
const { responses } = require('../lib/openai');
const crypto = require('crypto');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const u = await getUser(req);
    if (!u) return res.status(401).json({ error: 'Sign in required' });

    // 匿名用户禁止使用动画功能
    if (u.is_anonymous === true) {
      return res.status(403).json({
        error: 'Animation requires a registered account',
        code: 'ANON_ANIMATION_BLOCKED'
      });
    }

    const b = req.body || {};
    const isGrace = b.is_grace === true;
    let c = { ok: false, remaining: 0 };

    if (isGrace) {
      c = { ok: true, remaining: 0 };
    } else {
      const sb = admin();
      const { data: profile } = await sb
        .from('profiles')
        .select('credits_monthly, credits_paid, credits_bonus')
        .eq('id', u.id)
        .single();
      const totalCredits =
        (profile?.credits_monthly || 0) +
        (profile?.credits_paid || 0) +
        (profile?.credits_bonus || 0);
      if (totalCredits <= 0) {
        return res.status(402).json({ error: 'Not enough Credits', code: 'INSUFFICIENT_CREDITS' });
      }
      c = await charge(u.id, COST.animation, 'animation', crypto.randomUUID());
      if (!c.ok) {
        return res.status(402).json({ error: 'Not enough Credits', code: 'INSUFFICIENT_CREDITS' });
      }
    }

    // === 精简并强化 prompt ===
    const prompt = `Create ONE self-contained educational HTML file with inline CSS and JS.
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
7. Use inline SVG or CSS to visualize the solution steps.`;

    const r = await responses(
      [{ role: 'user', content: prompt }],
      process.env.ANIMATION_MODEL || 'gpt-5.6-luna',
      12000
    );

    // === 优先用 content，为空则用 reasoning ===
    let raw = String(r.text || '');
    if (!raw && r.reasoning) raw = String(r.reasoning || '');

    // 去掉可能的 markdown 代码围栏
    let h = raw
      .replace(/^```html\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    // 如果不是从 <!DOCTYPE 或 <html 开头，尝试截取
    const doctypeIdx = h.search(/<!DOCTYPE\s+html/i);
    const htmlIdx = h.search(/<html[\s>]/i);
    const startIdx = doctypeIdx >= 0 ? doctypeIdx : (htmlIdx >= 0 ? htmlIdx : -1);
    if (startIdx > 0) h = h.slice(startIdx);

    // 如果末尾没有 </html>，手动补一个
    if (!/<\/html>\s*$/i.test(h)) h = h + '\n</html>';

    // === 降低阈值到 100，同时输出更多日志 ===
    if (h.length < 100) {
      console.error('[animation] output too short. raw.length=', raw.length, 'first500=', raw.slice(0, 500));
      throw Error('Animation output too short');
    }

    await admin().from('solve_usage').insert({
      user_id: u.id,
      service: 'animation',
      credits_charged: isGrace ? 0 : COST.animation,
      model: process.env.ANIMATION_MODEL || 'gpt-5.6-luna',
      input_tokens: r.usage?.input_tokens || null,
      output_tokens: r.usage?.output_tokens || null
    });

    res.status(200).json({ html: h, credits: c.remaining });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
