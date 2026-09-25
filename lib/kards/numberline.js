// lib/kards/numberline.js — 数轴族知识卡
// 承载：整数加减（正负数方向跳跃）、分数比较
// CPA：具象(小动物/小球在数轴上跳) → 图示(numberLine 刻度+跳跃弧线) → 抽象(数字算式)
module.exports = {
  id: 'numberline',
  name: '数轴',
  keywords: [
    '数轴', '向右跳', '向左跳', '向右走', '向左走', '格', '起点', '正负数', '负数',
    '分数', '比较', '哪个大', '几分之几', '大于', '小于',
    'number line', 'jump', 'hop', 'right', 'left', 'fraction', 'compare', 'greater',
  ],

  match(problem, opts = {}) {
    const t = String(problem || '').toLowerCase();
    let score = 0;
    if (/(数轴|number line)/.test(t)) score += 5;
    if (/(向右|right|向右跳|右跳)/.test(t)) score += 3;
    if (/(向左|left|向左跳|左跳)/.test(t)) score += 3;
    if (/(格|跳|hop|jump|spaces)/.test(t)) score += 2;
    if (/(分数|fraction|比较|compare|大于|小于)/.test(t)) score += 3;
    if (/(负数|negative|-)/.test(t)) score += 1;
    return score;
  },

  extract(problem, opts = {}) {
    const t = String(problem || '');
    const tl = t.toLowerCase();

    // —— 分数比较模式 ——
    const frac = t.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*(?:和|与|跟|,|，|and|vs)\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
    const fracCN = t.match(/(\d+)\s*分之\s*(\d+)\s*(?:和|与|跟)\s*(\d+)\s*分之\s*(\d+)/);
    if (frac || fracCN) {
      let n1, d1, n2, d2;
      if (frac) [, n1, d1, n2, d2] = frac;
      else [, d1, n1, d2, n2] = fracCN; // 中文 a分之b → b/a
      n1 = +n1; d1 = +d1; n2 = +n2; d2 = +d2;
      if (d1 === 0 || d2 === 0) return null;
      return {
        mode: 'fractionCompare', n1, d1, n2, d2,
        confidence: 0.9, unit: '', raw: t,
      };
    }

    // —— 整数加减跳跃模式 ——
    // 起点：从 X 出发 / 在 X / start at X
    const startM =
      t.match(/从\s*(-?\d+(?:\.\d+)?)\s*出发/) ||
      t.match(/在\s*数?轴?\s*上?\s*的?\s*(-?\d+(?:\.\d+)?)/) ||
      t.match(/starts?\s+at\s*(-?\d+(?:\.\d+)?)/i) ||
      t.match(/starting\s+at\s*(-?\d+(?:\.\d+)?)/i);
    if (!startM) return null;
    const start = parseFloat(startM[1]);

    // 方向
    let dir = 0;
    if (/(向右|往右|右跳|右走|right|to the right|→)/.test(tl)) dir = +1;
    else if (/(向左|往左|左跳|左走|left|to the left|←)/.test(tl)) dir = -1;
    if (dir === 0) return null;

    // 跳几格 / 加 / 减
    const jumpM =
      t.match(/跳\s*(\d+(?:\.\d+)?)\s*(格|步|个单位|格)?/) ||
      t.match(/走\s*(\d+(?:\.\d+)?)\s*(格|步|个单位)/) ||
      t.match(/(?:jumps?|hops?|hopped|moved?|moves?)\s+(\d+(?:\.\d+)?)\s*(spaces?|steps?)/i);
    if (!jumpM) return null;
    const jump = parseFloat(jumpM[1]);

    // 操作：向右=加，向左=减
    const op = dir > 0 ? '+' : '-';

    // 演员
    let actor = '🐸';
    if (/(兔|rabbit|bunny)/i.test(t)) actor = '🐇';
    else if (/(鸟|bird)/i.test(t)) actor = '🐦';
    else if (/(狗|dog)/i.test(t)) actor = '🐕';
    else if (/(猴|monkey)/i.test(t)) actor = '🐒';
    else if (/(球|ball)/i.test(t)) actor = '⚽';

    return {
      mode: 'jump', start, op, jump, dir, actor,
      confidence: 0.85, unit: '', raw: t,
    };
  },

  solve(params, opts = {}) {
    const steps = [];
    let answer, result = null;

    if (params.mode === 'fractionCompare') {
      const { n1, d1, n2, d2 } = params;
      const v1 = n1 / d1, v2 = n2 / d2;
      const diff = n1 * d2 - n2 * d1; // 交叉相乘
      const a = `${n1}/${d1}`, b = `${n2}/${d2}`;
      steps.push({ narration: `把两个分数 ${a} 和 ${b} 放到数轴上比位置。`, visualHint: 'two_fractions' });
      steps.push({ narration: `通分交叉相乘：${n1}×${d2}=${n1 * d2}，${n2}×${d1}=${n2 * d1}。`, visualHint: 'cross' });
      if (diff > 0) {
        steps.push({ narration: `${n1 * d2} > ${n2 * d1}，所以 ${a} 在 ${b} 的右边，${a} 更大。`, visualHint: 'result' });
        answer = `${a} 更大`;
        result = v1;
      } else if (diff < 0) {
        steps.push({ narration: `${n1 * d2} < ${n2 * d1}，所以 ${b} 在 ${a} 的右边，${b} 更大。`, visualHint: 'result' });
        answer = `${b} 更大`;
        result = v2;
      } else {
        steps.push({ narration: `两边相等，两个分数一样大。`, visualHint: 'result' });
        answer = `一样大`;
        result = v1;
      }
      return { answer, steps, mode: 'fractionCompare', n1, d1, n2, d2, v1, v2, result };
    }

    // jump
    const { start, op, jump } = params;
    result = op === '+' ? start + jump : start - jump;
    steps.push({ narration: `从数轴上的 ${start} 出发。`, visualHint: 'start' });
    steps.push({
      narration: op === '+'
        ? `向右（正方向）跳 ${jump} 格，做加法：${start} + ${jump}。`
        : `向左（负方向）跳 ${jump} 格，做减法：${start} − ${jump}。`,
      visualHint: 'jump_arc',
    });
    steps.push({ narration: `落地后在 ${result}。`, visualHint: 'land' });
    answer = `${result}`;
    return { answer, steps, mode: 'jump', start, op, jump, result, actor: params.actor };
  },

  validate(params, solved, opts = {}) {
    if (!solved || !solved.answer) return { ok: false, reason: 'no_answer' };
    if (!solved.steps || solved.steps.length < 3) return { ok: false, reason: 'steps_too_short' };
    if (solved.mode === 'jump') {
      const expect = params.op === '+' ? params.start + params.jump : params.start - params.jump;
      if (Math.abs(expect - solved.result) > 1e-9) return { ok: false, reason: 'jump_mismatch' };
    } else if (solved.mode === 'fractionCompare') {
      const diff = params.n1 * params.d2 - params.n2 * params.d1;
      if (diff > 0 && !/更大/.test(solved.answer)) return { ok: false, reason: 'frac_wrong_dir' };
    }
    return { ok: true };
  },

  renderParams(solved, opts = {}) {
    const lang = opts.language || 'en';
    if (solved.mode === 'jump') {
      const { start, result, op, jump, actor } = solved;
      const lo = Math.min(start, result, 0);
      const hi = Math.max(start, result, 0);
      const pad = Math.max(1, Math.ceil((hi - lo) * 0.15));
      const min = Math.floor(lo - pad), max = Math.ceil(hi + pad);
      const eqText = op === '+' ? `${start} + ${jump} = ${result}` : `${start} − ${jump} = ${result}`;
      return {
        type: 'numberline',
        scene: {
          mode: 'jump', start, end: result, op, jump,
          min, max, actor: actor || '🐸',
        },
        beats: [
          { id: 'start', duration: 3500, label: lang === 'zh-CN' ? '出发点' : 'Start' },
          { id: 'jump', duration: 4500, label: lang === 'zh-CN' ? '跳跃' : 'Jump' },
          { id: 'land', duration: 3500, label: lang === 'zh-CN' ? '落点' : 'Land' },
          { id: 'eq', duration: 3500, label: lang === 'zh-CN' ? '算式' : 'Equation' },
        ],
        answer: solved.answer,
        scenes: [
          { type: 'numberline', start, end: result, min, max },
          { type: 'equation', text: eqText },
        ],
      };
    }

    // fraction compare
    const { n1, d1, n2, d2, v1, v2 } = solved;
    const eqText = `${n1}/${d1}  vs  ${n2}/${d2}`;
    return {
      type: 'numberline',
      scene: {
        mode: 'fractionCompare', n1, d1, n2, d2, v1, v2,
        min: 0, max: 1,
      },
      beats: [
        { id: 'locate1', duration: 4000, label: `${n1}/${d1}` },
        { id: 'locate2', duration: 4000, label: `${n2}/${d2}` },
        { id: 'cmp', duration: 4000, label: lang === 'zh-CN' ? '比较' : 'Compare' },
        { id: 'eq', duration: 3500, label: lang === 'zh-CN' ? '算式' : 'Equation' },
      ],
      answer: solved.answer,
      scenes: [
        { type: 'numberline', fractions: [{ v: v1, label: `${n1}/${d1}` }, { v: v2, label: `${n2}/${d2}` }], min: 0, max: 1 },
        { type: 'equation', text: eqText },
      ],
    };
  },
};
