// lib/kards/i18n.js — 知识卡多语种内核
// 11 语种：en, zh-CN, zh-TW, ja, ko, fr, de, es, it, ar, fa（ar/fa 为 RTL）
// 每张卡通过 register() 注册自己的翻译表（含 _keywords 路由关键词 + 旁白/标签模板）
// solve() / renderParams() 通过 t() 取本地化文本，保证不混语。
'use strict';

const LANGS = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'fr', 'de', 'es', 'it', 'ar', 'fa'];
const RTL_LANGS = new Set(['ar', 'fa']);
const _db = {}; // cardId -> { lang -> { key -> templateString } }

/** 注册一张卡的翻译表 */
function register(cardId, table) {
  _db[cardId] = table;
}

/** 是否 RTL 语种 */
function isRTL(lang) {
  return RTL_LANGS.has(String(lang || ''));
}

/** 从 opts 取 language，默认 en */
function langOf(opts) {
  return (opts && opts.language) || 'en';
}

/**
 * 取翻译文本，带 {var} 占位符替换
 * 回退链：请求语种 -> en -> 第一个可用语种 -> key 本身
 */
function t(cardId, lang, key, vars) {
  const card = _db[cardId];
  if (!card) return key;
  let table = card[lang];
  if (!table) table = card.en || card[Object.keys(card)[0]] || {};
  let s = table[key];
  if (s == null && card.en) s = card.en[key];
  if (s == null) s = key;
  s = String(s);
  if (vars) {
    for (const k in vars) {
      s = s.split('{' + k + '}').join(vars[k]);
    }
  }
  return s;
}

/** 取一张卡所有语种的关键词合集（用于 classify 路由） */
function keywords(cardId) {
  const card = _db[cardId];
  if (!card) return [];
  const out = [];
  for (const lang of LANGS) {
    const kw = card[lang] && card[lang]._keywords;
    if (Array.isArray(kw)) {
      for (const w of kw) if (w && !out.includes(w)) out.push(w);
    }
  }
  return out;
}

/** 取指定语种的关键词 */
function keywordsForLang(cardId, lang) {
  const card = _db[cardId];
  if (!card || !card[lang]) return [];
  return card[lang]._keywords || [];
}

/** 检测文本是否含中文字符（用于反混语校验） */
function hasChinese(text) {
  return /[\u4e00-\u9fff]/.test(String(text || ''));
}

/** 检测文本是否含给定语种的预期字符（粗粒度，用于旁白语种校验） */
function looksLikeLang(text, lang) {
  const s = String(text || '');
  if (!s.trim()) return false;
  // 数字、数学符号、emoji 不影响判断
  const stripped = s.replace(/[\d\s+\-×÷=().,%°²³/<>?!:;'"，。！？：；、…—–\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, '');
  if (!stripped.trim()) return true; // 纯数字/符号算通过
  switch (lang) {
    case 'zh-CN':
    case 'zh-TW':
      return /[\u4e00-\u9fff]/.test(stripped);
    case 'ja':
      return /[\u3040-\u30ff\u4e00-\u9fff]/.test(stripped);
    case 'ko':
      return /[\uac00-\ud7af\u1100-\u11ff]/.test(stripped);
    case 'ar':
      return /[\u0600-\u06ff]/.test(stripped);
    case 'fa':
      return /[\u0600-\u06ff\u0750-\u077f]/.test(stripped);
    case 'fr':
    case 'de':
    case 'es':
    case 'it':
    case 'en':
      // 拉丁字母语种：含拉丁字母且不含 CJK/阿拉伯/韩文字符
      return /[a-zA-ZàâäéèêëîïôöùûüçæœÀÂÄÉÈÊËÎÏÔÖÙÛÜÇÆŒßñáíóúü¿¡]/.test(stripped)
        && !/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af\u0600-\u06ff]/.test(stripped);
    default:
      return true;
  }
}

module.exports = { LANGS, RTL_LANGS, isRTL, langOf, register, t, keywords, keywordsForLang, hasChinese, looksLikeLang };
