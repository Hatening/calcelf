// lib/kards/axis_motion.js — 轴线运动族知识卡
// 承载：爬井、升降、弹跳、往返、水位变化等沿单一轴运动的题目
// CPA：具象(动物/物体) → 图示(轴线+刻度) → 抽象(数字算式)
module.exports = {
  id: 'axis_motion',
  name: '轴线运动',
  keywords: [
    '爬井', '井', '爬', '滑', '升降', '上升', '下降', '弹跳', '跳',
    '往返', '来回', '水位', '水面', '电梯', '楼层', '爬上', '滑下',
    'well', 'climb', 'slip', 'rise', 'fall', 'bounce', 'up and down',
    'elevator', 'floor', 'water level',
  ],

  match(problem, opts = {}) {
    const t = String(problem || '').toLowerCase();
    let score = 0;
    if (/(井|well)/.test(t) && /(爬|climb)/.test(t)) score += 5;
    if (/(滑|slip|fall|drop)/.test(t)) score += 3;
    if (/(白天|晚上|day|night)/.test(t) && /(井|well)/.test(t)) score += 3;
    if (/(电梯|elevator|楼层|floor)/.test(t)) score += 4;
    if (/(水位|水面|water level)/.test(t)) score += 4;
    if (/(弹跳|bounce|弹起)/.test(t)) score += 3;
    return score;
  },

  // 从题目抽参：深度、白天上升、晚上下滑、单位、演员类型
  extract(problem, opts = {}) {
    const t = String(problem || '');
    const nums = (t.match(/\d+(\.\d+)?/g) || []).map(Number);
    if (nums.length < 2) return null;

    // 尝试识别爬井模式：井深 N 米，白天爬 A，晚上滑 B
    const wellMatch = t.match(/(?:井深|深|深度|井)\s*(\d+(?:\.\d+)?)\s*(米|m|公尺)?/i);
    const upMatch = t.match(/(?:白天|每天|每天白天|向上|上升|爬)\s*(?:上升|爬|升)?\s*(\d+(?:\.\d+)?)\s*(米|m|公尺)?/i);
    const downMatch = t.match(/(?:晚上|夜里|夜间|夜晚|下滑|滑下|下降|掉)\s*(?:下滑|滑下|下降|掉)?\s*(\d+(?:\.\d+)?)\s*(米|m|公尺)?/i);

    let depth, up, down;
    if (wellMatch && upMatch) {
      depth = parseFloat(wellMatch[1]);
      up = parseFloat(upMatch[1]);
      down = downMatch ? parseFloat(downMatch[1]) : 0;
    } else if (nums.length >= 3) {
      [depth, up, down] = nums;
    } else if (nums.length === 2) {
      [depth, up] = nums; down = 0;
    } else {
      return null;
    }

    // 识别演员
    let actorType = 'frog';
    if (/(青蛙|蛙|frog)/i.test(t)) actorType = 'frog';
    else if (/(蜗牛|snail)/i.test(t)) actorType = 'turtle';
    else if (/(蚂蚁|ant)/i.test(t)) actorType = '🐜';
    else if (/(蜘蛛|spider)/i.test(t)) actorType = '🕷️';
    else if (/(电梯|elevator)/i.test(t)) actorType = '🛗';
    else if (/(球|ball)/i.test(t)) actorType = 'ball';

    const unit = (wellMatch && wellMatch[2]) || '米';
    const confidence = (wellMatch && upMatch) ? 0.9 : (nums.length >= 3 ? 0.6 : 0.4);

    return { depth, up, down, unit, actorType, confidence, raw: t };
  },

  // 确定性求解：爬井问题
  solve(params, opts = {}) {
    const { depth, up, down, unit } = params;
    const steps = [];
    const phases = [];

    if (up >= depth) {
      // 一天就能爬出
      steps.push({ narration: `第一天白天爬 ${up}${unit}，已经到达井口！`, visualHint: 'climb_to_top' });
      phases.push({ from: 0, to: Math.min(up, depth), type: 'day', label: `白天爬 ${up}${unit}` });
      return { answer: `1 天`, steps, phases, depth, up, down, unit };
    }

    // 安全 guard：净上升 <= 0 时永远爬不出，返回 null 让上层走兜底
    if (up - down <= 0) return null;

    let pos = 0;
    let day = 0;
    const netPerDay = up - down;
    const maxDays = Math.ceil(depth / netPerDay) + 2; // 安全上限

    while (pos < depth && day < maxDays) {
      day++;
      // 白天
      const dayStart = pos;
      pos += up;
      phases.push({ from: dayStart, to: Math.min(pos, depth), type: 'day', label: `第${day}天白天爬 ${up}${unit}` });
      steps.push({
        narration: `第${day}天白天，从 ${dayStart.toFixed(1)}${unit} 向上爬 ${up}${unit}，到达 ${Math.min(pos, depth).toFixed(1)}${unit}`,
        visualHint: 'climb_up',
      });
      if (pos >= depth) break;
      // 晚上下滑
      const nightStart = pos;
      pos -= down;
      phases.push({ from: nightStart, to: pos, type: 'night', label: `第${day}天晚上滑下 ${down}${unit}` });
      steps.push({
        narration: `第${day}天晚上，从 ${nightStart.toFixed(1)}${unit} 滑下 ${down}${unit}，停在 ${pos.toFixed(1)}${unit}`,
        visualHint: 'slip_down',
      });
    }

    // 安全上限仍未爬出 → 走兜底
    if (day >= maxDays && pos < depth) return null;

    steps.push({
      narration: `第${day}天白天爬到了井口，成功爬出！共用了 ${day} 天`,
      visualHint: 'escape',
    });

    return { answer: `${day} 天`, steps, phases, depth, up, down, unit, days: day };
  },

  // 校验
  validate(params, solved, opts = {}) {
    if (!solved.answer) return { ok: false, reason: 'no_answer' };
    if (!solved.phases || solved.phases.length === 0) return { ok: false, reason: 'no_phases' };
    // 数值校验：最后位置 >= 深度
    const lastPhase = solved.phases[solved.phases.length - 1];
    if (lastPhase.to < params.depth - 0.01) return { ok: false, reason: 'never_reaches_top' };
    return { ok: true };
  },

  // 渲染参数：给 Canvas 渲染器吃的确定性数据
  renderParams(solved, opts = {}) {
    const lang = opts.language || 'en';
    const i18n = {
      'zh-CN': { day: '白天', night: '晚上', done: '完成！', unit: solved.unit },
      'en': { day: 'Day', night: 'Night', done: 'Done!', unit: solved.unit },
    };
    const L = i18n[lang] || i18n.en;
    return {
      type: 'axis_motion',
      scene: { wellDepth: solved.depth, unit: solved.unit },
      actor: { type: 'frog', emoji: '🐸' },
      phases: solved.phases.map((p, i) => ({
        from: p.from, to: p.to, type: p.type,
        label: p.type === 'day' ? `${L.day} +${solved.up}${L.unit}` : `${L.night} -${solved.down}${L.unit}`,
      })),
      answer: solved.answer,
      beats: solved.phases.map((p, i) => ({ id: `phase_${i}`, duration: 2500, label: p.label })),
      scenes: [
        { type: 'wellclimb', phases: solved.phases },
        { type: 'equation', text: `(${solved.depth} - ${solved.up}) ÷ (${solved.up} - ${solved.down}) + 1 = ${solved.days}` },
      ],
    };
  },
};
