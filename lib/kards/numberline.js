// lib/kards/numberline.js — 数轴族知识卡（11 语种完整版）
// 承载：整数加减（正负数方向跳跃）、分数比较
// CPA：具象(小动物/小球在数轴上跳) → 图示(numberLine 刻度+跳跃弧线) → 抽象(数字算式)
'use strict';
const i18n = require('./i18n');

i18n.register('numberline', {
  en: {
    _keywords: ['number line','jump','hop','right','left','spaces','steps','fraction','compare','greater','less','which is bigger','starts at','starting at','negative','origin'],
    narr_start: 'Start at {start} on the number line.',
    narr_jump_right: 'Jump {jump} spaces to the right (positive direction): {start} + {jump}.',
    narr_jump_left: 'Jump {jump} spaces to the left (negative direction): {start} − {jump}.',
    narr_land: 'Land on {result}.',
    answer_jump: '{result}',
    narr_frac_locate: 'Place the two fractions {a} and {b} on the number line and compare their positions.',
    narr_frac_cross: 'Cross-multiply: {n1} × {d2} = {n1d2}, {n2} × {d1} = {n2d1}.',
    narr_frac_right: '{n1d2} > {n2d1}, so {a} is to the right of {b}; {a} is larger.',
    narr_frac_left: '{n1d2} < {n2d1}, so {b} is to the right of {a}; {b} is larger.',
    narr_frac_eq: 'They are equal; the two fractions are the same size.',
    answer_larger_a: '{a} is larger',
    answer_larger_b: '{b} is larger',
    answer_equal: 'They are equal',
    beat_start: 'Start', beat_jump: 'Jump', beat_land: 'Land', beat_eq: 'Equation',
    beat_locate: 'Locate', beat_cmp: 'Compare',
  },
  'zh-CN': {
    _keywords: ['数轴','向右跳','向左跳','向右走','向左走','格','起点','正负数','负数','分数','比较','哪个大','几分之几','大于','小于','出发','跳'],
    narr_start: '从数轴上的 {start} 出发。',
    narr_jump_right: '向右（正方向）跳 {jump} 格，做加法：{start} + {jump}。',
    narr_jump_left: '向左（负方向）跳 {jump} 格，做减法：{start} − {jump}。',
    narr_land: '落地后在 {result}。',
    answer_jump: '{result}',
    narr_frac_locate: '把两个分数 {a} 和 {b} 放到数轴上比位置。',
    narr_frac_cross: '通分交叉相乘：{n1}×{d2}={n1d2}，{n2}×{d1}={n2d1}。',
    narr_frac_right: '{n1d2} > {n2d1}，所以 {a} 在 {b} 的右边，{a} 更大。',
    narr_frac_left: '{n1d2} < {n2d1}，所以 {b} 在 {a} 的右边，{b} 更大。',
    narr_frac_eq: '两边相等，两个分数一样大。',
    answer_larger_a: '{a} 更大',
    answer_larger_b: '{b} 更大',
    answer_equal: '一样大',
    beat_start: '出发点', beat_jump: '跳跃', beat_land: '落点', beat_eq: '算式',
    beat_locate: '定位', beat_cmp: '比较',
  },
  'zh-TW': {
    _keywords: ['數軸','向右跳','向左跳','向右走','向左走','格','起點','正負數','負數','分數','比較','哪個大','幾分之幾','大於','小於','出發','跳'],
    narr_start: '從數軸上的 {start} 出發。',
    narr_jump_right: '向右（正方向）跳 {jump} 格，做加法：{start} + {jump}。',
    narr_jump_left: '向左（負方向）跳 {jump} 格，做減法：{start} − {jump}。',
    narr_land: '落地後在 {result}。',
    answer_jump: '{result}',
    narr_frac_locate: '把兩個分數 {a} 和 {b} 放到數軸上比位置。',
    narr_frac_cross: '通分交叉相乘：{n1}×{d2}={n1d2}，{n2}×{d1}={n2d1}。',
    narr_frac_right: '{n1d2} > {n2d1}，所以 {a} 在 {b} 的右邊，{a} 更大。',
    narr_frac_left: '{n1d2} < {n2d1}，所以 {b} 在 {a} 的右邊，{b} 更大。',
    narr_frac_eq: '兩邊相等，兩個分數一樣大。',
    answer_larger_a: '{a} 更大',
    answer_larger_b: '{b} 更大',
    answer_equal: '一樣大',
    beat_start: '出發點', beat_jump: '跳躍', beat_land: '落點', beat_eq: '算式',
    beat_locate: '定位', beat_cmp: '比較',
  },
  ja: {
    _keywords: ['数直線','跳ぶ','跳ねる','右','左','目盛り','原点','正の数','負の数','分数','比較','どちらが大きい','大きい','小さい','出発'],
    narr_start: '数直線上の {start} から始めます。',
    narr_jump_right: '右（正の方向）へ {jump} 目盛りジャンプ、足し算：{start} + {jump}。',
    narr_jump_left: '左（負の方向）へ {jump} 目盛りジャンプ、引き算：{start} − {jump}。',
    narr_land: '着地したのは {result}。',
    answer_jump: '{result}',
    narr_frac_locate: '二つの分数 {a} と {b} を数直線に置いて位置を比べます。',
    narr_frac_cross: 'たすきがけ：{n1}×{d2}={n1d2}、{n2}×{d1}={n2d1}。',
    narr_frac_right: '{n1d2} > {n2d1} なので、{a} は {b} より右、{a} の方が大きい。',
    narr_frac_left: '{n1d2} < {n2d1} なので、{b} は {a} より右、{b} の方が大きい。',
    narr_frac_eq: '両辺等しく、二つの分数は同じ大きさ。',
    answer_larger_a: '{a} の方が大きい',
    answer_larger_b: '{b} の方が大きい',
    answer_equal: '同じ大きさ',
    beat_start: '出発点', beat_jump: 'ジャンプ', beat_land: '着地', beat_eq: '計算式',
    beat_locate: '位置へ', beat_cmp: '比較',
  },
  ko: {
    _keywords: ['수직선','뛰다','점프','오른쪽','왼쪽','칸','원점','양수','음수','분수','비교','어느 것이 더 큰가','크다','작다','출발'],
    narr_start: '수직선의 {start}에서 시작합니다.',
    narr_jump_right: '오른쪽(양의 방향)으로 {jump}칸 점프, 덧셈: {start} + {jump}.',
    narr_jump_left: '왼쪽(음의 방향)으로 {jump}칸 점프, 뺄셈: {start} − {jump}.',
    narr_land: '내린 곳은 {result}.',
    answer_jump: '{result}',
    narr_frac_locate: '두 분수 {a}와 {b}를 수직선에 놓고 위치를 비교합니다.',
    narr_frac_cross: '교차 곱셈: {n1}×{d2}={n1d2}, {n2}×{d1}={n2d1}.',
    narr_frac_right: '{n1d2} > {n2d1}이므로 {a}가 {b} 오른쪽에 있고 {a}가 더 큽니다.',
    narr_frac_left: '{n1d2} < {n2d1}이므로 {b}가 {a} 오른쪽에 있고 {b}가 더 큽니다.',
    narr_frac_eq: '두 값이 같으므로 두 분수의 크기가 같습니다.',
    answer_larger_a: '{a}가 더 큼',
    answer_larger_b: '{b}가 더 큼',
    answer_equal: '같음',
    beat_start: '출발점', beat_jump: '점프', beat_land: '도착점', beat_eq: '계산식',
    beat_locate: '위치 찾기', beat_cmp: '비교',
  },
  fr: {
    _keywords: ['droite numérique','sauter','saut','droite','gauche','cases','unités','origine','nombres positifs','nombres négatifs','fraction','comparer','lequel est plus grand','plus grand','plus petit','partir de'],
    narr_start: 'On part de {start} sur la droite numérique.',
    narr_jump_right: 'Sauter de {jump} cases vers la droite (sens positif) : {start} + {jump}.',
    narr_jump_left: 'Sauter de {jump} cases vers la gauche (sens négatif) : {start} − {jump}.',
    narr_land: 'On atterrit sur {result}.',
    answer_jump: '{result}',
    narr_frac_locate: 'Placer les deux fractions {a} et {b} sur la droite numérique et comparer leurs positions.',
    narr_frac_cross: 'Produit en croix : {n1} × {d2} = {n1d2}, {n2} × {d1} = {n2d1}.',
    narr_frac_right: '{n1d2} > {n2d1}, donc {a} est à droite de {b} ; {a} est plus grand.',
    narr_frac_left: '{n1d2} < {n2d1}, donc {b} est à droite de {a} ; {b} est plus grand.',
    narr_frac_eq: 'Ils sont égaux ; les deux fractions ont la même taille.',
    answer_larger_a: '{a} est plus grand',
    answer_larger_b: '{b} est plus grand',
    answer_equal: 'Ils sont égaux',
    beat_start: 'Départ', beat_jump: 'Saut', beat_land: 'Arrivée', beat_eq: 'Équation',
    beat_locate: 'Placer', beat_cmp: 'Comparer',
  },
  de: {
    _keywords: ['zahlenstrahl','springen','sprung','rechts','links','felder','einheiten','ursprung','positive zahlen','negative zahlen','bruch','vergleichen','was ist größer','größer','kleiner','starten bei'],
    narr_start: 'Starte bei {start} auf dem Zahlenstrahl.',
    narr_jump_right: 'Springe {jump} Felder nach rechts (positive Richtung): {start} + {jump}.',
    narr_jump_left: 'Springe {jump} Felder nach links (negative Richtung): {start} − {jump}.',
    narr_land: 'Landung bei {result}.',
    answer_jump: '{result}',
    narr_frac_locate: 'Die beiden Brüche {a} und {b} auf den Zahlenstrahl legen und vergleichen.',
    narr_frac_cross: 'Kreuzprodukt: {n1} × {d2} = {n1d2}, {n2} × {d1} = {n2d1}.',
    narr_frac_right: '{n1d2} > {n2d1}, also liegt {a} rechts von {b}; {a} ist größer.',
    narr_frac_left: '{n1d2} < {n2d1}, also liegt {b} rechts von {a}; {b} ist größer.',
    narr_frac_eq: 'Sie sind gleich; die beiden Brüche sind gleich groß.',
    answer_larger_a: '{a} ist größer',
    answer_larger_b: '{b} ist größer',
    answer_equal: 'Sie sind gleich',
    beat_start: 'Start', beat_jump: 'Sprung', beat_land: 'Landung', beat_eq: 'Gleichung',
    beat_locate: 'Orten', beat_cmp: 'Vergleichen',
  },
  es: {
    _keywords: ['recta numérica','saltar','salto','derecha','izquierda','casillas','unidades','origen','números positivos','números negativos','fracción','comparar','cuál es mayor','mayor','menor','partir de'],
    narr_start: 'Comenzar en {start} sobre la recta numérica.',
    narr_jump_right: 'Saltar {jump} casillas a la derecha (sentido positivo): {start} + {jump}.',
    narr_jump_left: 'Saltar {jump} casillas a la izquierda (sentido negativo): {start} − {jump}.',
    narr_land: 'Se aterriza en {result}.',
    answer_jump: '{result}',
    narr_frac_locate: 'Colocar las dos fracciones {a} y {b} en la recta numérica y comparar sus posiciones.',
    narr_frac_cross: 'Multiplicación cruzada: {n1} × {d2} = {n1d2}, {n2} × {d1} = {n2d1}.',
    narr_frac_right: '{n1d2} > {n2d1}, así que {a} está a la derecha de {b}; {a} es mayor.',
    narr_frac_left: '{n1d2} < {n2d1}, así que {b} está a la derecha de {a}; {b} es mayor.',
    narr_frac_eq: 'Son iguales; las dos fracciones tienen el mismo tamaño.',
    answer_larger_a: '{a} es mayor',
    answer_larger_b: '{b} es mayor',
    answer_equal: 'Son iguales',
    beat_start: 'Inicio', beat_jump: 'Salto', beat_land: 'Llegada', beat_eq: 'Ecuación',
    beat_locate: 'Situar', beat_cmp: 'Comparar',
  },
  it: {
    _keywords: ['retta numerica','saltare','salto','destra','sinistra','caselle','unità','origine','numeri positivi','numeri negativi','frazione','confrontare','quale è maggiore','maggiore','minore','partire da'],
    narr_start: 'Si parte da {start} sulla retta numerica.',
    narr_jump_right: 'Salta di {jump} caselle verso destra (direzione positiva): {start} + {jump}.',
    narr_jump_left: 'Salta di {jump} caselle verso sinistra (direzione negativa): {start} − {jump}.',
    narr_land: 'Si atterra su {result}.',
    answer_jump: '{result}',
    narr_frac_locate: 'Posiziona le due frazioni {a} e {b} sulla retta numerica e confrontane le posizioni.',
    narr_frac_cross: 'Prodotto incrociato: {n1} × {d2} = {n1d2}, {n2} × {d1} = {n2d1}.',
    narr_frac_right: '{n1d2} > {n2d1}, quindi {a} è a destra di {b}; {a} è maggiore.',
    narr_frac_left: '{n1d2} < {n2d1}, quindi {b} è a destra di {a}; {b} è maggiore.',
    narr_frac_eq: 'Sono uguali; le due frazioni hanno la stessa grandezza.',
    answer_larger_a: '{a} è maggiore',
    answer_larger_b: '{b} è maggiore',
    answer_equal: 'Sono uguali',
    beat_start: 'Partenza', beat_jump: 'Salto', beat_land: 'Approdo', beat_eq: 'Equazione',
    beat_locate: 'Posizionare', beat_cmp: 'Confrontare',
  },
  ar: {
    _keywords: ['خط الأعداد','يقفز','قفزة','يمين','يسار','خانات','وحدات','نقطة الأصل','أعداد موجبة','أعداد سالبة','كسر','مقارنة','أيهما أكبر','أكبر','أصغر','ينطلق من'],
    narr_start: 'نبدأ من {start} على خط الأعداد.',
    narr_jump_right: 'اقفز {jump} خانات نحو اليمين (الاتجاه الموجب): {start} + {jump}.',
    narr_jump_left: 'اقفز {jump} خانات نحو اليسار (الاتجاه السالب): {start} − {jump}.',
    narr_land: 'تستقر عند {result}.',
    answer_jump: '{result}',
    narr_frac_locate: 'ضع الكسرين {a} و{b} على خط الأعداد وقارن بين موقعهما.',
    narr_frac_cross: 'الضرب التبادلي: {n1} × {d2} = {n1d2}، {n2} × {d1} = {n2d1}.',
    narr_frac_right: '{n1d2} > {n2d1}، إذًا يقع {a} يمين {b}؛ و{a} أكبر.',
    narr_frac_left: '{n1d2} < {n2d1}، إذًا يقع {b} يمين {a}؛ و{b} أكبر.',
    narr_frac_eq: 'المتساويان؛ الكسران متساويان في القيمة.',
    answer_larger_a: '{a} أكبر',
    answer_larger_b: '{b} أكبر',
    answer_equal: 'متساويان',
    beat_start: 'نقطة البداية', beat_jump: 'قفزة', beat_land: 'نقطة الاستقرار', beat_eq: 'المعادلة',
    beat_locate: 'التحديد', beat_cmp: 'المقارنة',
  },
  fa: {
    _keywords: ['محور اعداد','پرش','جهش','راست','چپ','خانه','واحد','مبدأ','اعداد مثبت','اعداد منفی','کسر','مقایسه','کدام بزرگتر است','بزرگتر','کوچکتر','شروع از'],
    narr_start: 'از نقطهٔ {start} روی محور اعداد شروع می‌کنیم.',
    narr_jump_right: '{jump} خانه به سمت راست (جهت مثبت) بپر: {start} + {jump}.',
    narr_jump_left: '{jump} خانه به سمت چپ (جهت منفی) بپر: {start} − {jump}.',
    narr_land: 'روی {result} فرود می‌آیی.',
    answer_jump: '{result}',
    narr_frac_locate: 'دو کسر {a} و {b} را روی محور اعداد بگذار و موقعیتشان را مقایسه کن.',
    narr_frac_cross: 'ضرب ضربدری: {n1} × {d2} = {n1d2}، {n2} × {d1} = {n2d1}.',
    narr_frac_right: '{n1d2} > {n2d1}، پس {a} سمت راست {b} است و {a} بزرگتر است.',
    narr_frac_left: '{n1d2} < {n2d1}، پس {b} سمت راست {a} است و {b} بزرگتر است.',
    narr_frac_eq: 'دو کسر برابرند و اندازهٔ یکسانی دارند.',
    answer_larger_a: '{a} بزرگتر است',
    answer_larger_b: '{b} بزرگتر است',
    answer_equal: 'برابرند',
    beat_start: 'نقطهٔ شروع', beat_jump: 'پرش', beat_land: 'نقطهٔ فرود', beat_eq: 'معادله',
    beat_locate: 'مکان‌یابی', beat_cmp: 'مقایسه',
  },
});

module.exports = {
  id: 'numberline',
  name: '数轴',
  keywords: i18n.keywords('numberline'),

  match(problem, opts = {}) {
    const t = String(problem || '').toLowerCase();
    let score = 0;
    if (/(数轴|數軸|number line|خط الأعداد|محور اعداد|数直線|수직선|droite numérique|zahlenstrahl|recta numérica|retta numerica)/.test(t)) score += 5;
    if (/(向右|往右|right|يمين|راست|右|오른쪽|droite|rechts|derecha|destra|→)/.test(t)) score += 3;
    if (/(向左|往左|left|يسار|چپ|左|왼쪽|gauche|links|izquierda|sinistra|←)/.test(t)) score += 3;
    if (/(格|跳|hop|jump|spaces|step|قفز|پرش|跳ぶ|점프|sauter|springen|saltar|saltare)/.test(t)) score += 2;
    if (/(分数|分數|fraction|كسر|کسر|분수|fraction|bruch|fracción|frazione)/.test(t)) score += 3;
    if (/(比较|比較|compare|مقارنة|مقایسه|比較|비교|comparer|vergleichen|comparar|confrontare)/.test(t)) score += 5;
    if (/(负数|負数|negative|سالب|منفی|負の|음수|négatif|negativ|negativo)/.test(t)) score += 1;
    // 强信号：两个分数比较
    if (/\d+\s*\/\s*\d+\s*(?:和|与|跟|and|vs|et|und|y|e|و|과|와|と|أو|ou|oder|o)\s*\d+\s*\/\s*\d+/.test(t)) score += 8;
    // 20 以内加法（凑十）：两组合并、又/再/给/一共 — 强意图；排除分数与数位题
    const ADD_RE = /又|再|一共|总共|给了|买来|摘了|捡了|more|another|adds?|gives?|gave|brings?|gets?|receives?|さらに|くれ|もら|足す|더 주|더 받|주었|de plus|en plus|donne|apporte|rajoute|weitere|noch\s*\d|gibt|bringt|bekommt|le da|añade|recibe|trae|altre|le dà|porta|aggiunge|أخرى|أعط|يضيف|دیگر|می‌دهد|اضافه/;
    const GUARD_FRAC = /分之|分の|분의|fraction|equal slices|parts? (égales|equal|gleiche|iguales|uguali)|كسر|کسر|bruch|fracción|frazione/;
    const GUARD_PLACE = /几个十|数位|十位|个位|tens|ones|zehner|decen|decine|dizaines?|عشرات|آحاد|十が|십이|자릿/;
    if (!GUARD_FRAC.test(t) && !GUARD_PLACE.test(t) && ADD_RE.test(t)) score += 12;
    // 20 以内减法（破十）：拿走/飞走/还剩/减号 — 强意图；排除分数与数位题
    const SUB_RE = /减法|减去|还剩|剩下|飞走|拿走|借走|用掉|subtract|take away|minus|\bleft\b|remain|\d+\s*[-−]\s*\d+|引き算|残り|引く|빼기|남은|soustraction|reste|enlève|abziehen|verbleib|noch übrig|restar|quedan|quita|sottrazione|resta|riman|طرح|متبق|يتبق|تفریق|باقی/;
    if (!GUARD_FRAC.test(t) && !GUARD_PLACE.test(t) && SUB_RE.test(t)) score += 12;
    return score;
  },

  extract(problem, opts = {}) {
    const t = String(problem || '');
    const tl = t.toLowerCase();

    // —— 分数比较模式 ——（分隔符多语种：和/与/and/vs/و/と/과/et/und/y/e）
    const frac = t.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*(?:和|与|跟|，|,|and|vs|et|und|y|e|و|과|와|と)\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
    const fracCN = t.match(/(\d+)\s*分之\s*(\d+)\s*(?:和|与|跟)\s*(\d+)\s*分之\s*(\d+)/);
    if (frac || fracCN) {
      let n1, d1, n2, d2;
      if (frac) [, n1, d1, n2, d2] = frac;
      else [, d1, n1, d2, n2] = fracCN; // 中文 a分之b → b/a
      n1 = +n1; d1 = +d1; n2 = +n2; d2 = +d2;
      if (d1 === 0 || d2 === 0) return null;
      return {
        mode: 'fractionCompare', n1, d1, n2, d2,
        confidence: 0.9, unit: '', raw: t,
      };
    }

    // —— 整数加减跳跃模式 ——
    // 起点：从 X 出发 / 在 X / start at X / من X / از X / Xから / X에서
    const startM =
      t.match(/从\s*(-?\d+(?:\.\d+)?)\s*出发/) ||
      t.match(/從\s*(-?\d+(?:\.\d+)?)\s*出發/) ||
      t.match(/在\s*数?轴?\s*上?\s*的?\s*(-?\d+(?:\.\d+)?)/) ||
      t.match(/在\s*數?軸?\s*上?\s*的?\s*(-?\d+(?:\.\d+)?)/) ||
      t.match(/starts?\s+at\s*(-?\d+(?:\.\d+)?)/i) ||
      t.match(/starting\s+at\s*(-?\d+(?:\.\d+)?)/i) ||
      t.match(/ينطلق\s*(?:من|عند)?\s*(-?\d+(?:\.\d+)?)/) ||
      t.match(/يبدأ\s*(?:من|عند)?\s*(-?\d+(?:\.\d+)?)/) ||
      t.match(/شروع\s*از\s*(-?\d+(?:\.\d+)?)/) ||
      // 多语种：Xから / X에서 / part de X / beginnt bei X / parte de X / parte da X / من X / از X
      t.match(/(-?\d+(?:\.\d+)?)\s*から\s*(?:右|左)/) ||
      t.match(/(-?\d+(?:\.\d+)?)\s*에서\s*(?:시작|오른쪽|왼쪽)/) ||
      t.match(/(?:part|démarre|commence)\s*(?:de|à)?\s*(-?\d+(?:\.\d+)?)/i) ||
      t.match(/(?:beginnt|startet)\s*(?:bei|von)\s*(-?\d+(?:\.\d+)?)/i) ||
      t.match(/(?:parte|comienza)\s*(?:de|desde)\s*(-?\d+(?:\.\d+)?)/i) ||
      t.match(/parte\s+da\s*(-?\d+(?:\.\d+)?)/i) ||
      t.match(/(?:من|عند)\s*(-?\d+(?:\.\d+)?)\s*(?:على|على خط)/) ||
      t.match(/(?:از|از\s+نقطه)\s*(-?\d+(?:\.\d+)?)/);
    if (!startM) return null;
    const start = parseFloat(startM[1]);

    // 方向（多语种）
    let dir = 0;
    if (/(向右|往右|右跳|右走|right|to the right|يمين|راست|右へ|오른쪽|droite|rechts|derecha|destra|→)/.test(tl)) dir = +1;
    else if (/(向左|往左|左跳|左走|left|to the left|يسار|چپ|左へ|왼쪽|gauche|links|izquierda|sinistra|←)/.test(tl)) dir = -1;
    if (dir === 0) return null;

    // 跳几格 / 加 / 减（多语种）
    const jumpM =
      t.match(/跳\s*(\d+(?:\.\d+)?)\s*(格|步|个单位|格)?/) ||
      t.match(/走\s*(\d+(?:\.\d+)?)\s*(格|步|个单位)/) ||
      t.match(/(?:jumps?|hops?|hopped|moved?|moves?)\s+(\d+(?:\.\d+)?)\s*(spaces?|steps?|cases?|felder?)/i) ||
      t.match(/(?:يقفز|تقفز)\s*(\d+(?:\.\d+)?)\s*(خانات|خانة|خطوات)/) ||
      t.match(/(\d+(?:\.\d+)?)\s*(?:خانه|خانه به|خانه‌های)/) ||
      // 日/韩/法/德/西/意 多语种
      t.match(/(\d+(?:\.\d+)?)\s*(?:マス|目盛り|個)/) ||
      t.match(/(\d+(?:\.\d+)?)\s*(?:칸|칸을)/) ||
      t.match(/(?:sauter|saute)\s*(?:de\s+)?(\d+(?:\.\d+)?)\s*(?:cases?|unités?)/i) ||
      t.match(/(?:springt|springe)\s+(\d+(?:\.\d+)?)\s*(?:Felder?|Einheiten?)/i) ||
      t.match(/(?:salta|saltar)\s+(?:de\s+)?(\d+(?:\.\d+)?)\s*(?:casillas?|espacios?|pasos?)/i) ||
      t.match(/(?:salta|saltare)\s+(?:di\s+)?(\d+(?:\.\d+)?)\s*(?:caselle|unità)/i);
    if (!jumpM) return null;
    const jump = parseFloat(jumpM[1]);

    // 操作：向右=加，向左=减
    const op = dir > 0 ? '+' : '-';

    // 演员
    let actor = '🐸';
    if (/(兔|rabbit|bunny|أرنب|خرگوش|うさぎ|토끼|lapin|hase|conejo|coniglio)/i.test(t)) actor = '🐇';
    else if (/(鸟|bird|طائر|پرنده|鳥|새|oiseau|vogel|pájaro|uccello)/i.test(t)) actor = '🐦';
    else if (/(狗|dog|كلب|سگ|犬|개|chien|hund|perro|cane)/i.test(t)) actor = '🐕';
    else if (/(猴|monkey|قرد|میمون|猿|원숭이|singe|affe|mono|scimmia)/i.test(t)) actor = '🐒';
    else if (/(球|ball|كرة|توپ|ボール|공|balle|ball|pelota|palla)/i.test(t)) actor = '⚽';

    return {
      mode: 'jump', start, op, jump, dir, actor,
      confidence: 0.85, unit: '', raw: t,
    };
  },

  solve(params, opts = {}) {
    const lang = i18n.langOf(opts);
    const T = (key, vars) => i18n.t('numberline', lang, key, vars);
    const steps = [];
    let answer, result = null, winner = 0;

    if (params.mode === 'fractionCompare') {
      const { n1, d1, n2, d2 } = params;
      const v1 = n1 / d1, v2 = n2 / d2;
      const cross1 = n1 * d2, cross2 = n2 * d1; // 交叉相乘
      const a = `${n1}/${d1}`, b = `${n2}/${d2}`;
      steps.push({ narration: T('narr_frac_locate', { a, b }), visualHint: 'two_fractions' });
      steps.push({ narration: T('narr_frac_cross', { n1, d2, n2, d1, n1d2: cross1, n2d1: cross2 }), visualHint: 'cross' });
      if (cross1 > cross2) {
        steps.push({ narration: T('narr_frac_right', { n1d2: cross1, n2d1: cross2, a, b }), visualHint: 'result' });
        answer = T('answer_larger_a', { a });
        result = v1; winner = 1;
      } else if (cross1 < cross2) {
        steps.push({ narration: T('narr_frac_left', { n1d2: cross1, n2d1: cross2, a, b }), visualHint: 'result' });
        answer = T('answer_larger_b', { b });
        result = v2; winner = -1;
      } else {
        steps.push({ narration: T('narr_frac_eq', {}), visualHint: 'result' });
        answer = T('answer_equal', {});
        result = v1; winner = 0;
      }
      return { answer, steps, mode: 'fractionCompare', n1, d1, n2, d2, v1, v2, result, winner };
    }

    // jump
    const { start, op, jump } = params;
    result = op === '+' ? start + jump : start - jump;
    steps.push({ narration: T('narr_start', { start }), visualHint: 'start' });
    steps.push({
      narration: op === '+'
        ? T('narr_jump_right', { jump, start })
        : T('narr_jump_left', { jump, start }),
      visualHint: 'jump_arc',
    });
    steps.push({ narration: T('narr_land', { result }), visualHint: 'land' });
    answer = T('answer_jump', { result });
    return { answer, steps, mode: 'jump', start, op, jump, result, actor: params.actor };
  },

  validate(params, solved, opts = {}) {
    if (!solved || !solved.answer) return { ok: false, reason: 'no_answer' };
    if (!solved.steps || solved.steps.length < 3) return { ok: false, reason: 'steps_too_short' };
    if (solved.mode === 'jump') {
      const expect = params.op === '+' ? params.start + params.jump : params.start - params.jump;
      if (Math.abs(expect - solved.result) > 1e-9) return { ok: false, reason: 'jump_mismatch' };
    } else if (solved.mode === 'fractionCompare') {
      const diff = params.n1 * params.d2 - params.n2 * params.d1;
      // 口径不变：diff>0 必须判定第一个分数更大（用结构化 winner，去除中文依赖）
      if (diff > 0 && solved.winner !== 1) return { ok: false, reason: 'frac_wrong_dir' };
      if (diff < 0 && solved.winner !== -1) return { ok: false, reason: 'frac_wrong_dir' };
    }
    return { ok: true };
  },

  renderParams(solved, opts = {}) {
    const lang = i18n.langOf(opts);
    const T = (key, vars) => i18n.t('numberline', lang, key, vars);
    if (solved.mode === 'jump') {
      const { start, result, op, jump, actor } = solved;
      const lo = Math.min(start, result, 0);
      const hi = Math.max(start, result, 0);
      const pad = Math.max(1, Math.ceil((hi - lo) * 0.15));
      const min = Math.floor(lo - pad), max = Math.ceil(hi + pad);
      const eqText = op === '+' ? `${start} + ${jump} = ${result}` : `${start} − ${jump} = ${result}`;
      return {
        type: 'numberline',
        rtl: i18n.isRTL(lang),
        language: lang,
        scene: {
          mode: 'jump', start, end: result, op, jump,
          min, max, actor: actor || '🐸',
        },
        beats: [
          { id: 'start', duration: 3500, label: T('beat_start') },
          { id: 'jump', duration: 4500, label: T('beat_jump') },
          { id: 'land', duration: 3500, label: T('beat_land') },
          { id: 'eq', duration: 3500, label: T('beat_eq') },
        ],
        answer: solved.answer,
        scenes: [
          { type: 'numberline', start, end: result, min, max },
          { type: 'equation', text: eqText },
        ],
      };
    }

    // fraction compare
    const { n1, d1, n2, d2, v1, v2 } = solved;
    const eqText = `${n1}/${d1}  vs  ${n2}/${d2}`;
    return {
      type: 'numberline',
      rtl: i18n.isRTL(lang),
      language: lang,
      scene: {
        mode: 'fractionCompare', n1, d1, n2, d2, v1, v2,
        min: 0, max: 1,
      },
      beats: [
        { id: 'locate1', duration: 4000, label: `${n1}/${d1}` },
        { id: 'locate2', duration: 4000, label: `${n2}/${d2}` },
        { id: 'cmp', duration: 4000, label: T('beat_cmp') },
        { id: 'eq', duration: 3500, label: T('beat_eq') },
      ],
      answer: solved.answer,
      scenes: [
        { type: 'numberline', fractions: [{ v: v1, label: `${n1}/${d1}` }, { v: v2, label: `${n2}/${d2}` }], min: 0, max: 1 },
        { type: 'equation', text: eqText },
      ],
    };
  },
};
