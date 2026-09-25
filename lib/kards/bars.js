// lib/kards/bars.js — 条形模型族知识卡
// 承载：分数应用题（求部分量）、百分比、和倍问题（tape model）
// CPA：具象(真实物体排列) → 图示(等宽条形 tape model，分段着色) → 抽象(分数/比例算式)
module.exports = {
  id: 'bars',
  name: '条形模型',
  keywords: [
    '苹果', '糖果', '书本', '绳子', '一袋', '一根', '分数', '几分之几', '吃掉', '用去',
    '百分之', '%', '百分比', '和倍', '是乙的', '几倍', '一共', '总和',
    'apple', 'candy', 'book', 'fraction', 'percent', '%', 'times as many', 'total',
  ],

  match(problem, opts = {}) {
    const t = String(problem || '').toLowerCase();
    let score = 0;
    if (/(几分之几|分之|分数|fraction)/.test(t)) score += 5;
    if (/(百分之|%|percent)/.test(t)) score += 5;
    if (/(倍|times as|倍数)/.test(t)) score += 4;
    if (/(吃掉|用去|读了|喝了|完成了|吃了|用了)/.test(t)) score += 3;
    if (/(一共|总和|和是|共|total|sum)/.test(t)) score += 2;
    return score;
  },

  extract(problem, opts = {}) {
    const t = String(problem || '');
    const tl = t.toLowerCase();

    // —— 百分比模式 ——
    const pctM = t.match(/(\d+(?:\.\d+)?)\s*%/) || t.match(/百分之\s*(\d+(?:\.\d+)?)/);
    if (pctM && !/分之/.test(t)) {
      // 总量：第一个正整数（百分比之外）
      const nums = (t.match(/\d+(?:\.\d+)?/g) || []).map(Number);
      const pct = parseFloat(pctM[1]);
      const totalCandidates = nums.filter(n => Math.abs(n - pct) > 1e-9);
      const total = totalCandidates[0] ?? null;
      if (total == null || total <= 0) return null;
      let object = '🍎';
      if (/(书|book|页|page)/.test(tl)) object = '📖';
      else if (/(绳|rope|线|string)/.test(tl)) object = '📏';
      else if (/(糖|candy)/.test(tl)) object = '🍬';
      return { mode: 'percent', total, pct, object, confidence: 0.88, unit: '', raw: t };
    }

    // —— 分数模式：总量 + a/b ——
    const frac = t.match(/(\d+)\s*\/\s*(\d+)/);
    const fracCN = t.match(/(\d+)\s*分之\s*(\d+)/);
    if (frac || fracCN) {
      let num, den;
      if (frac) [, num, den] = frac; else [, den, num] = fracCN; // a分之b = b/a
      num = +num; den = +den;
      if (den === 0) return null;
      const nums = (t.match(/\d+(?:\.\d+)?/g) || []).map(Number);
      const totalCandidates = nums.filter(n => n !== num && n !== den);
      const total = totalCandidates[0] ?? null;
      if (total == null || total <= 0) return null;
      let object = '🍎';
      if (/(糖|candy)/.test(tl)) object = '🍬';
      else if (/(书|book|页|page)/.test(tl)) object = '📖';
      else if (/(绳|rope|线|string|米)/.test(tl)) object = '📏';
      else if (/(饼干|cookie)/.test(tl)) object = '🍪';
      return { mode: 'fraction', total, num, den, object, confidence: 0.88, unit: '', raw: t };
    }

    // —— 和倍模式：两数和，甲是乙的 k 倍，求乙 ——
    const sumM = t.match(/(?:和是|一共|共有|总和|和为|总共|共有)\s*(\d+(?:\.\d+)?)/) || t.match(/total(?:\s+is)?\s*(\d+(?:\.\d+)?)/i);
    const timesM = t.match(/是\s*([^，。,的]{1,8}?)\s*的\s*(\d+(?:\.\d+)?)\s*倍/) ||
                   t.match(/(\d+(?:\.\d+)?)\s*times\s*as\s*(?:many|much)/i);
    if (sumM && timesM) {
      const sum = parseFloat(sumM[1]);
      // 中文分支 group[2]=倍数；英文 fallback group[1]=倍数
      const k = parseFloat(timesM[2] != null ? timesM[2] : timesM[1]);
      if (!(k > 0)) return null;
      return { mode: 'multiple', sum, k, confidence: 0.85, unit: '', raw: t };
    }

    return null;
  },

  solve(params, opts = {}) {
    const steps = [];
    let answer, part = null, unitVal = null;

    if (params.mode === 'fraction') {
      const { total, num, den } = params;
      part = total * num / den;
      steps.push({ narration: `整条条形代表全部 ${total} 个，看作单位“1”。`, visualHint: 'whole_bar' });
      steps.push({ narration: `平均分成 ${den} 等份，每份是 ${total} ÷ ${den} = ${total / den}。`, visualHint: 'split' });
      steps.push({ narration: `取其中的 ${num} 份：${total} ÷ ${den} × ${num} = ${part}。`, visualHint: 'highlight' });
      answer = `${part}${Number.isInteger(part) ? '' : ''}`;
      return { answer, steps, mode: 'fraction', total, num, den, part, object: params.object };
    }

    if (params.mode === 'percent') {
      const { total, pct } = params;
      part = total * pct / 100;
      steps.push({ narration: `整条条形代表全部 ${total}，看作 100%。`, visualHint: 'whole_bar' });
      steps.push({ narration: `${pct}% 就是把整条平均分成 100 份取 ${pct} 份。`, visualHint: 'split' });
      steps.push({ narration: `部分 = ${total} × ${pct}% = ${total} × ${pct / 100} = ${part}。`, visualHint: 'highlight' });
      answer = `${part}`;
      return { answer, steps, mode: 'percent', total, pct, part, object: params.object };
    }

    // multiple（和倍）
    const { sum, k } = params;
    unitVal = sum / (k + 1); // 乙=1份，甲=k份，共 k+1 份
    steps.push({ narration: `把乙数看作 1 份，甲数就是 ${k} 份。`, visualHint: 'two_bars' });
    steps.push({ narration: `一共 ${k}＋1＝${k + 1} 份，对应总和 ${sum}。`, visualHint: 'total_units' });
    steps.push({ narration: `1 份 = ${sum} ÷ ${k + 1} = ${unitVal}，所以乙数是 ${unitVal}。`, visualHint: 'highlight' });
    answer = `${unitVal}`;
    return { answer, steps, mode: 'multiple', sum, k, unitVal };
  },

  validate(params, solved, opts = {}) {
    if (!solved || !solved.answer) return { ok: false, reason: 'no_answer' };
    if (!solved.steps || solved.steps.length < 3) return { ok: false, reason: 'steps_too_short' };
    if (solved.mode === 'fraction') {
      const expect = params.total * params.num / params.den;
      if (Math.abs(expect - solved.part) > 1e-9) return { ok: false, reason: 'frac_mismatch' };
    } else if (solved.mode === 'percent') {
      const expect = params.total * params.pct / 100;
      if (Math.abs(expect - solved.part) > 1e-9) return { ok: false, reason: 'pct_mismatch' };
    } else if (solved.mode === 'multiple') {
      const expect = params.sum / (params.k + 1);
      if (Math.abs(expect - solved.unitVal) > 1e-9) return { ok: false, reason: 'mult_mismatch' };
    }
    return { ok: true };
  },

  renderParams(solved, opts = {}) {
    const lang = opts.language || 'en';
    const L = lang === 'zh-CN'
      ? { whole: '整体=单位1', split: '平均分份', pick: '取部分', eq: '算式' }
      : { whole: 'Whole = 1 unit', split: 'Split equally', pick: 'Pick part', eq: 'Equation' };

    if (solved.mode === 'fraction') {
      const { total, num, den, part, object } = solved;
      const eqText = `${total} ÷ ${den} × ${num} = ${part}`;
      return {
        type: 'bars',
        scene: { mode: 'fraction', total, num, den, part, object: object || '🍎' },
        beats: [
          { id: 'objects', duration: 4000, label: lang === 'zh-CN' ? '实物' : 'Objects' },
          { id: 'whole', duration: 3500, label: L.whole },
          { id: 'split', duration: 4000, label: L.split },
          { id: 'pick', duration: 3500, label: L.pick },
          { id: 'eq', duration: 3500, label: L.eq },
        ],
        answer: solved.answer,
        scenes: [
          { type: 'tape', total, num, den, part },
          { type: 'equation', text: eqText },
        ],
      };
    }

    if (solved.mode === 'percent') {
      const { total, pct, part, object } = solved;
      const eqText = `${total} × ${pct}% = ${part}`;
      return {
        type: 'bars',
        scene: { mode: 'percent', total, pct, part, object: object || '🍎' },
        beats: [
          { id: 'objects', duration: 4000, label: lang === 'zh-CN' ? '实物' : 'Objects' },
          { id: 'whole', duration: 3500, label: L.whole },
          { id: 'pct', duration: 4500, label: `${pct}%` },
          { id: 'eq', duration: 3500, label: L.eq },
        ],
        answer: solved.answer,
        scenes: [
          { type: 'tape', total, pct, part },
          { type: 'equation', text: eqText },
        ],
      };
    }

    // multiple
    const { sum, k, unitVal } = solved;
    const eqText = `${sum} ÷ (${k} + 1) = ${unitVal}`;
    return {
      type: 'bars',
      scene: { mode: 'multiple', sum, k, unitVal },
      beats: [
        { id: 'bars', duration: 4000, label: lang === 'zh-CN' ? '画条形' : 'Bars' },
        { id: 'count', duration: 4500, label: lang === 'zh-CN' ? `共${k + 1}份` : `${k + 1} units` },
        { id: 'one', duration: 4000, label: lang === 'zh-CN' ? '求1份' : '1 unit' },
        { id: 'eq', duration: 3500, label: L.eq },
      ],
      answer: solved.answer,
      scenes: [
        { type: 'tapeMultiple', sum, k, unitVal },
        { type: 'equation', text: eqText },
      ],
    };
  },
};
