// lib/board-router.js — board 族分类 + LLM 生成 board JSON + schema 校验
// 导出 tryBoard(problem, opts) -> {eligible, family, host, board, answer, steps}
//                            或 {eligible:false, reason}
//
// 流程：关键词+学段粗分类 → 调 openai.js 生成 {board,answer,steps} → validateBoard 校验
//       → 不合格带修正提示重试一次 → 仍不合格返回 schema_invalid。
// 模型名不写死，复用 lib/openai.js 的 MODELS（默认 deepseek-flash，兜底 deepseek-v4-pro）。

'use strict';

const { responsesWithFallback, MODELS } = require('./openai');
const { validateBoard } = require('./board-schema');
const { BOARD_PROMPTS, FAMILY_HOSTS } = require('./board-prompts');

// ---- 关键词表（任务约定）----
const KEYWORDS = {
  board_function_graph: ['函数', '二次函数', '抛物线函数', '三角函数', '指数函数', '对数函数', '图像', 'f(x)', 'f（x）'],
  board_conics: ['椭圆', '双曲线', '抛物线', '圆锥曲线', '离心率', '焦点', '准线'],
  board_analytic_geometry: ['解析几何', '直线方程', '圆的方程', '轨迹方程', '斜率', '垂足', '中点', '勾股'],
  board_vector: ['向量', '矢量', '点积', '叉积', '数量积', '平行四边形法则'],
  board_physics_motion: ['抛体', '平抛', '自由落体', '速度', '加速度', '位移', '动能', '势能', '机械能', '读数'],
  board_statistics: ['统计', '正态分布', '概率', '分布', '均值', '方差', '标准差', '直方图'],
  board_logic: ['逻辑', '命题', '集合', '充分条件', '必要条件', '推理', '文氏', '真值表', '交集', '并集'],
  board_solid_geometry: ['立体几何', '棱柱', '棱锥', '二面角', '线面角', '空间几何', '体积', '正方体', '正四棱锥'],
  board_physics_3d: ['洛伦兹力', '磁场', '空间向量', '三维', '力场', '右手定则', '叉积', '轨道'],
  board_chemistry: ['化学', '反应', '分子', '原子', '化学键', '化学平衡', '氧化还原', '配平', '燃烧', '酯化'],
};

// 明确的小学/CPA 学段：board 族不接，留给 renderer 确定性卡片
const ELEMENTARY_RE = /elementary|primary|小学|grade\s?[1-6]|cpa|arithmetic|counting|count|加法|减法|乘法表|数数/i;

const PER_CALL_TIMEOUT = Number(process.env.BOARD_LLM_TIMEOUT_MS || 25000); // 单次 LLM 25s
const OVERALL_TIMEOUT = Number(process.env.BOARD_OVERALL_TIMEOUT_MS || 30000); // 整体 30s
const MAX_TOKENS = Number(process.env.BOARD_MAX_TOKENS || 4000);

// 关键词打分分类
function classifyBoard(problem, opts = {}) {
  const text = String(problem || '').toLowerCase();
  const stage = String(opts.stage || 'prefer_not').toLowerCase();
  if (ELEMENTARY_RE.test(stage)) return null; // 小学/CPA 不接 board
  const scores = {};
  for (const [fam, kws] of Object.entries(KEYWORDS)) {
    let s = 0;
    for (const kw of kws) {
      if (text.includes(kw.toLowerCase())) s += kw.length >= 2 ? 2 : 1;
    }
    if (s > 0) scores[fam] = s;
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (!sorted.length) return null;
  // 至少要有一个明显命中，且领先第二名足够（避免模糊题目乱接）
  const [bestFam, bestScore] = sorted[0];
  if (bestScore < 2) return null;
  return { family: bestFam, score: bestScore, all: sorted };
}

// 从模型输出文本里抠 JSON（容忍 ```json 代码块包裹 / 前后多余文字）
function extractJson(text) {
  if (!text) return null;
  let t = String(text).trim();
  // 去掉 markdown 代码块
  t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  // 找第一个 { 到最后一个 }
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(t.slice(start, end + 1));
  } catch (e) {
    return null;
  }
}

// 构造 messages
function buildMessages(family, problem, opts, correction) {
  const p = BOARD_PROMPTS[family];
  const user = p.userTemplate
    .replace('{{problem}}', String(problem || ''))
    .replace('{{stage}}', String(opts.stage || 'prefer_not'))
    .replace('{{lang}}', String(opts.language || 'zh-CN'));
  const sys = p.system + '\n\n【本族 schema 要点】' + p.schemaHint +
    '\n\n【参考 board 结构（few-shot，仅作格式参考，不要照抄数值）】\n' +
    JSON.stringify(p.example);
  const msgs = [
    { role: 'system', content: sys },
    { role: 'user', content: user },
  ];
  if (correction) {
    msgs.push({ role: 'user', content:
      '你上次输出的 board JSON 未通过结构校验，请严格修正后重新输出完整的 {answer, steps, board} JSON。\n' +
      '校验错误：\n- ' + correction.join('\n- ') +
      '\n特别注意：constant 和 trace 必须是对象或 null；view 必须含 xRange/yRange；conics 的 kind 与 derived 的 type 必须用枚举值。' });
  }
  return msgs;
}

// 调一次模型并解析
async function generateOnce(family, problem, opts, correction) {
  const msgs = buildMessages(family, problem, opts, correction);
  const r = await responsesWithFallback(
    msgs,
    MAX_TOKENS,
    [MODELS.solve, MODELS.solveStrong],
    PER_CALL_TIMEOUT,
    // responsesWithFallback 不直接接收 extra；我们通过 responses 的 extra 注入 json mode。
    // 为兼容：这里用 responsesWithFallback，DeepSeek 默认会尽量返回可解析文本；router 端再 extractJson。
  );
  const parsed = extractJson(r.text);
  if (!parsed) return { ok: false, reason: 'parse_failed', raw: (r.text || '').slice(0, 300) };
  return { ok: true, parsed, model: r.model };
}

// 主入口
async function tryBoard(problem, opts = {}) {
  const stage = opts.stage || 'prefer_not';

  // 1. 分类
  const cls = classifyBoard(problem, { ...opts, stage });
  if (!cls) return { eligible: false, reason: 'no_board_match' };
  const family = cls.family;
  const host = FAMILY_HOSTS[family];

  // 2. 整体 30s 超时
  const overall = new Promise((_, rej) =>
    setTimeout(() => rej(new Error('board_overall_timeout')), OVERALL_TIMEOUT));

  try {
    const result = await Promise.race([
      (async () => {
        // 第一次生成
        let g;
        try {
          g = await generateOnce(family, problem, opts, null);
        } catch (e) {
          if (/timeout|abort|failed|unavailable|ENOTFOUND|ECONNREFUSED|401|402|429|5\d\d/i.test(e.message || '')) {
            return { eligible: false, reason: 'model_unavailable', error: e.message };
          }
          return { eligible: false, reason: 'model_error', error: e.message };
        }
        if (!g.ok) return { eligible: false, reason: g.reason || 'generate_failed', raw: g.raw };

        // 校验
        let v = validateBoard(g.parsed.board, host);
        if (v.ok) return finalize(family, host, g.parsed);

        // 3. 带修正提示重试一次
        let g2;
        try {
          g2 = await generateOnce(family, problem, opts, v.errors);
        } catch (e) {
          return { eligible: false, reason: 'model_unavailable', error: e.message };
        }
        if (!g2.ok) return { eligible: false, reason: 'parse_failed_retry', raw: g2.raw };
        v = validateBoard(g2.parsed.board, host);
        if (!v.ok) {
          return { eligible: false, reason: 'schema_invalid', errors: v.errors, family, host };
        }
        return finalize(family, host, g2.parsed);
      })(),
      overall,
    ]);
    return result;
  } catch (e) {
    if (e && e.message === 'board_overall_timeout') {
      return { eligible: false, reason: 'timeout', family, host };
    }
    return { eligible: false, reason: 'exception', error: e && e.message, family, host };
  }
}

function finalize(family, host, parsed) {
  const board = parsed.board || parsed.board3d || null;
  if (!board || typeof board !== 'object') {
    return { eligible: false, reason: 'no_board_in_response', family, host };
  }
  return {
    eligible: true,
    family,
    host,
    board,
    answer: parsed.answer || '',
    steps: Array.isArray(parsed.steps) ? parsed.steps : [],
  };
}

module.exports = { tryBoard, classifyBoard, extractJson, KEYWORDS, FAMILY_HOSTS };
