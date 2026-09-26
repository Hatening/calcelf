// lib/kards/grid.js — 阵列 / 数数 / 乘法入门 / 面积入门 族知识（11 语种版）
// 承载：乘法阵列（3行×4列=12）、按行列数数、长方形面积入门（长×宽）、简单排列
// CPA：具象(真实物体按行列排开) → 图示(点阵/阵列高亮行列) → 抽象(乘法算式/面积公式)
'use strict';
const i18n = require('./i18n');

i18n.register('grid', {
  en: {
    _keywords: ['array','arrays','row','rows','column','columns','multiplication','multiply','times','area','rectangle','length','width','in all','altogether','equal groups','tile','unit square','each row'],
    area1: "This is a rectangle. It is {cols} long and {rows} wide. Let's tile it with unit squares.",
    area2: "Each row holds {cols} squares, and there are {rows} rows.",
    area3: "Area = length × width = {cols} × {rows} = {product}{unit}.",
    mult1: "We line up the {emoji} in a neat array: {rows} rows in total.",
    mult2: "Each row has {cols}. Counting by rows: {skip}.",
    mult3: "{rows} rows of {cols} = {rows} × {cols} = {product}{unit}.",
    beat_build: "Build the array", beat_count: "Count by rows", beat_sentence: "Number sentence",
    title_area: "Area", title_array: "Array Multiplication", rowLabel: "rows", colLabel: "columns", answerLabel: "Answer",
  },
  'zh-CN': {
    _keywords: ['阵列','行列','行','列','每行','每排','每列','排','乘法','乘','一共多少','总数','数数','面积','长方形','长','宽','方格','一共'],
    area1: "这是一个长方形，长 {cols}，宽 {rows}。我们用小方格铺满它。",
    area2: "一行能铺 {cols} 格，一共铺 {rows} 行。",
    area3: "长方形面积 = 长 × 宽 = {cols} × {rows} = {product}{unit}。",
    mult1: "我们把{emoji}摆成整齐的方阵：一共 {rows} 行。",
    mult2: "每行有 {cols} 个。一行一行地数：{skip}。",
    mult3: "{rows} 行 × 每行 {cols} 个 = {rows} × {cols} = {product}{unit}。",
    beat_build: "摆成方阵", beat_count: "一行一行数", beat_sentence: "写成乘法",
    title_area: "面积入门", title_array: "阵列乘法", rowLabel: "行", colLabel: "列", answerLabel: "答案",
  },
  'zh-TW': {
    _keywords: ['陣列','行列','行','列','每行','每排','每列','排','乘法','乘','一共多少','總數','數數','面積','長方形','長','寬','方格','一共'],
    area1: "這是一個長方形，長 {cols}，寬 {rows}。我們用小方格鋪滿它。",
    area2: "一行能鋪 {cols} 格，一共鋪 {rows} 行。",
    area3: "長方形面積 = 長 × 寬 = {cols} × {rows} = {product}{unit}。",
    mult1: "我們把{emoji}排成整齊的方陣：一共 {rows} 行。",
    mult2: "每行有 {cols} 個。一行一行地數：{skip}。",
    mult3: "{rows} 行 × 每行 {cols} 個 = {rows} × {cols} = {product}{unit}。",
    beat_build: "排成方陣", beat_count: "一行一行數", beat_sentence: "寫成乘法",
    title_area: "面積入門", title_array: "陣列乘法", rowLabel: "行", colLabel: "列", answerLabel: "答案",
  },
  ja: {
    _keywords: ['配列','行列','行','列','每行','列ごと','並び','掛け算','かける','積','面積','長方形','長さ','幅','正方形','タイル','全部で'],
    area1: "これは長方形です。横が {cols}、たてが {rows}。単位正方形で敷き詰めてみましょう。",
    area2: "1行に {cols} 個並び、全部で {rows} 行です。",
    area3: "面積 = 横 × たて = {cols} × {rows} = {product}{unit}。",
    mult1: "{emoji} をきれいに並べましょう。全部で {rows} 行です。",
    mult2: "1行に {cols} 個ずつ。行ごとに数えましょう：{skip}。",
    mult3: "{rows} 行 × 行ごとに {cols} 個 = {rows} × {cols} = {product}{unit}。",
    beat_build: "並べてみよう", beat_count: "一行ずつ数える", beat_sentence: "かけ算の式",
    title_area: "面積の入門", title_array: "配列のかけ算", rowLabel: "行", colLabel: "列", answerLabel: "答え",
  },
  ko: {
    _keywords: ['배열','행','열','행마다','열마다','줄','곱셈','곱하다','곱','넓이','직사각형','가로','세로','정사각형','타일','모두'],
    area1: "이것은 직사각형입니다. 가로 {cols}, 세로 {rows}이에요. 단위 정사각형으로 빽빽이 채워 봅시다.",
    area2: "한 행에 {cols}개씩, 모두 {rows}행이에요.",
    area3: "넓이 = 가로 × 세로 = {cols} × {rows} = {product}{unit}.",
    mult1: "{emoji} 를 가지런히 배열해 봐요: 모두 {rows}행.",
    mult2: "한 행에 {cols}개씩. 행별로 세어 보면: {skip}.",
    mult3: "{rows}행 × 행마다 {cols}개 = {rows} × {cols} = {product}{unit}.",
    beat_build: "배열 만들기", beat_count: "행별로 세기", beat_sentence: "곱셈식",
    title_area: "넓이", title_array: "배열 곱셈", rowLabel: "행", colLabel: "열", answerLabel: "답",
  },
  fr: {
    _keywords: ['tableau','ligne','lignes','colonne','colonnes','multiplication','multiplier','fois','aire','rectangle','longueur','largeur','rangée','tuile','au total'],
    area1: "Voici un rectangle. Il mesure {cols} de long et {rows} de large. Remplissons-le de carreaux unités.",
    area2: "Chaque rangée contient {cols} carreaux, et il y a {rows} rangées.",
    area3: "Aire = longueur × largeur = {cols} × {rows} = {product}{unit}.",
    mult1: "Alignons les {emoji} en tableau ordonné : {rows} rangées au total.",
    mult2: "Chaque rangée a {cols}. Comptons par rangées : {skip}.",
    mult3: "{rows} rangées de {cols} = {rows} × {cols} = {product}{unit}.",
    beat_build: "Construire le tableau", beat_count: "Compter par rangées", beat_sentence: "Phrase multiplicative",
    title_area: "Aire", title_array: "Multiplication par tableau", rowLabel: "rangées", colLabel: "colonnes", answerLabel: "Réponse",
  },
  de: {
    _keywords: ['anordnung','reihe','reihen','spalte','spalten','multiplikation','mal','fläche','rechteck','länge','breite','kachel','insgesamt','feld'],
    area1: "Das ist ein Rechteck. Es ist {cols} lang und {rows} breit. Lass es mit Einheitsquadraten belegen.",
    area2: "Jede Reihe fasst {cols} Quadrate, und es gibt {rows} Reihen.",
    area3: "Fläche = Länge × Breite = {cols} × {rows} = {product}{unit}.",
    mult1: "Wir ordnen die {emoji} in einem geordneten Feld an: insgesamt {rows} Reihen.",
    mult2: "Jede Reihe hat {cols}. Reihe für Reihe zählen: {skip}.",
    mult3: "{rows} Reihen zu je {cols} = {rows} × {cols} = {product}{unit}.",
    beat_build: "Feld aufbauen", beat_count: "Reihenweise zählen", beat_sentence: "Multiplikationssatz",
    title_area: "Fläche", title_array: "Feldmultiplikation", rowLabel: "Reihen", colLabel: "Spalten", answerLabel: "Antwort",
  },
  es: {
    _keywords: ['matriz','fila','filas','columna','columnas','multiplicación','multiplicar','por','área','rectángulo','longitud','ancho','baldosa','en total'],
    area1: "Este es un rectángulo. Mide {cols} de largo y {rows} de ancho. Vamos a cubrirlo con cuadrados unidad.",
    area2: "Cada fila tiene {cols} cuadrados, y hay {rows} filas.",
    area3: "Área = largo × ancho = {cols} × {rows} = {product}{unit}.",
    mult1: "Alineamos los {emoji} en una matriz ordenada: {rows} filas en total.",
    mult2: "Cada fila tiene {cols}. Contamos por filas: {skip}.",
    mult3: "{rows} filas de {cols} = {rows} × {cols} = {product}{unit}.",
    beat_build: "Armar la matriz", beat_count: "Contar por filas", beat_sentence: "Enunciado multiplicativo",
    title_area: "Área", title_array: "Multiplicación con matriz", rowLabel: "filas", colLabel: "columnas", answerLabel: "Respuesta",
  },
  it: {
    _keywords: ['schieramento','riga','righe','colonna','colonne','moltiplicazione','moltiplicato','per','area','rettangolo','lunghezza','larghezza','piastrella','in tutto'],
    area1: "Questo è un rettangolo. È lungo {cols} e largo {rows}. Ricopriamolo di quadrati unità.",
    area2: "Ogni riga contiene {cols} quadrati, e ci sono {rows} righe.",
    area3: "Area = lunghezza × larghezza = {cols} × {rows} = {product}{unit}.",
    mult1: "Allineiamo gli {emoji} in uno schieramento ordinato: {rows} righe in tutto.",
    mult2: "Ogni riga ne ha {cols}. Contiamo riga per riga: {skip}.",
    mult3: "{rows} righe da {cols} = {rows} × {cols} = {product}{unit}.",
    beat_build: "Costruisci lo schieramento", beat_count: "Conta per righe", beat_sentence: "Phrasaggio moltiplicativo",
    title_area: "Area", title_array: "Moltiplicazione per schieramento", rowLabel: "righe", colLabel: "colonne", answerLabel: "Risposta",
  },
  ar: {
    _keywords: ['صفيف','مصفوفة','صف','صفوف','عمود','أعمدة','ضرب','مساحة','مستطيل','طول','عرض','كل صف','مربع وحدة','بلاط','بمجموع','يساوي'],
    area1: "هذا مستطيل طوله {cols} وعرضه {rows}. لنغطيه بمربعات وحدة.",
    area2: "كل صف يحوي {cols} مربعاً، ويوجد {rows} صفوف.",
    area3: "المساحة = الطول × العرض = {cols} × {rows} = {product}{unit}.",
    mult1: "نرتب {emoji} في مصفوفة منتظمة: {rows} صفوف في المجموع.",
    mult2: "كل صف فيه {cols}. نعد صفاً بعد صف: {skip}.",
    mult3: "{rows} صفوف × كل صف {cols} = {rows} × {cols} = {product}{unit}.",
    beat_build: "بناء المصفوفة", beat_count: "العد بالصفوف", beat_sentence: "الجملة الضربية",
    title_area: "المساحة", title_array: "الضرب بالمصفوفة", rowLabel: "صفوف", colLabel: "أعمدة", answerLabel: "الإجابة",
  },
  fa: {
    _keywords: ['آرایه','ماتریس','ردیف','ردیف‌ها','ستون','ستون‌ها','ضرب','مساحت','مستطیل','طول','عرض','هر ردیف','کاشی','مربع واحد','در مجموع','برابر'],
    area1: "این یک مستطیل است، طولش {cols} و عرضش {rows}. آن را با مربع‌های واحد می‌پوشانیم.",
    area2: "هر ردیف {cols} مربع جا می‌گیرد و مجموعاً {rows} ردیف داریم.",
    area3: "مساحت = طول × عرض = {cols} × {rows} = {product}{unit}.",
    mult1: "{emoji} را منظم می‌چینیم: در مجموع {rows} ردیف.",
    mult2: "هر ردیف {cols} تا دارد. ردیف به ردیف می‌شماریم: {skip}.",
    mult3: "{rows} ردیف × هر ردیف {cols} تا = {rows} × {cols} = {product}{unit}.",
    beat_build: "ساخت آرایه", beat_count: "شمارش ردیف‌به‌ردیف", beat_sentence: "جمله ضربی",
    title_area: "مساحت", title_array: "ضرب با آرایه", rowLabel: "ردیف‌ها", colLabel: "ستون‌ها", answerLabel: "پاسخ",
  },
});

// 物体词 → emoji（自包含小映射）
const ACTOR_EMOJI = {
  '苹果': '🍎', 'apple': '🍎', '星星': '⭐', 'star': '⭐',
  '方块': '🧊', '积木': '🧊', '方格': '🟧', 'box': '📦', 'cube': '🧊',
  '球': '⚽', 'ball': '⚽', '书': '📖', 'book': '📖', '花': '🌸', 'flower': '🌸',
  '气球': '🎈', 'balloon': '🎈', '礼物': '🎁', 'gift': '🎁',
};
function pickActor(t) {
  const low = t.toLowerCase();
  for (const kw of Object.keys(ACTOR_EMOJI)) {
    if (low.includes(kw.toLowerCase())) {
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

// 多语种词干
const ROW_W = '行|row|rows|reihe|reihen|fila|filas|riga|righe|صف|صفوف|ردیف|행|단|層|层|段|étagère|étagères|shelf|shelves';
const COL_W = '列|column|columns|spalte|spalten|columna|columnas|colonna|colonne|عمود|أعمدة|ستون|열';
const AREA_W = '面积|面積|area|aire|fläche|área|مساحة|مساحت|넓이';
const LEN_W = '长|長|length|länge|longueur|largo|lunghezza|طول|درازا|길이';
const WID_W = '宽|寬|width|breite|largeur|ancho|larghezza|عرض|너비';
const EACH_ROW_W = '每行|每排|每層|每层|各段|each row|chaque rangée|jede reihe|cada fila|ogni riga|كل صف|هر ردیف|한 행|각 단|1行ごと|行ごとに|pro Reihe|par étagère|per étagère';

module.exports = {
  id: 'grid',
  name: '阵列与乘法入门',
  keywords: i18n.keywords('grid'),

  match(problem, opts = {}) {
    const t = String(problem || '').toLowerCase();
    let score = 0;
    if (new RegExp('(' + ROW_W + ')').test(t) && new RegExp('(' + COL_W + '|个|颗|只|本|朵|冊|권|apple|🍎|books?|livres?|bücher|libros?|libri|كتب|کتاب)').test(t)) score += 5;
    if (new RegExp('(' + COL_W + ')').test(t) && new RegExp('(' + ROW_W + ')').test(t)) score += 3;
    if (new RegExp('(' + AREA_W + ')').test(t)) score += 6;
    if (new RegExp('(' + LEN_W + ')').test(t) && new RegExp('(' + WID_W + ')').test(t)) score += 3;
    if (new RegExp('(' + EACH_ROW_W + ')', 'i').test(t)) score += 5;
    if (/(乘法|乘|×|multiplication|multiplier|mal\b|por\b|per\b|ضرب|곱셈|掛け算|かけ)/.test(t)) score += 2;
    // 强信号：数字+行/层/排 + 数字+每/each/pro
    if (/\d+\s*(?:行|row|rows|reihe|reihen|fila|riga|صف|ردیف|행|단|層|层|段)/.test(t) && new RegExp('(' + EACH_ROW_W + ')', 'i').test(t)) score += 4;
    // 数位 / 数的组成（几个十、几个一）— 强意图，压过 bars 的泛数量词
    const PLACE_W = '几个十|几个一|个十和|个十、|十位|个位|数位|一捆|幾個十|幾個一|十個一|數位|how many tens|tens and (how many )?ones|place value|groups of ten|十がいくつ|十と一|十が\\s*\\d|십이 몇|자릿|십과 일|combien de dizaines|dizaines? et d|wie viele zehner|zehner\\b|cuántas decenas|decenas? y|quante decine|decine e|عشرات|آحاد|ده.?تایی|چند ده';
    if (new RegExp('(' + PLACE_W + ')', 'i').test(t)) score += 12;
    return score;
  },

  // 从题目抽参：行数 rows、列数 cols、模式(multiply/area)、物体类型
  extract(problem, opts = {}) {
    const t = String(problem || '');
    const low = t.toLowerCase();
    const nums = (t.match(/\d+(?:\.\d+)?/g) || []).map(Number).filter(n => n > 0);
    if (nums.length < 2) return null;

    const isArea = new RegExp(AREA_W, 'i').test(low);

    let rows = null, cols = null;

    if (isArea) {
      const lenM = t.match(new RegExp('(?:' + LEN_W + ')\\s*(?:是|为|等于|=|is|:)?\\s*(\\d+(?:\\.\\d+)?)', 'i'));
      const widM = t.match(new RegExp('(?:' + WID_W + ')\\s*(?:是|为|等于|=|is|:)?\\s*(\\d+(?:\\.\\d+)?)', 'i'));
      if (lenM && widM) {
        cols = parseFloat(lenM[1]); // 长 = 列方向
        rows = parseFloat(widM[1]); // 宽 = 行方向
      } else {
        [rows, cols] = nums.slice(0, 2);
      }
    } else {
      const rowM = t.match(new RegExp('(\\d+(?:\\.\\d+)?)\\s*(?:' + ROW_W + ')', 'i'));
      const colM = t.match(new RegExp('(\\d+(?:\\.\\d+)?)\\s*(?:' + COL_W + ')', 'i'));
      const eachM = t.match(new RegExp('(?:' + EACH_ROW_W + ')\\s*(?:有|放|摆|是|of|has|contiene|on|is)?\\s*(\\d+(?:\\.\\d+)?)', 'i'));

      if (rowM && colM) {
        rows = parseFloat(rowM[1]);
        cols = parseFloat(colM[1]);
      } else if (rowM && eachM) {
        rows = parseFloat(rowM[1]);
        cols = parseFloat(eachM[1]);
      } else if (eachM) {
        const rowTotalM = t.match(new RegExp('(?:一共|共有|有|in all|altogether)\\s*(\\d+(?:\\.\\d+)?)\\s*(?:' + ROW_W + ')', 'i'));
        if (rowTotalM) { rows = parseFloat(rowTotalM[1]); cols = parseFloat(eachM[1]); }
      }
      if (rows == null || cols == null) {
        [rows, cols] = nums.slice(0, 2);
      }
    }

    rows = Math.round(Number(rows));
    cols = Math.round(Number(cols));
    if (!Number.isFinite(rows) || !Number.isFinite(cols)) return null;
    if (rows <= 0 || cols <= 0) return null;
    if (rows > 12 || cols > 12) return null;

    const actor = pickActor(t);
    const mode = isArea ? 'area' : 'multiply';

    let confidence;
    if (isArea && new RegExp(AREA_W, 'i').test(low) && new RegExp(LEN_W, 'i').test(low) && new RegExp(WID_W, 'i').test(low)) confidence = 0.92;
    else if (new RegExp(ROW_W, 'i').test(low) && new RegExp(COL_W, 'i').test(low)) confidence = 0.9;
    else if (new RegExp(EACH_ROW_W, 'i').test(low)) confidence = 0.8;
    else confidence = 0.5;

    const sqUnit = (t.match(/(cm²|m²|dm²|mm²|cm2|m2|平方厘米|平方米|平方分米)/i) || [])[1] || '';
    const unit = isArea ? sqUnit : '';

    return { rows, cols, mode, actorType: actor.type, actorEmoji: actor.emoji, unit, confidence, raw: t };
  },

  // 确定性求解（旁白全语种本地化）
  solve(params, opts = {}) {
    const { rows, cols, mode, actorEmoji, unit } = params;
    const product = rows * cols;
    const lang = i18n.langOf(opts);
    const steps = [];

    if (mode === 'area') {
      steps.push({ narration: i18n.t('grid', lang, 'area1', { cols, rows }), visualHint: 'concrete_rect' });
      steps.push({ narration: i18n.t('grid', lang, 'area2', { cols, rows }), visualHint: 'pictorial_tiles' });
      steps.push({ narration: i18n.t('grid', lang, 'area3', { cols, rows, product, unit }), visualHint: 'abstract_formula' });
      return {
        answer: `${product}`,
        steps, rows, cols, mode, product, unit, actorEmoji,
        formula: `${cols} × ${rows} = ${product}`,
      };
    }

    steps.push({ narration: i18n.t('grid', lang, 'mult1', { emoji: actorEmoji || '🍎', rows }), visualHint: 'concrete_array' });
    const skip = [];
    for (let r = 1; r <= rows; r++) skip.push(r * cols);
    steps.push({ narration: i18n.t('grid', lang, 'mult2', { cols, skip: skip.join(', ') }), visualHint: 'pictorial_skip' });
    steps.push({ narration: i18n.t('grid', lang, 'mult3', { rows, cols, product, unit }), visualHint: 'abstract_sentence' });

    return {
      answer: `${product}`,
      steps, rows, cols, mode, product, unit, actorEmoji,
      formula: `${rows} × ${cols} = ${product}`,
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

  // 渲染参数
  renderParams(solved, opts = {}) {
    const lang = i18n.langOf(opts);
    const { rows, cols, mode, product, actorEmoji } = solved;

    const beats = [
      { id: 'concrete', duration: 5000, label: i18n.t('grid', lang, 'beat_build') },
      { id: 'pictorial', duration: 5000, label: i18n.t('grid', lang, 'beat_count') },
      { id: 'abstract', duration: 5000, label: i18n.t('grid', lang, 'beat_sentence') },
    ];

    return {
      type: 'grid',
      rtl: i18n.isRTL(lang),
      language: lang,
      mode, rows, cols, product,
      actor: { type: solved.actorType || 'apple', emoji: actorEmoji || '🍎' },
      formula: solved.formula,
      answer: String(product),
      beats,
      scenes: [
        { type: 'concrete_array', rows, cols, emoji: actorEmoji || '🍎' },
        { type: 'dot_array', rows, cols },
        { type: 'number_sentence', rows, cols, product, formula: solved.formula },
      ],
      i18n: {
        title: i18n.t('grid', lang, mode === 'area' ? 'title_area' : 'title_array'),
        rowLabel: i18n.t('grid', lang, 'rowLabel'),
        colLabel: i18n.t('grid', lang, 'colLabel'),
        answer: i18n.t('grid', lang, 'answerLabel'),
      },
    };
  },
};
