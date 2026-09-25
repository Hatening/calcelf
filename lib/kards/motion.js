// lib/kards/motion.js — 行程族知识卡
// 承载：相向相遇、同向追及、背向相离（环形跑道为相遇的特例）
// CPA：具象(两车/两人在道路上) → 图示(带刻度轨道+速度标注+相遇点) → 抽象(路程=速度×时间)
module.exports = {
  id: 'motion',
  name: '行程问题',
  keywords: [
    '相遇', '相向', '相对而行', '相背', '背向', '追及', '追上', '追赶', '同向',
    '两地', '相距', '同时出发', '千米', '每小时', '每分钟', '环形', '跑道',
    'meet', 'toward', 'opposite', 'chase', 'catch up', 'same direction',
    'apart', 'km per hour', 'per hour', 'per minute', 'track',
  ],

  match(problem, opts = {}) {
    const t = String(problem || '').toLowerCase();
    let score = 0;
    if (/(相遇|相向|相对而行|meet|toward each)/.test(t)) score += 5;
    if (/(追及|追上|追赶|追上|catch up|chase)/.test(t)) score += 5;
    if (/(相背|背向|背向而行|opposite|away from)/.test(t)) score += 4;
    if (/(相距|两地|apart)/.test(t)) score += 2;
    if (/(每小时|每分钟|per hour|per minute|千米|km)/.test(t)) score += 2;
    if (/(环形|跑道|circular track)/.test(t)) score += 3;
    return score;
  },

  // 抽参：方向(mode)、两速度、初始距离/领先距离/给定时间、单位
  extract(problem, opts = {}) {
    const t = String(problem || '');
    const tl = t.toLowerCase();

    // —— 方向判定 ——
    let mode = null;
    if (/(追及|追上|追赶|同向|先[走行]|catch up|chase)/.test(tl)) mode = 'chase';
    else if (/(相背|背向|背向而行|相背而行|反向而行|opposite|away from each|walk away|back-to-back|背道)/.test(tl)) mode = 'away';
    else if (/(相遇|相向|相对而行|相向而行|toward each|towards each|drive toward|drive towards)/.test(tl)) mode = 'meet';
    else if (/(环形|跑道|circular)/.test(tl)) mode = 'meet'; // 环形按相遇处理

    // —— 速度抽取（最多两个）——
    const speeds = [];
    const reZH1 = /每(?:小时|分钟|秒|时|分)(?:[^\d]{0,4})?(\d+(?:\.\d+)?)/g;
    let m;
    while ((m = reZH1.exec(t)) && speeds.length < 4) speeds.push(parseFloat(m[1]));
    const reZH2 = /(\d+(?:\.\d+)?)\s*(千米|公里|km|米|m)\s*\/\s*(每)?(小时|分钟|秒|时|分)/g;
    while ((m = reZH2.exec(t)) && speeds.length < 4) speeds.push(parseFloat(m[1]));
    const reEN = /(\d+(?:\.\d+)?)\s*(?:km|kilometers?|kilometres?|miles?|meters?|metres?|m)\s*(?:per|an?)\s*(hour|minute|min|second|hr)/gi;
    while ((m = reEN.exec(t)) && speeds.length < 4) speeds.push(parseFloat(m[1]));
    // 去重保序
    const uniqSpeeds = [];
    for (const s of speeds) if (!uniqSpeeds.includes(s)) uniqSpeeds.push(s);

    if (uniqSpeeds.length < 2) return null;
    const vA = uniqSpeeds[0];
    const vB = uniqSpeeds[1];

    // —— 单位 ——
    let unit = '千米';
    if (/(千米|公里|km|kilometers?|kilometres?|miles?)/i.test(t)) unit = '千米';
    else if (/(米|meters?|metres?)/i.test(t)) unit = '米';
    let timeUnit = '小时';
    if (/(分钟|min|minute)/i.test(t)) timeUnit = '分钟';
    else if (/(秒|second)/i.test(t)) timeUnit = '秒';
    else if (/(小时|hour|hr)/i.test(t)) timeUnit = '小时';

    // —— 距离 / 领先距离 / 给定时间 ——
    let distance = null, headStart = null, givenTime = null;

    const dm =
      t.match(/相距\s*(\d+(?:\.\d+)?)/) ||
      t.match(/相隔\s*(\d+(?:\.\d+)?)/) ||
      t.match(/两地?[相距间]?\s*(\d+(?:\.\d+)?)\s*(千米|公里|km|米|m)/) ||
      t.match(/(\d+(?:\.\d+)?)\s*(千米|公里|km|米|m)\s*(?:的)?\s*两地/) ||
      t.match(/(\d+(?:\.\d+)?)\s*(?:km|kilometers?|miles?|meters?)\s*apart/i);
    if (dm) distance = parseFloat(dm[1]);

    const cm =
      t.match(/先走\s*(\d+(?:\.\d+)?)/) ||
      t.match(/先行\s*(\d+(?:\.\d+)?)/) ||
      t.match(/提前\s*(\d+(?:\.\d+)?)/) ||
      t.match(/在\s*(?:前面|前方)\s*(\d+(?:\.\d+)?)/) ||
      t.match(/前面\s*(\d+(?:\.\d+)?)/) ||
      t.match(/先出发\s*(\d+(?:\.\d+)?)/) ||
      t.match(/领先\s*(\d+(?:\.\d+)?)/) ||
      t.match(/head start(?:\s+of)?\s*(\d+(?:\.\d+)?)/i);
    if (cm) headStart = parseFloat(cm[1]);

    const tm =
      t.match(/(\d+(?:\.\d+)?)\s*(分钟|小时|秒)后/) ||
      t.match(/after\s*(\d+(?:\.\d+)?)\s*(minutes?|hours?|seconds?)/i);
    if (tm) givenTime = parseFloat(tm[1]);

    // —— 兜底：若 mode 决定后仍缺关键量，用剩余数字凑 ——
    const allNums = (t.match(/\d+(?:\.\d+)?/g) || []).map(Number);
    const leftover = allNums.filter(n => !uniqSpeeds.includes(n) && n > 0);
    if (mode === 'meet' && distance == null) distance = leftover[0] ?? null;
    if (mode === 'chase' && headStart == null) headStart = leftover[0] ?? null;
    if (mode === 'away' && givenTime == null) givenTime = leftover[0] ?? null;

    if (!mode) return null;
    if (mode === 'meet' && distance == null) return null;
    if (mode === 'chase' && headStart == null) return null;
    if (mode === 'away' && givenTime == null) return null;

    // —— 演员识别 ——
    let actorA = '🚗', actorB = '🚙';
    if (/(自行车|骑行|单车|bike|bicycle|cycl)/i.test(t)) { actorA = '🚴'; actorB = '🚵'; }
    else if ((/汽车|车|car|drive|driving/i.test(t))) { actorA = '🚗'; actorB = '🚙'; }
    if (/(小明|男孩|boy|he|哥哥|哥哥)/.test(t)) { actorA = '👦'; }
    if (/(小红|女孩|girl|she|弟弟|弟弟)/.test(t)) { actorB = '👧'; }
    if (/(狗|dog)/i.test(t)) { actorA = '🐕'; }
    if (/(猫|cat)/i.test(t)) { actorB = '🐈'; }

    let confidence = 0.85;
    if (mode === 'meet' && distance == null) confidence = 0.4;
    if (mode === 'chase' && vA <= vB) confidence = Math.min(confidence, 0.5); // 追及必须更快

    return {
      mode, vA, vB, distance, headStart, givenTime,
      unit, timeUnit, actorA, actorB, confidence, raw: t,
    };
  },

  // 确定性求解
  solve(params, opts = {}) {
    const { mode, vA, vB, unit, timeUnit } = params;
    const steps = [];
    let answer, totalT = null, finalDist = null;

    if (mode === 'meet') {
      const d = params.distance;
      const rel = vA + vB; // 相向：相对速度相加
      totalT = d / rel;
      const meetPos = vA * totalT;
      steps.push({
        narration: `两车相距 ${d}${unit}，同时相向而行。`,
        visualHint: 'start_concrete',
      });
      steps.push({
        narration: `相向而行，每${timeUnit}靠近 ${vA}＋${vB}＝${rel}${unit}。`,
        visualHint: 'track',
      });
      steps.push({
        narration: `相遇时间 = 总距离 ÷ 速度和 = ${d} ÷ ${rel} = ${round2(totalT)} ${timeUnit}。`,
        visualHint: 'equation',
      });
      answer = `${round2(totalT)} ${timeUnit}`;
      return { answer, steps, mode, vA, vB, distance: d, unit, timeUnit, totalT, meetPos };
    }

    if (mode === 'chase') {
      const gap = params.headStart;
      const fast = Math.max(vA, vB), slow = Math.min(vA, vB);
      const rel = fast - slow; // 同向追及：相对速度相减
      totalT = gap / rel;
      steps.push({
        narration: `慢者在前面 ${gap}${unit}，快者同向追赶。`,
        visualHint: 'start_concrete',
      });
      steps.push({
        narration: `同向追及，每${timeUnit}缩短 ${fast}－${slow}＝${rel}${unit}。`,
        visualHint: 'track',
      });
      steps.push({
        narration: `追上时间 = 距离差 ÷ 速度差 = ${gap} ÷ ${rel} = ${round2(totalT)} ${timeUnit}。`,
        visualHint: 'equation',
      });
      answer = `${round2(totalT)} ${timeUnit}`;
      return { answer, steps, mode, vA: fast, vB: slow, headStart: gap, unit, timeUnit, totalT };
    }

    // away：背向而行，给定时间求距离
    const tt = params.givenTime;
    const rel = vA + vB;
    finalDist = rel * tt;
    steps.push({
      narration: `两人从同一点同时背向而行，朝相反方向离开。`,
      visualHint: 'start_concrete',
    });
    steps.push({
      narration: `背向而行，每${timeUnit}拉开 ${vA}＋${vB}＝${rel}${unit}。`,
      visualHint: 'track',
    });
    steps.push({
      narration: `${tt}${timeUnit}后相距 = (${vA}＋${vB})×${tt} = ${round2(finalDist)} ${unit}。`,
      visualHint: 'equation',
    });
    answer = `${round2(finalDist)} ${unit}`;
    return { answer, steps, mode, vA, vB, givenTime: tt, unit, timeUnit, totalT: tt, finalDist };
  },

  validate(params, solved, opts = {}) {
    if (!solved || !solved.answer) return { ok: false, reason: 'no_answer' };
    if (!solved.steps || solved.steps.length < 3) return { ok: false, reason: 'steps_too_short' };
    if (solved.mode === 'meet') {
      // 复算
      const t = params.distance / (params.vA + params.vB);
      if (Math.abs(t - solved.totalT) > 1e-6) return { ok: false, reason: 'meet_mismatch' };
      if (t <= 0) return { ok: false, reason: 'non_positive_time' };
    } else if (solved.mode === 'chase') {
      const fast = Math.max(params.vA, params.vB), slow = Math.min(params.vA, params.vB);
      if (fast <= slow) return { ok: false, reason: 'chase_no_gain' };
      const t = params.headStart / (fast - slow);
      if (Math.abs(t - solved.totalT) > 1e-6) return { ok: false, reason: 'chase_mismatch' };
    } else if (solved.mode === 'away') {
      const d = (params.vA + params.vB) * params.givenTime;
      if (Math.abs(d - solved.finalDist) > 1e-6) return { ok: false, reason: 'away_mismatch' };
    }
    return { ok: true };
  },

  renderParams(solved, opts = {}) {
    const lang = opts.language || 'en';
    const L = lang === 'zh-CN'
      ? { meet: '相向而行相遇', chase: '同向追及', away: '背向而行', start: '同时出发', meetPt: '相遇点', eq: '算式' }
      : { meet: 'Driving toward each other', chase: 'Catching up', away: 'Back-to-back', start: 'Start at the same time', meetPt: 'Meeting point', eq: 'Equation' };

    // 计算两物体在 m=0 / m=1 的道路坐标
    let a0, a1, b0, b1, dirLabelA = '', dirLabelB = '';
    if (solved.mode === 'meet') {
      a0 = 0; a1 = solved.meetPos;
      b0 = solved.distance; b1 = solved.meetPos;
    } else if (solved.mode === 'chase') {
      // 快者在后追，慢者在前；都向右
      a0 = 0; a1 = solved.vA * solved.totalT;       // 快者
      b0 = solved.headStart; b1 = solved.headStart + solved.vB * solved.totalT; // 慢者
    } else {
      // away：同一点背向，A 向右 B 向左
      a0 = 0; a1 = solved.vA * solved.totalT;
      b0 = 0; b1 = -solved.vB * solved.totalT;
    }

    let eqText = '';
    if (solved.mode === 'meet') eqText = `${solved.distance} ÷ (${solved.vA} + ${solved.vB}) = ${solved.answer}`;
    else if (solved.mode === 'chase') eqText = `${solved.headStart} ÷ (${solved.vA} − ${solved.vB}) = ${solved.answer}`;
    else eqText = `(${solved.vA} + ${solved.vB}) × ${solved.givenTime} = ${solved.answer}`;

    return {
      type: 'motion',
      scene: {
        mode: solved.mode,
        label: L[solved.mode],
        unit: solved.unit,
        timeUnit: solved.timeUnit,
        vA: solved.vA, vB: solved.vB,
        a0, a1, b0, b1,
        actorA: opts.actorA || '🚗', actorB: opts.actorB || '🚙',
        speedLabelA: `${solved.vA} ${solved.unit}/${solved.timeUnit}`,
        speedLabelB: `${solved.vB} ${solved.unit}/${solved.timeUnit}`,
        meetPt: L.meetPt,
      },
      beats: [
        { id: 'intro', duration: 4000, label: L.start },
        { id: 'move', duration: 5000, label: L.label || L.meet },
        { id: 'meet', duration: 4000, label: L.meetPt },
        { id: 'equation', duration: 4000, label: L.eq },
      ],
      answer: solved.answer,
      scenes: [
        { type: 'road', mode: solved.mode, a0, a1, b0, b1, unit: solved.unit },
        { type: 'equation', text: eqText },
      ],
    };
  },
};

function round2(x) {
  const r = Math.round(x * 100) / 100;
  return Number.isInteger(r) ? String(r) : String(r);
}
