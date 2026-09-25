// lib/kards/geometry.js — 几何族知识卡
// 承载：三角形/矩形/正方形/圆的周长面积、三角形内角、余角补角、勾股定理
// CPA：具象(围栏/地砖/钟表/梯子) → 图示(Canvas path 多边形+角度边长标注) → 抽象(公式/算式)
'use strict';

function r2(x) {
  if (typeof x !== 'number' || !isFinite(x)) return x;
  // 去掉浮点尾巴：6.0000000001 -> 6
  const r = Math.round(x * 100) / 100;
  return Object.is(r, -0) ? 0 : r;
}

function allNums(t) {
  return (String(t).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
}

// 线性单位 → 面积单位
function sqUnit(u) {
  if (!u) return u;
  if (/²/.test(u) || /平方/.test(u)) return u;
  const map = { '米': '平方米', '厘米': '平方厘米', '分米': '平方分米', '毫米': '平方毫米',
    'm': 'm²', 'cm': 'cm²', 'dm': 'dm²', 'mm': 'mm²', 'inch': 'inch²', 'feet': 'ft²', 'ft': 'ft²' };
  return map[u] || (u + '²');
}

module.exports = {
  id: 'geometry',
  name: '几何图形',
  keywords: [
    '长方形', '矩形', '正方形', '三角形', '平行四边形', '圆', '周长', '面积',
    '内角', '余角', '补角', '直角', '勾股', '斜边', '边长', '半径', '直径',
    'perimeter', 'area', 'rectangle', 'square', 'triangle', 'circle', 'radius',
    'angle', 'supplement', 'complement', 'hypotenuse', 'pythagorean',
  ],

  match(problem, opts = {}) {
    const t = String(problem || '').toLowerCase();
    let s = 0;
    if (/(长方形|矩形|rectangle)/.test(t)) s += 4;
    if (/(正方形|square)/.test(t)) s += 4;
    if (/(三角形|triangle)/.test(t)) s += 4;
    if (/(平行四边形)/.test(t)) s += 4;
    if (/(圆|circle)/.test(t) && /(半径|直径|radius|diameter)/.test(t)) s += 4;
    if (/(周长|perimeter|circumference)/.test(t)) s += 2;
    if (/(面积|area)/.test(t)) s += 2;
    if (/(内角|外角|补角|余角|supplement|complement)/.test(t)) s += 3;
    if (/(勾股|斜边|hypotenuse|pythagorean)/.test(t)) s += 5;
    if (/(围栏|篱笆|地砖|草坪|花坛|钟表|梯子)/.test(t)) s += 1;
    return s;
  },

  // 从题目抽参：形状类型、边长、角度、所求量
  extract(problem, opts = {}) {
    const t = String(problem || '');
    const low = t.toLowerCase();
    const nums = allNums(t);
    let conf = 0.4;

    const isPerimeter = /(周长|perimeter|circumference|篱笆|围栏)/.test(low);
    const isArea = /(面积|area|铺.*砖|草坪)/.test(low);
    const isZh = /[一-龥]/.test(t);
    // 面积题优先取平方单位；没有则由线性单位推导。其余取线性单位
    const sqMatch = t.match(/(平方厘米|平方米|平方分米|cm²|m²|dm²)/i);
    const linMatch = t.match(/(厘米|米|分米|毫米|cm|m|dm|mm|英寸|inch|feet|ft)/i);
    let unit;
    if (isArea) {
      unit = sqMatch ? sqMatch[1] : (linMatch ? sqUnit(linMatch[1]) : (isZh ? '平方厘米' : 'cm²'));
    } else {
      unit = linMatch ? linMatch[1] : (isZh ? '厘米' : 'cm');
    }

    // —— 三角形内角和：已知两个角，求第三个 ——
    const angleNums = (t.match(/\d+(?:\.\d+)?\s*°/g) || []).map(s => parseFloat(s));
    if (/(三角形|triangle)/.test(t) && angleNums.length >= 2 && /(第三|剩下|另一个|求.*角|other|third|remaining)/.test(low)) {
      return {
        task: 'triangle_angle', known: angleNums.slice(0, 2), unit: '°',
        confidence: 0.9, raw: t,
      };
    }

    // —— 补角 / 余角 ——
    if (/(补角|supplement)/.test(low)) {
      const m = t.match(/(\d+(?:\.\d+)?)/);
      if (m) return { task: 'supplementary', given: parseFloat(m[1]), unit: '°', confidence: 0.85, raw: t };
    }
    if (/(余角|complement)/.test(low)) {
      const m = t.match(/(\d+(?:\.\d+)?)/);
      if (m) return { task: 'complementary', given: parseFloat(m[1]), unit: '°', confidence: 0.85, raw: t };
    }

    // —— 勾股定理：直角三角形两直角边求斜边 ——
    if (/(直角三角形|勾股|斜边|hypotenuse)/.test(low) && nums.length >= 2) {
      // 形如：两直角边分别为 a 和 b
      const legs = nums.slice(0, 2).sort((a, b) => a - b);
      return { task: 'pythagorean', legA: legs[0], legB: legs[1], unit, confidence: 0.85, raw: t };
    }

    // —— 圆：半径 r，周长或面积 ——
    if (/(圆|circle)/.test(low) && /(半径|radius)/.test(low)) {
      const m = t.match(/(?:半径|radius)\s*(?:是|为|等于|=)?\s*(\d+(?:\.\d+)?)/i);
      const r = m ? parseFloat(m[1]) : nums[0];
      if (r > 0) {
        return {
          task: isArea ? 'circle_area' : 'circle_circumference',
          radius: r, unit, confidence: 0.85, raw: t,
        };
      }
    }

    // —— 正方形：边长 s ——
    if (/(正方形|square)/.test(low) && nums.length >= 1) {
      const side = nums[0];
      if (side > 0) {
        return { task: isArea ? 'square_area' : 'square_perimeter', side, unit, confidence: 0.85, raw: t };
      }
    }

    // —— 三角形面积：底 a 高 h ——
    if (/(三角形|triangle)/.test(low) && /(底|base)/.test(low) && /(高|height|altitude)/.test(low)) {
      const baseM = t.match(/(?:底|base)\s*(?:是|为|长|=)?\s*(\d+(?:\.\d+)?)/i);
      const hM = t.match(/(?:高|height|altitude)\s*(?:是|为|=)?\s*(\d+(?:\.\d+)?)/i);
      const base = baseM ? parseFloat(baseM[1]) : nums[0];
      const height = hM ? parseFloat(hM[1]) : nums[1];
      if (base > 0 && height > 0) {
        return { task: 'tri_area', base, height, unit, confidence: 0.9, raw: t };
      }
    }

    // —— 长方形/矩形：长 a 宽 b ——
    if (/(长方形|矩形|rectangle)/.test(low) && nums.length >= 2) {
      let w, h;
      const lenM = t.match(/(?:长|length)\s*(?:是|为|=)?\s*(\d+(?:\.\d+)?)/i);
      const widM = t.match(/(?:宽|width)\s*(?:是|为|=)?\s*(\d+(?:\.\d+)?)/i);
      if (lenM && widM) { w = parseFloat(lenM[1]); h = parseFloat(widM[1]); conf = 0.92; }
      else { w = nums[0]; h = nums[1]; conf = 0.6; }
      if (w > 0 && h > 0) {
        return {
          task: isArea ? 'rect_area' : 'rect_perimeter',
          width: w, height: h, unit, confidence: conf, raw: t,
        };
      }
    }

    // —— 平行四边形面积（兜底）：底 高 ——
    if (/平行四边形/.test(t) && nums.length >= 2) {
      return { task: 'tri_area', base: nums[0], height: nums[1], unit, confidence: 0.6, raw: t, isPara: true };
    }

    return null;
  },

  // 确定性求解
  solve(params, opts = {}) {
    const steps = [];
    const u = params.unit || '';
    const isZh = (opts.language || 'en').indexOf('zh') === 0;
    const L = {
      perimeter: isZh ? '周长' : 'perimeter',
      area: isZh ? '面积' : 'area',
      fence: isZh ? '围栏' : 'fence',
      tiles: isZh ? '地砖' : 'tiles',
      clock: isZh ? '钟表指针' : 'clock hands',
      ladder: isZh ? '靠墙的梯子' : 'a ladder',
      shape: isZh ? '图形' : 'the shape',
    };

    let answer, shape = {}, formula = '';

    switch (params.task) {
      case 'rect_perimeter': {
        const { width: a, height: b } = params;
        answer = r2(2 * (a + b));
        shape = { kind: 'rect', w: a, h: b, measure: 'perimeter' };
        formula = `2×(长+宽) = 2×(${a}+${b}) = ${answer}${u}`;
        steps.push({ narration: isZh ? `一块长方形菜地，四周围上围栏` : `A rectangular garden needs a fence`, visualHint: 'concrete_fence' });
        steps.push({ narration: isZh ? `长 ${a}${u}，宽 ${b}${u}，四条边依次量一圈` : `Length ${a}${u}, width ${b}${u}; walk all four sides`, visualHint: 'shape_rect' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'rect_area': {
        const { width: a, height: b } = params;
        answer = r2(a * b);
        shape = { kind: 'rect', w: a, h: b, measure: 'area' };
        formula = `长×宽 = ${a}×${b} = ${answer}${u}`;
        steps.push({ narration: isZh ? `长方形地面铺满地砖` : `A rectangle floor to tile`, visualHint: 'concrete_tiles' });
        steps.push({ narration: isZh ? `每排 ${a} 块，共 ${b} 排` : `${a} tiles per row, ${b} rows`, visualHint: 'shape_rect' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'square_perimeter': {
        const s = params.side;
        answer = r2(4 * s);
        shape = { kind: 'square', s, measure: 'perimeter' };
        formula = `4×边长 = 4×${s} = ${answer}${u}`;
        steps.push({ narration: isZh ? `正方形花坛围边` : `A square flower bed border`, visualHint: 'concrete_fence' });
        steps.push({ narration: isZh ? `四条边都相等，每条 ${s}${u}` : `All 4 sides equal, each ${s}${u}`, visualHint: 'shape_square' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'square_area': {
        const s = params.side;
        answer = r2(s * s);
        shape = { kind: 'square', s, measure: 'area' };
        formula = `边长×边长 = ${s}×${s} = ${answer}${u}`;
        steps.push({ narration: isZh ? `正方形地砖铺满` : `A square floor to tile`, visualHint: 'concrete_tiles' });
        steps.push({ narration: isZh ? `每排 ${s} 块，共 ${s} 排` : `${s} tiles per row, ${s} rows`, visualHint: 'shape_square' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'tri_area': {
        const { base: a, height: h } = params;
        answer = r2(a * h / 2);
        shape = { kind: 'triangle', base: a, height: h, measure: 'area' };
        formula = `底×高÷2 = ${a}×${h}÷2 = ${answer}${u}`;
        steps.push({ narration: isZh ? `三角形屋顶/沙坑的地面` : `A triangular roof / sandbox`, visualHint: 'concrete_sandbox' });
        steps.push({ narration: isZh ? `把三角形补成一个长方形，三角形占一半` : `Double the triangle into a rectangle; triangle is half`, visualHint: 'shape_triangle' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'circle_circumference': {
        const r = params.radius;
        answer = r2(2 * Math.PI * r);
        shape = { kind: 'circle', r, measure: 'perimeter' };
        formula = `2πr = 2×3.14×${r} ≈ ${answer}${u}`;
        steps.push({ narration: isZh ? `圆形花坛走一圈` : `Walking around a circular garden`, visualHint: 'concrete_wheel' });
        steps.push({ narration: isZh ? `半径 ${r}${u}，描出圆的一周` : `Radius ${r}${u}; trace the circle once`, visualHint: 'shape_circle' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'circle_area': {
        const r = params.radius;
        answer = r2(Math.PI * r * r);
        shape = { kind: 'circle', r, measure: 'area' };
        formula = `πr² = 3.14×${r}×${r} ≈ ${answer}${u}`;
        steps.push({ narration: isZh ? `给圆形餐桌铺桌布` : `Covering a round table`, visualHint: 'concrete_pie' });
        steps.push({ narration: isZh ? `半径 ${r}${u}，圆面铺满` : `Radius ${r}${u}; fill the disk`, visualHint: 'shape_circle' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'triangle_angle': {
        const [a, b] = params.known;
        answer = r2(180 - a - b);
        shape = { kind: 'triangle_angle', angles: [a, b, answer], measure: 'angle' };
        formula = `180° − ${a}° − ${b}° = ${answer}°`;
        steps.push({ narration: isZh ? `三角形三个角拼在一起是一条直线` : `The 3 angles of a triangle make a straight line (180°)`, visualHint: 'concrete_clock' });
        steps.push({ narration: isZh ? `已知两角 ${a}°、${b}°` : `Given two angles ${a}°, ${b}°`, visualHint: 'shape_angle' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'supplementary': {
        const g = params.given;
        answer = r2(180 - g);
        shape = { kind: 'angle_pair', a: g, b: answer, straight: true };
        formula = `180° − ${g}° = ${answer}°（两角成平角）`;
        steps.push({ narration: isZh ? `两个角拼成一个平角（一条直线）` : `Two angles form a straight line (180°)`, visualHint: 'concrete_clock' });
        steps.push({ narration: isZh ? `已知一个角 ${g}°` : `One angle is ${g}°`, visualHint: 'shape_angle' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'complementary': {
        const g = params.given;
        answer = r2(90 - g);
        shape = { kind: 'angle_pair', a: g, b: answer, straight: false };
        formula = `90° − ${g}° = ${answer}°（两角成直角）`;
        steps.push({ narration: isZh ? `两个角拼成一个直角` : `Two angles make a right angle (90°)`, visualHint: 'concrete_clock' });
        steps.push({ narration: isZh ? `已知一个角 ${g}°` : `One angle is ${g}°`, visualHint: 'shape_angle' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'pythagorean': {
        const a = params.legA, b = params.legB;
        const c = r2(Math.sqrt(a * a + b * b));
        answer = c;
        shape = { kind: 'righttri', a, b, c, measure: 'side' };
        formula = `a²+b² = ${a}²+${b}² = ${a*a}+${b*b} = ${a*a+b*b}，c = √${a*a+b*b} ≈ ${c}${u}`;
        steps.push({ narration: isZh ? `一架梯子斜靠墙上，求梯子长度` : `A ladder leans against a wall; find its length`, visualHint: 'concrete_ladder' });
        steps.push({ narration: isZh ? `竖直边 ${a}${u}，水平边 ${b}${u}，夹角是直角` : `Vertical leg ${a}${u}, horizontal leg ${b}${u}, right angle between`, visualHint: 'shape_righttri' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      default:
        return { answer: null, steps: [], error: 'unknown_task' };
    }

    const angleTask = (params.task === 'triangle_angle' || params.task === 'supplementary' || params.task === 'complementary');
    const ansText = angleTask ? String(answer) + '°' : (u ? String(answer) + u : String(answer));
    return { answer: ansText, steps, shape, formula, unit: u, task: params.task, numeric: answer };
  },

  validate(params, solved, opts = {}) {
    if (!solved || solved.answer == null || solved.answer === '') return { ok: false, reason: 'no_answer' };
    if (!solved.steps || solved.steps.length < 3) return { ok: false, reason: 'need_3_cpa_steps' };
    if (typeof solved.numeric !== 'number' || !isFinite(solved.numeric)) return { ok: false, reason: 'bad_number' };
    // 结构校验：必须有 shape 图形描述
    if (!solved.shape || !solved.shape.kind) return { ok: false, reason: 'no_shape' };
    return { ok: true };
  },

  renderParams(solved, opts = {}) {
    const lang = opts.language || 'en';
    const isZh = lang.indexOf('zh') === 0;
    const L = {
      concrete: isZh ? '具象' : 'See it',
      shape: isZh ? '看图' : 'Draw it',
      formula: isZh ? '列式' : 'Formula',
    };
    return {
      type: 'geometry',
      task: solved.task,
      shape: solved.shape,
      answer: solved.answer,
      formula: solved.formula,
      beats: [
        { id: 'concrete', duration: 5000, label: L.concrete },
        { id: 'shape', duration: 5000, label: L.shape },
        { id: 'formula', duration: 5000, label: L.formula },
      ],
      scenes: [
        { type: 'concrete', hint: solved.steps[0] && solved.steps[0].visualHint },
        { type: 'shape', shape: solved.shape },
        { type: 'formula', text: solved.formula },
      ],
    };
  },
};
