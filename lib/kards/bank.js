// lib/kards/bank.js — 蒸馏例题库加载器 + 多语言相关性检索
// 用途：动画/board 生成时，按题目检索 1-2 个"教学分镜参考"，
//       让模型学到该题型应有的具象程度与场景顺序（参考而非照抄，不硬套、不固化）。
// 多语言：先用聚合了 11 语种关键词的分类器判"族"，再在同族里选题；
//         非拉丁脚本（阿拉伯/韩/日）也能命中。
'use strict';

const DATA = require('./bank/index.js');

// 已知族（长名优先，避免 function-graph / axis_motion 被拆）
const FAMILY_IDS = ['function-graph', 'axis_motion', 'numberline', 'balance', 'geometry',
  'sequence', 'motion', 'bars', 'grid', 'board'];

function parseName(file) {
  const m = file.match(/^(\d+)-(.+)\.json$/);
  if (!m) return null;
  const num = Number(m[1]);
  const rest = m[2];
  let family = null;
  for (const id of FAMILY_IDS) {
    if (rest.startsWith(id + '-')) { family = id; break; }
  }
  if (!family) family = 'board';
  const topic = rest.slice(family.length + 1);
  return { num, family, topic, file };
}

const ENTRIES = Object.keys(DATA).map(parseName).filter(Boolean);

function clip(s, n) {
  s = String(s == null ? '' : s);
  return s.length > n ? s.slice(0, n) + '…' : s;
}

// 多语言分词：拉丁（含重音）、数字、CJK、假名、韩文、阿拉伯文
const WORD_RE = /[a-zà-ÿ]{2,}|[0-9]+|[一-龥㐀-䶿]{2,4}|[぀-ヿ]{2,4}|[가-힯ᄀ-ᇿ]{2,4}|[؀-ۿ]{2,6}/g;
function contentWords(s) {
  return new Set(String(s || '').toLowerCase().match(WORD_RE) || []);
}

// 多语言族分类（延迟加载，避免循环依赖）
let _classify = null;
function classify(problemText) {
  if (_classify === null) {
    try { _classify = require('./registry').classify; } catch (e) { _classify = false; }
  }
  if (!_classify) return null;
  try { return _classify(problemText) || null; } catch (e) { return null; }
}

// 给"题目文本 vs 某个题型文件"打分
const _contentCache = {};
function contentText(entry) {
  if (_contentCache[entry.file]) return _contentCache[entry.file];
  const data = DATA[entry.file];
  const probs = (data.examples || []).map(e => String(e.problem || '')).join(' ');
  const s = String((data.topic || '') + ' ' + entry.topic + ' ' + probs).toLowerCase();
  _contentCache[entry.file] = s;
  return s;
}

function scoreEntry(entry, problemText, cls) {
  const text = String(problemText || '').toLowerCase();
  let score = 0;

  // 1) 题干词语重叠（同语言最强信号）
  const hay = contentText(entry);
  for (const w of contentWords(text)) {
    if (w.length >= 2 && hay.includes(w)) score += 1;
  }

  // 2) 关键实体命中（青蛙/井/天平/电阻…）
  const data = DATA[entry.file];
  const objs = new Set();
  (data.examples || []).forEach(e => (e.key_objects || []).forEach(o => objs.add(String(o).toLowerCase())));
  for (const o of objs) {
    if (o.length >= 2 && text.includes(o)) score += 2;
  }
  // 3) 题型名整词命中
  const topicHay = String((data.topic || '') + ' ' + entry.topic).toLowerCase();
  for (const w of contentWords(topicHay)) {
    if (w.length >= 3 && text.includes(w)) score += 2;
  }
  // 4) 多语言分类器判为同族 → 强加分（保证阿拉伯/韩/日等也能命中同族题）
  if (cls && entry.family === cls.id) score += 8;
  return score;
}

// 精简一道例题，控制注入 prompt 的体积
function condense(ex, maxBeats) {
  const out = {
    problem: clip(ex.problem, 120),
    answer: clip(ex.answer, 80),
    key_objects: (ex.key_objects || []).slice(0, 10),
    beats: (ex.beats || []).slice(0, maxBeats || 6).map(b => ({
      say: clip(b.narration, 90),
      show: clip(b.visual, 170),
    })),
  };
  if (ex.pitfall) out.pitfall = clip(ex.pitfall, 100);
  return out;
}

// 主入口：返回最多 k 个相关题型的精简参考例题
function relevant(problemText, opts) {
  opts = opts || {};
  const k = opts.k || 2;
  const familyHint = opts.family || null;
  const cls = classify(problemText);
  const ranked = ENTRIES
    .map(e => ({ e, s: scoreEntry(e, problemText, cls) }))
    .filter(x => x.s > 0 && (!familyHint || x.e.family === familyHint))
    .sort((a, b) => b.s - a.s || a.e.num - b.e.num);

  const out = [];
  for (const item of ranked.slice(0, k)) {
    const data = DATA[item.e.file];
    const exs = data.examples || [];
    const pick = exs.find(x => x.difficulty === '中') || exs[0];
    if (pick) out.push(Object.assign({ topic: clip(data.topic || item.e.topic, 40) }, condense(pick, opts.maxBeats || 6)));
  }
  return out;
}

module.exports = { relevant, list: () => ENTRIES, DATA };
