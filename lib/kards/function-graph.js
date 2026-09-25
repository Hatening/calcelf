// lib/kards/function-graph.js — 函数图像族知识卡
// 承载：一次函数 y=kx+b、二次函数 y=ax²+bx+c、两点求解析式、函数值、两直线交点、顶点
// CPA：具象(行程距离-时间/水温变化) → 图示(坐标系+曲线逐点动画+关键点) → 抽象(斜率/截距/顶点公式)
'use strict';

function r2(x) {
  if (typeof x !== 'number' || !isFinite(x)) return x;
  const r = Math.round(x * 100) / 100;
  return Object.is(r, -0) ? 0 : r;
}

// 把数字格式成算式里好看的样子：2 -> "2"，-1 -> "-1"，0.5 -> "0.5"
function fnum(x) {
  const r = r2(x);
  return Object.is(r, -0) ? '0' : String(r);
}

// 解析一次函数右侧："2x+1" / "-3x-2" / "x" / "-x" / "0.5x-3" / "4"
function parseLinear(right) {
  let e = String(right).replace(/\s+/g, '');
  let k = 0, b = 0;
  const xm = e.match(/([+-]?\d*\.?\d*)x/);
  if (xm) {
    const s = xm[1];
    k = (s === '' || s === '+') ? 1 : (s === '-' ? -1 : parseFloat(s));
    e = e.replace(xm[0], '');
    b = e.trim() === '' ? 0 : (parseFloat(e) || 0);
  } else {
    b = parseFloat(e) || 0;
  }
  return { k, b };
}

// 解析二次函数右侧："x²-4x+3" / "2x²+8x+6" / "-x²+2x" / "x²"
function parseQuad(right) {
  let e = String(right).replace(/\s+/g, '');
  const am = e.match(/([+-]?\d*\.?\d*)x²/);
  if (!am) return null;
  let a = am[1]; a = (a === '' || a === '+') ? 1 : (a === '-' ? -1 : parseFloat(a));
  e = e.replace(am[0], '');
  let b = 0;
  const bm = e.match(/([+-]?\d*\.?\d*)x/);
  if (bm) { const s = bm[1]; b = (s === '' || s === '+') ? 1 : (s === '-' ? -1 : parseFloat(s)); e = e.replace(bm[0], ''); }
  const c = e.trim() === '' ? 0 : (parseFloat(e) || 0);
  return { a, b, c };
}

function linearEq(k, b) {
  let s = 'y=';
  if (k === 0) return s + fnum(b);
  s += (k === 1 ? 'x' : k === -1 ? '-x' : fnum(k) + 'x');
  if (b > 0) s += '+' + fnum(b);
  else if (b < 0) s += fnum(b);
  return s;
}

module.exports = {
  id: 'function-graph',
  name: '函数图像',
  keywords: [
    '函数', '一次函数', '二次函数', '解析式', '斜率', '截距', '交点', '顶点',
    '图像', '坐标系', 'y=', 'x²', '抛物线', '直线',
    'function', 'linear', 'quadratic', 'slope', 'intercept', 'vertex',
    'parabola', 'graph', 'coordinate',
  ],

  match(problem, opts = {}) {
    const t = String(problem || '').toLowerCase();
    let s = 0;
    if (/(一次函数|直线|解析式)/.test(t)) s += 3;
    if (/(二次函数|抛物线|parabola|vertex|顶点)/.test(t)) s += 4;
    if (/(斜率|slope|截距|intercept)/.test(t)) s += 3;
    if (/(交点|intersection)/.test(t)) s += 4;
    if (/(函数图像|坐标系|graph)/.test(t)) s += 2;
    if (/(y\s*=\s*[^。？?]*x)/.test(t)) s += 3;
    if (/(x²|x\^2)/.test(t)) s += 4;
    if (/(行程|距离.*时间|水温|temperature|distance.*time)/.test(t)) s += 1;
    return s;
  },

  extract(problem, opts = {}) {
    const t = String(problem || '');
    const low = t.toLowerCase();

    // —— 抓所有 y=... 表达式（只吞数学字符，遇到空格/汉字即停）——
    const eqRe = /y\s*=\s*([+-]?\d*\.?\d*x(?:²)?(?:\s*[+-]\s*\d*\.?\d*(?:x(?:²)?)?)*)/g;
    const eqs = [];
    let m;
    while ((m = eqRe.exec(t)) !== null) eqs.push(m[1].trim());

    // —— 抓所有 (x,y) 点 ——
    const ptRe = /\(\s*(-?\d+(?:\.\d+)?)\s*[,，]\s*(-?\d+(?:\.\d+)?)\s*\)/g;
    const pts = [];
    while ((m = ptRe.exec(t)) !== null) pts.push([parseFloat(m[1]), parseFloat(m[2])]);

    // —— 抓 "x=数字" 求函数值 ——
    const xVal = t.match(/x\s*=\s*(-?\d+(?:\.\d+)?)/);

    // 1) 两点求一次函数解析式
    if (pts.length >= 2 && /(直线|一次函数|解析式|line|function)/.test(low)) {
      const [p1, p2] = pts;
      return { task: 'linear_points', p1, p2, confidence: 0.9, raw: t };
    }

    // 2) 二次函数顶点
    const quadEqs = eqs.map(e => parseQuad(e)).filter(Boolean);
    if (quadEqs.length >= 1 && /(顶点|vertex|最值|最低点|最高点)/.test(low)) {
      return { task: 'quadratic_vertex', q: quadEqs[0], confidence: 0.9, raw: t };
    }
    if (quadEqs.length >= 1 && /(二次函数|抛物线|parabola)/.test(low)) {
      return { task: 'quadratic_vertex', q: quadEqs[0], confidence: 0.7, raw: t };
    }

    // 3) 两条直线交点
    const linEqs = eqs.map(e => parseLinear(e));
    if (linEqs.length >= 2 && /(交点|intersection|intersect|相交)/.test(low)) {
      return { task: 'intersection', f1: linEqs[0], f2: linEqs[1], confidence: 0.9, raw: t };
    }

    // 4) 已知一次函数求某点函数值
    if (linEqs.length >= 1 && xVal) {
      return { task: 'linear_value', f: linEqs[0], x: parseFloat(xVal[1]), confidence: 0.85, raw: t };
    }

    // 5) 退化为画一条一次函数图像
    if (linEqs.length >= 1) {
      return { task: 'linear_value', f: linEqs[0], x: 1, confidence: 0.5, raw: t, graphOnly: true };
    }

    return null;
  },

  solve(params, opts = {}) {
    const isZh = (opts.language || 'en').indexOf('zh') === 0;
    const steps = [];
    let answer, funcs = [], keyPoints = [], formula = '';

    switch (params.task) {
      case 'linear_points': {
        const [x1, y1] = params.p1, [x2, y2] = params.p2;
        const k = (y2 - y1) / (x2 - x1);
        const b = y1 - k * x1;
        answer = linearEq(r2(k), r2(b));
        funcs = [{ type: 'line', k: r2(k), b: r2(b), color: '#4f8cff' }];
        keyPoints = [
          { x: x1, y: y1, label: 'A(' + fnum(x1) + ',' + fnum(y1) + ')' },
          { x: x2, y: y2, label: 'B(' + fnum(x2) + ',' + fnum(y2) + ')' },
        ];
        // 截距点仅当两个已知点都不在 y 轴上时才单独标注（避免标签重叠）
        if (x1 !== 0 && x2 !== 0) {
          keyPoints.push({ x: 0, y: r2(b), label: '截距(0,' + fnum(r2(b)) + ')' });
        }
        formula = `斜率 k=(${fnum(y2)}-${fnum(y1)})/(${fnum(x2)}-${fnum(x1)})=${fnum(r2(k))}；代入得 b=${fnum(r2(b))}`;
        steps.push({ narration: isZh ? '行程图：横轴时间，纵轴路程' : 'Distance-time graph: x=time, y=distance', visualHint: 'concrete_travel' });
        steps.push({ narration: isZh ? `描出两点 A(${fnum(x1)},${fnum(y1)})、B(${fnum(x2)},${fnum(y2)})，连直线` : `Plot A and B, draw the line`, visualHint: 'graph_line' });
        steps.push({ narration: formula + '，所以 ' + answer, visualHint: 'formula' });
        break;
      }
      case 'linear_value': {
        const { k, b } = params.f;
        const y = k * params.x + b;
        funcs = [{ type: 'line', k, b, color: '#4f8cff' }];
        keyPoints = [
          { x: 0, y: b, label: '(0,' + fnum(b) + ')' },
          { x: params.x, y: r2(y), label: '(' + fnum(params.x) + ',' + fnum(r2(y)) + ')' },
        ];
        answer = params.graphOnly ? linearEq(k, b) : ('y=' + fnum(r2(y)));
        formula = `y = ${fnum(k)}×${fnum(params.x)} + ${fnum(b)} = ${fnum(r2(y))}`;
        steps.push({ narration: isZh ? '水温随时间变化的折线' : 'Water temperature over time', visualHint: 'concrete_temp' });
        steps.push({ narration: isZh ? `画出直线 y=${linearEq(k, b).slice(2)}，找到 x=${fnum(params.x)} 对应的点` : `Draw the line, read off x=${fnum(params.x)}`, visualHint: 'graph_line' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'quadratic_vertex': {
        const { a, b, c } = params.q;
        const h = -b / (2 * a);
        const vk = a * h * h + b * h + c;
        answer = '顶点(' + fnum(r2(h)) + ',' + fnum(r2(vk)) + ')';
        funcs = [{ type: 'parabola', a, b, c, color: '#f59e0b' }];
        keyPoints = [
          { x: r2(h), y: r2(vk), label: '顶点(' + fnum(r2(h)) + ',' + fnum(r2(vk)) + ')' },
          { x: 0, y: c, label: '(0,' + fnum(c) + ')' },
        ];
        formula = `x = -b/2a = -(${fnum(b)})/(2×${fnum(a)}) = ${fnum(r2(h))}；代入得 y=${fnum(r2(vk))}`;
        steps.push({ narration: isZh ? '篮球划出的抛物线' : 'A basketball flies in a parabola', visualHint: 'concrete_ball' });
        steps.push({ narration: isZh ? `画出抛物线 y=${fnum(a)}x²${b >= 0 ? '+' : ''}${fnum(b)}x${c >= 0 ? '+' : ''}${fnum(c)}，找最低点/最高点` : `Plot the parabola, find its turning point`, visualHint: 'graph_parabola' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'intersection': {
        const k1 = params.f1.k, b1 = params.f1.b;
        const k2 = params.f2.k, b2 = params.f2.b;
        const xi = (b2 - b1) / (k1 - k2);
        const yi = k1 * xi + b1;
        answer = '交点(' + fnum(r2(xi)) + ',' + fnum(r2(yi)) + ')';
        funcs = [
          { type: 'line', k: k1, b: b1, color: '#4f8cff' },
          { type: 'line', k: k2, b: b2, color: '#2fd6a5' },
        ];
        keyPoints = [{ x: r2(xi), y: r2(yi), label: '(' + fnum(r2(xi)) + ',' + fnum(r2(yi)) + ')' }];
        formula = `${linearEq(k1, b1).slice(2)} = ${linearEq(k2, b2).slice(2)}，解得 x=${fnum(r2(xi))}, y=${fnum(r2(yi))}`;
        steps.push({ narration: isZh ? '两辆车在途中相遇' : 'Two travelers meet on the road', visualHint: 'concrete_meet' });
        steps.push({ narration: isZh ? '在同一坐标系画出两条直线，交点即相遇点' : 'Draw both lines; the crossing point is the meeting point', visualHint: 'graph_intersect' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      default:
        return { answer: null, steps: [], error: 'unknown_task' };
    }

    return { answer, steps, funcs, keyPoints, formula, task: params.task };
  },

  validate(params, solved, opts = {}) {
    if (!solved || !solved.answer) return { ok: false, reason: 'no_answer' };
    if (!solved.steps || solved.steps.length < 3) return { ok: false, reason: 'need_3_cpa_steps' };
    if (!Array.isArray(solved.funcs) || solved.funcs.length === 0) return { ok: false, reason: 'no_functions_to_plot' };
    if (!Array.isArray(solved.keyPoints) || solved.keyPoints.length === 0) return { ok: false, reason: 'no_key_points' };
    return { ok: true };
  },

  renderParams(solved, opts = {}) {
    const lang = opts.language || 'en';
    const isZh = lang.indexOf('zh') === 0;
    const L = { concrete: isZh ? '具象' : 'See it', graph: isZh ? '看图' : 'Graph it', formula: isZh ? '列式' : 'Formula' };
    return {
      type: 'function-graph',
      task: solved.task,
      funcs: solved.funcs,
      keyPoints: solved.keyPoints,
      answer: solved.answer,
      formula: solved.formula,
      beats: [
        { id: 'concrete', duration: 5000, label: L.concrete },
        { id: 'graph', duration: 5000, label: L.graph },
        { id: 'formula', duration: 5000, label: L.formula },
      ],
      scenes: [
        { type: 'concrete', hint: solved.steps[0] && solved.steps[0].visualHint },
        { type: 'graph', funcs: solved.funcs, keyPoints: solved.keyPoints },
        { type: 'formula', text: solved.formula },
      ],
    };
  },
};
