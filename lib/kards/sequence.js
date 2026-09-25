// lib/kards/sequence.js — 分组数列 / 找规律 族知识卡
// 承载：自然数 n 连续出现 n 次（1, 2,2, 3,3,3, 4,4,4,4, …），求第 N 个数。
// 方法：前 k 组累计个数 = 三角形数 T(k)=1+2+…+k=k(k+1)/2；
//       找 m 使 T(m-1) < N ≤ T(m)，则第 N 个数 = m。
// CPA：具象(分组卡片，每组 n 张写着 n) → 图示(累计三角形数) → 抽象(定位不等式 + 公式)。
'use strict';

const isZh = (opts) => String((opts || {}).language || '').indexOf('zh') === 0;

module.exports = {
  id: 'sequence',
  name: '分组数列',
  keywords: [
    '一串数', '这串数', '连续出现', '找规律', '三角形数', '按规律', '自然数',
    '个数是多少', '第几个', '数列',
    'sequence', 'in a row', 'appears', 'consecutive', 'nth term', 'term number', 'pattern',
  ],

  match(problem /*, opts */) {
    const t = String(problem || '');
    let s = 0;
    if (/连续出现\s*n\s*次|出现\s*n\s*次/.test(t)) s += 8;
    if (/1[，,、\s]{1,3}2[，,、\s]{1,3}2[，,、\s]{1,3}3[，,、\s]{1,3}3[，,、\s]{1,3}3/.test(t)) s += 6;
    if (/一串数|这串数/.test(t)) s += 4;
    if (/三角形数/.test(t)) s += 4;
    if (/自然数\s*n/.test(t)) s += 3;
    if (/第\s*\d+\s*个/.test(t)) s += 3;
    if (/appears?\s+n\s+times|n\s+times in a row/i.test(t)) s += 8;
    if (/\d+(?:st|nd|rd|th)\s+term|term\s+(?:number\s*)?\d+/i.test(t)) s += 3;
    if (/sequence|pattern/i.test(t)) s += 2;
    return s;
  },

  extract(problem /*, opts */) {
    const t = String(problem || '');

    // 规则确认：必须是“n 出现 n 次”，或给出 1,2,2,3,3,3 前缀，避免误接其它数列题。
    const ruleRe = /连续出现\s*n\s*次|出现\s*n\s*次|appears?\s+n\s+times|n\s+times in a row/i;
    const prefixRe = /1[，,、\s]{1,3}2[，,、\s]{1,3}2[，,、\s]{1,3}3[，,、\s]{1,3}3[，,、\s]{1,3}3/;
    const hasRule = ruleRe.test(t);
    const hasPrefix = prefixRe.test(t);
    if (!hasRule && !hasPrefix) return null;

    // 求第 N 个
    let N = null;
    const nCN = t.match(/第\s*(\d+)\s*个/);
    const nEN = t.match(/(\d+)(?:st|nd|rd|th)\s+term|term\s+(?:number\s*)?(\d+)/i);
    if (nCN) N = parseInt(nCN[1], 10);
    else if (nEN) N = parseInt(nEN[1] || nEN[2], 10);
    if (!N || N < 1 || !Number.isFinite(N)) return null;

    return {
      mode: 'grouped', N,
      confidence: hasRule ? 0.92 : 0.8,
      raw: t,
    };
  },

  solve(params, opts = {}) {
    const zh = isZh(opts);
    const N = params.N;

    // m = ceil((sqrt(1+8N)-1)/2)，使 T(m-1) < N ≤ T(m)
    const m = Math.max(1, Math.ceil((Math.sqrt(1 + 8 * N) - 1) / 2 - 1e-9));
    const Tprev = (m - 1) * m / 2;
    const Tm = m * (m + 1) / 2;
    const offsetWithin = N - Tprev; // 第 m 组里的第几个

    const steps = zh ? [
      { narration: `先看规律：1 出现 1 次，2 连续出现 2 次，3 连续出现 3 次…… 第 n 组就是 n 个“n”。`, visualHint: 'groups' },
      { narration: `数到第 k 组结束，一共出现 T(k)=1+2+…+k=k(k+1)/2 个数，这就是三角形数。`, visualHint: 'triangle' },
      { narration: `定位第 ${N} 个：T(${m - 1})=${Tprev}，T(${m})=${Tm}，而 ${Tprev} < ${N} ≤ ${Tm}，所以它在第 ${m} 组（第 ${offsetWithin} 个）。`, visualHint: 'locate' },
      { narration: `第 ${m} 组里的数全部是 ${m}，因此第 ${N} 个数就是 ${m}。`, visualHint: 'answer' },
    ] : [
      { narration: `See the pattern: 1 appears once, 2 appears twice, 3 three times… block n holds n copies of n.`, visualHint: 'groups' },
      { narration: `Through block k there are T(k)=1+2+…+k=k(k+1)/2 terms — the triangular numbers.`, visualHint: 'triangle' },
      { narration: `Locate term ${N}: T(${m - 1})=${Tprev}, T(${m})=${Tm}, and ${Tprev} < ${N} ≤ ${Tm}, so it lies in block ${m} (copy ${offsetWithin}).`, visualHint: 'locate' },
      { narration: `Every term in block ${m} equals ${m}, so the ${N}th term is ${m}.`, visualHint: 'answer' },
    ];

    return {
      answer: `${m}`,
      steps,
      mode: 'grouped', N, m, Tprev, Tm, offsetWithin,
    };
  },

  validate(params, solved /*, opts */) {
    if (!solved || !solved.answer) return { ok: false, reason: 'no_answer' };
    if (!solved.steps || solved.steps.length < 4) return { ok: false, reason: 'steps_too_short' };
    const { N, m, Tprev, Tm } = solved;
    if (!(Tprev < N && N <= Tm)) return { ok: false, reason: 'n_out_of_block' };
    // 复核 m 的三角形数边界
    if (Tprev !== (m - 1) * m / 2 || Tm !== m * (m + 1) / 2) return { ok: false, reason: 'triangular_mismatch' };
    if (parseInt(solved.answer, 10) !== m) return { ok: false, reason: 'answer_mismatch' };
    return { ok: true };
  },

  renderParams(solved, opts = {}) {
    const zh = isZh(opts);
    const { N, m, Tprev, Tm, offsetWithin } = solved;
    return {
      type: 'sequence',
      language: zh ? 'zh' : 'en',
      scene: { N, m, Tprev, Tm, offsetWithin },
      beats: [
        { id: 'groups', duration: 5000, label: zh ? '看规律：n 出现 n 次' : 'Pattern: n appears n times' },
        { id: 'triangle', duration: 5000, label: zh ? '累计：三角形数 T(k)' : 'Cumulative: triangular T(k)' },
        { id: 'locate', duration: 5000, label: zh ? `定位第 ${N} 个` : `Locate term ${N}` },
        { id: 'answer', duration: 5000, label: zh ? `第 ${N} 个数 = ${m}` : `Term ${N} = ${m}` },
      ],
      answer: solved.answer,
      scenes: [{ type: 'equation', text: zh ? `T(k)=k(k+1)/2，T(${m - 1})=${Tprev}<${N}≤T(${m})=${Tm}` : `T(k)=k(k+1)/2, T(${m - 1})=${Tprev}<${N}≤T(${m})=${Tm}` }],
    };
  },
};
