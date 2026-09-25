// lib/kards/balance.js — 天平 / 等式 / 一元一次方程 / 质量比较 族知识（11 语种完整版）
// CommonJS 自包含，不依赖 ESM 渲染层。
// 承载：ax+b=c 型一元一次方程、等式性质（两边同加减/同除）、天平平衡、质量比较
// CPA：具象(天平两端放盒子/砝码) → 图示(两边同步取放砝码、平均分份) → 抽象(方程求解、等号对齐)
'use strict';
const i18n = require('./i18n');

function num(s) { return parseFloat(String(s).replace(/[，,\s]/g, '')); }

// 解析 “含 x 的一边”：返回 {a, bSigned}
// 支持 2x+5 / 2x - 5 / 5+2x / x+3 / 3x / 2*x / 3倍x加5
function parseSide(side) {
  let s = side.replace(/\s+/g, '').replace(/＝/g, '=').replace(/×/g, '*');
  s = s.replace(/倍的?x/g, 'x').replace(/个x/g, 'x');
  // 抓 x 的系数
  let a = 1;
  const coefM = s.match(/(\d+(?:\.\d+)?)\s*\*?\s*x/i);
  if (coefM) a = num(coefM[1]);
  else if (/x/i.test(s)) a = 1;
  else a = 0;

  // 去掉含 x 的项，剩下的串里找一个带符号的常数（容忍中文前缀污染）
  let rest = s.replace(/\d+(?:\.\d+)?\s*\*?\s*x/i, '');
  rest = rest.replace(/x/i, '');
  const bM = rest.match(/([+-]?\s*\d+(?:\.\d+)?)/);
  const b = bM ? num(bM[1]) : 0;
  return { a, bSigned: b };
}

i18n.register('balance', {
  en: {
    _keywords: ['balance','scale','weigh','equation','both sides','unknown','solve for x','equals','weights','mass','box','bag','grams','kilograms','left side','right side'],
    narr_initial: 'The scale is balanced: the left side has {a} boxes plus {b}{unit}, and the right side has {c}{unit}.',
    narr_remove: 'Take {b}{unit} away from BOTH sides; the scale stays balanced. The left has {a} boxes, and the right has {target}{unit}.',
    narr_add: 'Add {b}{unit} to BOTH sides; the scale stays balanced. The left has {a} boxes, and the right has {target}{unit}.',
    narr_asis: 'The left side has {a} boxes, and the right side has {target}{unit}; the scale is balanced.',
    narr_divide: 'Split both sides into {a} equal groups. One box weighs {x}{unit}.',
    narr_result: 'So x = {target} ÷ {a} = {x}{unit}.',
    beat_initial: 'Balanced', beat_remove: 'Subtract both', beat_add: 'Add both', beat_asis: 'As-is',
    beat_divide: 'Split equally', beat_eq: 'Equation',
    title: 'Balance & Equations', box: 'box', weight: 'weights', answer: 'Answer',
  },
  'zh-CN': {
    _keywords: ['天平','平衡','砝码','等式','方程','未知数','解方程','移项','两边','左边','右边','盒子','质量','克','千克','等于'],
    narr_initial: '天平是平衡的：左边 {a} 个盒子 + {b}{unit}，右边 {c}{unit}。',
    narr_remove: '两边同时拿走 {b}{unit}，天平仍然平衡。左边剩下 {a} 个盒子，右边剩 {target}{unit}。',
    narr_add: '两边同时加上 {b}{unit}，天平仍然平衡。左边是 {a} 个盒子，右边是 {target}{unit}。',
    narr_asis: '左边就是 {a} 个盒子，右边 {target}{unit}，天平平衡。',
    narr_divide: '把两边平均分成 {a} 份。每 1 个盒子对应 {x}{unit}。',
    narr_result: '所以 x = {target} ÷ {a} = {x}{unit}。',
    beat_initial: '天平平衡', beat_remove: '两边同减', beat_add: '两边同加', beat_asis: '就是这些',
    beat_divide: '平均分份', beat_eq: '写出方程',
    title: '天平分方程', box: '盒子', weight: '砝码', answer: '答案',
  },
  'zh-TW': {
    _keywords: ['天平','平衡','砝码','等式','方程式','未知數','解方程','移項','兩邊','左邊','右邊','盒子','品質','克','千克','等於'],
    narr_initial: '天平是平衡的：左邊 {a} 個盒子 + {b}{unit}，右邊 {c}{unit}。',
    narr_remove: '兩邊同時拿走 {b}{unit}，天平仍然平衡。左邊剩下 {a} 個盒子，右邊剩 {target}{unit}。',
    narr_add: '兩邊同時加上 {b}{unit}，天平仍然平衡。左邊是 {a} 個盒子，右邊是 {target}{unit}。',
    narr_asis: '左邊就是 {a} 個盒子，右邊 {target}{unit}，天平平衡。',
    narr_divide: '把兩邊平均分成 {a} 份。每 1 個盒子對應 {x}{unit}。',
    narr_result: '所以 x = {target} ÷ {a} = {x}{unit}。',
    beat_initial: '天平平衡', beat_remove: '兩邊同減', beat_add: '兩邊同加', beat_asis: '就是這些',
    beat_divide: '平均分份', beat_eq: '寫出方程式',
    title: '天平分方程式', box: '盒子', weight: '砝码', answer: '答案',
  },
  ja: {
    _keywords: ['天秤','平衡','分銅','等式','方程式','未知数','方程式を解く','移項','両辺','左辺','右辺','箱','質量','グラム','キログラム','等しい'],
    narr_initial: '天秤は釣り合っています：左辺に箱 {a} 個と {b}{unit}、右辺に {c}{unit}。',
    narr_remove: '両辺から {b}{unit} を同時に取り去ると、釣り合いは保たれます。左辺は箱 {a} 個、右辺は {target}{unit}。',
    narr_add: '両辺に {b}{unit} を同時に加えると、釣り合いは保たれます。左辺は箱 {a} 個、右辺は {target}{unit}。',
    narr_asis: '左辺は箱 {a} 個、右辺は {target}{unit}で、釣り合っています。',
    narr_divide: '両辺を {a} 等分に分けます。箱 1 個は {x}{unit} に相当します。',
    narr_result: 'よって x = {target} ÷ {a} = {x}{unit}。',
    beat_initial: '釣り合い', beat_remove: '両辺から引く', beat_add: '両辺に足す', beat_asis: 'このまま',
    beat_divide: '等分する', beat_eq: '方程式を書く',
    title: '天秤と方程式', box: '箱', weight: '分銅', answer: '答え',
  },
  ko: {
    _keywords: ['저울','평형','추','등식','방정식','미지수','방정식 풀기','이항','양변','왼쪽','오른쪽','상자','질량','그램','킬로그램','같다'],
    narr_initial: '저울이 평형을 이룹니다: 왼쪽에 상자 {a}개와 {b}{unit}, 오른쪽에 {c}{unit}.',
    narr_remove: '양변에서 {b}{unit}를 동시에 빼도 평형은 유지됩니다. 왼쪽은 상자 {a}개, 오른쪽은 {target}{unit}.',
    narr_add: '양변에 {b}{unit}를 동시에 더해도 평형은 유지됩니다. 왼쪽은 상자 {a}개, 오른쪽은 {target}{unit}.',
    narr_asis: '왼쪽은 상자 {a}개, 오른쪽은 {target}{unit}이며 평형 상태입니다.',
    narr_divide: '양변을 {a}로 똑같이 나눕니다. 상자 1개의 무게는 {x}{unit}.',
    narr_result: '따라서 x = {target} ÷ {a} = {x}{unit}.',
    beat_initial: '평형', beat_remove: '양변에서 빼기', beat_add: '양변에 더하기', beat_asis: '그대로',
    beat_divide: '똑같이 나누기', beat_eq: '방정식 쓰기',
    title: '저울과 방정식', box: '상자', weight: '추', answer: '답',
  },
  fr: {
    _keywords: ['balance','balance romaine','peser','équation','des deux côtés','inconnu','résoudre','égal','poids','masse','boîte','sac','grammes','kilogrammes','côté gauche','côté droit'],
    narr_initial: 'La balance est équilibrée : à gauche, {a} boîtes plus {b}{unit}, à droite, {c}{unit}.',
    narr_remove: 'Retirons {b}{unit} des DEUX côtés ; la balance reste équilibrée. Gauche = {a} boîtes, droite = {target}{unit}.',
    narr_add: 'Ajoutons {b}{unit} des DEUX côtés ; la balance reste équilibrée. Gauche = {a} boîtes, droite = {target}{unit}.',
    narr_asis: 'Gauche = {a} boîtes, droite = {target}{unit} ; la balance est équilibrée.',
    narr_divide: 'Diviser les deux côtés en {a} groupes égaux. Une boîte = {x}{unit}.',
    narr_result: 'Donc x = {target} ÷ {a} = {x}{unit}.',
    beat_initial: 'Équilibrée', beat_remove: 'Retirer des deux', beat_add: 'Ajouter des deux', beat_asis: 'Tel quel',
    beat_divide: 'Partager également', beat_eq: 'Équation',
    title: 'Balance & Équations', box: 'boîte', weight: 'poids', answer: 'Réponse',
  },
  de: {
    _keywords: ['waage','gleichgewicht','gewicht','gleichung','beidseits','unbekannte','auflösen','gleicht','gewichte','masse','kasten','tüte','gramm','kilogramm','linke seite','rechte seite'],
    narr_initial: 'Die Waage ist im Gleichgewicht: links {a} Kisten plus {b}{unit}, rechts {c}{unit}.',
    narr_remove: 'Auf BEIDEN Seiten {b}{unit} wegnehmen; die Waage bleibt im Gleichgewicht. Links = {a} Kisten, rechts = {target}{unit}.',
    narr_add: 'Auf BEIDEN Seiten {b}{unit} dazugeben; die Waage bleibt im Gleichgewicht. Links = {a} Kisten, rechts = {target}{unit}.',
    narr_asis: 'Links = {a} Kisten, rechts = {target}{unit}; die Waage ist im Gleichgewicht.',
    narr_divide: 'Beide Seiten in {a} gleiche Gruppen teilen. Eine Kiste = {x}{unit}.',
    narr_result: 'Also gilt x = {target} ÷ {a} = {x}{unit}.',
    beat_initial: 'Gleichgewicht', beat_remove: 'Beidseits abziehen', beat_add: 'Beidseits dazu', beat_asis: 'So wie ist',
    beat_divide: 'Gleichmäßig teilen', beat_eq: 'Gleichung',
    title: 'Waage & Gleichungen', box: 'Kiste', weight: 'Gewicht', answer: 'Antwort',
  },
  es: {
    _keywords: ['balanza','equilibrio','pesa','ecuación','ambos lados','incógnita','resolver','igual','pesas','masa','caja','bolsa','gramos','kilogramos','lado izquierdo','lado derecho'],
    narr_initial: 'La balanza está equilibrada: a la izquierda, {a} cajas más {b}{unit}; a la derecha, {c}{unit}.',
    narr_remove: 'Quitamos {b}{unit} de AMBOS lados; la balanza sigue equilibrada. Izquierda = {a} cajas, derecha = {target}{unit}.',
    narr_add: 'Añadimos {b}{unit} a AMBOS lados; la balanza sigue equilibrada. Izquierda = {a} cajas, derecha = {target}{unit}.',
    narr_asis: 'Izquierda = {a} cajas, derecha = {target}{unit}; la balanza está equilibrada.',
    narr_divide: 'Repartir ambos lados en {a} grupos iguales. Una caja = {x}{unit}.',
    narr_result: 'Así que x = {target} ÷ {a} = {x}{unit}.',
    beat_initial: 'Equilibrada', beat_remove: 'Restar en ambos', beat_add: 'Sumar en ambos', beat_asis: 'Tal cual',
    beat_divide: 'Repartir igual', beat_eq: 'Ecuación',
    title: 'Balanza y Ecuaciones', box: 'caja', weight: 'pesas', answer: 'Respuesta',
  },
  it: {
    _keywords: ['bilancia','equilibrio','pesi','equazione','entrambi i lati','incognita','risolvere','uguale','pesi','massa','scatola','sacchetto','grammi','chilogrammi','lato sinistro','lato destro'],
    narr_initial: 'La bilancia è in equilibrio: a sinistra {a} scatole più {b}{unit}, a destra {c}{unit}.',
    narr_remove: 'Togliamo {b}{unit} da ENTRAMBI i lati; la bilancia resta in equilibrio. Sinistra = {a} scatole, destra = {target}{unit}.',
    narr_add: 'Aggiungiamo {b}{unit} a ENTRAMBI i lati; la bilancia resta in equilibrio. Sinistra = {a} scatole, destra = {target}{unit}.',
    narr_asis: 'Sinistra = {a} scatole, destra = {target}{unit}; la bilancia è in equilibrio.',
    narr_divide: 'Dividi entrambi i lati in {a} gruppi uguali. Una scatola = {x}{unit}.',
    narr_result: 'Quindi x = {target} ÷ {a} = {x}{unit}.',
    beat_initial: 'Equilibrata', beat_remove: 'Sottrarre da entrambi', beat_add: 'Aggiungere a entrambi', beat_asis: 'Così com’è',
    beat_divide: 'Dividere in parti uguali', beat_eq: 'Equazione',
    title: 'Bilancia e Equazioni', box: 'scatola', weight: 'pesi', answer: 'Risposta',
  },
  ar: {
    _keywords: ['ميزان','اتّزان','أثقال','معادلة','طرفان','المجهول','حل المعادلة','طرف','الطرف الأيسر','الطرف الأيمن','صندوق','كتلة','غرام','كيلوغرام','يتساوى'],
    narr_initial: 'الميزان متوازن: في الطرف الأيسر {a} صناديق و{b}{unit}، وفي الطرف الأيمن {c}{unit}.',
    narr_remove: 'نزيل {b}{unit} من الطرفين معاً فيبقى الميزان متوازناً. الأيسر = {a} صناديق، والأيمن = {target}{unit}.',
    narr_add: 'نضيف {b}{unit} إلى الطرفين معاً فيبقى الميزان متوازناً. الأيسر = {a} صناديق، والأيمن = {target}{unit}.',
    narr_asis: 'الأيسر = {a} صناديق، والأيمن = {target}{unit}، والميزان متوازن.',
    narr_divide: 'نقسم الطرفين إلى {a} مجموعات متساوية. كل صندوق يزن {x}{unit}.',
    narr_result: 'إذن x = {target} ÷ {a} = {x}{unit}.',
    beat_initial: 'متوازن', beat_remove: 'نطرح من الطرفين', beat_add: 'نضيف للطرفين', beat_asis: 'كما هو',
    beat_divide: 'تقسيم بالتساوي', beat_eq: 'المعادلة',
    title: 'الميزان والمعادلات', box: 'صندوق', weight: 'أثقال', answer: 'الإجابة',
  },
  fa: {
    _keywords: ['ترازو','تعادل','وزنه','معادله','دو طرف','مجهول','حل معادله','طرف','طرف چپ','طرف راست','جعبه','جرم','گرم','کیلوگرم','برابر بودن'],
    narr_initial: 'ترازو در تعادل است: در طرف چپ {a} جعبه به‌اضافهٔ {b}{unit}، و در طرف راست {c}{unit}.',
    narr_remove: 'از هر دو طرف {b}{unit} برمی‌داریم؛ ترازو همچنان در تعادل می‌ماند. چپ = {a} جعبه، راست = {target}{unit}.',
    narr_add: 'به هر دو طرف {b}{unit} می‌افزاییم؛ ترازو همچنان در تعادل می‌ماند. چپ = {a} جعبه، راست = {target}{unit}.',
    narr_asis: 'چپ = {a} جعبه، راست = {target}{unit}؛ ترازو در تعادل است.',
    narr_divide: 'هر دو طرف را به {a} گروه مساوی تقسیم می‌کنیم. هر جعبه = {x}{unit}.',
    narr_result: 'پس x = {target} ÷ {a} = {x}{unit}.',
    beat_initial: 'تعادل', beat_remove: 'از دو طرف کم کن', beat_add: 'به دو طرف اضافه کن', beat_asis: 'همین‌طور',
    beat_divide: 'تقسیم مساوی', beat_eq: 'معادله',
    title: 'ترازو و معادلات', box: 'جعبه', weight: 'وزنه', answer: 'پاسخ',
  },
});

module.exports = {
  id: 'balance',
  name: '天平与方程',
  keywords: i18n.keywords('balance'),

  match(problem, opts = {}) {
    const t = String(problem || '').toLowerCase();
    let score = 0;
    if (/(天平|天秤|てんびん|balance|scale|weigh|ميزان|ترازو|저울|waage|balanza|bilancia)/.test(t)) score += 6;
    if (/(方程|方程式|equation|solve for x|risolvi per x|未知数|未知數|مجهول|معادلة|방정식|gleichung|ecuación|equazione)/.test(t)) score += 5;
    if (/(=|＝|等于|يتساوى|برابر|等しい|같다|égale|gleicht|igual|uguale)/.test(t) && /x/i.test(t)) score += 4;
    if (/(两边|兩邊|both sides|طرفين|دو طرف|両辺|양변|des deux|beidseits|ambos lados|entrambi)/.test(t)) score += 3;
    if (/(砝码|分銅|추|weights|pesi|اثقال|وزنه|克|千克|gram|kg\b|g\b)/.test(t)) score += 2;
    if (/(盒子|箱|box|bag|sacchetto|caja|scatola|صندوق|جعبه|袋)/.test(t)) score += 1;
    // 坐标点题目（函数图像）不应路由到天平
    if (/\(\s*-?\d+(?:\.\d+)?\s*[,،，]\s*-?\d+(?:\.\d+)?\s*\)/.test(t)) score -= 8;
    return score;
  },

  extract(problem, opts = {}) {
    const t = String(problem || '');
    const low = t.toLowerCase();

    let a = null, bSigned = 0, c = null;

    // 情况 A：直接给方程，如 "2x + 5 = 17"
    const eqM = t.match(/([^=＝]+)[=＝]([^=＝]+)/);
    if (eqM && /x/i.test(eqM[1] + eqM[2])) {
      const leftHasX = /x/i.test(eqM[1]);
      const sideWithX = leftHasX ? eqM[1] : eqM[2];
      const sidePlain = leftHasX ? eqM[2] : eqM[1];
      const parsed = parseSide(sideWithX);
      a = parsed.a;
      bSigned = parsed.bSigned;
      c = num(sidePlain);
    } else {
      // 情况 B：文字天平题。抓三个数：盒数 a、盘上已知砝码 b、对面砝码 c
      const nums = (t.match(/\d+(?:\.\d+)?/g) || []).map(num).filter(n => n > 0);
      // 检测盒数：数字+盒 或 不定冠词+盒（une boîte / eine Box / una caja = 1 box）或 裸盒名（a box = 1）
      let boxCount = null;
      const boxNumM = t.match(/(\d+(?:\.\d+)?)\s*(?:个|只|盒|bag|box|boîtes?|cajas?|scatole|صناديق|جعبه|개|個)/i);
      if (boxNumM) boxCount = num(boxNumM[1]);
      else if (/(?:une|eine|una|un|une|一個|一个|한|واحدة|one|a)\s*(?:boîte|boite|box|caja|scatola|صندوق|جعبه|상자|箱)/i.test(low)) boxCount = 1;
      else if (/(?:صندوق|جعبه|boîte|boite|box|caja|scatola|상자|箱|盒)/.test(low) && nums.length === 2) boxCount = 1;
      if (/(天平|天秤|てんびん|balance|scale|ميزان|ترازو|저울|waage|balanza|bilancia)/.test(low) && nums.length >= 2) {
        a = boxCount != null ? boxCount : nums[0];
        // 从 nums 中移除盒数（如果它是一个数字），剩下的是砝码重量
        let weights = nums.slice();
        if (boxCount != null && weights.includes(boxCount)) {
          weights.splice(weights.indexOf(boxCount), 1);
        }
        // weights 应包含 [左边已知砝码, 右边总砝码]
        if (weights.length >= 2) {
          // 较大的是对面砝码 c，较小的是盘上砝码 b
          const sorted = weights.slice().sort((x, y) => x - y);
          c = sorted[sorted.length - 1];
          bSigned = sorted.length >= 2 ? sorted[0] : 0;
        } else {
          c = weights[weights.length - 1];
          bSigned = weights.length >= 2 ? weights[weights.length - 2] : 0;
        }
      } else {
        return null;
      }
    }

    if (!Number.isFinite(a) || !Number.isFinite(c)) return null;
    a = Math.round(a);
    if (a <= 0) return null;
    if (c <= 0) return null;

    const unit = (t.match(/(千克|kg|公斤|kilogramme|kilogram|kg)/i)) ? 'kg' : ((t.match(/(克|g\b|gramme|gram|g)\b/i)) ? 'g' : '');
    const target = c - bSigned; // a*x = target
    if (target <= 0) return null; // 儿童题不取非正解

    const confidence = eqM && /x/i.test(t) ? 0.92 : (/(天平|balance|scale|ميزان|ترازو)/.test(low) ? 0.7 : 0.4);
    return { a, bSigned, c, target, unit, confidence, raw: t };
  },

  solve(params, opts = {}) {
    const lang = i18n.langOf(opts);
    const T = (key, vars) => i18n.t('balance', lang, key, vars);
    const { a, bSigned, c, target, unit } = params;
    const x = target / a;
    const steps = [];

    steps.push({
      narration: T('narr_initial', { a, b: bSigned, c, unit }),
      visualHint: 'balance_initial',
    });
    if (bSigned !== 0) {
      steps.push({
        narration: bSigned > 0
          ? T('narr_remove', { b: bSigned, a, target, unit })
          : T('narr_add', { b: -bSigned, a, target, unit }),
        visualHint: 'balance_sync',
      });
    } else {
      steps.push({
        narration: T('narr_asis', { a, target, unit }),
        visualHint: 'balance_sync',
      });
    }
    steps.push({
      narration: T('narr_divide', { a, x, unit }),
      visualHint: 'balance_divide',
    });
    steps.push({
      narration: T('narr_result', { target, a, x, unit }),
      visualHint: 'abstract_equation',
    });

    return {
      answer: String(x),
      steps, a, bSigned, c, target, x, unit,
      equation: `${a}x ${bSigned >= 0 ? '+' : '−'} ${Math.abs(bSigned)} = ${c}`,
    };
  },

  validate(params, solved, opts = {}) {
    if (!solved || !solved.answer) return { ok: false, reason: 'no_answer' };
    if (!(params.a > 0)) return { ok: false, reason: 'coef_not_positive' };
    const x = (params.c - params.bSigned) / params.a;
    if (Math.abs(x - solved.x) > 1e-9) return { ok: false, reason: 'solve_mismatch' };
    if (Math.abs(Number(solved.answer) - x) > 1e-9) return { ok: false, reason: 'answer_mismatch' };
    if (!Number.isInteger(x)) return { ok: false, reason: 'non_integer_solution' };
    if (!solved.steps || solved.steps.length < 3) return { ok: false, reason: 'steps_too_short' };
    return { ok: true };
  },

  renderParams(solved, opts = {}) {
    const lang = i18n.langOf(opts);
    const T = (key, vars) => i18n.t('balance', lang, key, vars);
    const { a, bSigned, c, target, x, unit } = solved;

    const beats = [
      { id: 'initial', duration: 5000, label: T('beat_initial') },
      { id: 'sync', duration: 5000, label: bSigned === 0 ? T('beat_asis') : (bSigned > 0 ? T('beat_remove') : T('beat_add')) },
      { id: 'divide', duration: 5000, label: T('beat_divide') },
      { id: 'abstract', duration: 5000, label: T('beat_eq') },
    ];

    return {
      type: 'balance',
      rtl: i18n.isRTL(lang),
      language: lang,
      a, bSigned, c, target, x, unit,
      equation: solved.equation,
      answer: String(x),
      beats,
      scenes: [
        { type: 'balance_scale', a, bSigned, c },
        { type: 'balance_sync', a, bSigned, target },
        { type: 'balance_divide', a, each: x },
        { type: 'equation_steps', a, bSigned, c, target, x },
      ],
      i18n: {
        title: T('title'),
        box: T('box'),
        weight: T('weight'),
        answer: T('answer'),
      },
    };
  },
};
