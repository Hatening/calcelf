// tests/gen-my-rp.js — 为本族(geometry/function-graph)生成 renderParams 并合并进 manifest（不覆盖他人）
const fs = require('fs');
const path = require('path');
const { runCard } = require('../lib/kards/registry.js');

const OUT = path.join(__dirname, 'rp');
fs.mkdirSync(OUT, { recursive: true });

const picks = {
  geometry: [0, 6, 16],            // 长方形周长 / 三角形面积 / 勾股
  'function-graph': [0, 9, 14],    // 两点求一次函数 / 二次顶点 / 两直线交点
};

(async () => {
  const manifestPath = path.join(OUT, 'manifest.json');
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : [];
  const have = new Set(manifest.map(m => m.fam + '_' + m.idx));
  for (const [fam, idxs] of Object.entries(picks)) {
    const samples = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'samples', fam + '.json'), 'utf8'));
    for (const i of idxs) {
      if (have.has(fam + '_' + i)) continue;
      const s = samples[i];
      const res = await runCard(fam, s.problem, { language: s.language || 'zh-CN' });
      if (!res.eligible) { console.error('NOT ELIGIBLE', fam, i, s.problem, res.reason); process.exit(2); }
      const file = path.join(OUT, `${fam}_${i}.json`);
      fs.writeFileSync(file, JSON.stringify(res.renderParams));
      manifest.push({ fam, idx: i, file: path.basename(file), problem: s.problem, answer: res.answer });
      console.log('OK', fam, i, '->', path.basename(file), 'answer=', res.answer);
    }
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('manifest now', manifest.length, 'entries');
})();
