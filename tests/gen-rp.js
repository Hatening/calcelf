// tests/gen-rp.js — 为选定样本生成 renderParams，写 tests/rp/<fam>_<i>.json
const fs = require('fs');
const path = require('path');
const { runCard } = require('../lib/kards/registry.js');

const OUT = path.join(__dirname, 'rp');
fs.mkdirSync(OUT, { recursive: true });

const picks = {
  grid: [0, 3, 13],
  balance: [0, 4, 11],
};

(async () => {
  const manifest = [];
  for (const [fam, idxs] of Object.entries(picks)) {
    const samples = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'samples', fam + '.json'), 'utf8'));
    for (const i of idxs) {
      const s = samples[i];
      const res = await runCard(fam, s.problem, { language: s.language || 'zh-CN' });
      if (!res.eligible) { console.error('NOT ELIGIBLE', fam, i, s.problem, res.reason); process.exit(2); }
      const file = path.join(OUT, `${fam}_${i}.json`);
      fs.writeFileSync(file, JSON.stringify(res.renderParams));
      manifest.push({ fam, idx: i, file: path.basename(file), problem: s.problem, answer: res.answer });
      console.log('OK', fam, i, '->', path.basename(file), 'answer=', res.answer);
    }
  }
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
})();
