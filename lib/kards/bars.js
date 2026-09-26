// lib/kards/bars.js — 条形模型族知识卡（11 语种完整版）
// 承载：分数应用题（求部分量）、百分比、和倍问题（tape model）
// CPA：具象(真实物体排列) → 图示(等宽条形 tape model，分段着色) → 抽象(分数/比例算式)
'use strict';
const i18n = require('./i18n');

i18n.register('bars', {
  en: {
    _keywords: ['apple','candy','book','rope','bag','fraction','part of','eat','used up','percent','%','percentage','times as many','total','sum','altogether','how many'],
    narr_whole_frac: 'The whole bar stands for all {total}, treated as the unit "1".',
    narr_split_frac: 'Split equally into {den} parts; each part = {total} ÷ {den} = {per}.',
    narr_pick_frac: 'Take {num} of those parts: {total} ÷ {den} × {num} = {part}.',
    answer_part: '{part}',
    narr_whole_pct: 'The whole bar stands for all {total}, treated as 100%.',
    narr_split_pct: '{pct}% means splitting the whole into 100 parts and taking {pct} of them.',
    narr_pick_pct: 'Part = {total} × {pct}% = {total} × {frac} = {part}.',
    narr_unit1: 'Treat the smaller number as 1 part; the larger number is {k} parts.',
    narr_total_units: 'Together {k} + 1 = {k1} parts, matching the total {sum}.',
    narr_one_unit: '1 part = {sum} ÷ {k1} = {unitVal}, so the smaller number is {unitVal}.',
    beat_objects: 'Objects', beat_whole: 'Whole = 1 unit', beat_split: 'Split equally', beat_pick: 'Pick part', beat_eq: 'Equation',
    beat_bars: 'Bars', beat_count: '{k1} units', beat_one: '1 unit',
  },
  'zh-CN': {
    _keywords: ['苹果','糖果','书本','绳子','一袋','一根','分数','几分之几','吃掉','用去','读了','喝了','百分之','%','百分比','和倍','是乙的','几倍','一共','总和','共有'],
    narr_whole_frac: '整条条形代表全部 {total} 个，看作单位“1”。',
    narr_split_frac: '平均分成 {den} 等份，每份是 {total} ÷ {den} = {per}。',
    narr_pick_frac: '取其中的 {num} 份：{total} ÷ {den} × {num} = {part}。',
    answer_part: '{part}',
    narr_whole_pct: '整条条形代表全部 {total}，看作 100%。',
    narr_split_pct: '{pct}% 就是把整条平均分成 100 份取 {pct} 份。',
    narr_pick_pct: '部分 = {total} × {pct}% = {total} × {frac} = {part}。',
    narr_unit1: '把乙数看作 1 份，甲数就是 {k} 份。',
    narr_total_units: '一共 {k}＋1＝{k1} 份，对应总和 {sum}。',
    narr_one_unit: '1 份 = {sum} ÷ {k1} = {unitVal}，所以乙数是 {unitVal}。',
    beat_objects: '实物', beat_whole: '整体=单位1', beat_split: '平均分份', beat_pick: '取部分', beat_eq: '算式',
    beat_bars: '画条形', beat_count: '共{k1}份', beat_one: '求1份',
  },
  'zh-TW': {
    _keywords: ['蘋果','糖果','書本','繩子','一袋','一根','分數','幾分之幾','吃掉','用去','讀了','喝了','百分之','%','百分比','和倍','是乙的','幾倍','一共','總和','共有'],
    narr_whole_frac: '整條長條代表全部 {total} 個，看作單位「1」。',
    narr_split_frac: '平均分成 {den} 等份，每份是 {total} ÷ {den} = {per}。',
    narr_pick_frac: '取其中的 {num} 份：{total} ÷ {den} × {num} = {part}。',
    answer_part: '{part}',
    narr_whole_pct: '整條長條代表全部 {total}，看作 100%。',
    narr_split_pct: '{pct}% 就是把整條平均分成 100 份取 {pct} 份。',
    narr_pick_pct: '部分 = {total} × {pct}% = {total} × {frac} = {part}。',
    narr_unit1: '把乙數看作 1 份，甲數就是 {k} 份。',
    narr_total_units: '一共 {k}＋1＝{k1} 份，對應總和 {sum}。',
    narr_one_unit: '1 份 = {sum} ÷ {k1} = {unitVal}，所以乙數是 {unitVal}。',
    beat_objects: '實物', beat_whole: '整體=單位1', beat_split: '平均分份', beat_pick: '取部分', beat_eq: '算式',
    beat_bars: '畫長條', beat_count: '共{k1}份', beat_one: '求1份',
  },
  ja: {
    _keywords: ['りんご','キャンディ','本','ひも','袋','分数','〜分の〜','食べた','使った','読んだ','飲んだ','パーセント','%','割合','倍','合計','全部','いくつ'],
    narr_whole_frac: '全体の棒は {total} 個全体を表し、単位「1」と見なします。',
    narr_split_frac: '{den} 等分に分け、1つ分は {total} ÷ {den} = {per}。',
    narr_pick_frac: 'そのうち {num} 個分を取る：{total} ÷ {den} × {num} = {part}。',
    answer_part: '{part}',
    narr_whole_pct: '全体の棒は {total} 全体を表し、100% と見なします。',
    narr_split_pct: '{pct}% とは、全体を100等分して {pct} 個分を取ることです。',
    narr_pick_pct: '一部 = {total} × {pct}% = {total} × {frac} = {part}。',
    narr_unit1: '小さい方の数を1とすると、大きい方は {k} 個分です。',
    narr_total_units: '合計 {k}＋1＝{k1} 個分で、合計 {sum} に対応します。',
    narr_one_unit: '1個分 = {sum} ÷ {k1} = {unitVal}、よって小さい方の数は {unitVal}。',
    beat_objects: '実物', beat_whole: '全体=1', beat_split: '等分する', beat_pick: '部分を取る', beat_eq: '計算式',
    beat_bars: '棒を描く', beat_count: '計{k1}個', beat_one: '1個分を求める',
  },
  ko: {
    _keywords: ['사과','사탕','책','밧줄','봉지','분수','분의','먹다','쓰다','읽다','마시다','퍼센트','%','백분율','배','합계','모두','몇 개'],
    narr_whole_frac: '전체 막대는 {total}개 전체를 나타내며 단위 "1"로 봅니다.',
    narr_split_frac: '{den} 등분하면 한 칸은 {total} ÷ {den} = {per}입니다.',
    narr_pick_frac: '그중 {num}칸을 가집니다: {total} ÷ {den} × {num} = {part}.',
    answer_part: '{part}',
    narr_whole_pct: '전체 막대는 {total} 전체를 나타내며 100%로 봅니다.',
    narr_split_pct: '{pct}%는 전체를 100칸으로 나누어 {pct}칸을 가지는 것입니다.',
    narr_pick_pct: '부분 = {total} × {pct}% = {total} × {frac} = {part}.',
    narr_unit1: '작은 수를 1칸으로 하면 큰 수는 {k}칸입니다.',
    narr_total_units: '모두 {k}＋1＝{k1}칸이며 합계 {sum}에 해당합니다.',
    narr_one_unit: '1칸 = {sum} ÷ {k1} = {unitVal}, 따라서 작은 수는 {unitVal}.',
    beat_objects: '실물', beat_whole: '전체=1', beat_split: '균등 분할', beat_pick: '부분 선택', beat_eq: '계산식',
    beat_bars: '막대 그리기', beat_count: '총 {k1}칸', beat_one: '1칸 구하기',
  },
  fr: {
    _keywords: ['pomme','bonbon','livre','corde','sac','fraction','part','mangé','utilisé','lu','bu','pourcentage','%','fois','total','somme','ensemble','combien'],
    narr_whole_frac: 'La barre entière représente la totalité {total}, prise comme unité « 1 ».',
    narr_split_frac: 'Partager également en {den} parts ; chaque part = {total} ÷ {den} = {per}.',
    narr_pick_frac: 'Prenez {num} de ces parts : {total} ÷ {den} × {num} = {part}.',
    answer_part: '{part}',
    narr_whole_pct: 'La barre entière représente la totalité {total}, prise comme 100 %.',
    narr_split_pct: '{pct} % signifie partager la barre en 100 parts et en prendre {pct}.',
    narr_pick_pct: 'Part = {total} × {pct} % = {total} × {frac} = {part}.',
    narr_unit1: 'Prenez le plus petit nombre pour 1 part ; le plus grand fait {k} parts.',
    narr_total_units: 'Au total {k} + 1 = {k1} parts, ce qui correspond à la somme {sum}.',
    narr_one_unit: '1 part = {sum} ÷ {k1} = {unitVal}, donc le plus petit nombre est {unitVal}.',
    beat_objects: 'Objets', beat_whole: 'Total = 1 unité', beat_split: 'Partager également', beat_pick: 'Prendre une part', beat_eq: 'Équation',
    beat_bars: 'Barres', beat_count: '{k1} parts', beat_one: '1 part',
  },
  de: {
    _keywords: ['apfel','bonbon','buch','seil','tüte','bruch','teil','gegessen','benutzt','gelesen','getrunken','prozent','%','prozentsatz','mal','gesamt','summe','zusammen','wie viel'],
    narr_whole_frac: 'Der ganze Balken steht für alle {total} und wird als Einheit „1“ betrachtet.',
    narr_split_frac: 'Gleichmäßig in {den} Teile teilen; jeder Teil = {total} ÷ {den} = {per}.',
    narr_pick_frac: 'Nimm {num} dieser Teile: {total} ÷ {den} × {num} = {part}.',
    answer_part: '{part}',
    narr_whole_pct: 'Der ganze Balken steht für alle {total} und wird als 100 % betrachtet.',
    narr_split_pct: '{pct} % bedeutet: den Balken in 100 Teile teilen und {pct} nehmen.',
    narr_pick_pct: 'Teil = {total} × {pct} % = {total} × {frac} = {part}.',
    narr_unit1: 'Die kleinere Zahl ist 1 Teil; die größere Zahl ist {k} Teile.',
    narr_total_units: 'Zusammen {k} + 1 = {k1} Teile, passend zur Summe {sum}.',
    narr_one_unit: '1 Teil = {sum} ÷ {k1} = {unitVal}, also ist die kleinere Zahl {unitVal}.',
    beat_objects: 'Objekte', beat_whole: 'Ganzes = 1 Einheit', beat_split: 'Gleichmäßig teilen', beat_pick: 'Teil wählen', beat_eq: 'Gleichung',
    beat_bars: 'Balken', beat_count: '{k1} Einheiten', beat_one: '1 Einheit',
  },
  es: {
    _keywords: ['manzana','caramelo','libro','cuerda','bolsa','fracción','parte','comido','usado','leído','bebido','porcentaje','%','veces','total','suma','entre todos','cuántos'],
    narr_whole_frac: 'La barra entera representa el total {total}, tomado como la unidad «1».',
    narr_split_frac: 'Dividir en partes iguales entre {den}; cada parte = {total} ÷ {den} = {per}.',
    narr_pick_frac: 'Tomar {num} de esas partes: {total} ÷ {den} × {num} = {part}.',
    answer_part: '{part}',
    narr_whole_pct: 'La barra entera representa el total {total}, tomado como el 100%.',
    narr_split_pct: '{pct}% significa dividir la barra en 100 partes y tomar {pct}.',
    narr_pick_pct: 'Parte = {total} × {pct}% = {total} × {frac} = {part}.',
    narr_unit1: 'Toma el número menor como 1 parte; el mayor es {k} partes.',
    narr_total_units: 'En total {k} + 1 = {k1} partes, que corresponden a la suma {sum}.',
    narr_one_unit: '1 parte = {sum} ÷ {k1} = {unitVal}, así que el número menor es {unitVal}.',
    beat_objects: 'Objetos', beat_whole: 'Total = 1 unidad', beat_split: 'Dividir a partes iguales', beat_pick: 'Tomar parte', beat_eq: 'Ecuación',
    beat_bars: 'Barras', beat_count: '{k1} unidades', beat_one: '1 unidad',
  },
  it: {
    _keywords: ['mela','caramella','libro','corda','sacchetto','frazione','parte','mangiato','usato','letto','bevuto','percento','%','percentuale','volte','totale','somma','insieme','quanti'],
    narr_whole_frac: 'La barra intera rappresenta il totale {total}, preso come unità «1».',
    narr_split_frac: 'Dividere in parti uguali in {den}; ogni parte = {total} ÷ {den} = {per}.',
    narr_pick_frac: 'Prendi {num} di queste parti: {total} ÷ {den} × {num} = {part}.',
    answer_part: '{part}',
    narr_whole_pct: 'La barra intera rappresenta il totale {total}, preso come 100%.',
    narr_split_pct: '{pct}% significa dividere la barra in 100 parti e prenderne {pct}.',
    narr_pick_pct: 'Parte = {total} × {pct}% = {total} × {frac} = {part}.',
    narr_unit1: 'Prendi il numero minore come 1 parte; il maggiore è {k} parti.',
    narr_total_units: 'In tutto {k} + 1 = {k1} parti, che corrispondono alla somma {sum}.',
    narr_one_unit: '1 parte = {sum} ÷ {k1} = {unitVal}, quindi il numero minore è {unitVal}.',
    beat_objects: 'Oggetti', beat_whole: 'Totale = 1 unità', beat_split: 'Dividere in parti uguali', beat_pick: 'Prendere parte', beat_eq: 'Equazione',
    beat_bars: 'Barre', beat_count: '{k1} unità', beat_one: '1 unità',
  },
  ar: {
    _keywords: ['تفاحة','حلوى','كتاب','حبل','كيس','كسر','جزء','أكل','استعمل','قرأ','شرب','نسبة مئوية','%','مائة','ضعف','المجموع','الكلي','معاً','كم'],
    narr_whole_frac: 'الشريط الكامل يمثل الكلّ {total}، ونعتبره الوحدة «1».',
    narr_split_frac: 'نقسمه بالتساوي إلى {den} أجزاء؛ كل جزء = {total} ÷ {den} = {per}.',
    narr_pick_frac: 'نأخذ {num} من هذه الأجزاء: {total} ÷ {den} × {num} = {part}.',
    answer_part: '{part}',
    narr_whole_pct: 'الشريط الكامل يمثل الكلّ {total}، ونعتبره 100%.',
    narr_split_pct: '{pct}% تعني تقسيم الكلّ إلى 100 جزء وأخذ {pct} منها.',
    narr_pick_pct: 'الجزء = {total} × {pct}% = {total} × {frac} = {part}.',
    narr_unit1: 'نعتبر العدد الأصغر جزءاً واحداً؛ فيكون العدد الأكبر {k} أجزاء.',
    narr_total_units: 'المجموع {k} + 1 = {k1} أجزاء، تقابل المجموع الكليّ {sum}.',
    narr_one_unit: 'الجزء الواحد = {sum} ÷ {k1} = {unitVal}، إذن العدد الأصغر هو {unitVal}.',
    beat_objects: 'أشياء', beat_whole: 'الكل = 1', beat_split: 'تقسيم بالتساوي', beat_pick: 'أخذ الجزء', beat_eq: 'المعادلة',
    beat_bars: 'أشرطة', beat_count: '{k1} أجزاء', beat_one: 'جزء واحد',
  },
  fa: {
    _keywords: ['سیب','آبنبات','کتاب','طناب','کیسه','کسر','بخش','خورد','مصرف کرد','خواند','نوشید','درصد','%','چند برابر','مجموع','کل','با هم','چند تا'],
    narr_whole_frac: 'کل نوار، همهٔ {total} را نشان می‌دهد و واحد «1» در نظر گرفته می‌شود.',
    narr_split_frac: 'به {den} قسمت مساوی تقسیم می‌شود؛ هر قسمت = {total} ÷ {den} = {per}.',
    narr_pick_frac: '{num} قسمت از آن را برمی‌داریم: {total} ÷ {den} × {num} = {part}.',
    answer_part: '{part}',
    narr_whole_pct: 'کل نوار، همهٔ {total} را نشان می‌دهد و ۱۰۰٪ در نظر گرفته می‌شود.',
    narr_split_pct: '{pct}٪ یعنی کل را به ۱۰۰ قسمت تقسیم کنیم و {pct} قسمت برداریم.',
    narr_pick_pct: 'جزء = {total} × {pct}٪ = {total} × {frac} = {part}.',
    narr_unit1: 'عدد کوچک‌تر را 1 قسمت می‌گیریم؛ عدد بزرگ‌تر {k} قسمت است.',
    narr_total_units: 'در مجموع {k} + 1 = {k1} قسمت داریم که با جمع {sum} برابر است.',
    narr_one_unit: '1 قسمت = {sum} ÷ {k1} = {unitVal}، پس عدد کوچک‌تر {unitVal} است.',
    beat_objects: 'اشیاء', beat_whole: 'کل = 1 واحد', beat_split: 'تقسیم مساوی', beat_pick: 'برداشتن جزء', beat_eq: 'معادله',
    beat_bars: 'نوارها', beat_count: '{k1} قسمت', beat_one: '1 قسمت',
  },
});

module.exports = {
  id: 'bars',
  name: '条形模型',
  keywords: i18n.keywords('bars'),

  match(problem, opts = {}) {
    const t = String(problem || '').toLowerCase();
    let score = 0;
    if (/(几分之几|分之|分数|分數|fraction|كسر|کسر|분수|bruch|fracción|frazione)/.test(t)) score += 5;
    if (/\d+\s*\/\s*\d+/.test(t) && /(总共|一共|total|mang|gegess|comid|mangiat|أكل|خورد|吃|用|読|読ん|read|完了|完成|pourcentage|%|percent|合計|합)/.test(t)) score += 4;
    if (/(百分之|%|percent|pourcentage|prozent|porcentaje|percento|درصد|نسبة مئوية|パーセント|퍼센트)/.test(t)) score += 5;
    if (/(倍|times as|倍数|ضِعف|برابر|배|fois|mal|veces|volte)/.test(t)) score += 4;
    if (/(吃掉|用去|读了|喝了|完成了|吃了|用了|mangé|gegessen|comido|mangiato|أكل|خورد|切り取)/.test(t)) score += 3;
    if (/(一共|总和|和是|共|total|sum|somme|ensemble|gesamt|suma|somma|المجموع|مجموع|合計|합계)/.test(t)) score += 2;
    // 分数 / 部分-整体（均分、吃了/用了、还剩几分之几、百分）— 强意图，压过同族泛词
    const FRAC_STRONG = /fraction|equal (slices|parts|pieces)|what fraction|of the (pizza|cake|pie)|分之|分數|平均分|几分之几|等分|분의|몇 분의|parts? égales|quelle fraction|gleiche stücke|welcher anteil|partes iguales|qué fracción|fette uguali|quale frazione|أجزاء متساوية|ما الكسر|قسمت مساوی|چه کسری|percent|pourcent|prozent|porcent|porcentaje|percento|درصد|نسبة مئوية|パーセント|%/;
    if (FRAC_STRONG.test(t)) score += 12;
    return score;
  },

  extract(problem, opts = {}) {
    const t = String(problem || '');
    const tl = t.toLowerCase();

    // —— 百分比模式 ——
    const pctM = t.match(/(\d+(?:\.\d+)?)\s*%/) || t.match(/百分之\s*(\d+(?:\.\d+)?)/) || t.match(/(\d+(?:\.\d+)?)\s*%?\s*(?:percent|pourcent|prozent|porciento|per cento|درصد|بالمئة)/i);
    if (pctM && !/分之/.test(t)) {
      const nums = (t.match(/\d+(?:\.\d+)?/g) || []).map(Number);
      const pct = parseFloat(pctM[1]);
      const totalCandidates = nums.filter(n => Math.abs(n - pct) > 1e-9);
      const total = totalCandidates[0] ?? null;
      if (total == null || total <= 0) return null;
      let object = '🍎';
      if (/(书|book|页|page|livre|buch|libro|libro|كتاب|کتاب|本|책)/.test(tl)) object = '📖';
      else if (/(绳|rope|线|string|corde|seil|cuerda|corda|حبل|طناب|ひも|밧줄)/.test(tl)) object = '📏';
      else if (/(糖|candy|bonbon|süßigkeit|caramelo|caramella|حلوى|آبنبات|キャンディ|사탕)/.test(tl)) object = '🍬';
      return { mode: 'percent', total, pct, object, confidence: 0.88, unit: '', raw: t };
    }

    // —— 分数模式：总量 + a/b ——
    const frac = t.match(/(\d+)\s*\/\s*(\d+)/);
    const fracCN = t.match(/(\d+)\s*分之\s*(\d+)/);
    if (frac || fracCN) {
      let num, den;
      if (frac) [, num, den] = frac; else [, den, num] = fracCN; // a分之b = b/a
      num = +num; den = +den;
      if (den === 0) return null;
      const nums = (t.match(/\d+(?:\.\d+)?/g) || []).map(Number);
      const totalCandidates = nums.filter(n => n !== num && n !== den);
      const total = totalCandidates[0] ?? null;
      if (total == null || total <= 0) return null;
      let object = '🍎';
      if (/(糖|candy|bonbon|caramelo|حلوى|آبنبات)/.test(tl)) object = '🍬';
      else if (/(书|book|page|livre|buch|libro|كتاب|کتاب)/.test(tl)) object = '📖';
      else if (/(绳|rope|string|corde|cuerda|حبل|طناب|米)/.test(tl)) object = '📏';
      else if (/(饼干|cookie|cookie|biscuit|keks|galleta|biscotto|بسكويت|کلوچه)/.test(tl)) object = '🍪';
      return { mode: 'fraction', total, num, den, object, confidence: 0.88, unit: '', raw: t };
    }

    // —— 和倍模式：两数和，甲是乙的 k 倍，求乙 ——
    const sumM = t.match(/(?:和是|一共|共有|总和|和为|总共|共有)\s*(\d+(?:\.\d+)?)/) ||
                 t.match(/total(?:\s+is)?\s*(\d+(?:\.\d+)?)/i) ||
                 t.match(/(?:summe|somme|suma|somma|مجموع|합|合計|和計)[^.\d]{0,30}?(\d+(?:\.\d+)?)/i);
    const timesM = t.match(/是\s*([^，。,的]{1,8}?)\s*的\s*(\d+(?:\.\d+)?)\s*倍/) ||
                   t.match(/(\d+(?:\.\d+)?)\s*times\s*as\s*(?:many|much)/i) ||
                   t.match(/(\d+(?:\.\d+)?)\s*(?:倍|배|fois|veces|volte|أضعاف|برابر|倍)/) ||
                   t.match(/(?:dreimal|trois\s+fois|tres\s+veces|tre\s+volte|3\s+أضعاف|3\s+배|3\s+倍)\s*(?:so\s+groß|plus\s+grand|mayor|maggiore|أكبر|더\s+크|大きい)?/i);
    if (sumM && timesM) {
      const sum = parseFloat(sumM[1]);
      let k = parseFloat(timesM[2] != null ? timesM[2] : timesM[1]);
      if (!k || k <= 0) k = parseFloat(timesM[1]);
      if (!(k > 0)) return null;
      return { mode: 'multiple', sum, k, confidence: 0.85, unit: '', raw: t };
    }

    return null;
  },

  solve(params, opts = {}) {
    const lang = i18n.langOf(opts);
    const T = (key, vars) => i18n.t('bars', lang, key, vars);
    const steps = [];
    let answer, part = null, unitVal = null;

    if (params.mode === 'fraction') {
      const { total, num, den } = params;
      part = total * num / den;
      steps.push({ narration: T('narr_whole_frac', { total }), visualHint: 'whole_bar' });
      steps.push({ narration: T('narr_split_frac', { den, total, per: total / den }), visualHint: 'split' });
      steps.push({ narration: T('narr_pick_frac', { total, den, num, part }), visualHint: 'highlight' });
      answer = T('answer_part', { part });
      return { answer, steps, mode: 'fraction', total, num, den, part, object: params.object };
    }

    if (params.mode === 'percent') {
      const { total, pct } = params;
      part = total * pct / 100;
      steps.push({ narration: T('narr_whole_pct', { total }), visualHint: 'whole_bar' });
      steps.push({ narration: T('narr_split_pct', { pct }), visualHint: 'split' });
      steps.push({ narration: T('narr_pick_pct', { total, pct, frac: pct / 100, part }), visualHint: 'highlight' });
      answer = T('answer_part', { part });
      return { answer, steps, mode: 'percent', total, pct, part, object: params.object };
    }

    // multiple（和倍）
    const { sum, k } = params;
    unitVal = sum / (k + 1); // 乙=1份，甲=k份，共 k+1 份
    steps.push({ narration: T('narr_unit1', { k }), visualHint: 'two_bars' });
    steps.push({ narration: T('narr_total_units', { k, k1: k + 1, sum }), visualHint: 'total_units' });
    steps.push({ narration: T('narr_one_unit', { sum, k1: k + 1, unitVal }), visualHint: 'highlight' });
    answer = T('answer_part', { part: unitVal });
    return { answer, steps, mode: 'multiple', sum, k, unitVal };
  },

  validate(params, solved, opts = {}) {
    if (!solved || !solved.answer) return { ok: false, reason: 'no_answer' };
    if (!solved.steps || solved.steps.length < 3) return { ok: false, reason: 'steps_too_short' };
    if (solved.mode === 'fraction') {
      const expect = params.total * params.num / params.den;
      if (Math.abs(expect - solved.part) > 1e-9) return { ok: false, reason: 'frac_mismatch' };
    } else if (solved.mode === 'percent') {
      const expect = params.total * params.pct / 100;
      if (Math.abs(expect - solved.part) > 1e-9) return { ok: false, reason: 'pct_mismatch' };
    } else if (solved.mode === 'multiple') {
      const expect = params.sum / (params.k + 1);
      if (Math.abs(expect - solved.unitVal) > 1e-9) return { ok: false, reason: 'mult_mismatch' };
    }
    return { ok: true };
  },

  renderParams(solved, opts = {}) {
    const lang = i18n.langOf(opts);
    const T = (key, vars) => i18n.t('bars', lang, key, vars);

    if (solved.mode === 'fraction') {
      const { total, num, den, part, object } = solved;
      const eqText = `${total} ÷ ${den} × ${num} = ${part}`;
      return {
        type: 'bars',
        rtl: i18n.isRTL(lang),
        language: lang,
        scene: { mode: 'fraction', total, num, den, part, object: object || '🍎' },
        beats: [
          { id: 'objects', duration: 4000, label: T('beat_objects') },
          { id: 'whole', duration: 3500, label: T('beat_whole') },
          { id: 'split', duration: 4000, label: T('beat_split') },
          { id: 'pick', duration: 3500, label: T('beat_pick') },
          { id: 'eq', duration: 3500, label: T('beat_eq') },
        ],
        answer: solved.answer,
        scenes: [
          { type: 'tape', total, num, den, part },
          { type: 'equation', text: eqText },
        ],
      };
    }

    if (solved.mode === 'percent') {
      const { total, pct, part, object } = solved;
      const eqText = `${total} × ${pct}% = ${part}`;
      return {
        type: 'bars',
        rtl: i18n.isRTL(lang),
        language: lang,
        scene: { mode: 'percent', total, pct, part, object: object || '🍎' },
        beats: [
          { id: 'objects', duration: 4000, label: T('beat_objects') },
          { id: 'whole', duration: 3500, label: T('beat_whole') },
          { id: 'pct', duration: 4500, label: `${pct}%` },
          { id: 'eq', duration: 3500, label: T('beat_eq') },
        ],
        answer: solved.answer,
        scenes: [
          { type: 'tape', total, pct, part },
          { type: 'equation', text: eqText },
        ],
      };
    }

    // multiple
    const { sum, k, unitVal } = solved;
    const eqText = `${sum} ÷ (${k} + 1) = ${unitVal}`;
    return {
      type: 'bars',
      rtl: i18n.isRTL(lang),
      language: lang,
      scene: { mode: 'multiple', sum, k, unitVal },
      beats: [
        { id: 'bars', duration: 4000, label: T('beat_bars') },
        { id: 'count', duration: 4500, label: T('beat_count', { k1: k + 1 }) },
        { id: 'one', duration: 4000, label: T('beat_one') },
        { id: 'eq', duration: 3500, label: T('beat_eq') },
      ],
      answer: solved.answer,
      scenes: [
        { type: 'tapeMultiple', sum, k, unitVal },
        { type: 'equation', text: eqText },
      ],
    };
  },
};
