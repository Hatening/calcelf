const crypto=require('crypto');
function ip(req){const x=req.headers['x-forwarded-for'];return (x?x.split(',')[0]:req.socket?.remoteAddress||'unknown').trim()}
function hmac(v){return crypto.createHmac('sha256',process.env.ABUSE_SALT||'dev-only-change-me').update(String(v)).digest('hex')}
function installKey(req){return hmac(req.body?.installId||'missing-install')}
async function turnstile(token,requestIp){if(!process.env.TURNSTILE_SECRET_KEY)return true;if(!token)return false;const body=new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY,response:token,remoteip:requestIp});const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body});const j=await r.json();return !!j.success}
module.exports={ip,hmac,installKey,turnstile};
