// lib/kards/orchestrator.js — 编排层：路由 / 级联 / 缓存 / 质量门
// 优先级：知识卡(确定性) → free HTML(受控兜底) → 静态步骤卡
// 绝不硬套、绝不白屏、绝不把源码/思考显示到页面。

const { classify, runCard, FAMILY_IDS } = require('./registry');
const crypto = require('crypto');
const { tryBoard } = require('../board-router');

const QUALITY_GATE = {
  minConfidence: 0.3,
  requireGraphicScene: true,  // 纯 say/show 判不合格
  maxExtractTokens: 800,
  kardTimeoutMs: Number(process.env.KARD_TIMEOUT_MS || 8000),
  freeHtmlTimeoutMs: Number(process.env.FREE_HTML_TIMEOUT_MS || 25000),
};

function cacheKey(problem, lang, stage) {
  const norm = String(problem || '').replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 800);
  return crypto.createHash('sha256').update([lang || 'en', stage || '', norm].join('|')).digest('hex');
}

// 质量门：检查知识卡结果是否合格
function passesQualityGate(result) {
  if (!result || !result.eligible) return false;
  if (result.params && result.params.confidence != null && result.params.confidence < QUALITY_GATE.minConfidence) return false;
  // 必须含至少一个图形场景
  if (QUALITY_GATE.requireGraphicScene) {
    const rp = result.renderParams;
    if (!rp) return false;
    const hasScene = rp.scenes && rp.scenes.some(s => s && s.type && s.type !== 'say' && s.type !== 'show');
    if (!hasScene) return false;
  }
  return true;
}

// 主入口：尝试知识卡路径，失败则返回 needFallback
async function tryKnowledgeCard(problem, opts = {}) {
  const lang = opts.language || 'en';
  const stage = opts.stage || 'prefer_not';
  const key = cacheKey(problem, lang, stage);

  // ---- 第一棒：renderer 确定性知识卡（现有 8 族，保持原逻辑）----
  const renderer = await runRendererCard(problem, { language: lang, stage });
  if (renderer.eligible) {
    return { eligible: true, family: renderer.family, result: renderer.result, cacheKey: key, isBoard: false };
  }

  // ---- 第二棒：board 族（高中学科/实验，LLM 生成 edulab board JSON）----
  // renderer 不命中（无匹配/超时/质量门不过）时尝试；小学/CPA 由 board-router 自行拦截。
  try {
    const board = await tryBoard(problem, { language: lang, stage });
    if (board && board.eligible) {
      // board 质量门：board 非空 + validateBoard 通过（router 内部已做二次校验，这里再兜底）
      return {
        eligible: true,
        family: board.family,
        host: board.host,
        board: board.board,
        answer: board.answer,
        steps: board.steps,
        cacheKey: key,
        isBoard: true,
      };
    }
    // board 不命中，返回 renderer 的失败原因
    return {
      eligible: false,
      reason: renderer.reason || (board && board.reason) || 'no_match',
      fallback: 'free_html',
      family: renderer.family || (board && board.family) || null,
      cacheKey: key,
    };
  } catch (e) {
    console.error('[kards] board path error:', e && e.message);
    return {
      eligible: false,
      reason: renderer.reason || 'board_exception',
      fallback: 'free_html',
      family: renderer.family || null,
      cacheKey: key,
    };
  }
}

// renderer 确定性卡片流程：分类 → 限时执行 → 质量门
async function runRendererCard(problem, opts) {
  // 1. 分类
  const cls = classify(problem, opts);
  if (!cls) return { eligible: false, reason: 'no_match' };

  // 2. 限时执行卡片
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('kard_timeout')), QUALITY_GATE.kardTimeoutMs));
  let result;
  try {
    result = await Promise.race([runCard(cls.id, problem, opts), timeout]);
  } catch (e) {
    return { eligible: false, reason: e.message === 'kard_timeout' ? 'timeout' : 'exception', family: cls.id };
  }

  // 3. 质量门
  if (!passesQualityGate(result)) {
    return { eligible: false, reason: result?.reason || 'quality_gate', family: cls.id };
  }
  return { eligible: true, family: cls.id, result };
}

// 级联决策：根据信号决定是否触发兜底
function shouldFallback(kardResult, signals = {}) {
  if (!kardResult || !kardResult.eligible) return true;
  if (signals.timeout) return true;
  if (signals.error) return true;
  if (signals.noGraphic) return true;
  return false;
}

module.exports = {
  tryKnowledgeCard,
  shouldFallback,
  passesQualityGate,
  cacheKey,
  QUALITY_GATE,
  FAMILY_IDS,
};
