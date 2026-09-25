// lib/kards/sequence.js — 分组数列 / 找规律 族知识卡（11 语种版）
// 承载：自然数 n 连续出现 n 次（1, 2,2, 3,3,3, 4,4,4,4, …），求第 N 个数。
// 方法：前 k 组累计个数 = 三角形数 T(k)=1+2+…+k=k(k+1)/2；
//       找 m 使 T(m-1) < N ≤ T(m)，则第 N 个数 = m。
// CPA：具象(分组卡片，每组 n 张写着 n) → 图示(累计三角形数) → 抽象(定位不等式 + 公式)。
'use strict';
const i18n = require('./i18n');

i18n.register('sequence', {
  en: {
    _keywords: ['sequence','in a row','appears','consecutive','nth term','term number','pattern','triangular','natural number','times in a row','block','term','series'],
    narr_groups: "See the pattern: 1 appears once, 2 appears twice, 3 three times… block n holds n copies of n.",
    narr_triangle: "Through block k there are T(k)=1+2+…+k=k(k+1)/2 terms — the triangular numbers.",
    narr_locate: "Locate term {N}: T({m1})={Tprev}, T({m})={Tm}, and {Tprev} < {N} ≤ {Tm}, so it lies in block {m} (copy {offsetWithin}).",
    narr_answer: "Every term in block {m} equals {m}, so the {N}th term is {m}.",
    beat_groups: "Pattern: n appears n times", beat_triangle: "Cumulative: triangular T(k)",
    beat_locate: "Locate term {N}", beat_answer: "Term {N} = {m}",
  },
  'zh-CN': {
    _keywords: ['一串数','这串数','连续出现','找规律','三角形数','按规律','自然数','个数是多少','第几个','数列','规律','出现','第'],
    narr_groups: "先看规律：1 出现 1 次，2 连续出现 2 次，3 连续出现 3 次…… 第 n 组就是 n 个“n”。",
    narr_triangle: "数到第 k 组结束，一共出现 T(k)=1+2+…+k=k(k+1)/2 个数，这就是三角形数。",
    narr_locate: "定位第 {N} 个：T({m1})={Tprev}，T({m})={Tm}，而 {Tprev} < {N} ≤ {Tm}，所以它在第 {m} 组（第 {offsetWithin} 个）。",
    narr_answer: "第 {m} 组里的数全部是 {m}，因此第 {N} 个数就是 {m}。",
    beat_groups: "看规律：n 出现 n 次", beat_triangle: "累计：三角形数 T(k)",
    beat_locate: "定位第 {N} 个", beat_answer: "第 {N} 个数 = {m}",
  },
  'zh-TW': {
    _keywords: ['一串數','這串數','連續出現','找規律','三角形數','按規律','自然數','個數是多少','第幾個','數列','規律','出現','第'],
    narr_groups: "先看規律：1 出現 1 次，2 連續出現 2 次，3 連續出現 3 次…… 第 n 組就是 n 個「n」。",
    narr_triangle: "數到第 k 組結束，一共出現 T(k)=1+2+…+k=k(k+1)/2 個數，這就是三角形數。",
    narr_locate: "定位第 {N} 個：T({m1})={Tprev}，T({m})={Tm}，而 {Tprev} < {N} ≤ {Tm}，所以它在第 {m} 組（第 {offsetWithin} 個）。",
    narr_answer: "第 {m} 組裡的數全部是 {m}，因此第 {N} 個數就是 {m}。",
    beat_groups: "看規律：n 出現 n 次", beat_triangle: "累計：三角形數 T(k)",
    beat_locate: "定位第 {N} 個", beat_answer: "第 {N} 個數 = {m}",
  },
  ja: {
    _keywords: ['数列','規則','連続','項','規則性','三角形数','自然数','n番目','並び方','現れる','n回','とは'],
    narr_groups: "規則を見ましょう：1 は1回、2 は2回連続、3 は3回連続…… n のまとまりには n 個の n が並びます。",
    narr_triangle: "k 番目のまとまりまでで、T(k)=1+2+…+k=k(k+1)/2 個の項になります。これが三角数です。",
    narr_locate: "第 {N} 項の位置：T({m1})={Tprev}、T({m})={Tm}。{Tprev} < {N} ≤ {Tm} なので、{m} 番目のまとまり（{offsetWithin} 個目）にあります。",
    narr_answer: "{m} 番目のまとまりの中はすべて {m} なので、第 {N} 項は {m} です。",
    beat_groups: "規則：n が n 回現れる", beat_triangle: "累計：三角数 T(k)",
    beat_locate: "第 {N} 項を探す", beat_answer: "第 {N} 項 = {m}",
  },
  ko: {
    _keywords: ['수열','규칙','연속','항','규칙성','삼각수','자연수','n번째','나열','나타난다','n번','수'],
    narr_groups: "규칙을 봅시다: 1은 1번, 2는 2번 연속, 3은 3번 연속…… n 묶음에는 n개의 n이 들어 있어요.",
    narr_triangle: "k번째 묶음까지 모두 더하면 T(k)=1+2+…+k=k(k+1)/2개, 이것이 삼각수예요.",
    narr_locate: "제 {N}번째 항 찾기: T({m1})={Tprev}, T({m})={Tm}. {Tprev} < {N} ≤ {Tm} 이므로 {m}번째 묶음({offsetWithin}번째)에 있어요.",
    narr_answer: "{m}번째 묶음의 수는 모두 {m}이므로 제 {N}번째 수는 {m}예요.",
    beat_groups: "규칙: n이 n번 나타난다", beat_triangle: "누적: 삼각수 T(k)",
    beat_locate: "{N}번째 항 찾기", beat_answer: "{N}번째 수 = {m}",
  },
  fr: {
    _keywords: ['suite','règle','apparaît','consécutif','terme','motif','nombre triangulaire','entier naturel','nième','bloc','fois de suite','série'],
    narr_groups: "Observons le motif : 1 apparaît une fois, 2 deux fois, 3 trois fois… le bloc n contient n copies de n.",
    narr_triangle: "Jusqu'au bloc k, il y a T(k)=1+2+…+k=k(k+1)/2 termes — ce sont les nombres triangulaires.",
    narr_locate: "Placer le terme {N} : T({m1})={Tprev}, T({m})={Tm}, et {Tprev} < {N} ≤ {Tm}, donc il est dans le bloc {m} (copie {offsetWithin}).",
    narr_answer: "Chaque terme du bloc {m} vaut {m}, donc le terme {N} vaut {m}.",
    beat_groups: "Motif : n apparaît n fois", beat_triangle: "Cumul : nombres triangulaires T(k)",
    beat_locate: "Placer le terme {N}", beat_answer: "Terme {N} = {m}",
  },
  de: {
    _keywords: ['folge','muster','erscheint','hintereinander','glied','dreieckszahl','natürliche zahl','block','mal hintereinander','reihe','te'],
    narr_groups: "Sieh das Muster: 1 erscheint einmal, 2 zweimal, 3 dreimal… Block n enthält n Exemplare von n.",
    narr_triangle: "Bis Block k gibt es T(k)=1+2+…+k=k(k+1)/2 Glieder — die Dreieckszahlen.",
    narr_locate: "Finde das {N}-te Glied: T({m1})={Tprev}, T({m})={Tm}, und {Tprev} < {N} ≤ {Tm}, also liegt es in Block {m} (Exemplar {offsetWithin}).",
    narr_answer: "Jedes Glied in Block {m} ist {m}, also ist das {N}-te Glied {m}.",
    beat_groups: "Muster: n erscheint n-mal", beat_triangle: "Kumuliert: Dreieckszahlen T(k)",
    beat_locate: "Glied {N} finden", beat_answer: "Glied {N} = {m}",
  },
  es: {
    _keywords: ['secuencia','patrón','aparece','consecutivo','término','número triangular','número natural','n-ésimo','bloque','veces seguidas','serie'],
    narr_groups: "Observa el patrón: 1 aparece una vez, 2 dos veces, 3 tres veces… el bloque n tiene n copias de n.",
    narr_triangle: "Hasta el bloque k hay T(k)=1+2+…+k=k(k+1)/2 términos: los números triangulares.",
    narr_locate: "Localiza el término {N}: T({m1})={Tprev}, T({m})={Tm}, y {Tprev} < {N} ≤ {Tm}, así que está en el bloque {m} (copia {offsetWithin}).",
    narr_answer: "Cada término del bloque {m} vale {m}, así que el término {N} es {m}.",
    beat_groups: "Patrón: n aparece n veces", beat_triangle: "Acumulado: números triangulares T(k)",
    beat_locate: "Localizar término {N}", beat_answer: "Término {N} = {m}",
  },
  it: {
    _keywords: ['sequenza','modello','appare','consecutivo','termine','numero triangolare','numero naturale','nesimo','blocco','volte di seguito','serie'],
    narr_groups: "Osserva il modello: 1 appare una volta, 2 due volte, 3 tre volte… il blocco n contiene n copie di n.",
    narr_triangle: "Fino al blocco k ci sono T(k)=1+2+…+k=k(k+1)/2 termini: i numeri triangolari.",
    narr_locate: "Trova il termine {N}: T({m1})={Tprev}, T({m})={Tm}, e {Tprev} < {N} ≤ {Tm}, quindi è nel blocco {m} (copia {offsetWithin}).",
    narr_answer: "Ogni termine nel blocco {m} vale {m}, quindi il termine {N} è {m}.",
    beat_groups: "Modello: n appare n volte", beat_triangle: "Cumulato: numeri triangolari T(k)",
    beat_locate: "Trova il termine {N}", beat_answer: "Termine {N} = {m}",
  },
  ar: {
    _keywords: ['متتالية','تسلسل','نمط','يظهر','متتالي','الحد','العدد الثلاثي','العدد الطبيعي','الحد رقم','كتلة','مرات متتالية','يتكرر','سلسلة'],
    narr_groups: "لاحظ النمط: العدد 1 يظهر مرة، والعدد 2 يظهر مرتين متتاليتين، والعدد 3 ثلاث مرات… الكتلة n تحوي n نسخاً من العدد n.",
    narr_triangle: "حتى الكتلة k يبلغ عدد الحدود T(k)=1+2+…+k=k(k+1)/2، وهي الأعداد الثلاثية.",
    narr_locate: "حدّد موقع الحد رقم {N}: T({m1})={Tprev}، T({m})={Tm}، وبما أن {Tprev} < {N} ≤ {Tm}، فهو يقع في الكتلة {m} (النسخة {offsetWithin}).",
    narr_answer: "جميع حدود الكتلة {m} تساوي {m}، إذن الحد رقم {N} هو {m}.",
    beat_groups: "النمط: العدد n يتكرر n مرات", beat_triangle: "التراكم: الأعداد الثلاثية T(k)",
    beat_locate: "تحديد الحد رقم {N}", beat_answer: "الحد رقم {N} = {m}",
  },
  fa: {
    _keywords: ['دنباله','الگو','ظاهر می‌شود','متوالی','جمله','عدد مثلثی','عدد طبیعی','جمله ام','بلوک','بار پشت سر هم','تکرار','الگوی','سری'],
    narr_groups: "الگو را ببینید: عدد 1 یک بار، عدد 2 دو بار پشت سر هم، عدد 3 سه بار… بلوک n شامل n تای عدد n است.",
    narr_triangle: "تا بلوک k مجموعاً T(k)=1+2+…+k=k(k+1)/2 جمله داریم که اعداد مثلثی هستند.",
    narr_locate: "محل جمله {N} را پیدا کنید: T({m1})={Tprev}، T({m})={Tm}، و چون {Tprev} < {N} ≤ {Tm}، پس در بلوک {m} (تای {offsetWithin}) است.",
    narr_answer: "همه جمله‌های بلوک {m} برابر {m} هستند، پس جمله {N}ام برابر {m} است.",
    beat_groups: "الگو: عدد، n بار تکرار می‌شود", beat_triangle: "تجمیع: اعداد مثلثی T(k)",
    beat_locate: "یافتن جمله {N}", beat_answer: "جمله {N} = {m}",
  },
});

// 规则命中：多语种“n 出现 n 次”
const RULE_RE = /连续出现\s*n\s*次|出现\s*n\s*次|appears?\s+n\s+times|n\s+times in a row|n回(?:連続|現れ)|n번\s*(?:나타|연속)|apareît\s+n\s+fois|n\s+Mal\s+hintereinander|n\s+veces\s+(?:seguidas|veces)|n\s+volte\s+di\s+seguito|يتكرر\s*n\s+مرات|يظهر\s*n\s+مرة|n\s+بار\s+(?:پشت\s+سر\s+هم|تکرار|ظاهر)|n\s+مرات|n\s+번\s+나타나|n\s+veces|n\s+fois/i;
// 强前缀：1, 2,2, 3,3,3
const PREFIX_RE = /1[，,、؛;\s]{1,3}2[，,、؛;\s]{1,3}2[，,、؛;\s]{1,3}3[，,、؛;\s]{1,3}3[，,、؛;\s]{1,3}3/;

function extractN(t) {
  // 中文：第 2026 个 / 第 2026 個
  let m = t.match(/第\s*(\d+)\s*[个個]/);
  if (m) return parseInt(m[1], 10);
  // 英文：2026th term / term 2026
  m = t.match(/(\d+)(?:st|nd|rd|th)\s+term|term\s+(?:number\s*)?(\d+)/i);
  if (m) return parseInt(m[1] || m[2], 10);
  // 阿拉伯：الحد رقم 2026 / الحد 2026 / الحد الأول / الثالث / العاشر
  m = t.match(/الحد\s+رقم\s*(\d+)|الحد\s+(\d+)/);
  if (m) return parseInt(m[1] || m[2], 10);
  // 波斯：جمله 2026 / جمله شماره 2026 / جمله‌ی 2026 / جمله 2026ام
  m = t.match(/جمله[‌ ]?(?:شماره\s*)?(\d+)/);
  if (m) return parseInt(m[1], 10);
  // 日语：2026番目 / 第2026項
  m = t.match(/(\d+)\s*番目/) || t.match(/第\s*(\d+)\s*項/);
  if (m) return parseInt(m[1], 10);
  // 韩语：2026번째 / 제2026항 / 첫 번째(1) / 세 번째(3) / 열 번째(10)
  m = t.match(/(\d+)\s*번째/) || t.match(/제\s*(\d+)\s*항/);
  if (m) return parseInt(m[1], 10);
  // 法语：le 2026e terme
  m = t.match(/(\d+)(?:er|e)\s+terme/);
  if (m) return parseInt(m[1], 10);
  // 德语：das 2026. Glied / Glied 2026
  m = t.match(/(\d+)\s*[.\s]+\s*Glied|Glied\s+(\d+)/i);
  if (m) return parseInt(m[1] || m[2], 10);
  // 西语：término 2026 / 2026.º / primer(1) / tercer(3) / décimo(10)
  m = t.match(/término\s+(?:número\s*)?(\d+)|(\d+)(?:º|ª)\s+término/i);
  if (m) return parseInt(m[1] || m[2], 10);
  // 意语：termine 2026 / 2026°
  m = t.match(/termine\s+(?:numero\s*)?(\d+)|(\d+)(?:°|º)\s+termine/i);
  if (m) return parseInt(m[1] || m[2], 10);
  // —— 拼写序数词兜底（多语种）——
  const ordinalWords = [
    [1, /(?:first|premier|première|erst|primero|prima|primo|prima|الأول|الاول|اول|أول|첫\s*번째|첫째|第\s*一|1\s*番目|1\s*번째)/i],
    [2, /(?:second|deuxième|zweiter|segundo|secondo|الثاني|دوم|두\s*번째|둘째|第\s*二|2\s*番目|2\s*번째)/i],
    [3, /(?:third|troisième|dritter|tercer|terzo|الثالث|ثالث|سوم|세\s*번째|셋째|第\s*三|3\s*番目|3\s*번째)/i],
    [10, /(?:tenth|dixième|zehnter|décimo|decimo|العاشر|عاشر|دهم|열\s*번째|열째|第\s*十|10\s*番目|10\s*번째)/i],
  ];
  for (const [n, re] of ordinalWords) {
    if (re.test(t)) return n;
  }
  return null;
}

module.exports = {
  id: 'sequence',
  name: '分组数列',
  keywords: i18n.keywords('sequence'),

  match(problem /*, opts */) {
    const t = String(problem || '');
    let s = 0;
    if (RULE_RE.test(t)) s += 8;
    if (PREFIX_RE.test(t)) s += 6;
    if (/一串数|这串数|一串數|這串數/.test(t)) s += 4;
    if (/三角形数|三角形數|triangular|triangulaire|dreieckszahl|triángulo|triangolare|ثلاثي|مثلثی|삼각수|三角数/.test(t)) s += 4;
    if (/自然数\s*n|自然數\s*n|natural number|entier naturel|natürliche|número natural|numero naturale|طبيعي|طبیعی|자연수/.test(t)) s += 3;
    if (/第\s*\d+\s*[个個]|第\s*\d+\s*項/.test(t)) s += 3;
    if (/(\d+)(?:st|nd|rd|th)\s+term|term\s+(?:number\s*)?\d+/i.test(t)) s += 3;
    if (/الحد\s+رقم\s*\d+|جمله[‌ ]?(?:شماره\s*)?\d+|\d+\s*番目|\d+\s*번째|제\s*\d+\s*항|第\s*\d+\s*項/.test(t)) s += 3;
    if (/sequence|pattern|suite|folge|secuencia|sequenza|متتالية|دنباله|수열|数列/.test(t)) s += 2;
    return s;
  },

  extract(problem /*, opts */) {
    const t = String(problem || '');
    const hasRule = RULE_RE.test(t);
    const hasPrefix = PREFIX_RE.test(t);
    if (!hasRule && !hasPrefix) return null;

    const N = extractN(t);
    if (!N || N < 1 || !Number.isFinite(N)) return null;

    return { mode: 'grouped', N, confidence: hasRule ? 0.92 : 0.8, raw: t };
  },

  solve(params, opts = {}) {
    const lang = i18n.langOf(opts);
    const N = params.N;

    // m = ceil((sqrt(1+8N)-1)/2)，使 T(m-1) < N ≤ T(m)
    const m = Math.max(1, Math.ceil((Math.sqrt(1 + 8 * N) - 1) / 2 - 1e-9));
    const Tprev = (m - 1) * m / 2;
    const Tm = m * (m + 1) / 2;
    const offsetWithin = N - Tprev; // 第 m 组里的第几个

    const v = { N, m, m1: m - 1, Tprev, Tm, offsetWithin };
    const steps = [
      { narration: i18n.t('sequence', lang, 'narr_groups', v), visualHint: 'groups' },
      { narration: i18n.t('sequence', lang, 'narr_triangle', v), visualHint: 'triangle' },
      { narration: i18n.t('sequence', lang, 'narr_locate', v), visualHint: 'locate' },
      { narration: i18n.t('sequence', lang, 'narr_answer', v), visualHint: 'answer' },
    ];

    return { answer: `${m}`, steps, mode: 'grouped', N, m, Tprev, Tm, offsetWithin };
  },

  validate(params, solved /*, opts */) {
    if (!solved || !solved.answer) return { ok: false, reason: 'no_answer' };
    if (!solved.steps || solved.steps.length < 4) return { ok: false, reason: 'steps_too_short' };
    const { N, m, Tprev, Tm } = solved;
    if (!(Tprev < N && N <= Tm)) return { ok: false, reason: 'n_out_of_block' };
    if (Tprev !== (m - 1) * m / 2 || Tm !== m * (m + 1) / 2) return { ok: false, reason: 'triangular_mismatch' };
    if (parseInt(solved.answer, 10) !== m) return { ok: false, reason: 'answer_mismatch' };
    return { ok: true };
  },

  renderParams(solved, opts = {}) {
    const lang = i18n.langOf(opts);
    const { N, m, Tprev, Tm, offsetWithin } = solved;
    const v = { N, m, m1: m - 1, Tprev, Tm, offsetWithin };
    return {
      type: 'sequence',
      rtl: i18n.isRTL(lang),
      language: lang,
      scene: { N, m, Tprev, Tm, offsetWithin },
      beats: [
        { id: 'groups', duration: 5000, label: i18n.t('sequence', lang, 'beat_groups', v) },
        { id: 'triangle', duration: 5000, label: i18n.t('sequence', lang, 'beat_triangle', v) },
        { id: 'locate', duration: 5000, label: i18n.t('sequence', lang, 'beat_locate', v) },
        { id: 'answer', duration: 5000, label: i18n.t('sequence', lang, 'beat_answer', v) },
      ],
      answer: solved.answer,
      scenes: [{ type: 'equation', text: `T(k)=k(k+1)/2, T(${m - 1})=${Tprev}<${N}≤T(${m})=${Tm}` }],
    };
  },
};
