// lib/kards/registry.js — 知识卡注册表与加载器
// 每张卡是一个 JS 模块：{ id, name, keywords, extract(), solve(), validate(), renderParams() }
// 运行时按需加载，不打包全部。

const CARD_DIR = __dirname; // lib/kards/
const FAMILY_IDS = ['axis_motion', 'motion', 'numberline', 'bars', 'grid', 'balance', 'geometry', 'function-graph', 'sequence'];

let _cache = {};

function loadCard(id) {
  if (_cache[id]) return _cache[id];
  try {
    const mod = require(`./${id}.js`);
    _cache[id] = mod;
    return mod;
  } catch (e) {
    console.error('[kards] failed to load card:', id, e.message);
    return null;
  }
}

// 分类路由：根据题目文本 + 关键词打分，返回最匹配的族 id 或 null
function classify(problemText, opts = {}) {
  const text = String(problemText || '').toLowerCase();
  const scores = {};
  for (const id of FAMILY_IDS) {
    const card = loadCard(id);
    if (!card) continue;
    let score = 0;
    const kws = card.keywords || [];
    for (const kw of kws) {
      if (text.includes(kw.toLowerCase())) score += kw.length > 2 ? 2 : 1;
    }
    // 卡片可自定义 match(problem) 返回额外分数
    if (typeof card.match === 'function') {
      try { score += card.match(problemText, opts) || 0; } catch(e){}
    }
    if (score > 0) scores[id] = score;
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted.length ? { id: sorted[0][0], score: sorted[0][1], all: sorted } : null;
}

// 执行一张卡的完整流程：抽参 → 解题 → 校验 → 渲染参数
async function runCard(id, problemText, opts = {}) {
  const card = loadCard(id);
  if (!card) return { eligible: false, reason: 'card_not_found', id };
  try {
    // 1. 抽参
    const params = typeof card.extract === 'function' ? card.extract(problemText, opts) : null;
    if (!params) return { eligible: false, reason: 'extract_failed', id };
    if (params.confidence != null && params.confidence < 0.3) {
      return { eligible: false, reason: 'low_confidence', id, confidence: params.confidence };
    }
    // 2. 解题
    const solved = typeof card.solve === 'function' ? card.solve(params, opts) : null;
    if (!solved) return { eligible: false, reason: 'solve_failed', id };
    // 3. 校验
    if (typeof card.validate === 'function') {
      const v = card.validate(params, solved, opts);
      if (v && v.ok === false) return { eligible: false, reason: 'validate_failed', id, detail: v };
    }
    // 4. 渲染参数
    const renderParams = typeof card.renderParams === 'function' ? card.renderParams(solved, opts) : null;
    return {
      eligible: true,
      id,
      params,
      solved,
      renderParams,
      answer: solved.answer,
      steps: solved.steps || [],
    };
  } catch (e) {
    console.error('[kards] runCard error:', id, e.message);
    return { eligible: false, reason: 'exception', id, error: e.message };
  }
}

module.exports = { FAMILY_IDS, loadCard, classify, runCard };
