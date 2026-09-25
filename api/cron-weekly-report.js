// Vercel Cron — weekly parent report. Schedule: Mon 14:00 UTC ("0 14 * * 1")
// Vercel calls with GET and header Authorization: Bearer $CRON_SECRET (auto-injected).
const { createClient } = require('@supabase/supabase-js');
const { buildReport, renderEmail, tr, normLang, unsubToken } = require('../lib/weekly-report');

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
  const appUrl = (process.env.APP_URL || 'https://calcelf.vercel.app').replace(/\/$/, '');
  const from = new Date(); from.setDate(from.getDate() - 7);
  const weekStart = from.toISOString().split('T')[0];

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id,email,language,weekly_report_email,weekly_report_to')
    .eq('weekly_report_email', true)
    .not('email', 'is', null);

  if (error) { console.error('[cron-weekly] profiles error', error); return res.status(500).json({ error: error.message }); }
  if (!users || !users.length) return res.json({ ok: true, processed: 0, sent: 0, skipped: 0 });

  let sent = 0, skipped = 0, failed = 0;
  for (const user of users) {
    try {
      const report = await buildReport(supabase, user.id, from);
      if (!report.active) { skipped++; continue; } // 整周零活动不发，避免骚扰

      await supabase.from('weekly_reports').upsert({
        user_id: user.id,
        week_start: weekStart,
        payload: report,
        emailed_at: new Date().toISOString()
      }, { onConflict: 'user_id,week_start' });

      const key = process.env.RESEND_API_KEY;
      if (key) {
        const lang = report.lang || normLang(user.language);
        const unsubUrl = `${appUrl}/api/weekly-report?action=unsubscribe&u=${user.id}&t=${unsubToken(user.id)}&lang=${encodeURIComponent(lang)}`;
        const html = renderEmail(report, appUrl, unsubUrl);
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || 'onboarding@resend.dev',
            to: (user.weekly_report_to || user.email),
            subject: tr(lang, 'subject'),
            html
          })
        });
        if (!r.ok) { failed++; console.error('[cron-weekly] resend', r.status, await r.text()); }
        else sent++;
      } else {
        console.log('[cron-weekly] RESEND_API_KEY missing; report saved but not emailed for', user.email);
        skipped++;
      }
    } catch (e) {
      failed++;
      console.error('[cron-weekly] user', user.id, e.message);
    }
  }

  console.log(`[cron-weekly] processed=${users.length} sent=${sent} skipped=${skipped} failed=${failed}`);
  return res.json({ ok: true, processed: users.length, sent, skipped, failed });
}

module.exports = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }
  return run(req, res);
};
