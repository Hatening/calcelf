// tests/gen_data.js — 为无头回测挑选样本并输出 renderParams 到 tests/frames-data.json
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const cards = {
  geometry: require(path.join(ROOT, 'lib/kards/geometry.js')),
  'function-graph': require(path.join(ROOT, 'lib/kards/function-graph.js')),
};

// 每族挑 3 个样本（覆盖不同形状/函数）
const picks = {
  geometry: [0, 6, 16],      // 长方形周长 / 三角形面积 / 勾股
  'function-graph': [0, 9, 14], // 两点求一次函数 / 二次顶点 / 两直线交点
};

const out = [];
for (const [fam, idxs] of Object.entries(picks)) {
  const card = cards[fam];
  const samples = JSON.parse(fs.readFileSync(path.join(ROOT, `samples/${fam}.json`), 'utf8'));
  idxs.forEach((si, k) => {
    const s = samples[si];
    const params = card.extract(s.problem, { language: s.language });
    const solved = card.solve(params, { language: s.language });
    const rp = card.renderParams(solved, { language: s.language });
    out.push({ family: fam, tag: `s${k}`, problem: s.problem, renderParams: rp });
  });
}
fs.writeFileSync(path.join(ROOT, 'tests/frames-data.json'), JSON.stringify(out, null, 2));
console.log('wrote', out.length, 'renderParams');
