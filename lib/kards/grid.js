// lib/kards/grid.js — 阵列 / 数数 / 乘法入门 / 面积入门 族知识
// CommonJS 自包含，不依赖 ESM 渲染层（node 单测可直接 require）。
// 承载：乘法阵列（3行×4列=12）、按行列数数、长方形面积入门（长×宽）、简单排列
// CPA：具象(真实物体按行列排开) → 图示(点阵/阵列高亮行列) → 抽象(乘法算式/面积公式)

// 物体词 → emoji（自包含小映射，渲染层另有 normalizeActor）
const ACTOR_EMOJI = {
  '苹果': '🍎', 'apple': '🍎', '星星': '⭐', '星': '⭐', 'star': '⭐',
  '方块': '🧊', '积木': '🧊', '正方形': '🟧', '方格': '🟧', 'box': '📦', 'cube': '🧊',
  '球': '⚽', 'ball': '⚽', '书': '📖', 'book': '📖', '花': '🌸', 'flower': '🌸',
  '气球': '🎈', 'balloon': '🎈', '礼物': '🎁', 'gift': '🎁', '橙': '🟧',
};

function pickActor(t) {
  const low = t.toLowerCase();
  for (const kw of Object.keys(ACTOR_EMOJI)) {
    if (low.includes(kw.toLowerCase())) {
      // 归一 type
      let type = 'apple';
      if (/方块|积木|方格|box|cube|square|tile/.test(low)) type = 'box';
      else if (/星|star/.test(low)) type = 'star';
      else if (/球|ball/.test(low)) type = 'ball';
      else if (/书|book/.test(low)) type = 'book';
      else if (/花|flower/.test(low)) type = 'flower';
      else if (/气球|balloon/.test(low)) type = 'balloon';
      else if (/礼物|gift/.test(low)) type = 'gift';
      return { type, emoji: ACTOR_EMOJI[kw] };
    }
  }
  return { type: 'apple', emoji: '🍎' };
}

module.exports = {
  id: 'grid',
  name: '阵列与乘法入门',
  keywords: [
    '阵列', '行列', '行', '列', '几行', '几列', '每行', '每列', '排', '排排',
    '乘法', '乘', '一共多少', '总数', '数数', '数一数', '面积', '长方形', '长', '宽',
    'arrays', 'row', 'rows', 'column', 'columns', 'multiplication', 'times',
    'area', 'rectangle', 'length', 'width', 'in all', 'altogether', 'equal groups',
  ],

  match(problem, opts = {}) {
    const t = String(problem || '').toLowerCase();
    let score = 0;
    // 强信号：行列阵列
    if (/(行|row|rows)/.test(t) && /(列|column|columns|个|颗|只|本|朵|个)/.test(t)) score += 5;
    if (/(列|column|columns)/.test(t) && /(行|row|rows)/.test(t)) score += 3;
    // 面积
    if (/(面积|area)/.test(t)) score += 6;
    if (/(长|length)/.test(t) && /(宽|width)/.test(t)) score += 3;
    // 每排/每行…一共
    if (/(每行|每排|每列|each row|each row of)/.test(t)) score += 4;
    if (/(乘法|乘|×|multiplication|times)/.test(t)) score += 2;
    return score;
  },

  // 从题目抽参：行数 rows、列数 cols、模式(multiply/area)、物体类型
  extract(problem, opts = {}) {
    const t = String(problem || '');
    const low = t.toLowerCase();
    const nums = (t.match(/\d+(?:\.\d+)?/g) || []).map(Number).filter(n => n > 0);
    if (nums.length < 2) return null;

    const isArea = /(面积|area)/.test(low);

    let rows = null, cols = null;

    if (isArea) {
      // 面积：长 L 宽 W（或 length L width W）
      const lenM = t.match(/(?:长|length)\s*(?:是|为|等于|=)?\s*(\d+(?:\.\d+)?)/i);
      const widM = t.match(/(?:宽|width)\s*(?:是|为|等于|=)?\s*(\d+(?:\.\d+)?)/i);
      if (lenM && widM) {
        cols = parseFloat(lenM[1]); // 长 = 列方向
        rows = parseFloat(widM[1]); // 宽 = 行方向
      } else {
        [rows, cols] = nums.slice(0, 2); // 退化：前两个数当宽、长
      }
    } else {
      // 阵列：优先 “A行B列” 直接配对（行后紧跟“行”，避免被“第3排”这类干扰项抢走）
      const rowM = t.match(/(\d+(?:\.\d+)?)\s*行/);
      const colM = t.match(/(\d+(?:\.\d+)?)\s*列/);
      const paiM = t.match(/(\d+(?:\.\d+)?)\s*排/);
      const eachM = t.match(/(?:每行|每排|each row)\s*(?:有|放|摆|是)?\s*(\d+(?:\.\d+)?)/i);

      if (rowM && colM) {
        rows = parseFloat(rowM[1]);
        cols = parseFloat(colM[1]);
      } else if (rowM && eachM) {
        rows = parseFloat(rowM[1]);
        cols = parseFloat(eachM[1]);
      } else if (paiM && eachM) {
        // “6排椅子，每排8把”
        rows = parseFloat(paiM[1]);
        cols = parseFloat(eachM[1]);
      } else if (eachM) {
        const rowTotalM = t.match(/(?:一共|共有|有)\s*(\d+(?:\.\d+)?)\s*(?:行|排|row|rows)/i);
        if (rowTotalM) { rows = parseFloat(rowTotalM[1]); cols = parseFloat(eachM[1]); }
      }
      if (rows == null || cols == null) {
        // 兜底：两个数字按出现顺序当作 rows, cols
        [rows, cols] = nums.slice(0, 2);
      }
    }

    rows = Math.round(Number(rows));
    cols = Math.round(Number(cols));
    if (!Number.isFinite(rows) || !Number.isFinite(cols)) return null;
    if (rows <= 0 || cols <= 0) return null;
    // 体量保护：阵列渲染要画得下
    if (rows > 12 || cols > 12) return null;

    const actor = pickActor(t);
    const mode = isArea ? 'area' : 'multiply';

    // 置信度
    let confidence;
    if (isArea && /(面积|area)/.test(low) && /(长|length)/.test(low) && /(宽|width)/.test(low)) confidence = 0.92;
    else if (/(行|row)/.test(low) && /(列|column)/.test(low)) confidence = 0.9;
    else if (/(每行|每排|each row)/.test(low)) confidence = 0.8;
    else confidence = 0.5; // 仅靠两个数字兜底，中等置信

    const unit = (t.match(/(平方厘米|平方厘米|平方米|m²|cm²|平方米)/i) || [])[1] || (isArea ? '' : '个');

    return {
      rows, cols, mode,
      actorType: actor.type, actorEmoji: actor.emoji,
      unit, confidence, raw: t,
    };
  },

  // 确定性求解
  solve(params, opts = {}) {
    const { rows, cols, mode, actorEmoji, unit } = params;
    const product = rows * cols;
    const lang = (opts.language) || 'zh-CN';
    const ZH = lang !== 'en';
    const steps = [];

    if (mode === 'area') {
      steps.push({
        narration: ZH
          ? `这是一个长方形，长 ${cols}，宽 ${rows}。我们用小方格铺满它。`
          : `This is a rectangle. It is ${cols} long and ${rows} wide. Let's tile it with unit squares.`,
        visualHint: 'concrete_rect',
      });
      steps.push({
        narration: ZH
          ? `一行能铺 ${cols} 格，一共铺 ${rows} 行。`
          : `Each row holds ${cols} squares, and there are ${rows} rows.`,
        visualHint: 'pictorial_tiles',
      });
      steps.push({
        narration: ZH
          ? `长方形面积 = 长 × 宽 = ${cols} × ${rows} = ${product}${unit ? ' ' + unit : ''}。`
          : `Area = length × width = ${cols} × ${rows} = ${product}${unit ? ' ' + unit : ''}.`,
        visualHint: 'abstract_formula',
      });
      return {
        answer: ZH ? `${product}` : `${product}`,
        steps, rows, cols, mode, product, unit, actorEmoji,
        formula: ZH ? `${cols} × ${rows} = ${product}` : `${cols} × ${rows} = ${product}`,
      };
    }

    // multiply / 数数
    steps.push({
      narration: ZH
        ? `我们把${actorEmoji}摆成整齐的方阵：一共 ${rows} 行。`
        : `We line up the ${actorEmoji} in a neat array: ${rows} rows in total.`,
      visualHint: 'concrete_array',
    });
    // 跳数
    const skip = [];
    for (let r = 1; r <= rows; r++) skip.push(r * cols);
    steps.push({
      narration: ZH
        ? `每行有 ${cols} 个。一行一行地数：${skip.join('、')}。`
        : `Each row has ${cols}. Counting by rows: ${skip.join(', ')}.`,
      visualHint: 'pictorial_skip',
    });
    steps.push({
      narration: ZH
        ? `${rows} 行 × 每行 ${cols} 个 = ${rows} × ${cols} = ${product}${unit ? ' ' + unit : ''}。`
        : `${rows} rows of ${cols} = ${rows} × ${cols} = ${product}${unit ? ' ' + unit : ''}.`,
      visualHint: 'abstract_sentence',
    });

    return {
      answer: ZH ? `${product}` : `${product}`,
      steps, rows, cols, mode, product, unit, actorEmoji,
      formula: ZH ? `${rows} × ${cols} = ${product}` : `${rows} × ${cols} = ${product}`,
    };
  },

  validate(params, solved, opts = {}) {
    if (!solved || !solved.answer) return { ok: false, reason: 'no_answer' };
    if (!Number.isFinite(params.rows) || !Number.isFinite(params.cols)) return { ok: false, reason: 'bad_dims' };
    const expect = params.rows * params.cols;
    if (Number(solved.product) !== expect) return { ok: false, reason: 'product_mismatch' };
    if (String(solved.answer).trim() !== String(expect)) return { ok: false, reason: 'answer_mismatch' };
    if (!solved.steps || solved.steps.length < 3) return { ok: false, reason: 'steps_too_short' };
    return { ok: true };
  },

  // 渲染参数：给 Canvas 渲染器吃的确定性数据
  renderParams(solved, opts = {}) {
    const lang = opts.language || 'zh-CN';
    const ZH = lang !== 'en';
    const { rows, cols, mode, product, actorEmoji } = solved;

    const beats = [
      { id: 'concrete', duration: 5000, label: ZH ? '摆成方阵' : 'Build the array' },
      { id: 'pictorial', duration: 5000, label: ZH ? '一行一行数' : 'Count by rows' },
      { id: 'abstract', duration: 5000, label: ZH ? '写成乘法' : 'Number sentence' },
    ];

    return {
      type: 'grid',
      mode, rows, cols, product,
      actor: { type: solved.actorType || 'apple', emoji: actorEmoji || '🍎' },
      formula: solved.formula,
      answer: String(product),
      beats,
      // 至少一个非 say/show 的图形场景
      scenes: [
        { type: 'concrete_array', rows, cols, emoji: actorEmoji || '🍎' },
        { type: 'dot_array', rows, cols },
        { type: 'number_sentence', rows, cols, product, formula: solved.formula },
      ],
      i18n: {
        title: mode === 'area' ? (ZH ? '面积入门' : 'Area') : (ZH ? '阵列乘法' : 'Array Multiplication'),
        rowLabel: ZH ? '行' : 'rows',
        colLabel: ZH ? '列' : 'columns',
        answer: ZH ? '答案' : 'Answer',
      },
    };
  },
};
