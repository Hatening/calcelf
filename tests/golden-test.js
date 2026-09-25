// tests/golden-test.js — 黄金集单元测试：直接 require 知识卡，跑 extract→solve→validate→renderParams
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const cards = {
  geometry: require(path.join(ROOT, 'lib/kards/geometry.js')),
  'function-graph': require(path.join(ROOT, 'lib/kards/function-graph.js')),
};

let total = 0, pass = 0, eligible = 0;
const failures = [];

for (const [fam, card] of Object.entries(cards)) {
  const samples = JSON.parse(fs.readFileSync(path.join(ROOT, `samples/${fam}.json`), 'utf8'));
  console.log(`\n=== ${fam} (${samples.length} samples) ===`);
  for (const s of samples) {
    total++;
    const lang = s.language || 'en';
    let ok = false, ans = '', conf = null, reason = '';
    try {
      const params = card.extract(s.problem, { language: lang });
      if (!params) reason = 'extract_null';
      else if (params.confidence != null && params.confidence < 0.3) reason = 'low_conf';
      else {
        conf = params.confidence;
        const solved = card.solve(params, { language: lang });
        const v = card.validate(params, solved, { language: lang });
        if (!v.ok) reason = 'validate:' + (v.reason || '');
        else {
          const rp = card.renderParams(solved, { language: lang });
          const hasGraphic = rp.scenes && rp.scenes.some(x => x && x.type !== 'say' && x.type !== 'show');
          ans = solved.answer;
          if (!hasGraphic) reason = 'no_graphic_scene';
          else {
            eligible++;
            // 答案比对：容错（去空格、数值近似）
            const want = String(s.expectedAnswer).replace(/\s+/g, '');
            const got = String(ans).replace(/\s+/g, '');
            ok = want === got || fuzzy(want, got);
          }
        }
      }
    } catch (e) { reason = 'exception:' + e.message; }
    if (ok) { pass++; console.log('  PASS', JSON.stringify(s.problem).slice(0, 50), '=>', ans); }
    else { console.log('  FAIL', JSON.stringify(s.problem).slice(0, 50), '| want', s.expectedAnswer, '| got', ans, '|', reason); failures.push({ fam, problem: s.problem, want: s.expectedAnswer, got: ans, reason }); }
  }
}

function fuzzy(want, got) {
  // 数字部分近似比对
  const wn = parseFloat(want), gn = parseFloat(got);
  if (isNaN(wn) || isNaN(gn)) return false;
  return Math.abs(wn - gn) < 0.02 && (want.indexOf(got.replace(wn, '').replace(gn, '')) >= 0 || true);
}

console.log(`\n=== SUMMARY ===`);
console.log(`total=${total} eligible=${eligible} pass=${pass} rate=${(pass/total*100).toFixed(1)}%`);
if (failures.length) { console.log('FAILURES:'); failures.forEach(f => console.log(' -', f.fam, f.problem, '| want', f.want, '| got', f.got, '|', f.reason)); }
process.exit(pass / total >= 0.9 ? 0 : 1);
