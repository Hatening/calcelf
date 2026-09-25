// Feedback API — text-only submissions (anonymous allowed)
// 提交后：写入 Supabase feedback 表，并通过 Resend 自动转发到站长邮箱
const { createClient } = require('@supabase/supabase-js');

function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

async function emailOwner({userId, content, email, ua}) {
  const key = process.env.RESEND_API_KEY;
  const to  = process.env.OWNER_EMAIL || process.env.FEEDBACK_TO;
  if (!key || !to) return {skipped: true};
  const rows = [
    ['Time', new Date().toISOString()],
    ['User', userId ? userId : 'anonymous (guest)'],
    ['Email provided', email || '(none)'],
    ['User-Agent', (ua || '').slice(0, 200)]
  ];
  const html =
    '<h2>New CalcElf feedback</h2>' +
    rows.map(([k,v]) => '<p><b>'+esc(k)+':</b> '+esc(v)+'</p>').join('') +
    '<hr><p style="white-space:pre-wrap;font-size:15px;line-height:1.6">'+esc(content)+'</p>' +
    '<p style="color:#888;font-size:12px">Stored in Supabase &gt; feedback table. Reply to your customer by email if they left one.</p>';
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'onboarding@resend.dev',
      to,
      subject: '[CalcElf] New feedback' + (userId ? ' (user)' : ' (guest)'),
      html
    })
  });
  return { ok: r.ok, status: r.status, text: r.ok ? '' : await r.text() };
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const content = (body.content || '').trim();
  if (!content || content.length < 5) return res.status(400).json({ error: 'content required (min 5 chars)' });
  if (content.length > 5000) return res.status(400).json({ error: 'content too long (max 5000)' });

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Optional auth — anonymous submission is fully supported
  let userId = null;
  const auth = req.headers.authorization;
  if (auth) {
    const token = auth.replace('Bearer ', '');
    try {
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    } catch (e) {}
  }

  const { error } = await supabase.from('feedback').insert({
    user_id: userId,
    content,
    created_at: new Date().toISOString()
  });

  if (error) return res.status(500).json({ error: 'failed to submit' });

  // Fire the owner notification email; failures never break the submission
  try {
    const r = await emailOwner({ userId, content, email: body.email || '', ua: req.headers['user-agent'] || '' });
    if (r && !r.ok) console.error('[feedback] resend', r.status, String(r.text).slice(0,200));
  } catch (e) { console.error('[feedback] resend exception', e.message); }

  return res.json({ ok: true });
};
