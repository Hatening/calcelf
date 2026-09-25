// lib/kards/motion.js — 行程族知识卡（11 语种完整版）
// 承载：相向相遇、同向追及、背向相离（环形跑道为相遇的特例）
// CPA：具象(两车/两人在道路上) → 图示(带刻度轨道+速度标注+相遇点) → 抽象(路程=速度×时间)
'use strict';
const i18n = require('./i18n');

i18n.register('motion', {
  en: {
    _keywords: ['meet','toward each','towards each','opposite','chase','catch up','same direction','back-to-back','walk away','apart','distance','per hour','per minute','circular track','two cars','start at the same time','speed'],
    unit_km: 'km', unit_m: 'm',
    time_hour: 'h', time_min: 'min', time_sec: 's',
    narr_meet_start: 'Two objects are {d} {unit} apart and head toward each other at the same time.',
    narr_meet_rel: 'Moving toward each other, they close {rel} {unit} every {timeUnit} ({vA} + {vB}).',
    narr_meet_eq: 'Meeting time = distance ÷ combined speed = {d} ÷ {rel} = {t} {timeUnit}.',
    answer_time: '{t} {timeUnit}',
    narr_chase_start: 'The slower one is {gap} {unit} ahead; the faster one chases in the same direction.',
    narr_chase_rel: 'Chasing in the same direction, the gap shrinks by {rel} {unit} every {timeUnit} ({fast} − {slow}).',
    narr_chase_eq: 'Catch-up time = gap ÷ speed difference = {gap} ÷ {rel} = {t} {timeUnit}.',
    narr_away_start: 'Two people leave the same point at the same time, walking away in opposite directions.',
    narr_away_rel: 'Walking away, the distance grows by {rel} {unit} every {timeUnit} ({vA} + {vB}).',
    narr_away_eq: 'After {tt} {timeUnit}, distance = ({vA} + {vB}) × {tt} = {dist} {unit}.',
    answer_dist: '{dist} {unit}',
    scene_meet: 'Driving toward each other', scene_chase: 'Catching up', scene_away: 'Back-to-back',
    beat_start: 'Start at the same time', beat_move: 'Moving', beat_meetpt: 'Meeting point', beat_eq: 'Equation',
    meet_pt: 'Meeting point', speed: '{v} {unit}/{timeUnit}',
  },
  'zh-CN': {
    _keywords: ['相遇','相向','相对而行','相背','背向','追及','追上','追赶','同向','两地','相距','同时出发','千米','每小时','每分钟','环形','跑道','先出发','领先'],
    unit_km: '千米', unit_m: '米',
    time_hour: '小时', time_min: '分钟', time_sec: '秒',
    narr_meet_start: '两车相距 {d}{unit}，同时相向而行。',
    narr_meet_rel: '相向而行，每{timeUnit}靠近 {vA}＋{vB}＝{rel}{unit}。',
    narr_meet_eq: '相遇时间 = 总距离 ÷ 速度和 = {d} ÷ {rel} = {t} {timeUnit}。',
    answer_time: '{t} {timeUnit}',
    narr_chase_start: '慢者在前面 {gap}{unit}，快者同向追赶。',
    narr_chase_rel: '同向追及，每{timeUnit}缩短 {fast}－{slow}＝{rel}{unit}。',
    narr_chase_eq: '追上时间 = 距离差 ÷ 速度差 = {gap} ÷ {rel} = {t} {timeUnit}。',
    narr_away_start: '两人从同一点同时背向而行，朝相反方向离开。',
    narr_away_rel: '背向而行，每{timeUnit}拉开 {vA}＋{vB}＝{rel}{unit}。',
    narr_away_eq: '{tt}{timeUnit}后相距 =（{vA}＋{vB}）×{tt} = {dist} {unit}。',
    answer_dist: '{dist} {unit}',
    scene_meet: '相向而行相遇', scene_chase: '同向追及', scene_away: '背向而行',
    beat_start: '同时出发', beat_move: '行进', beat_meetpt: '相遇点', beat_eq: '算式',
    meet_pt: '相遇点', speed: '{v}{unit}/{timeUnit}',
  },
  'zh-TW': {
    _keywords: ['相遇','相向','相對而行','相背','背向','追及','追上','追趕','同向','兩地','相距','同時出發','千米','每小時','每分鐘','環形','跑道','先出發','領先'],
    unit_km: '公里', unit_m: '公尺',
    time_hour: '小時', time_min: '分鐘', time_sec: '秒',
    narr_meet_start: '兩車相距 {d}{unit}，同時相向而行。',
    narr_meet_rel: '相向而行，每{timeUnit}靠近 {vA}＋{vB}＝{rel}{unit}。',
    narr_meet_eq: '相遇時間 = 總距離 ÷ 速度和 = {d} ÷ {rel} = {t} {timeUnit}。',
    answer_time: '{t} {timeUnit}',
    narr_chase_start: '慢者在前面 {gap}{unit}，快者同向追趕。',
    narr_chase_rel: '同向追及，每{timeUnit}縮短 {fast}－{slow}＝{rel}{unit}。',
    narr_chase_eq: '追上時間 = 距離差 ÷ 速度差 = {gap} ÷ {rel} = {t} {timeUnit}。',
    narr_away_start: '兩人從同一點同時背向而行，朝相反方向離開。',
    narr_away_rel: '背向而行，每{timeUnit}拉開 {vA}＋{vB}＝{rel}{unit}。',
    narr_away_eq: '{tt}{timeUnit}後相距 =（{vA}＋{vB}）×{tt} = {dist} {unit}。',
    answer_dist: '{dist} {unit}',
    scene_meet: '相向而行相遇', scene_chase: '同向追及', scene_away: '背向而行',
    beat_start: '同時出發', beat_move: '行進', beat_meetpt: '相遇點', beat_eq: '算式',
    meet_pt: '相遇點', speed: '{v}{unit}/{timeUnit}',
  },
  ja: {
    _keywords: ['出会う','向かい合う','追いかける','追いつく','追跡','同じ方向','背中合わせ','離れる','距離','時速','分速','円形トラック','同時に出発','速さ','二人','車'],
    unit_km: 'km', unit_m: 'm',
    time_hour: '時間', time_min: '分', time_sec: '秒',
    narr_meet_start: '2人は {d}{unit} 離れた地点から同時に向かい合って進みます。',
    narr_meet_rel: '向かい合って進むと、{timeUnit} ごとに {vA}＋{vB}＝{rel}{unit} ずつ近づきます。',
    narr_meet_eq: '出会う時間 = 距離 ÷ 速さの和 = {d} ÷ {rel} = {t} {timeUnit}。',
    answer_time: '{t} {timeUnit}',
    narr_chase_start: '遅い人が {gap}{unit} 先にいて、速い人が同じ方向に追いかけます。',
    narr_chase_rel: '同じ方向に追いかけると、{timeUnit} ごとに {fast}－{slow}＝{rel}{unit} ずつ縮まります。',
    narr_chase_eq: '追いつく時間 = 距離 ÷ 速さの差 = {gap} ÷ {rel} = {t} {timeUnit}。',
    narr_away_start: '2人が同じ地点から同時に、反対方向へ離れて進みます。',
    narr_away_rel: '反対方向へ進むと、{timeUnit} ごとに {vA}＋{vB}＝{rel}{unit} ずつ離れます。',
    narr_away_eq: '{tt}{timeUnit}後の距離 =（{vA}＋{vB}）×{tt} = {dist} {unit}。',
    answer_dist: '{dist} {unit}',
    scene_meet: '向かい合って出会う', scene_chase: '追いかける', scene_away: '背中合わせ',
    beat_start: '同時に出発', beat_move: '進む', beat_meetpt: '出会う地点', beat_eq: '計算式',
    meet_pt: '出会う地点', speed: '{v}{unit}/{timeUnit}',
  },
  ko: {
    _keywords: ['만나다','마주 보고','마주치다','추격','따라잡다','쫓다','같은 방향','등을 지다','떨어져','거리','시속','분속','원형 트랙','동시 출발','속도','두 사람','자동차'],
    unit_km: 'km', unit_m: 'm',
    time_hour: '시간', time_min: '분', time_sec: '초',
    narr_meet_start: '두 사람은 {d}{unit} 떨어진 곳에서 동시에 마주 보고 걸어갑니다.',
    narr_meet_rel: '마주 보고 가면 {timeUnit}마다 {vA}＋{vB}＝{rel}{unit}씩 가까워집니다.',
    narr_meet_eq: '만나는 시간 = 거리 ÷ 속도의 합 = {d} ÷ {rel} = {t} {timeUnit}.',
    answer_time: '{t} {timeUnit}',
    narr_chase_start: '느린 사람이 {gap}{unit} 앞에 있고, 빠른 사람이 같은 방향으로 추격합니다.',
    narr_chase_rel: '같은 방향으로 추격하면 {timeUnit}마다 {fast}－{slow}＝{rel}{unit}씩 좁혀집니다.',
    narr_chase_eq: '따라잡는 시간 = 거리 ÷ 속도의 차 = {gap} ÷ {rel} = {t} {timeUnit}.',
    narr_away_start: '두 사람이 같은 지점에서 동시에 반대 방향으로 걸어갑니다.',
    narr_away_rel: '반대 방향으로 가면 {timeUnit}마다 {vA}＋{vB}＝{rel}{unit}씩 멀어집니다.',
    narr_away_eq: '{tt}{timeUnit} 후 거리 =（{vA}＋{vB}）×{tt} = {dist} {unit}.',
    answer_dist: '{dist} {unit}',
    scene_meet: '마주 보고 만나기', scene_chase: '따라잡기', scene_away: '등지고 걷기',
    beat_start: '동시 출발', beat_move: '이동', beat_meetpt: '만나는 지점', beat_eq: '계산식',
    meet_pt: '만나는 지점', speed: '{v}{unit}/{timeUnit}',
  },
  fr: {
    _keywords: ['rencontrer','se rencontrer','face à face','poursuivre','rattraper','même direction','dos à dos','séloigner','distance','par heure','par minute','piste circulaire','départ en même temps','vitesse','deux voitures'],
    unit_km: 'km', unit_m: 'm',
    time_hour: 'h', time_min: 'min', time_sec: 's',
    narr_meet_start: 'Deux objets sont distants de {d} {unit} et se dirigent l\'un vers l\'autre en même temps.',
    narr_meet_rel: 'En se faisant face, ils se rapprochent de {rel} {unit} toutes les {timeUnit} ({vA} + {vB}).',
    narr_meet_eq: 'Temps de rencontre = distance ÷ vitesse totale = {d} ÷ {rel} = {t} {timeUnit}.',
    answer_time: '{t} {timeUnit}',
    narr_chase_start: 'Le plus lent est précédé de {gap} {unit} ; le plus rapide le poursuit dans la même direction.',
    narr_chase_rel: 'Poursuivant dans le même sens, l\'écart diminue de {rel} {unit} toutes les {timeUnit} ({fast} − {slow}).',
    narr_chase_eq: 'Temps de rattrapage = écart ÷ différence de vitesse = {gap} ÷ {rel} = {t} {timeUnit}.',
    narr_away_start: 'Deux personnes partent du même point en même temps, en s\'éloignant en sens opposé.',
    narr_away_rel: 'En s\'éloignant, la distance grandit de {rel} {unit} toutes les {timeUnit} ({vA} + {vB}).',
    narr_away_eq: 'Après {tt} {timeUnit}, distance = ({vA} + {vB}) × {tt} = {dist} {unit}.',
    answer_dist: '{dist} {unit}',
    scene_meet: 'Se font face', scene_chase: 'Rattrapage', scene_away: 'Dos à dos',
    beat_start: 'Départ en même temps', beat_move: 'En mouvement', beat_meetpt: 'Point de rencontre', beat_eq: 'Équation',
    meet_pt: 'Point de rencontre', speed: '{v} {unit}/{timeUnit}',
  },
  de: {
    _keywords: ['treffen','aufeinander zu','begegnen','verfolgen','einholen','gleiche richtung','rücken an rücken','entfernen','entfernung','pro stunde','pro minute','kreisförmige strecke','gleichzeitig starten','geschwindigkeit','zwei autos'],
    unit_km: 'km', unit_m: 'm',
    time_hour: 'h', time_min: 'min', time_sec: 's',
    narr_meet_start: 'Zwei Orte sind {d} {unit} voneinander entfernt und fahren gleichzeitig aufeinander zu.',
    narr_meet_rel: 'Aufeinander zu fahrend verringert sich der Abstand um {rel} {unit} pro {timeUnit} ({vA} + {vB}).',
    narr_meet_eq: 'Treffzeit = Entfernung ÷ Gesamtgeschwindigkeit = {d} ÷ {rel} = {t} {timeUnit}.',
    answer_time: '{t} {timeUnit}',
    narr_chase_start: 'Der Langsamere ist {gap} {unit} voraus; der Schnellere verfolgt ihn in gleicher Richtung.',
    narr_chase_rel: 'In gleicher Richtung verfolgend schrumpft der Abstand um {rel} {unit} pro {timeUnit} ({fast} − {slow}).',
    narr_chase_eq: 'Einholzeit = Abstand ÷ Geschwindigkeitsdifferenz = {gap} ÷ {rel} = {t} {timeUnit}.',
    narr_away_start: 'Zwei Personen starten gleichzeitig am selben Punkt und entfernen sich in entgegengesetzter Richtung.',
    narr_away_rel: 'Entfernen sich voneinander wächst der Abstand um {rel} {unit} pro {timeUnit} ({vA} + {vB}).',
    narr_away_eq: 'Nach {tt} {timeUnit} beträgt der Abstand = ({vA} + {vB}) × {tt} = {dist} {unit}.',
    answer_dist: '{dist} {unit}',
    scene_meet: 'Aufeinander zu', scene_chase: 'Einholen', scene_away: 'Rücken an Rücken',
    beat_start: 'Gleicher Start', beat_move: 'Fahren', beat_meetpt: 'Treffpunkt', beat_eq: 'Gleichung',
    meet_pt: 'Treffpunkt', speed: '{v} {unit}/{timeUnit}',
  },
  es: {
    _keywords: ['encontrar','enfrentarse','cara a cara','perseguir','alcanzar','misma dirección','espaldas','alejar','distancia','por hora','por minuto','pista circular','salir al mismo tiempo','velocidad','dos coches'],
    unit_km: 'km', unit_m: 'm',
    time_hour: 'h', time_min: 'min', time_sec: 's',
    narr_meet_start: 'Dos objetos están separados {d} {unit} y avanzan uno hacia el otro al mismo tiempo.',
    narr_meet_rel: 'Avanzando uno hacia otro, se acercan {rel} {unit} cada {timeUnit} ({vA} + {vB}).',
    narr_meet_eq: 'Tiempo de encuentro = distancia ÷ velocidad total = {d} ÷ {rel} = {t} {timeUnit}.',
    answer_time: '{t} {timeUnit}',
    narr_chase_start: 'El más lento lleva {gap} {unit} de ventaja; el más rápido lo persigue en la misma dirección.',
    narr_chase_rel: 'Persiguiendo en la misma dirección, la distancia se reduce {rel} {unit} cada {timeUnit} ({fast} − {slow}).',
    narr_chase_eq: 'Tiempo de alcance = distancia ÷ diferencia de velocidad = {gap} ÷ {rel} = {t} {timeUnit}.',
    narr_away_start: 'Dos personas salen del mismo punto a la vez, alejándose en direcciones opuestas.',
    narr_away_rel: 'Alejándose, la distancia crece {rel} {unit} cada {timeUnit} ({vA} + {vB}).',
    narr_away_eq: 'Tras {tt} {timeUnit}, la distancia = ({vA} + {vB}) × {tt} = {dist} {unit}.',
    answer_dist: '{dist} {unit}',
    scene_meet: 'Uno hacia el otro', scene_chase: 'Alcance', scene_away: 'Espaldas',
    beat_start: 'Salida simultánea', beat_move: 'Avanzando', beat_meetpt: 'Punto de encuentro', beat_eq: 'Ecuación',
    meet_pt: 'Punto de encuentro', speed: '{v} {unit}/{timeUnit}',
  },
  it: {
    _keywords: ['incontrare','incontrarsi','uno verso l\'altro','inseguire','raggiungere','stessa direzione','schiena contro schiena','allontanare','distanza','ora','minuto','pista circolare','partire insieme','velocità','due auto'],
    unit_km: 'km', unit_m: 'm',
    time_hour: 'h', time_min: 'min', time_sec: 's',
    narr_meet_start: 'Due oggetti distano {d} {unit} e si dirigono l\'uno verso l\'altro nello stesso istante.',
    narr_meet_rel: 'Procedendo incontro, si avvicinano di {rel} {unit} ogni {timeUnit} ({vA} + {vB}).',
    narr_meet_eq: 'Tempo d\'incontro = distanza ÷ velocità totale = {d} ÷ {rel} = {t} {timeUnit}.',
    answer_time: '{t} {timeUnit}',
    narr_chase_start: 'Il più lento è avanti di {gap} {unit}; il più veloce lo insegue nella stessa direzione.',
    narr_chase_rel: 'Inseguendo nella stessa direzione, il divario si riduce di {rel} {unit} ogni {timeUnit} ({fast} − {slow}).',
    narr_chase_eq: 'Tempo di recupero = divario ÷ differenza di velocità = {gap} ÷ {rel} = {t} {timeUnit}.',
    narr_away_start: 'Due persone partono dallo stesso punto insieme, allontanandosi in direzioni opposte.',
    narr_away_rel: 'Allontanandosi, la distanza cresce di {rel} {unit} ogni {timeUnit} ({vA} + {vB}).',
    narr_away_eq: 'Dopo {tt} {timeUnit}, la distanza = ({vA} + {vB}) × {tt} = {dist} {unit}.',
    answer_dist: '{dist} {unit}',
    scene_meet: 'Uno verso l\'altro', scene_chase: 'Recupero', scene_away: 'Schiena contro schiena',
    beat_start: 'Partenza insieme', beat_move: 'In movimento', beat_meetpt: 'Punto d\'incontro', beat_eq: 'Equazione',
    meet_pt: 'Punto d\'incontro', speed: '{v} {unit}/{timeUnit}',
  },
  ar: {
    _keywords: ['يلتقي','التقاء','متقابلان','في اتجاهين متقابلين','يلاحق','مطاردة','لحاق','نفس الاتجاه','ظهرا لظهر','يبتعدان','مسافة','في الساعة','في الدقيقة','مسار دائري','ينطلقان معا','السرعة','سيارتان','نقطتان','متقدم'],
    unit_km: 'كم', unit_m: 'م',
    time_hour: 'ساعة', time_min: 'دقيقة', time_sec: 'ثانية',
    narr_meet_start: 'يبتعد جسمان مسافة {d} {unit} ويتحركان باتجاه بعضهما في الوقت نفسه.',
    narr_meet_rel: 'بحركة التقابل، يقتربان بمقدار {rel} {unit} كل {timeUnit} ({vA} + {vB}).',
    narr_meet_eq: 'زمن اللقاء = المسافة ÷ مجموع السرعتين = {d} ÷ {rel} = {t} {timeUnit}.',
    answer_time: '{t} {timeUnit}',
    narr_chase_start: 'الأبطأ متقدّم بمقدار {gap} {unit}، والأسرع يلاحقه في الاتجاه نفسه.',
    narr_chase_rel: 'بالملاحقة في الاتجاه نفسه، يتقلّص الفارق بمقدار {rel} {unit} كل {timeUnit} ({fast} − {slow}).',
    narr_chase_eq: 'زمن اللحاق = الفارق ÷ فرق السرعة = {gap} ÷ {rel} = {t} {timeUnit}.',
    narr_away_start: 'ينطلق شخصان من النقطة نفسها في الوقت نفسه، مبتعدين في اتجاهين متعاكسين.',
    narr_away_rel: 'بابتعادهما، تزداد المسافة بمقدار {rel} {unit} كل {timeUnit} ({vA} + {vB}).',
    narr_away_eq: 'بعد {tt} {timeUnit}، المسافة = ({vA} + {vB}) × {tt} = {dist} {unit}.',
    answer_dist: '{dist} {unit}',
    scene_meet: 'التقابل', scene_chase: 'ملاحقة', scene_away: 'ظهراً لظهر',
    beat_start: 'انطلاق معاً', beat_move: 'الحركة', beat_meetpt: 'نقطة اللقاء', beat_eq: 'المعادلة',
    meet_pt: 'نقطة اللقاء', speed: '{v} {unit}/{timeUnit}',
  },
  fa: {
    _keywords: ['ملاقات','روبرو','به هم رسیدن','تعقیب','دنبال کردن','رسیدن به','همان جهت','پشت به پشت','دور شدن','فاصله','در ساعت','در دقیقه','مسیر دایره','همزمان حرکت کردن','سرعت','دو خودرو','جلوتر'],
    unit_km: 'کیلومتر', unit_m: 'متر',
    time_hour: 'ساعت', time_min: 'دقیقه', time_sec: 'ثانیه',
    narr_meet_start: 'دو جسم به فاصلهٔ {d} {unit} از هم قرار دارند و هم‌زمان به‌سوی هم حرکت می‌کنند.',
    narr_meet_rel: 'در حرکت روبه‌رو، هر {timeUnit} به اندازهٔ {rel} {unit} به هم نزدیک می‌شوند ({vA} + {vB}).',
    narr_meet_eq: 'زمان ملاقات = فاصله ÷ مجموع سرعت‌ها = {d} ÷ {rel} = {t} {timeUnit}.',
    answer_time: '{t} {timeUnit}',
    narr_chase_start: 'کندتر به اندازهٔ {gap} {unit} جلوتر است و تندتر در همان جهت او را تعقیب می‌کند.',
    narr_chase_rel: 'در تعقیب هم‌جهت، هر {timeUnit} به اندازهٔ {rel} {unit} از فاصله کم می‌شود ({fast} − {slow}).',
    narr_chase_eq: 'زمان رسیدن = فاصله ÷ اختلاف سرعت = {gap} ÷ {rel} = {t} {timeUnit}.',
    narr_away_start: 'دو نفر هم‌زمان از یک نقطه حرکت می‌کنند و در دو جهت مخالف از هم دور می‌شوند.',
    narr_away_rel: 'در دور شدن از هم، هر {timeUnit} به اندازهٔ {rel} {unit} بر فاصله افزوده می‌شود ({vA} + {vB}).',
    narr_away_eq: 'پس از {tt} {timeUnit}، فاصله = ({vA} + {vB}) × {tt} = {dist} {unit}.',
    answer_dist: '{dist} {unit}',
    scene_meet: 'روبه‌رو هم', scene_chase: 'تعقیب', scene_away: 'پشت به پشت',
    beat_start: 'شروع هم‌زمان', beat_move: 'حرکت', beat_meetpt: 'نقطهٔ ملاقات', beat_eq: 'معادله',
    meet_pt: 'نقطهٔ ملاقات', speed: '{v} {unit}/{timeUnit}',
  },
});

module.exports = {
  id: 'motion',
  name: '行程问题',
  keywords: i18n.keywords('motion'),

  match(problem, opts = {}) {
    const t = String(problem || '').toLowerCase();
    let score = 0;
    // 多语种强信号
    if (/(相遇|相向|相对而行|meet|toward|towards|يلتقي|يلتقيان|تلتقيان|التقاء|متقابل|باتجاه بعض|ملاقات|روبرو|出会う|向かい|만나|마주|향해|rencontrer|treffen|encontrar|incontrare|se dirig|au bout|nach wie|dopo quanto|dopo quante|after how|cuántas horas|quantes ore|combien de temps)/.test(t)) score += 5;
    if (/(追及|追上|追赶|同向|先[走行]|catch up|chase|يلاحق|مطاردة|تعقیب|追いかけ|追う|追いつ|쫓다|따라잡|추월|poursuivre|rattraper|rattrape|verfolgen|perseguir|inseguire|alcanzar|alcanza|raggiungere|raggiunge|holen|holt auf|aufholen|التحاق|يلحق)/.test(t)) score += 5;
    if (/(相背|背向|背道|opposite|away from|walk away|back-to-back|ابتعد|يبتعدان|ظهرا|دور شدن|背中合わせ|반대 방향|s'éloigner|entgegen|alejarse|alejánd|allontanare|allontanánd|entgegengesetzt|direcciones opuestas|direzioni opposte|اتجاهين متعاكسين|جهت مخالف|اتجاهين|مخالف)/.test(t)) score += 4;
    if (/(相距|两地|apart|مسافة|فاصله|距離|거리|distance|entfernung|distancia|distanza|distantes|distan|entfernt|تبعد|تبعدان|離れた|떨어진)/.test(t)) score += 3;
    if (/(每小时|每分钟|每小時|每分鐘|per hour|per minute|per hr|في الساعة|في الدقيقة|در ساعت|در دقیقه|時速|分速|시간당|시속|par heure|par minute|pro stunde|pro minute|por hora|por minuto|all'ora|al minuto|km\/h|km\/s|کیلومتر بر ساعت|كم\/ساعة)/.test(t)) score += 3;
    if (/(环形|跑道|circular track|circular|مسار دائري|مسیر دایره|円形|원형|piste circulaire|kreisbahn|pista circular|pista circolare)/.test(t)) score += 3;
    // 强信号：两个速度 + 距离/时间
    if (/\d+\s*(?:km|كم|كيلومتر|کیلومتر|miles?|meters?)/.test(t) && /\d+\s*(?:km|كم|كيلومتر|کیلومتر|miles?|meters?)/.test(t)) score += 2;
    return score;
  },

  // 抽参：方向(mode)、两速度、初始距离/领先距离/给定时间、单位
  extract(problem, opts = {}) {
    const t = String(problem || '');
    const tl = t.toLowerCase();

    // —— 方向判定（多语种）——
    let mode = null;
    if (/(追及|追上|追赶|同向|先[走行]|先出发|先行|提前|领先|catch up|chase|يلاحق|مطاردة|تعقیب|追いかけ|追う|追いつ|쫓다|따라잡|추월|poursuivre|rattraper|rattrape|verfolgen|perseguir|inseguire|alcanzar|alcanza|raggiungere|raggiunge|holen|holt auf|aufholen|التحاق|يلحق)/.test(tl)) mode = 'chase';
    else if (/(相背|背向|背向而行|相背而行|反向而行|反対方向|背道|opposite|away from each|walk away|back-to-back|ابتعد|يبتعدان|ظهرا|دور شدن|背中合わせ|반대 방향|s'éloigner|entgegen|alejarse|alejánd|allontanare|allontanánd|en s'éloignant|entgegengesetzt|direcciones opuestas|direzioni opposte|اتجاهين متعاكسين|جهت مخالف|اتجاهين|مخالف)/.test(tl)) mode = 'away';
    else if (/(相遇|相向|相对而行|相向而行|toward each|towards each|drive toward|drive towards|toward|يلتقي|يلتقيان|تلتقيان|التقاء|متقابل|باتجاه بعض|ملاقات|روبرو|出会う|向かい|만나|마주|향해|rencontrer|treffen|encontrar|incontrare|towards?|toward)/.test(tl)) mode = 'meet';
    else if (/(环形|跑道|circular|مسار دائري|円形|원형|piste circulaire|kreisbahn|pista circular)/.test(tl)) mode = 'meet'; // 环形按相遇处理

    // —— 速度抽取（最多两个，多语种）——
    const speeds = [];
    const reZH1 = /每(?:小時|小时|分钟|分鐘|分钟|秒|時|时|分)(?:[^\d]{0,6})?(\d+(?:\.\d+)?)/g;
    let m;
    while ((m = reZH1.exec(t)) && speeds.length < 4) speeds.push(parseFloat(m[1]));
    const reZH2 = /(\d+(?:\.\d+)?)\s*(千米|公里|km|公尺|米|m)\s*\/\s*(每)?(小時|小时|分鐘|分钟|秒|時|时|分)/g;
    while ((m = reZH2.exec(t)) && speeds.length < 4) speeds.push(parseFloat(m[1]));
    // 通用 "X km/h" "X km per hour" 等（含斜杠分隔）
    const reEN = /(\d+(?:\.\d+)?)\s*(?:km|kilometers?|kilometres?|miles?|meters?|metres?|m)\s*[\/\s]*(?:per|an?|par|pro|por|all'|بر)?\s*(?:hour|hr|heure|stunde|ora|hora|h\b)/gi;
    while ((m = reEN.exec(t)) && speeds.length < 4) speeds.push(parseFloat(m[1]));
    // 阿拉伯语：60 كم/ساعة / بسرعة 40 كم/ساعة
    const reAR = /(\d+(?:\.\d+)?)\s*(?:كم|كيلومتر|كيلو متر|ميل|متر)\s*[\/\s]*(?:في|بالساعة|بالدقيقة|بر)?\s*(?:الساعة|ساعة|الدقيقة|دقيقة|الثانية|ثانية)/g;
    while ((m = reAR.exec(t)) && speeds.length < 4) speeds.push(parseFloat(m[1]));
    // 波斯语：40 و 20 کیلومتر بر ساعت
    const reFA = /(\d+(?:\.\d+)?)\s*(?:و\s*(\d+(?:\.\d+)?)\s*)?کیلومتر\s*بر\s*ساعت/g;
    while ((m = reFA.exec(t)) && speeds.length < 4) { speeds.push(parseFloat(m[1])); if (m[2]) speeds.push(parseFloat(m[2])); }
    // 日语/韩语：時速60 / 60キロ 毎時 / 시속 60
    const reJA = /(?:時速|分速|秒速|毎時|毎分|시간당|시속|분속)\s*(\d+(?:\.\d+)?)/g;
    while ((m = reJA.exec(t)) && speeds.length < 4) speeds.push(parseFloat(m[1]));
    // 阿语"بسرعة 40" / 法德西意"à 40 km/h"已被 reEN 覆盖；兜底：文中出现"سرعة/vitesse/Geschwindigkeit/velocidad/velocità"后的数字
    const reSpeedWord = /(?:سرعة|سرعات|سرعت|vitesse|geschwindigkeit|velocidad|velocità|speed|速さ|속도)\D{0,8}(\d+(?:\.\d+)?)/g;
    while ((m = reSpeedWord.exec(t)) && speeds.length < 4) speeds.push(parseFloat(m[1]));
    // 去重保序
    const uniqSpeeds = [];
    for (const s of speeds) if (!uniqSpeeds.includes(s)) uniqSpeeds.push(s);

    if (uniqSpeeds.length < 2) return null;
    const vA = uniqSpeeds[0];
    const vB = uniqSpeeds[1];

    // —— 单位（语言无关 key，由 solve 本地化）——
    let unitKey = 'km';
    if (/(千米|公里|km|kilometers?|kilometres?|miles?|كم|كيلومتر|キロ|킬로)/i.test(t)) unitKey = 'km';
    else if (/(公尺|米|meters?|metres?|متر|メートル|미터)/i.test(t)) unitKey = 'm';
    let timeUnitKey = 'hour';
    if (/(分钟|分鐘|min|minute|분|دقيقة|دقیقه|minuto)/i.test(t)) timeUnitKey = 'minute';
    else if (/(秒|seconde?|sekunde|segundo|secondo|초)/i.test(t)) timeUnitKey = 'second';
    else if (/\d+\s*ثانية/.test(t)) timeUnitKey = 'second'; // 阿语"秒"须前接数字，避免误伤 الثانية(后者)
    else if (/(小时|小時|hour|hr|heure|stunde|hora|ora|時間|시간|ساعة|ساعت)/i.test(t)) timeUnitKey = 'hour';

    // —— 距离 / 领先距离 / 给定时间 ——
    let distance = null, headStart = null, givenTime = null;

    const dm =
      t.match(/相距\s*(\d+(?:\.\d+)?)/) ||
      t.match(/相隔\s*(\d+(?:\.\d+)?)/) ||
      t.match(/两地?[相距间]?\s*(\d+(?:\.\d+)?)\s*(千米|公里|km|公尺|米|m)/) ||
      t.match(/(\d+(?:\.\d+)?)\s*(千米|公里|km|公尺|米|m)\s*(?:的)?\s*两地/) ||
      t.match(/(\d+(?:\.\d+)?)\s*(?:km|kilometers?|miles?|meters?|كم|كيلومتر|كيلو متر|کیلومتر)\s*(?:apart|بالأمتار)/i) ||
      t.match(/(\d+(?:\.\d+)?)\s*(?:km|كم|كيلومتر|كيلو متر|کیلومتر)\s*(?:離れた|離れて|떨어진|entfernt|voneinander\s+entfernt|distantes?\s+de|distantes?|distan\w*|تبعدان?|تبعد|به\s+فاصله|از\s+هم\s+فاصله|فاصله\s+دارند)/i) ||
      t.match(/(?:به\s+فاصله|تبعد|تبعدان?|distantes?\s+de|distantes?|distan\w*|entfernt|فاصله\s+دارند|از\s+هم\s+فاصله)\s*(\d+(?:\.\d+)?)\s*(?:km|كم|كيلومتر|كيلو متر|کیلومتر)?/i);
    if (dm) distance = parseFloat(dm[1]);

    const cm =
      t.match(/先走\s*(\d+(?:\.\d+)?)/) ||
      t.match(/先行\s*(\d+(?:\.\d+)?)/) ||
      t.match(/提前\s*(\d+(?:\.\d+)?)/) ||
      t.match(/在\s*(?:前面|前方)\s*(\d+(?:\.\d+)?)/) ||
      t.match(/前面\s*(\d+(?:\.\d+)?)/) ||
      t.match(/先出发\s*(\d+(?:\.\d+)?)/) ||
      t.match(/领先\s*(\d+(?:\.\d+)?)/) ||
      t.match(/متقدّم\s*(\d+(?:\.\d+)?)/) ||
      t.match(/head start(?:\s+of)?\s*(\d+(?:\.\d+)?)/i) ||
      t.match(/(\d+(?:\.\d+)?)\s*(?:km|كم|كيلومتر|کیلومتر)\s*(?:後ろ|後ろに|뒤|뒤에|derrière|hinter|detrás|dietro|خلف|کیلومتری\s+جلوتر)/i) ||
      t.match(/(?:behind|hinter|derrière|detrás|dietro|뒤|後ろ)\s*(?:de\s+|a\s+|a\s+)?\s*(\d+(?:\.\d+)?)\s*(?:km|كم|كيلومتر|کیلومتر)?/i);
    if (cm) headStart = parseFloat(cm[1]);

    const tm =
      t.match(/(\d+(?:\.\d+)?)\s*(分钟|小时|秒|分鐘|小時|時間|시간)/) ||
      t.match(/after\s*(\d+(?:\.\d+)?)\s*(minutes?|hours?|seconds?)/i) ||
      t.match(/(?:après|nach|después|tras|dopo|بعد|بعد از|بعد من)\s*(\d+(?:\.\d+)?)\s*(?:heures?|stunden?|horas?|ore?|ساعات|ساعت|h\b)/i);
    if (tm) givenTime = parseFloat(tm[1]);

    // —— 兜底：若 mode 决定后仍缺关键量，用剩余数字凑 ——
    const allNums = (t.match(/\d+(?:\.\d+)?/g) || []).map(Number);
    const leftover = allNums.filter(n => !uniqSpeeds.includes(n) && n > 0);
    if (mode === 'meet' && distance == null) distance = leftover.length ? Math.max(...leftover) : null;
    if (mode === 'chase' && headStart == null) headStart = leftover.length ? Math.max(...leftover) : null;
    if (mode === 'away' && givenTime == null) givenTime = leftover[0] ?? null;

    if (!mode) return null;
    if (mode === 'meet' && distance == null) return null;
    if (mode === 'chase' && headStart == null) return null;
    if (mode === 'away' && givenTime == null) return null;

    // —— 演员识别 ——
    let actorA = '🚗', actorB = '🚙';
    if (/(自行车|骑行|单车|bike|bicycle|cycl|دراجة|دوچرخه|自転車|자전거|vélo|fahrrad|bicicleta|bicicletta)/i.test(t)) { actorA = '🚴'; actorB = '🚵'; }
    else if ((/汽车|车|car|drive|driving|سيارة|خودرو|車|자동차|voiture|auto|coche|macchina/i.test(t))) { actorA = '🚗'; actorB = '🚙'; }
    if (/(小明|男孩|boy|he|哥哥|ولد|پسر|男の子|소년|garçon|junge|chico|ragazzo)/.test(t)) { actorA = '👦'; }
    if (/(小红|女孩|girl|she|弟弟|بنت|دختر|女の子|소녀|fille|mädchen|chica|ragazza)/.test(t)) { actorB = '👧'; }
    if (/(狗|dog|كلب|سگ|犬|개|chien|hund|perro|cane)/i.test(t)) { actorA = '🐕'; }
    if (/(猫|cat|قطة|گربه|猫|고양이|chat|katze|gato|gatto)/i.test(t)) { actorB = '🐈'; }

    let confidence = 0.85;
    if (mode === 'meet' && distance == null) confidence = 0.4;
    if (mode === 'chase' && vA <= vB) confidence = Math.min(confidence, 0.5); // 追及必须更快

    return {
      mode, vA, vB, distance, headStart, givenTime,
      unitKey, timeUnitKey, actorA, actorB, confidence, raw: t,
    };
  },

  // 确定性求解（旁白全语种本地化）
  solve(params, opts = {}) {
    const lang = i18n.langOf(opts);
    const T = (key, vars) => i18n.t('motion', lang, key, vars);
    const unit = T('unit_' + params.unitKey);
    const timeSuffix = { hour: 'time_hour', minute: 'time_min', second: 'time_sec' }[params.timeUnitKey] || 'time_hour';
    const timeUnit = T(timeSuffix);
    const steps = [];
    let answer, totalT = null, finalDist = null;

    if (params.mode === 'meet') {
      const d = params.distance;
      const rel = params.vA + params.vB; // 相向：相对速度相加
      totalT = d / rel;
      const meetPos = params.vA * totalT;
      steps.push({ narration: T('narr_meet_start', { d, unit }), visualHint: 'start_concrete' });
      steps.push({ narration: T('narr_meet_rel', { timeUnit, vA: params.vA, vB: params.vB, rel, unit }), visualHint: 'track' });
      steps.push({ narration: T('narr_meet_eq', { d, rel, t: round2(totalT), timeUnit }), visualHint: 'equation' });
      answer = T('answer_time', { t: round2(totalT), timeUnit });
      return { answer, steps, mode: 'meet', vA: params.vA, vB: params.vB, distance: d, unit, timeUnit, totalT, meetPos };
    }

    if (params.mode === 'chase') {
      const gap = params.headStart;
      const fast = Math.max(params.vA, params.vB), slow = Math.min(params.vA, params.vB);
      const rel = fast - slow; // 同向追及：相对速度相减
      totalT = gap / rel;
      steps.push({ narration: T('narr_chase_start', { gap, unit }), visualHint: 'start_concrete' });
      steps.push({ narration: T('narr_chase_rel', { timeUnit, fast, slow, rel, unit }), visualHint: 'track' });
      steps.push({ narration: T('narr_chase_eq', { gap, rel, t: round2(totalT), timeUnit }), visualHint: 'equation' });
      answer = T('answer_time', { t: round2(totalT), timeUnit });
      return { answer, steps, mode: 'chase', vA: fast, vB: slow, headStart: gap, unit, timeUnit, totalT };
    }

    // away：背向而行，给定时间求距离
    const tt = params.givenTime;
    const rel = params.vA + params.vB;
    finalDist = rel * tt;
    steps.push({ narration: T('narr_away_start', {}), visualHint: 'start_concrete' });
    steps.push({ narration: T('narr_away_rel', { timeUnit, vA: params.vA, vB: params.vB, rel, unit }), visualHint: 'track' });
    steps.push({ narration: T('narr_away_eq', { tt, vA: params.vA, vB: params.vB, dist: round2(finalDist), unit }), visualHint: 'equation' });
    answer = T('answer_dist', { dist: round2(finalDist), unit });
    return { answer, steps, mode: 'away', vA: params.vA, vB: params.vB, givenTime: tt, unit, timeUnit, totalT: tt, finalDist };
  },

  validate(params, solved, opts = {}) {
    if (!solved || !solved.answer) return { ok: false, reason: 'no_answer' };
    if (!solved.steps || solved.steps.length < 3) return { ok: false, reason: 'steps_too_short' };
    if (solved.mode === 'meet') {
      const t = params.distance / (params.vA + params.vB);
      if (Math.abs(t - solved.totalT) > 1e-6) return { ok: false, reason: 'meet_mismatch' };
      if (t <= 0) return { ok: false, reason: 'non_positive_time' };
    } else if (solved.mode === 'chase') {
      const fast = Math.max(params.vA, params.vB), slow = Math.min(params.vA, params.vB);
      if (fast <= slow) return { ok: false, reason: 'chase_no_gain' };
      const t = params.headStart / (fast - slow);
      if (Math.abs(t - solved.totalT) > 1e-6) return { ok: false, reason: 'chase_mismatch' };
    } else if (solved.mode === 'away') {
      const d = (params.vA + params.vB) * params.givenTime;
      if (Math.abs(d - solved.finalDist) > 1e-6) return { ok: false, reason: 'away_mismatch' };
    }
    return { ok: true };
  },

  renderParams(solved, opts = {}) {
    const lang = i18n.langOf(opts);
    const T = (key, vars) => i18n.t('motion', lang, key, vars);

    // 计算两物体在 m=0 / m=1 的道路坐标
    let a0, a1, b0, b1;
    if (solved.mode === 'meet') {
      a0 = 0; a1 = solved.meetPos;
      b0 = solved.distance; b1 = solved.meetPos;
    } else if (solved.mode === 'chase') {
      a0 = 0; a1 = solved.vA * solved.totalT;
      b0 = solved.headStart; b1 = solved.headStart + solved.vB * solved.totalT;
    } else {
      a0 = 0; a1 = solved.vA * solved.totalT;
      b0 = 0; b1 = -solved.vB * solved.totalT;
    }

    let eqText = '';
    if (solved.mode === 'meet') eqText = `${solved.distance} ÷ (${solved.vA} + ${solved.vB}) = ${solved.answer}`;
    else if (solved.mode === 'chase') eqText = `${solved.headStart} ÷ (${solved.vA} − ${solved.vB}) = ${solved.answer}`;
    else eqText = `(${solved.vA} + ${solved.vB}) × ${solved.givenTime} = ${solved.answer}`;

    return {
      type: 'motion',
      rtl: i18n.isRTL(lang),
      language: lang,
      scene: {
        mode: solved.mode,
        label: T('scene_' + solved.mode),
        unit: solved.unit,
        timeUnit: solved.timeUnit,
        vA: solved.vA, vB: solved.vB,
        a0, a1, b0, b1,
        actorA: opts.actorA || '🚗', actorB: opts.actorB || '🚙',
        speedLabelA: T('speed', { v: solved.vA, unit: solved.unit, timeUnit: solved.timeUnit }),
        speedLabelB: T('speed', { v: solved.vB, unit: solved.unit, timeUnit: solved.timeUnit }),
        meetPt: T('meet_pt'),
      },
      beats: [
        { id: 'intro', duration: 4000, label: T('beat_start') },
        { id: 'move', duration: 5000, label: T('scene_' + solved.mode) },
        { id: 'meet', duration: 4000, label: T('beat_meetpt') },
        { id: 'equation', duration: 4000, label: T('beat_eq') },
      ],
      answer: solved.answer,
      scenes: [
        { type: 'road', mode: solved.mode, a0, a1, b0, b1, unit: solved.unit },
        { type: 'equation', text: eqText },
      ],
    };
  },
};

function round2(x) {
  const r = Math.round(x * 100) / 100;
  return Number.isInteger(r) ? String(r) : String(r);
}
