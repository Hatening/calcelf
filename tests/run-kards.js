// tests/run-kards.js — node 无头单测：对 grid / balance 两族跑样本集
const path = require('path');
const fs = require('fs');
const { runCard, classify } = require('../lib/kards/registry.js');

const ROOT = path.join(__dirname, '..');
const families = ['grid', 'balance'];

let total = 0, pass = 0;
const report = {};

(async () => {
  for (const fid of families) {
    const samples = JSON.parse(fs.readFileSync(path.join(ROOT, 'samples', fid + '.json'), 'utf8'));
    report[fid] = { pass: 0, fail: 0, fails: [] };
    for (const s of samples) {
      total++;
      const lang = s.language || 'zh-CN';
      const res = await runCard(fid, s.problem, { language: lang });
      let ok = true;
      if (!res.eligible) ok = false;
      else if (String(res.answer).trim() !== String(s.expectedAnswer).trim()) ok = false;
      // 质量门：必须有图形场景
      if (res.eligible) {
        const hasGraphic = res.renderParams && res.renderParams.scenes &&
          res.renderParams.scenes.some(sc => sc && sc.type && sc.type !== 'say' && sc.type !== 'show');
        if (!hasGraphic) ok = false;
      }
      if (ok) { pass++; report[fid].pass++; }
      else {
        report[fid].fail++;
        report[fid].fails.push({
          problem: s.problem,
          expected: s.expectedAnswer,
          got: res.eligible ? res.answer : ('NOT_ELIGIBLE:' + res.reason),
          confidence: res.params && res.params.confidence,
        });
      }
    }
  }
  console.log('==== KARD UNIT TEST REPORT ====');
  for (const fid of families) {
    const r = report[fid];
    console.log(`\n[${fid}] pass=${r.pass} fail=${r.fail} rate=${(100 * r.pass / (r.pass + r.fail)).toFixed(1)}%`);
    for (const f of r.fails) {
      console.log('  FAIL:', JSON.stringify(f, null, 0));
    }
  }
  console.log(`\nTOTAL pass=${pass}/${total}  rate=${(100 * pass / total).toFixed(1)}%`);
  process.exit(pass / total >= 0.9 ? 0 : 1);
})();
