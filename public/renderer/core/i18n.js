// renderer/core/i18n.js — 渲染器轻量多语种模块（ESM）
// 与 lib/kards/i18n.js 对应，但为 ESM 格式，供 renderer/modes/*.js 使用
export const LANGS = ['en','zh-CN','zh-TW','ja','ko','fr','de','es','it','ar','fa'];
export const RTL_LANGS = new Set(['ar','fa']);
export function isRTL(lang) { return RTL_LANGS.has(String(lang||'')); }
export function langOf(anim) { return (anim && anim.language) || 'en'; }

// 通用渲染标签翻译（各模式共享的常见词）
const COMMON = {
  en: { day:'Day', night:'Night', done:'Done', meetingPoint:'Meeting point', unit1:'Unit 1', part:'part', answer:'Answer', time:'time', distance:'distance' },
  'zh-CN': { day:'白天', night:'晚上', done:'完成', meetingPoint:'相遇点', unit1:'单位"1"', part:'份', answer:'答案', time:'时间', distance:'距离' },
  'zh-TW': { day:'白天', night:'晚上', done:'完成', meetingPoint:'相遇點', unit1:'單位"1"', part:'份', answer:'答案', time:'時間', distance:'距離' },
  ja: { day:'昼', night:'夜', done:'完了', meetingPoint:'出会い点', unit1:'単位"1"', part:'個', answer:'答え', time:'時間', distance:'距離' },
  ko: { day:'낮', night:'밤', done:'완료', meetingPoint:'만남 지점', unit1:'단위"1"', part:'몫', answer:'정답', time:'시간', distance:'거리' },
  fr: { day:'Jour', night:'Nuit', done:'Terminé', meetingPoint:'Point de rencontre', unit1:'Unité «1»', part:'part', answer:'Réponse', time:'temps', distance:'distance' },
  de: { day:'Tag', night:'Nacht', done:'Fertig', meetingPoint:'Treffpunkt', unit1:'Einheit „1"', part:'Anteil', answer:'Antwort', time:'Zeit', distance:'Entfernung' },
  es: { day:'Día', night:'Noche', done:'Listo', meetingPoint:'Punto de encuentro', unit1:'Unidad «1»', part:'parte', answer:'Respuesta', time:'tiempo', distance:'distancia' },
  it: { day:'Giorno', night:'Notte', done:'Fatto', meetingPoint:'Punto d\'incontro', unit1:'Unità «1»', part:'parte', answer:'Risposta', time:'tempo', distance:'distanza' },
  ar: { day:'نهار', night:'ليل', done:'تم', meetingPoint:'نقطة الالتقاء', unit1:'الوحدة "1"', part:'جزء', answer:'الإجابة', time:'الوقت', distance:'المسافة' },
  fa: { day:'روز', night:'شب', done:'تمام شد', meetingPoint:'نقطه ملاقات', unit1:'واحد "1"', part:'بخش', answer:'پاسخ', time:'زمان', distance:'فاصله' },
};

export function t(lang, key) {
  const table = COMMON[lang] || COMMON.en;
  return table[key] || COMMON.en[key] || key;
}
