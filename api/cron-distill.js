// api/cron-distill.js — 每周蒸馏：聚合 asked_questions / animation_ratings，
// 写入 distill_batches，并可选邮件通知管理员。
// Vercel Cron：Mon 14:30 UTC ("30 14 * * 1")。Vercel 自动带 Authorization: Bearer $CRON_SECRET。
const { createClient } = require('@supabase/supabase-js');

// ISO-8601 周号（周一为一周开始，周四决定所属年份）
function isoPeriod(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7; // Mon=0..Sun=6
  date.setUTCDate(date.getUTCDate() - dayNum + 3); // 本周周四
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const fDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - fDayNum + 3);
  const week = 1 + Math.round((date - firstThursday) / (7 * 24 * 3600 * 1000));
  return date.getUTCFullYear() + '-W' + String(week).padStart(2, '0');
}

async function run(req, res) {
  const auth = req.headers.authorization || '';
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== 'Bearer ' + secret) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 1) since = 最近一次 distill_batches.created_at；无则 7 天前
  const { data: last } = await supabase
    .from('distill_batches')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const since = last && last.created_at
    ? new Date(last.created_at).toISOString()
    : new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  // 2) 拉取窗口内 asked_questions（只取需要的列）
  const { data: rows, error: qErr } = await supabase
    .from('asked_questions')
    .select('qid,family,lang,problem_hash,problem_text,kard_eligible,anim_source,created_at')
    .gte('created_at', since);
  if (qErr) {
    console.error('[cron-distill] asked_questions error', qErr);
    return res.status(500).json({ error: qErr.message });
  }
  const questions = rows || [];

  // 3) 同期 animation_ratings
  const { data: ratings } = await supabase
    .from('animation_ratings')
    .select('rating,family,source,problem_hash,created_at')
    .gte('created_at', since);
  const ratingRows = ratings || [];

  // 4) 聚合
  const totalQuestions = questions.length;
  const uniqueHashes = new Set(questions.map(r => r.problem_hash));

  // by_family: [{family, lang, total, unique_questions, kard_hits, fallback_count}]
  const famMap = new Map();
  for (const r of questions) {
    const key = (r.family || '(null)') + '||' + (r.lang || '(null)');
    if (!famMap.has(key)) {
      famMap.set(key, { family: r.family || null, lang: r.lang || null, total: 0, hashes: new Set(), kard_hits: 0, fallback_count: 0 });
    }
    const g = famMap.get(key);
    g.total++;
    g.hashes.add(r.problem_hash);
    if (r.kard_eligible === true) g.kard_hits++;
    if (r.anim_source === 'static' || r.anim_source === 'none') g.fallback_count++;
  }
  const by_family = Array.from(famMap.values()).map(g => ({
    family: g.family,
    lang: g.lang,
    total: g.total,
    unique_questions: g.hashes.size,
    kard_hits: g.kard_hits,
    fallback_count: g.fallback_count
  })).sort((a, b) => b.total - a.total);

  // avg_rating（整体 + 按 family）
  let avg_rating = null;
  const byFamRating = new Map();
  if (ratingRows.length) {
    let sum = 0;
    for (const r of ratingRows) {
      sum += Number(r.rating) || 0;
      const f = r.family || '(null)';
      if (!byFamRating.has(f)) byFamRating.set(f, { sum: 0, n: 0 });
      byFamRating.get(f).sum += Number(r.rating) || 0;
      byFamRating.get(f).n++;
    }
    avg_rating = Math.round(1000 * sum / ratingRows.length) / 1000;
  }
  const avg_rating_by_family = {};
  for (const [f, v] of byFamRating) {
    avg_rating_by_family[f] = Math.round(1000 * v.sum / v.n) / 1000;
  }

  // fallback_pct: 全部问题里 anim_source in (static,none) 的占比
  const fallbackN = questions.filter(r => r.anim_source === 'static' || r.anim_source === 'none').length;
  const fallback_pct = totalQuestions ? Math.round(1000 * fallbackN / totalQuestions) / 10 : 0;

  // 5) 覆盖缺口：family 有流量但 kard_eligible=true 比例 < 30%；family 为 null 的占比
  const gaps = [];
  for (const g of by_family) {
    if (!g.family) {
      gaps.push({ gap: 'null_family', total: g.total, share_pct: totalQuestions ? Math.round(1000 * g.total / totalQuestions) / 10 : 0 });
      continue;
    }
    const rate = g.kard_hits / g.total;
    if (rate < 0.3) {
      gaps.push({ family: g.family, lang: g.lang, total: g.total, kard_hits: g.kard_hits, kard_rate_pct: Math.round(1000 * 100 * rate) / 10 });
    }
  }

  // 6) 高频题 top10（带 problem_text）
  const topMap = new Map();
  for (const r of questions) {
    if (!topMap.has(r.problem_hash)) {
      topMap.set(r.problem_hash, { problem_hash: r.problem_hash, problem_text: r.problem_text || '', count: 0, family: r.family || null });
    }
    topMap.get(r.problem_hash).count++;
  }
  const top_questions = Array.from(topMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 7) 低分题（rating<=2）
  const low_rated = ratingRows
    .filter(r => r.rating <= 2)
    .map(r => ({ rating: r.rating, family: r.family, source: r.source, problem_hash: r.problem_hash, created_at: r.created_at }));

  const period = isoPeriod(new Date());
  const summary = {
    by_family,
    avg_rating,
    avg_rating_by_family,
    fallback_pct,
    total_questions: totalQuestions,
    unique_questions: uniqueHashes.size,
    top_questions
  };

  // 8) 写入 distill_batches
  const { error: insErr } = await supabase.from('distill_batches').insert({
    period,
    summary,
    low_rated,
    gaps
  });
  if (insErr) {
    console.error('[cron-distill] insert error', insErr);
    return res.status(500).json({ error: insErr.message });
  }

  // 9) 可选邮件
  if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
    try {
      const rowsHtml = by_family.slice(0, 15).map(g =>
        `<tr><td>${g.family || '(null)'}</td><td>${g.lang || ''}</td><td>${g.total}</td><td>${g.unique_questions}</td><td>${g.kard_hits}</td><td>${g.fallback_count}</td></tr>`
      ).join('');
      const html = `<h2>CalcElf Weekly Distill — ${period}</h2>
<p>Total questions: <b>${totalQuestions}</b> &nbsp; Unique: <b>${uniqueHashes.size}</b> &nbsp; Avg rating: <b>${avg_rating == null ? 'n/a' : avg_rating}</b> &nbsp; Fallback: <b>${fallback_pct}%</b></p>
<h3>By family</h3>
<table border="1" cellpadding="6" cellspacing="0"><tr><th>family</th><th>lang</th><th>total</th><th>unique</th><th>kard_hits</th><th>fallback</th></tr>${rowsHtml}</table>
<h3>Gaps (${gaps.length})</h3><pre>${JSON.stringify(gaps.slice(0, 10), null, 2)}</pre>
<h3>Top questions (${top_questions.length})</h3><pre>${JSON.stringify(top_questions, null, 2)}</pre>`;
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'onboarding@resend.dev',
          to: process.env.ADMIN_EMAIL,
          subject: 'CalcElf Weekly Distill',
          html
        })
      });
      if (!r.ok) console.error('[cron-distill] resend', r.status, await r.text());
    } catch (mailErr) {
      console.error('[cron-distill] mail error', mailErr && mailErr.message);
    }
  }

  return res.json({
    ok: true,
    period,
    since,
    total_questions: totalQuestions,
    unique_questions: uniqueHashes.size,
    avg_rating,
    fallback_pct,
    gaps: gaps.length,
    low_rated: low_rated.length
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }
  try {
    return await run(req, res);
  } catch (e) {
    console.error('[cron-distill] fatal:', e);
    return res.status(500).json({ error: e.message || 'internal error' });
  }
};
