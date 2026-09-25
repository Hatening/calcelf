// lib/kards/balance.js — 天平 / 等式 / 一元一次方程 / 质量比较 族知识
// CommonJS 自包含，不依赖 ESM 渲染层。
// 承载：ax+b=c 型一元一次方程、等式性质（两边同加减/同除）、天平平衡、质量比较
// CPA：具象(天平两端放盒子/砝码) → 图示(两边同步取放砝码、平均分份) → 抽象(方程求解、等号对齐)

function num(s) { return parseFloat(String(s).replace(/[，,\s]/g, '')); }

// 解析 “含 x 的一边”：返回 {a, bSigned}
// 支持 2x+5 / 2x - 5 / 5+2x / x+3 / 3x / 2*x / 3倍x加5
function parseSide(side) {
  let s = side.replace(/\s+/g, '').replace(/＝/g, '=').replace(/×/g, '*');
  s = s.replace(/倍的?x/g, 'x').replace(/个x/g, 'x');
  // 抓 x 的系数
  let a = 1;
  const coefM = s.match(/(\d+(?:\.\d+)?)\s*\*?\s*x/i);
  if (coefM) a = num(coefM[1]);
  else if (/x/i.test(s)) a = 1;
  else a = 0;

  // 去掉含 x 的项，剩下的串里找一个带符号的常数（容忍中文前缀污染）
  let rest = s.replace(/\d+(?:\.\d+)?\s*\*?\s*x/i, '');
  rest = rest.replace(/x/i, '');
  const bM = rest.match(/([+-]?\s*\d+(?:\.\d+)?)/);
  const b = bM ? num(bM[1]) : 0;
  return { a, bSigned: b };
}

module.exports = {
  id: 'balance',
  name: '天平与方程',
  keywords: [
    '天平', '平衡', '砝码', '等式', '方程', '未知数', '解方程', '移项', '两边',
    '左边', '右边', '盒子', '质量', '克', '千克', '等于',
    'balance', 'scale', 'weigh', 'equation', 'both sides', 'unknown', 'solve for x',
    'equals', 'weights', 'mass',
  ],

  match(problem, opts = {}) {
    const t = String(problem || '').toLowerCase();
    let score = 0;
    if (/(天平|balance|scale|weigh)/.test(t)) score += 6;
    if (/(方程|equation|solve for x|未知数)/.test(t)) score += 5;
    if (/(=|＝|等于)/.test(t) && /x/.test(t)) score += 4;
    if (/(两边|both sides|同加|同减|移项)/.test(t)) score += 3;
    if (/(砝码|weights|克|千克|g\b|kg\b)/.test(t)) score += 2;
    if (/(盒子|box|bag|袋)/.test(t)) score += 1;
    return score;
  },

  extract(problem, opts = {}) {
    const t = String(problem || '');
    const low = t.toLowerCase();

    let a = null, bSigned = 0, c = null;

    // 情况 A：直接给方程，如 "2x + 5 = 17"
    const eqM = t.match(/([^=＝]+)[=＝]([^=＝]+)/);
    if (eqM && /x/i.test(eqM[1] + eqM[2])) {
      const leftHasX = /x/i.test(eqM[1]);
      const sideWithX = leftHasX ? eqM[1] : eqM[2];
      const sidePlain = leftHasX ? eqM[2] : eqM[1];
      const parsed = parseSide(sideWithX);
      a = parsed.a;
      bSigned = parsed.bSigned;
      c = num(sidePlain);
    } else {
      // 情况 B：文字天平题。抓三个数：盒数 a、盘上已知砝码 b、对面砝码 c
      const nums = (t.match(/\d+(?:\.\d+)?/g) || []).map(num).filter(n => n > 0);
      const boxM = t.match(/(\d+(?:\.\d+)?)\s*(?:个|只|盒|bag|box|of)\s*(?:同样的)?(?:盒子|袋|box)/i);
      if (/(天平|balance|scale)/.test(low) && nums.length >= 2) {
        a = boxM ? num(boxM[1]) : nums[0];
        // 约定：文字题里最后一个较大数是对面砝码 c
        c = nums[nums.length - 1];
        bSigned = nums.length >= 3 ? nums[nums.length - 2] : 0;
      } else {
        return null;
      }
    }

    if (!Number.isFinite(a) || !Number.isFinite(c)) return null;
    a = Math.round(a);
    if (a <= 0) return null;
    if (c <= 0) return null;

    const unit = (t.match(/(千克|kg|公斤)/i)) ? 'kg' : ((t.match(/(克|g\b)/i)) ? 'g' : '');
    const target = c - bSigned; // a*x = target
    if (target <= 0) return null; // 儿童题不取非正解

    const confidence = eqM && /x/i.test(t) ? 0.92 : (/(天平|balance|scale)/.test(low) ? 0.7 : 0.4);
    return { a, bSigned, c, target, unit, confidence, raw: t };
  },

  solve(params, opts = {}) {
    const { a, bSigned, c, target, unit } = params;
    const lang = opts.language || 'zh-CN';
    const ZH = lang !== 'en';
    const x = target / a;
    const steps = [];
    const signWord = bSigned >= 0
      ? (ZH ? `拿走 ${bSigned}${unit}` : `take away ${bSigned}${unit}`)
      : (ZH ? `加上 ${-bSigned}${unit}` : `add ${-bSigned}${unit}`);

    steps.push({
      narration: ZH
        ? `天平是平衡的：左边 ${a} 个盒子 + ${bSigned}${unit}，右边 ${c}${unit}。`
        : `The scale is balanced: left has ${a} boxes + ${bSigned}${unit}, right has ${c}${unit}.`,
      visualHint: 'balance_initial',
    });
    if (bSigned !== 0) {
      steps.push({
        narration: ZH
          ? `两边同时${signWord}，天平仍然平衡。左边剩下 ${a} 个盒子，右边剩 ${target}${unit}。`
          : `${signWord} from BOTH sides, it stays balanced. Left = ${a} boxes, right = ${target}${unit}.`,
        visualHint: 'balance_sync',
      });
    } else {
      steps.push({
        narration: ZH
          ? `左边就是 ${a} 个盒子，右边 ${target}${unit}，天平平衡。`
          : `Left = ${a} boxes, right = ${target}${unit}, balanced.`,
        visualHint: 'balance_sync',
      });
    }
    steps.push({
      narration: ZH
        ? `把两边平均分成 ${a} 份。每 1 个盒子对应 ${x}${unit}。`
        : `Split both sides into ${a} equal groups. One box = ${x}${unit}.`,
      visualHint: 'balance_divide',
    });
    steps.push({
      narration: ZH
        ? `所以 x = ${target} ÷ ${a} = ${x}${unit}。`
        : `So x = ${target} ÷ ${a} = ${x}${unit}.`,
      visualHint: 'abstract_equation',
    });

    return {
      answer: ZH ? `${x}` : `${x}`,
      steps, a, bSigned, c, target, x, unit,
      equation: ZH ? `${a}x ${bSigned >= 0 ? '+' : '−'} ${Math.abs(bSigned)} = ${c}` : `${a}x ${bSigned >= 0 ? '+' : '-'} ${Math.abs(bSigned)} = ${c}`,
    };
  },

  validate(params, solved, opts = {}) {
    if (!solved || !solved.answer) return { ok: false, reason: 'no_answer' };
    if (!(params.a > 0)) return { ok: false, reason: 'coef_not_positive' };
    const x = (params.c - params.bSigned) / params.a;
    if (Math.abs(x - solved.x) > 1e-9) return { ok: false, reason: 'solve_mismatch' };
    if (Math.abs(Number(solved.answer) - x) > 1e-9) return { ok: false, reason: 'answer_mismatch' };
    if (!Number.isInteger(x)) return { ok: false, reason: 'non_integer_solution' };
    if (!solved.steps || solved.steps.length < 3) return { ok: false, reason: 'steps_too_short' };
    return { ok: true };
  },

  renderParams(solved, opts = {}) {
    const lang = opts.language || 'zh-CN';
    const ZH = lang !== 'en';
    const { a, bSigned, c, target, x, unit } = solved;

    const beats = [
      { id: 'initial', duration: 5000, label: ZH ? '天平平衡' : 'Balanced' },
      { id: 'sync', duration: 5000, label: bSigned === 0 ? (ZH ? '就是这些' : 'As-is') : (bSigned > 0 ? (ZH ? '两边同减' : 'Subtract both') : (ZH ? '两边同加' : 'Add both')) },
      { id: 'divide', duration: 5000, label: ZH ? '平均分份' : 'Split equally' },
      { id: 'abstract', duration: 5000, label: ZH ? '写出方程' : 'Equation' },
    ];

    return {
      type: 'balance',
      a, bSigned, c, target, x, unit,
      equation: solved.equation,
      answer: String(x),
      beats,
      scenes: [
        { type: 'balance_scale', a, bSigned, c },
        { type: 'balance_sync', a, bSigned, target },
        { type: 'balance_divide', a, each: x },
        { type: 'equation_steps', a, bSigned, c, target, x },
      ],
      i18n: {
        title: ZH ? '天平分方程' : 'Balance & Equations',
        box: ZH ? '盒子' : 'box',
        weight: ZH ? '砝码' : 'g',
        answer: ZH ? '答案' : 'Answer',
      },
    };
  },
};
