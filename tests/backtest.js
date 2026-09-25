// tests/backtest.js — 无头回测：对每族 >=3 样本渲染并截图，检查 console 错误
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { runCard } = require('../lib/kards/registry');

const ROOT = path.join(__dirname, '..');
const FRAMES = path.join(__dirname, 'frames');
if (!fs.existsSync(FRAMES)) fs.mkdirSync(FRAMES, { recursive: true });

// 极简静态服务器
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/tests/runner.html';
  const fp = path.join(ROOT, p);
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
    res.end(data);
  });
});

(async () => {
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;
  const browser = await chromium.launch({ executablePath: '/usr/local/bin/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('PAGEERROR:' + e.message));

  const jobs = [
    ['motion', 0], ['motion', 6], ['motion', 10],
    ['numberline', 0], ['numberline', 2], ['numberline', 11],
    ['bars', 0], ['bars', 8], ['bars', 13],
  ];

  const shotAt = [1000, 6500, 16000]; // 首步/中间/结论
  let okCount = 0, total = 0;

  for (const [fam, idx] of jobs) {
    total++;
    const sample = JSON.parse(fs.readFileSync(path.join(ROOT, 'samples', fam + '.json'), 'utf8'))[idx];
    const r = await runCard(fam, sample.problem, { language: sample.language });
    if (!r.eligible) { console.log('SKIP not eligible', fam, idx); continue; }
    const data = encodeURIComponent(JSON.stringify(r.renderParams));
    const url = `http://localhost:${port}/tests/runner.html?data=${data}`;
    await page.goto(url);
    await page.waitForFunction(() => window.__ready === true, { timeout: 8000 });
    const pageErrorsHere = consoleErrors.length;
    for (let s = 0; s < shotAt.length; s++) {
      const wait = s === 0 ? shotAt[0] : shotAt[s] - shotAt[s - 1];
      await page.waitForTimeout(wait);
      const file = path.join(FRAMES, `${fam}_${idx}_step${s}.png`);
      await page.screenshot({ path: file });
    }
    const errs = consoleErrors.slice(pageErrorsHere);
    const clean = errs.length === 0;
    if (clean) okCount++;
    console.log(`${fam}[${idx}] ans=${r.answer} consoleErrors=${errs.length} ${clean ? 'OK' : 'ERR:' + errs.join(';')}`);
  }

  console.log(`\n=== BACKTEST ${okCount}/${total} samples rendered with no console errors ===`);
  await browser.close();
  server.close();
  process.exit(0);
})();
