// Weekly report API
// GET  /api/weekly-report           -> latest report + email opt-in status (auth)
// GET  /api/weekly-report?action=unsubscribe&u=<uid>&t=<hmac> -> one-click unsubscribe
// POST {action:'generate'}          -> build real report from last 7 days and save (auth)
// POST {action:'toggle',enabled}    -> opt in/out (auth)
const { createClient } = require('@supabase/supabase-js');
const { buildReport, renderConfirmPage, verifyUnsub } = require('../lib/weekly-report');

const sb = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  const supabase = sb();

  if (req.method === 'GET') {
    const q = req.query || {};
    if (q.action === 'unsubscribe') {
      if (!q.u || !q.t || !verifyUnsub(q.u, q.t)) {
        return res.status(400).send('Invalid unsubscribe link.');
      }
      await supabase.from('profiles').update({ weekly_report_email: false }).eq('id', q.u);
      return res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8').send(renderConfirmPage(q.lang || 'en'));
    }

    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'unauthorized' });
    const { data: { user }, error } = await supabase.auth.getUser(auth.replace('Bearer ', ''));
    if (error || !user) return res.status(401).json({ error: 'unauthorized' });

    const { data: reportRow } = await supabase
      .from('weekly_reports').select('*')
      .eq('user_id', user.id).order('week_start', { ascending: false })
      .limit(1).maybeSingle();
    const { data: prof } = await supabase
      .from('profiles').select('weekly_report_email').eq('id', user.id).maybeSingle();

    return res.json({ report: reportRow?.payload || null, enabled: prof ? prof.weekly_report_email : true });
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'unauthorized' });
    const { data: { user }, error } = await supabase.auth.getUser(auth.replace('Bearer ', ''));
    if (error || !user) return res.status(401).json({ error: 'unauthorized' });

    if (body.action === 'toggle') {
      const { error: err } = await supabase
        .from('profiles').update({ weekly_report_email: !!body.enabled }).eq('id', user.id);
      return res.json({ ok: !err, enabled: !!body.enabled });
    }

    // Generate from the last 7 days of REAL data
    const from = new Date(); from.setDate(from.getDate() - 7);
    const report = await buildReport(supabase, user.id, from);
    const weekStart = from.toISOString().split('T')[0];
    await supabase.from('weekly_reports').upsert({
      user_id: user.id,
      week_start: weekStart,
      payload: report,
      emailed_at: null
    }, { onConflict: 'user_id,week_start' });
    return res.json({ ok: true, report });
  }

  return res.status(405).json({ error: 'method not allowed' });
};
