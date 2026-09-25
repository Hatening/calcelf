// Stateless arithmetic CAPTCHA, server-signed (HMAC). The answer never reaches
// the browser DOM: GET issues { token, q:{a,b} }; POST verifies { token, answer }.
const crypto = require('crypto');

function secret() {
  return process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'calcelf-captcha-dev-secret';
}
function b64url(buf) { return Buffer.from(buf).toString('base64url'); }
function issue(ans) {
  const body = b64url(JSON.stringify({ ans, exp: Date.now() + 10 * 60 * 1000 }));
  const sig = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  return body + '.' + sig;
}
function verify(token, answer) {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 2) return false;
    const [body, sig] = parts;
    const expect = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
    if (sig.length !== expect.length) return false;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return false;
    const p = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (!p || !p.exp || Date.now() > p.exp) return false;
    const n = Number(answer);
    return Number.isFinite(n) && n === Number(p.ans);
  } catch (e) { return false; }
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method === 'GET') {
      const a = 2 + Math.floor(Math.random() * 8); // 2..9
      const b = 1 + Math.floor(Math.random() * 8); // 1..8
      return res.status(200).json({ token: issue(a + b), q: { a, b } });
    }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const ok = verify(body.token, body.answer);
      return res.status(ok ? 200 : 400).json({ ok });
    }
    res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
