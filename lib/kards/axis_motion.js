// lib/kards/axis_motion.js — 轴线运动族知识卡（11 语种完整版）
// 承载：爬井、升降、弹跳、往返、水位变化等沿单一轴运动的题目
// CPA：具象(动物/物体) → 图示(轴线+刻度) → 抽象(数字算式)
'use strict';
const i18n = require('./i18n');

i18n.register('axis_motion', {
  en: {
    _keywords: ['well','climb','slip','rise','fall','bounce','up and down','elevator','floor','water level','crawls out','slipped back','day','night','snail in well','frog in well'],
    day: 'Day', night: 'Night', done: 'Done!',
    label_day: 'Day +{val}{unit}', label_night: 'Night -{val}{unit}',
    narr_first_top: 'On day 1 it climbs {up}{unit} and already reaches the top!',
    narr_day_climb: 'On day {day}, climb {up}{unit} from {from}{unit} to {to}{unit}.',
    narr_night_slip: 'On night {day}, slip {down}{unit} from {from}{unit}, stopping at {to}{unit}.',
    narr_escape: 'On day {day} it climbs out of the well! Total: {day} days.',
    answer_days: '{day} days',
    unit_m: 'm',
  },
  'zh-CN': {
    _keywords: ['爬井','井','爬','滑','升降','上升','下降','弹跳','跳','往返','来回','水位','水面','电梯','楼层','爬上','滑下','白天','晚上','蜗牛爬井','青蛙爬井'],
    day: '白天', night: '晚上', done: '完成！',
    label_day: '白天 +{val}{unit}', label_night: '晚上 -{val}{unit}',
    narr_first_top: '第一天白天爬 {up}{unit}，已经到达井口！',
    narr_day_climb: '第{day}天白天，从 {from}{unit} 向上爬 {up}{unit}，到达 {to}{unit}',
    narr_night_slip: '第{day}天晚上，从 {from}{unit} 滑下 {down}{unit}，停在 {to}{unit}',
    narr_escape: '第{day}天白天爬到了井口，成功爬出！共用了 {day} 天',
    answer_days: '{day} 天',
    unit_m: '米',
  },
  'zh-TW': {
    _keywords: ['爬井','井','爬','滑','升降','上升','下降','彈跳','跳','往返','來回','水位','水面','電梯','樓層','爬上','滑下','白天','晚上','蝸牛爬井','青蛙爬井'],
    day: '白天', night: '晚上', done: '完成！',
    label_day: '白天 +{val}{unit}', label_night: '晚上 -{val}{unit}',
    narr_first_top: '第一天白天爬 {up}{unit}，已經到達井口！',
    narr_day_climb: '第{day}天白天，從 {from}{unit} 向上爬 {up}{unit}，到達 {to}{unit}',
    narr_night_slip: '第{day}天晚上，從 {from}{unit} 滑下 {down}{unit}，停在 {to}{unit}',
    narr_escape: '第{day}天白天爬到了井口，成功爬出！共用了 {day} 天',
    answer_days: '{day} 天',
    unit_m: '公尺',
  },
  ja: {
    _keywords: ['井戸','登る','滑る','昇降','上昇','下降','跳ねる','跳ぶ','往復','水位','水面','エレベーター','階','階層','登り','滑り落ちる','昼','夜','カタツムリ','カエル'],
    day: '昼', night: '夜', done: '完了！',
    label_day: '昼 +{val}{unit}', label_night: '夜 -{val}{unit}',
    narr_first_top: '1日目の昼に {up}{unit} 登り、すでに頂上に到着！',
    narr_day_climb: '{day}日目の昼、{from}{unit} から {up}{unit} 登り、{to}{unit} に到達。',
    narr_night_slip: '{day}日目の夜、{from}{unit} から {down}{unit} 滑り落ち、{to}{unit} で停止。',
    narr_escape: '{day}日目の昼に井戸から脱出！合計 {day} 日。',
    answer_days: '{day} 日',
    unit_m: 'm',
  },
  ko: {
    _keywords: ['우물','오르다','미끄러지다','오르내리다','상승','하강','튀다','점프','왕복','수위','수면','엘리베이터','층','올라가다','미끄러져 내려가다','낮','밤','달팽이','개구리'],
    day: '낮', night: '밤', done: '완료!',
    label_day: '낮 +{val}{unit}', label_night: '밤 -{val}{unit}',
    narr_first_top: '첫째 날 낮에 {up}{unit} 올라가 이미 우물 밖에 도착!',
    narr_day_climb: '{day}일째 낮, {from}{unit}에서 {up}{unit} 올라가 {to}{unit}에 도착.',
    narr_night_slip: '{day}일째 밤, {from}{unit}에서 {down}{unit} 미끄러져 {to}{unit}에서 멈춤.',
    narr_escape: '{day}일째 낮에 우물에서 탈출! 총 {day}일.',
    answer_days: '{day} 일',
    unit_m: 'm',
  },
  fr: {
    _keywords: ['puits','grimper','glisser','montée','descente','rebond','saut','aller-retour','niveau d\'eau','ascenseur','étage','escalade','tomber','jour','nuit','escargot','grenouille'],
    day: 'Jour', night: 'Nuit', done: 'Terminé !',
    label_day: 'Jour +{val}{unit}', label_night: 'Nuit -{val}{unit}',
    narr_first_top: 'Le jour 1, il grimpe de {up}{unit} et atteint déjà le haut !',
    narr_day_climb: 'Jour {day}, monter de {up}{unit} de {from}{unit} à {to}{unit}.',
    narr_night_slip: 'Nuit {day}, glisser de {down}{unit} de {from}{unit}, s\'arrêter à {to}{unit}.',
    narr_escape: 'Le jour {day}, il sort du puits ! Total : {day} jours.',
    answer_days: '{day} jours',
    unit_m: 'm',
  },
  de: {
    _keywords: ['brunnen','klettern','rutschen','aufstieg','abstieg','springen','hin und her','wasserstand','aufzug','etage','hochklettern','hinunterrutschen','tag','nacht','schnecke','frosch'],
    day: 'Tag', night: 'Nacht', done: 'Fertig!',
    label_day: 'Tag +{val}{unit}', label_night: 'Nacht -{val}{unit}',
    narr_first_top: 'Am Tag 1 klettert es {up}{unit} und erreicht schon den Rand!',
    narr_day_climb: 'Tag {day}: von {from}{unit} um {up}{unit} hochklettern, erreicht {to}{unit}.',
    narr_night_slip: 'Nacht {day}: um {down}{unit} hinunterrutschen von {from}{unit}, hält bei {to}{unit}.',
    narr_escape: 'Am Tag {day} klettert es aus dem Brunnen! Gesamt: {day} Tage.',
    answer_days: '{day} Tage',
    unit_m: 'm',
  },
  es: {
    _keywords: ['pozo','subir','resbalar','subida','bajada','rebote','salto','ida y vuelta','nivel del agua','ascensor','piso','escalar','caer','día','noche','caracol','rana'],
    day: 'Día', night: 'Noche', done: '¡Listo!',
    label_day: 'Día +{val}{unit}', label_night: 'Noche -{val}{unit}',
    narr_first_top: '¡El día 1 sube {up}{unit} y ya llega arriba!',
    narr_day_climb: 'Día {day}: subir {up}{unit} de {from}{unit} a {to}{unit}.',
    narr_night_slip: 'Noche {day}: resbalar {down}{unit} de {from}{unit}, se detiene en {to}{unit}.',
    narr_escape: '¡El día {day} sale del pozo! Total: {day} días.',
    answer_days: '{day} días',
    unit_m: 'm',
  },
  it: {
    _keywords: ['pozzo','arrampicarsi','scivolare','salita','discesa','rimbalzo','salto','andata e ritorno','livello dell\'acqua','ascensore','piano','scalare','cadere','giorno','notte','lumaca','rana'],
    day: 'Giorno', night: 'Notte', done: 'Fatto!',
    label_day: 'Giorno +{val}{unit}', label_night: 'Notte -{val}{unit}',
    narr_first_top: 'Il giorno 1 si arrampica di {up}{unit} e raggiunge già la cima!',
    narr_day_climb: 'Giorno {day}: salire di {up}{unit} da {from}{unit} a {to}{unit}.',
    narr_night_slip: 'Notte {day}: scivolare di {down}{unit} da {from}{unit}, si ferma a {to}{unit}.',
    narr_escape: 'Il giorno {day} esce dal pozzo! Totale: {day} giorni.',
    answer_days: '{day} giorni',
    unit_m: 'm',
  },
  ar: {
    _keywords: ['بئر','تسلق','ينزلق','صعود','هبوط','ارتداد','قفز','ذهاب وعودة','مستوى الماء','مصعد','طابق','يتسلق','يسقط','نهار','ليل','حلزون','ضفدع','قاع البئر','فوهة البئر'],
    day: 'نهار', night: 'ليل', done: 'تم!',
    label_day: 'نهار +{val}{unit}', label_night: 'ليل -{val}{unit}',
    narr_first_top: 'في اليوم الأول، يتسلق {up}{unit} ويصل إلى الفوهة بالفعل!',
    narr_day_climb: 'نهار اليوم {day}: يتسلق {up}{unit} من {from}{unit} إلى {to}{unit}.',
    narr_night_slip: 'ليل اليوم {day}: ينزلق {down}{unit} من {from}{unit}، ويتوقف عند {to}{unit}.',
    narr_escape: 'في نهار اليوم {day} يخرج من البئر! الإجمالي: {day} أيام.',
    answer_days: '{day} أيام',
    unit_m: 'م',
  },
  fa: {
    _keywords: ['چاه','بالا رفتن','لغزیدن','صعود','فرود','پرش','جهش','رفت و برگشت','سطح آب','آسانسور','طبقه','صعود کردن','افتادن','روز','شب','حلزون','قورباغه','ته چاه','دهانه چاه'],
    day: 'روز', night: 'شب', done: 'تمام شد!',
    label_day: 'روز +{val}{unit}', label_night: 'شب -{val}{unit}',
    narr_first_top: 'در روز اول، {up}{unit} بالا می‌رود و از قبل به دهانه می‌رسد!',
    narr_day_climb: 'روز {day}: از {from}{unit} به اندازه {up}{unit} بالا می‌رود و به {to}{unit} می‌رسد.',
    narr_night_slip: 'شب {day}: از {from}{unit} به اندازه {down}{unit} لغزیده و در {to}{unit} متوقف می‌شود.',
    narr_escape: 'در روز {day} از چاه بیرون می‌رود! مجموع: {day} روز.',
    answer_days: '{day} روز',
    unit_m: 'متر',
  },
});

module.exports = {
  id: 'axis_motion',
  name: '轴线运动',
  keywords: i18n.keywords('axis_motion'),

  match(problem, opts = {}) {
    const t = String(problem || '').toLowerCase();
    let score = 0;
    // 多语种强信号：井 + 爬
    if (/(井|well|بئر|چاه|井戸|우물|puits|brunnen|pozo|pozzo)/.test(t) && /(爬|climb|تسلق|بالا رفتن|登る|오르다|grimper|kletter|subir|arrampic)/.test(t)) score += 5;
    if (/(滑|slip|fall|drop|ينزلق|لغزیدن|滑る|미끄러지다|glisser|rutsch|resbalar|scivol)/.test(t)) score += 3;
    if (/(白天|晚上|day|night|نهار|ليل|روز|شب|昼|夜|낮|밤|jour|nuit|tag|nacht|día|noche|giorno|notte)/.test(t) && /(井|well|بئر|چاه|井戸|우물|puits|brunnen|pozo|pozzo)/.test(t)) score += 3;
    if (/(电梯|elevator|مصعد|آسانسور|エレベーター|엘리베이터|ascenseur|aufzug|ascensor|ascensore|楼层|floor|طابق|طبقه|階|층|étage|etage|piso|piano)/.test(t)) score += 4;
    if (/(水位|水面|water level|مستوى الماء|سطح آب|水位|수위|niveau d'eau|wasserstand|nivel del agua|livello dell'acqua)/.test(t)) score += 4;
    if (/(弹跳|bounce|ارتداد|پرش|跳ねる|튀다|rebond|springen|rebote|rimbalzo|弹起)/.test(t)) score += 3;
    return score;
  },

  // 从题目抽参：深度、白天上升、晚上下滑、单位、演员类型
  extract(problem, opts = {}) {
    const t = String(problem || '');
    const nums = (t.match(/\d+(\.\d+)?/g) || []).map(Number);
    if (nums.length < 2) return null;

    // 多语种爬井模式：井深 N 米，白天爬 A，晚上滑 B
    const wellMatch = t.match(/(?:井深|深|深度|井|well|بئر|چاه|井戸|우물|puits|brunnen|pozo|pozzo)\s*(\d+(?:\.\d+)?)\s*(米|m|公尺|م|متر|メートル|미터|mètres?|metern?|metros?|metri)?/i);
    const upMatch = t.match(/(?:白天|每天|每天白天|向上|上升|爬|climb|rise|يتسلق|بالا می‌رود|登る|올라가다|monter|kletter|subir|sale|arrampica)\s*(?:上升|爬|升|up)?\s*(\d+(?:\.\d+)?)\s*(米|m|公尺|م|متر|メートル|미터|mètres?|metern?|metros?|metri)?/i);
    const downMatch = t.match(/(?:晚上|夜里|夜间|夜晚|下滑|滑下|下降|掉|滑|slip|fall|drop|ينزلق|لغزیدن|滑る|미끄러지다|glisser|rutsch|resbala|scivola)\s*(?:下滑|滑下|下降|掉|滑|down)?\s*(\d+(?:\.\d+)?)\s*(米|m|公尺|م|متر|メートル|미터|mètres?|metern?|metros?|metri)?/i);

    let depth, up, down;
    if (wellMatch && upMatch) {
      depth = parseFloat(wellMatch[1]);
      up = parseFloat(upMatch[1]);
      down = downMatch ? parseFloat(downMatch[1]) : 0;
    } else if (nums.length >= 3) {
      [depth, up, down] = nums;
    } else if (nums.length === 2) {
      [depth, up] = nums; down = 0;
    } else {
      return null;
    }

    // 识别演员（多语种）
    let actorType = 'frog';
    if (/(青蛙|蛙|frog|ضفدع|قورباغه|カエル|개구리|grenouille|frosch|rana)/i.test(t)) actorType = 'frog';
    else if (/(蜗牛|snail|حلزون|حلزون|カタツムリ|달팽이|escargot|schnecke|caracol|lumaca)/i.test(t)) actorType = 'turtle';
    else if (/(蚂蚁|ant|نمل|مورچه|アリ|개미|fourmi|ameise|hormiga|formica)/i.test(t)) actorType = '🐜';
    else if (/(蜘蛛|spider|عنكبوت|عنکبوت|クモ|거미|araignée|spinne|araña|ragno)/i.test(t)) actorType = '🕷️';
    else if (/(电梯|elevator|مصعد|آسانسور|エレベーター|엘리베이터|ascenseur|aufzug|ascensor|ascensore)/i.test(t)) actorType = '🛗';
    else if (/(球|ball|كرة|توپ|ボール|공|balle|ball|pelota|palla)/i.test(t)) actorType = 'ball';

    const unit = (wellMatch && wellMatch[2]) || i18n.t('axis_motion', i18n.langOf(opts), 'unit_m');
    const confidence = (wellMatch && upMatch) ? 0.9 : (nums.length >= 3 ? 0.6 : 0.4);

    return { depth, up, down, unit, actorType, confidence, raw: t };
  },

  // 确定性求解：爬井问题（旁白全语种本地化）
  solve(params, opts = {}) {
    const { depth, up, down, unit } = params;
    const lang = i18n.langOf(opts);
    const steps = [];
    const phases = [];

    if (up >= depth) {
      steps.push({ narration: i18n.t('axis_motion', lang, 'narr_first_top', { up, unit }), visualHint: 'climb_to_top' });
      phases.push({ from: 0, to: Math.min(up, depth), type: 'day', label: i18n.t('axis_motion', lang, 'label_day', { val: up, unit }) });
      return { answer: i18n.t('axis_motion', lang, 'answer_days', { day: 1 }), steps, phases, depth, up, down, unit };
    }

    // 安全 guard：净上升 <= 0 时永远爬不出
    if (up - down <= 0) return null;

    let pos = 0;
    let day = 0;
    const netPerDay = up - down;
    const maxDays = Math.ceil(depth / netPerDay) + 2;

    while (pos < depth && day < maxDays) {
      day++;
      const dayStart = pos;
      pos += up;
      phases.push({ from: dayStart, to: Math.min(pos, depth), type: 'day', label: i18n.t('axis_motion', lang, 'label_day', { val: up, unit }) });
      steps.push({
        narration: i18n.t('axis_motion', lang, 'narr_day_climb', { day, up, unit, from: dayStart.toFixed(1), to: Math.min(pos, depth).toFixed(1) }),
        visualHint: 'climb_up',
      });
      if (pos >= depth) break;
      const nightStart = pos;
      pos -= down;
      phases.push({ from: nightStart, to: pos, type: 'night', label: i18n.t('axis_motion', lang, 'label_night', { val: down, unit }) });
      steps.push({
        narration: i18n.t('axis_motion', lang, 'narr_night_slip', { day, down, unit, from: nightStart.toFixed(1), to: pos.toFixed(1) }),
        visualHint: 'slip_down',
      });
    }

    if (day >= maxDays && pos < depth) return null;

    steps.push({
      narration: i18n.t('axis_motion', lang, 'narr_escape', { day }),
      visualHint: 'escape',
    });

    return { answer: i18n.t('axis_motion', lang, 'answer_days', { day }), steps, phases, depth, up, down, unit, days: day };
  },

  // 校验
  validate(params, solved, opts = {}) {
    if (!solved.answer) return { ok: false, reason: 'no_answer' };
    if (!solved.phases || solved.phases.length === 0) return { ok: false, reason: 'no_phases' };
    const lastPhase = solved.phases[solved.phases.length - 1];
    if (lastPhase.to < params.depth - 0.01) return { ok: false, reason: 'never_reaches_top' };
    return { ok: true };
  },

  // 渲染参数
  renderParams(solved, opts = {}) {
    const lang = i18n.langOf(opts);
    return {
      type: 'axis_motion',
      rtl: i18n.isRTL(lang),
      language: lang,
      scene: { wellDepth: solved.depth, unit: solved.unit },
      actor: { type: 'frog', emoji: '🐸' },
      phases: solved.phases.map((p) => ({
        from: p.from, to: p.to, type: p.type,
        label: p.type === 'day'
          ? i18n.t('axis_motion', lang, 'label_day', { val: solved.up, unit: solved.unit })
          : i18n.t('axis_motion', lang, 'label_night', { val: solved.down, unit: solved.unit }),
      })),
      answer: solved.answer,
      beats: solved.phases.map((p, i) => ({ id: `phase_${i}`, duration: 2500, label: p.label })),
      scenes: [
        { type: 'wellclimb', phases: solved.phases },
        { type: 'equation', text: `(${solved.depth} - ${solved.up}) ÷ (${solved.up} - ${solved.down}) + 1 = ${solved.days}` },
      ],
    };
  },
};
