// tests/headless-render-test.js — 无头渲染验证
// 对 9 张卡各取 ar(RTL)、ja(CJK)、en(Latin) 三个语种的 renderParams，
// 用 Playwright 加载 renderer/index.html?data= 验证零 console/pageerror/requestfailed。
const { chromium } = require('playwright');
const registry = require('../lib/kards/registry');

const SAMPLE_PROBLEMS = {
  axis_motion: {
    en: 'A well is 10m deep. A frog climbs 3m during the day and slips 2m at night.',
    ar: 'بئر عمقه 10 متر، ضفدع يتسلق 3 متر نهاراً وينزلق 2 متر ليلاً.',
    ja: '井戸の深さ10m、カエルは昼に3m登り夜に2m滑り落ちる。',
  },
  motion: {
    en: 'Two cars are 120 km apart, driving toward each other at 40 km/h and 20 km/h.',
    ar: 'سيارتان تبعدان 120 كم، تتحركان نحو بعضهما بسرعة 40 و 20 كم/ساعة.',
    ja: '2台の車が120 km離れて時速40 kmと20 kmで向かい合って進む。',
  },
  numberline: {
    en: 'A frog starts at -3 on the number line and jumps 5 spaces to the right.',
    ar: 'ضفدع يبدأ من -3 على خط الأعداد ويقفز 5 خانات إلى اليمين.',
    ja: 'カエルは数直線上の-3から右へ5マスジャンプする。',
  },
  bars: {
    en: 'There are 24 apples. Eat 3/4 of them. How many are eaten?',
    ar: 'هناك 24 تفاحة. أكل 3/4 منها. كم تفاحة أكل؟',
    ja: 'りんごが24個ある。3/4食べた。何個食べた？',
  },
  grid: {
    en: 'Apples are arranged in 3 rows and 4 columns. How many apples total?',
    ar: 'تُرتب التفاح في 3 صفوف و 4 أعمدة. كم تفاحة في المجموع؟',
    ja: 'りんごを3行4列に並べる。全部で何個？',
  },
  balance: {
    en: 'Solve for x: 2x + 5 = 17',
    ar: 'حل المعادلة: 2x + 5 = 17',
    ja: '方程式を解け: 2x + 5 = 17',
  },
  geometry: {
    en: 'A rectangle has length 6 cm and width 4 cm. Find its perimeter.',
    ar: 'مستطيل طوله 6 سم وعرضه 4 سم. أوجد المحيط.',
    ja: '長方形の縦6 cm、横4 cm。周の長さは？',
  },
  'function-graph': {
    en: 'Find the vertex of y = x² - 4x + 3',
    ar: 'أوجد رأس القطع المكافئ y = x² - 4x + 3',
    ja: 'y = x² - 4x + 3 の頂点を求めよ。',
  },
  sequence: {
    en: 'In the sequence 1,2,2,3,3,3,... n appears n times. What is the 10th term?',
    ar: 'في المتتالية 1,2,2,3,3,3,... يظهر n مرات. ما هو الحد 10؟',
    ja: '数列 1,2,2,3,3,3,... nがn回。第10項は？',
  },
};

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/local/bin/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push('console: ' + msg.text()); });
  page.on('pageerror', err => errors.push('pageerror: ' + err.message));
  page.on('requestfailed', req => errors.push('requestfailed: ' + req.url() + ' ' + req.failure().errorText));

  // Start local server
  const http = require('http');
  const fs = require('fs');
  const path = require('path');
  const root = path.resolve(__dirname, '..');
  const server = http.createServer((req, res) => {
    let fp = path.join(root, req.url.split('?')[0]);
    if (fp === root || fp.endsWith('/')) fp = path.join(fp, 'index.html');
    if (!fs.existsSync(fp)) { res.writeHead(404); res.end(); return; }
    const ext = path.extname(fp);
    const mime = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.json':'application/json' }[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(fp).pipe(res);
  });
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;

  let pass = 0, fail = 0;
  for (const [cardId, langs] of Object.entries(SAMPLE_PROBLEMS)) {
    for (const [lang, problem] of Object.entries(langs)) {
      errors.length = 0;
      try {
        const result = await registry.runCard(cardId, problem, { language: lang });
        if (!result.eligible) {
          console.log(`SKIP ${cardId}/${lang}: not eligible (${result.reason})`);
          continue;
        }
        const rp = result.renderParams;
        const data = encodeURIComponent(JSON.stringify(rp));
        const url = `http://localhost:${port}/renderer/index.html?data=${data}`;
        await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(1500); // let animation play
        const canvasOk = await page.evaluate(() => {
          const c = document.getElementById('stage');
          return c && c.width > 0 && c.height > 0;
        });
        if (errors.length === 0 && canvasOk) {
          console.log(`PASS ${cardId}/${lang} (rtl=${rp.rtl || false})`);
          pass++;
        } else {
          console.log(`FAIL ${cardId}/${lang}: errors=${JSON.stringify(errors)} canvas=${canvasOk}`);
          fail++;
        }
      } catch (e) {
        console.log(`FAIL ${cardId}/${lang}: exception ${e.message}`);
        fail++;
      }
    }
  }

  await browser.close();
  server.close();
  console.log(`\nHeadless render: ${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})();
