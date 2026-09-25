// lib/kards/function-graph.js — 函数图像族知识卡（11 语种版）
// 承载：一次函数 y=kx+b、二次函数 y=ax²+bx+c、两点求解析式、函数值、两直线交点、顶点
// CPA：具象(行程距离-时间/水温变化) → 图示(坐标系+曲线逐点动画+关键点) → 抽象(斜率/截距/顶点公式)
'use strict';
const i18n = require('./i18n');

i18n.register('function-graph', {
  en: {
    _keywords: ['function','linear','quadratic','slope','intercept','vertex','parabola','graph','coordinate','line','intersection','y=','x²','straight line'],
    n_lp_1: "Distance-time graph: x=time, y=distance.",
    n_lp_2: "Plot A({x1},{y1}) and B({x2},{y2}), then draw the straight line.",
    f_lp: "Slope k=({y2}−{y1})/({x2}−{x1})={k}; substituting gives b={b}.",
    label_intercept: "intercept (0,{b})",
    n_lv_1: "Water temperature changes over time.",
    n_lv_2: "Draw the line and read off the point at x={x}.",
    f_lv: "y = {k}×{x} + {b} = {y}.",
    n_qv_1: "A basketball flies along a parabola.",
    n_qv_2: "Plot the parabola and find its lowest or highest point.",
    f_qv: "x = −b/2a = −({b})/(2×{a}) = {h}; substituting gives y={v}.",
    ans_vertex: "vertex ({x},{y})",
    label_vertex: "vertex ({x},{y})",
    n_in_1: "Two travelers meet somewhere on the road.",
    n_in_2: "Draw both lines on the same axes; the crossing point is the meeting point.",
    f_in: "{l1} = {l2}, solve for x={x}, y={y}.",
    ans_intersection: "intersection ({x},{y})",
    beat_concrete: "See it", beat_graph: "Graph it", beat_formula: "Formula",
  },
  'zh-CN': {
    _keywords: ['函数','一次函数','二次函数','解析式','斜率','截距','交点','顶点','图像','坐标系','抛物线','直线'],
    n_lp_1: "行程图：横轴是时间，纵轴是路程。",
    n_lp_2: "描出两点 A({x1},{y1})、B({x2},{y2})，连成一条直线。",
    f_lp: "斜率 k=({y2}−{y1})/({x2}−{x1})={k}；代入得 b={b}。",
    label_intercept: "截距(0,{b})",
    n_lv_1: "水温随时间变化的折线。",
    n_lv_2: "画出直线，找到 x={x} 对应的点。",
    f_lv: "y = {k}×{x} + {b} = {y}。",
    n_qv_1: "篮球划出的一道抛物线。",
    n_qv_2: "画出抛物线，找到它的最低点（或最高点）。",
    f_qv: "x = −b/2a = −({b})/(2×{a}) = {h}；代入得 y={v}。",
    ans_vertex: "顶点({x},{y})",
    label_vertex: "顶点({x},{y})",
    n_in_1: "两辆车在途中相遇。",
    n_in_2: "在同一坐标系画出两条直线，交点即相遇点。",
    f_in: "{l1} = {l2}，解得 x={x}, y={y}。",
    ans_intersection: "交点({x},{y})",
    beat_concrete: "具象", beat_graph: "看图", beat_formula: "列式",
  },
  'zh-TW': {
    _keywords: ['函數','一次函數','二次函數','解析式','斜率','截距','交點','頂點','圖像','座標系','拋物線','直線'],
    n_lp_1: "行程圖：橫軸是時間，縱軸是路程。",
    n_lp_2: "描出兩點 A({x1},{y1})、B({x2},{y2})，連成一條直線。",
    f_lp: "斜率 k=({y2}−{y1})/({x2}−{x1})={k}；代入得 b={b}。",
    label_intercept: "截距(0,{b})",
    n_lv_1: "水溫隨時間變化的折線。",
    n_lv_2: "畫出直線，找到 x={x} 對應的點。",
    f_lv: "y = {k}×{x} + {b} = {y}。",
    n_qv_1: "籃球劃出的一道拋物線。",
    n_qv_2: "畫出拋物線，找到它的最低點（或最高點）。",
    f_qv: "x = −b/2a = −({b})/(2×{a}) = {h}；代入得 y={v}。",
    ans_vertex: "頂點({x},{y})",
    label_vertex: "頂點({x},{y})",
    n_in_1: "兩輛車在途中相遇。",
    n_in_2: "在同一座標系畫出兩條直線，交點即相遇點。",
    f_in: "{l1} = {l2}，解得 x={x}, y={y}。",
    ans_intersection: "交點({x},{y})",
    beat_concrete: "具象", beat_graph: "看圖", beat_formula: "列式",
  },
  ja: {
    _keywords: ['関数','一次関数','二次関数','傾き','切片','交点','頂点','グラフ','座標','放物線','直線'],
    n_lp_1: "距離-時間グラフ：横軸が時間、縦軸が距離。",
    n_lp_2: "2点 A({x1},{y1})、B({x2},{y2}) を取って直線を引く。",
    f_lp: "傾き k=({y2}−{y1})/({x2}−{x1})={k}；代入して b={b}。",
    label_intercept: "切片(0,{b})",
    n_lv_1: "時間とともに変わる水温の折れ線。",
    n_lv_2: "直線を引き、x={x} に対応する点を読み取る。",
    f_lv: "y = {k}×{x} + {b} = {y}。",
    n_qv_1: "バスケットボールが描く放物線。",
    n_qv_2: "放物線を描き、最低点または最高点を見つける。",
    f_qv: "x = −b/2a = −({b})/(2×{a}) = {h}；代入して y={v}。",
    ans_vertex: "頂点({x},{y})",
    label_vertex: "頂点({x},{y})",
    n_in_1: "二人の旅人が道中で出会う。",
    n_in_2: "同じ座標軸に2本の直線を引き、交わる点が出会う点。",
    f_in: "{l1} = {l2} を解いて x={x}, y={y}。",
    ans_intersection: "交点({x},{y})",
    beat_concrete: "具象", beat_graph: "グラフ", beat_formula: "式",
  },
  ko: {
    _keywords: ['함수','일차함수','이차함수','기울기','절편','교점','꼭짓점','그래프','좌표','포물선','직선'],
    n_lp_1: "거리-시간 그래프: x축은 시간, y축은 거리.",
    n_lp_2: "두 점 A({x1},{y1}), B({x2},{y2})를 찍고 직선으로 이어요.",
    f_lp: "기울기 k=({y2}−{y1})/({x2}−{x1})={k}; 대입하면 b={b}.",
    label_intercept: "절편(0,{b})",
    n_lv_1: "시간에 따라 변하는 물 온도 꺾은선.",
    n_lv_2: "직선을 그리고 x={x}에 해당하는 점을 읽어요.",
    f_lv: "y = {k}×{x} + {b} = {y}.",
    n_qv_1: "농구공이 그리는 포물선.",
    n_qv_2: "포물선을 그리고 가장 낮은(또는 높은) 점을 찾아요.",
    f_qv: "x = −b/2a = −({b})/(2×{a}) = {h}; 대입하면 y={v}.",
    ans_vertex: "꼭짓점({x},{y})",
    label_vertex: "꼭짓점({x},{y})",
    n_in_1: "두 여행자가 길에서 만나요.",
    n_in_2: "같은 좌표축에 두 직선을 그리면 교점이 만남의 점.",
    f_in: "{l1} = {l2}를 풀면 x={x}, y={y}.",
    ans_intersection: "교점({x},{y})",
    beat_concrete: "구체적", beat_graph: "그래프", beat_formula: "식 세우기",
  },
  fr: {
    _keywords: ['fonction','linéaire','quadratique','pente','ordonnée','intersection','sommet','parabole','graphe','repère','droite'],
    n_lp_1: "Graphe distance-temps : x = temps, y = distance.",
    n_lp_2: "Place A({x1},{y1}) et B({x2},{y2}), puis trace la droite.",
    f_lp: "Pente k=({y2}−{y1})/({x2}−{x1})={k} ; en substituant, b={b}.",
    label_intercept: "ordonnée à l'origine (0,{b})",
    n_lv_1: "La température de l'eau évolue dans le temps.",
    n_lv_2: "Trace la droite et lis le point pour x={x}.",
    f_lv: "y = {k}×{x} + {b} = {y}.",
    n_qv_1: "Un ballon de basket vole en parabole.",
    n_qv_2: "Trace la parabole et trouve son point le plus bas ou le plus haut.",
    f_qv: "x = −b/2a = −({b})/(2×{a}) = {h} ; en substituant, y={v}.",
    ans_vertex: "sommet ({x},{y})",
    label_vertex: "sommet ({x},{y})",
    n_in_1: "Deux voyageurs se rencontrent en chemin.",
    n_in_2: "Trace les deux droites sur le même repère ; leur croisement est le point de rencontre.",
    f_in: "{l1} = {l2}, on résout x={x}, y={y}.",
    ans_intersection: "intersection ({x},{y})",
    beat_concrete: "Concret", beat_graph: "Graphe", beat_formula: "Formule",
  },
  de: {
    _keywords: ['funktion','linear','quadratisch','steigung','achsenabschnitt','schnittpunkt','scheitel','parabel','graph','koordinate','gerade'],
    n_lp_1: "Weg-Zeit-Diagramm: x = Zeit, y = Weg.",
    n_lp_2: "Zeichne A({x1},{y1}) und B({x2},{y2}) ein und verbinde sie mit der Geraden.",
    f_lp: "Steigung k=({y2}−{y1})/({x2}−{x1})={k}; einsetzen gibt b={b}.",
    label_intercept: "Achsenabschnitt (0,{b})",
    n_lv_1: "Die Wassertemperatur ändert sich mit der Zeit.",
    n_lv_2: "Zeichne die Gerade und lies den Punkt bei x={x} ab.",
    f_lv: "y = {k}×{x} + {b} = {y}.",
    n_qv_1: "Ein Basketball fliegt auf einer Parabel.",
    n_qv_2: "Zeichne die Parabel und finde ihren tiefsten oder höchsten Punkt.",
    f_qv: "x = −b/2a = −({b})/(2×{a}) = {h}; einsetzen gibt y={v}.",
    ans_vertex: "Scheitelpunkt ({x},{y})",
    label_vertex: "Scheitelpunkt ({x},{y})",
    n_in_1: "Zwei Reisende treffen sich auf der Straße.",
    n_in_2: "Zeichne beide Geraden in dasselbe Koordinatensystem; ihr Schnittpunkt ist die Begegnung.",
    f_in: "{l1} = {l2} auflösen: x={x}, y={y}.",
    ans_intersection: "Schnittpunkt ({x},{y})",
    beat_concrete: "Anschauen", beat_graph: "Graph", beat_formula: "Formel",
  },
  es: {
    _keywords: ['función','lineal','cuadrática','pendiente','intersección','vértice','parábola','gráfico','coordenada','recta'],
    n_lp_1: "Gráfica distancia-tiempo: x = tiempo, y = distancia.",
    n_lp_2: "Marca A({x1},{y1}) y B({x2},{y2}) y traza la recta.",
    f_lp: "Pendiente k=({y2}−{y1})/({x2}−{x1})={k}; al sustituir, b={b}.",
    label_intercept: "ordenada en el origen (0,{b})",
    n_lv_1: "La temperatura del agua cambia con el tiempo.",
    n_lv_2: "Dibuja la recta y lee el punto para x={x}.",
    f_lv: "y = {k}×{x} + {b} = {y}.",
    n_qv_1: "Un balón de baloncesto vuela en parábola.",
    n_qv_2: "Dibuja la parábola y encuentra su punto más bajo o más alto.",
    f_qv: "x = −b/2a = −({b})/(2×{a}) = {h}; al sustituir, y={v}.",
    ans_vertex: "vértice ({x},{y})",
    label_vertex: "vértice ({x},{y})",
    n_in_1: "Dos viajeros se encuentran en el camino.",
    n_in_2: "Dibuja ambas rectas en los mismos ejes; su cruce es el punto de encuentro.",
    f_in: "{l1} = {l2}, se resuelve x={x}, y={y}.",
    ans_intersection: "intersección ({x},{y})",
    beat_concrete: "Verlo", beat_graph: "Gráfico", beat_formula: "Fórmula",
  },
  it: {
    _keywords: ['funzione','lineare','quadratica','pendenza','intercetta','intersezione','vertice','parabola','grafico','coordinata','retta'],
    n_lp_1: "Grafico distanza-tempo: x = tempo, y = distanza.",
    n_lp_2: "Segna A({x1},{y1}) e B({x2},{y2}) e traccia la retta.",
    f_lp: "Pendenza k=({y2}−{y1})/({x2}−{x1})={k}; sostituendo si ha b={b}.",
    label_intercept: "intercetta sull'asse (0,{b})",
    n_lv_1: "La temperatura dell'acqua cambia nel tempo.",
    n_lv_2: "Disegna la retta e leggi il punto per x={x}.",
    f_lv: "y = {k}×{x} + {b} = {y}.",
    n_qv_1: "Un pallone da basket vola lungo una parabola.",
    n_qv_2: "Disegna la parabola e trova il suo punto più basso o più alto.",
    f_qv: "x = −b/2a = −({b})/(2×{a}) = {h}; sostituendo si ha y={v}.",
    ans_vertex: "vertice ({x},{y})",
    label_vertex: "vertice ({x},{y})",
    n_in_1: "Due viaggiatori si incontrano sulla strada.",
    n_in_2: "Disegna entrambe le rette sugli stessi assi; il loro incrocio è il punto d'incontro.",
    f_in: "{l1} = {l2}, si risolve x={x}, y={y}.",
    ans_intersection: "intersezione ({x},{y})",
    beat_concrete: "Vedere", beat_graph: "Grafico", beat_formula: "Formula",
  },
  ar: {
    _keywords: ['دالة','خط مستقيم','قطع مكافئ','ميل','تقاطع','رأس','رسم بياني','إحداثيات','معادلة','نقطة','دالة تربيعية','مستقيم'],
    n_lp_1: "رسم بياني للمسافة مقابل الزمن: المحور الأفقي الزمن، والعمودي المسافة.",
    n_lp_2: "حدّد النقطتين أ({x1},{y1})، ب({x2},{y2})، ثم ارسم الخط المستقيم.",
    f_lp: "الميل k=({y2}−{y1})/({x2}−{x1})={k}; بالتعويض نحصل على b={b}.",
    label_intercept: "تقاطع المحور الصادي (0,{b})",
    n_lv_1: "درجة حرارة الماء تتغير مع الزمن.",
    n_lv_2: "ارسم المستقيم واقرأ النقطة عند x={x}.",
    f_lv: "y = {k}×{x} + {b} = {y}.",
    n_qv_1: "كرة سلة تسير في مسار مكافئ.",
    n_qv_2: "ارسم القطع المكافئ واعثر على نقطته الدنيا أو القصوى.",
    f_qv: "x = −b/2a = −({b})/(2×{a}) = {h}; بالتعويض نحصل على y={v}.",
    ans_vertex: "الرأس ({x},{y})",
    label_vertex: "الرأس ({x},{y})",
    n_in_1: "مسافران يلتقيان في الطريق.",
    n_in_2: "ارسم المستقيمين على نفس المحاور؛ نقطة التقاطع هي نقطة اللقاء.",
    f_in: "{l1} = {l2}، نحلها فنجد x={x}، y={y}.",
    ans_intersection: "نقطة التقاطع ({x},{y})",
    beat_concrete: "عاين", beat_graph: "ارسم", beat_formula: "المعادلة",
  },
  fa: {
    _keywords: ['تابع','خط مستقیم','سهمی','شیب','مقاطع','رأس','نمودار','مختصات','معادله','نقطه','تابع درجه دوم','عرض از مبدأ'],
    n_lp_1: "نمودار مسافـت-زمان: محور افقی زمان، محور قائم مسافت.",
    n_lp_2: "دو نقطه A({x1},{y1}) و B({x2},{y2}) را رسم کن و خط راست را بکش.",
    f_lp: "شیب k=({y2}−{y1})/({x2}−{x1})={k}; با جایگذاری b={b} به دست می‌آید.",
    label_intercept: "عرض از مبدأ (0,{b})",
    n_lv_1: "دمای آب با زمان تغییر می‌کند.",
    n_lv_2: "خط را رسم کن و نقطه متناظر با x={x} را بخوان.",
    f_lv: "y = {k}×{x} + {b} = {y}.",
    n_qv_1: "توپ بسکتبال در مسیری سهمی پرواز می‌کند.",
    n_qv_2: "سهمی را رسم کن و پایین‌ترین یا بالاترین نقطه آن را بیاب.",
    f_qv: "x = −b/2a = −({b})/(2×{a}) = {h}; با جایگذاری y={v} به دست می‌آید.",
    ans_vertex: "رأس ({x},{y})",
    label_vertex: "رأس ({x},{y})",
    n_in_1: "دو مسافر در راه به هم می‌رسند.",
    n_in_2: "هر دو خط را روی یک دستگاه مختصات رسم کن؛ نقطه برخورد، محل دیدار است.",
    f_in: "{l1} = {l2} را حل کن: x={x}، y={y}.",
    ans_intersection: "نقطه برخورد ({x},{y})",
    beat_concrete: "ببینید", beat_graph: "رسم کنید", beat_formula: "فرمول",
  },
});

// —— 数学解析工具（保持原逻辑）——
function r2(x) {
  if (typeof x !== 'number' || !isFinite(x)) return x;
  const r = Math.round(x * 100) / 100;
  return Object.is(r, -0) ? 0 : r;
}
function fnum(x) {
  const r = r2(x);
  return Object.is(r, -0) ? '0' : String(r);
}
function parseLinear(right) {
  let e = String(right).replace(/\s+/g, '');
  let k = 0, b = 0;
  const xm = e.match(/([+-]?\d*\.?\d*)x/);
  if (xm) {
    const s = xm[1];
    k = (s === '' || s === '+') ? 1 : (s === '-' ? -1 : parseFloat(s));
    e = e.replace(xm[0], '');
    b = e.trim() === '' ? 0 : (parseFloat(e) || 0);
  } else {
    b = parseFloat(e) || 0;
  }
  return { k, b };
}
function parseQuad(right) {
  let e = String(right).replace(/\s+/g, '');
  const am = e.match(/([+-]?\d*\.?\d*)x²/);
  if (!am) return null;
  let a = am[1]; a = (a === '' || a === '+') ? 1 : (a === '-' ? -1 : parseFloat(a));
  e = e.replace(am[0], '');
  let b = 0;
  const bm = e.match(/([+-]?\d*\.?\d*)x/);
  if (bm) { const s = bm[1]; b = (s === '' || s === '+') ? 1 : (s === '-' ? -1 : parseFloat(s)); e = e.replace(bm[0], ''); }
  const c = e.trim() === '' ? 0 : (parseFloat(e) || 0);
  return { a, b, c };
}
function linearEq(k, b) {
  let s = 'y=';
  if (k === 0) return s + fnum(b);
  s += (k === 1 ? 'x' : k === -1 ? '-x' : fnum(k) + 'x');
  if (b > 0) s += '+' + fnum(b);
  else if (b < 0) s += fnum(b);
  return s;
}

// 多语种路由词
const LINE_W = '直线|一次函数|直線|line|linear|droite|gerade|recta|retta|خط مستقيم|خط مستقیم|직선|مستقيم|مستقیم';
const PARA_W = '二次函数|二次函數|抛物线|拋物線|parabola|parábola|parabole|Parabel|قطع مكافئ|سهمی|이차함수|포물선';
const VERTEX_W = '顶点|頂点|vertex|最值|最低点|最高点|sommet|Scheitel|vértice|vertice|رأس|꼭짓점';
const INTERSECT_W = '交点|交點|intersection|intersect|相交|Schnittpunkt|intersección|intersezione|تقاطع|برخورد|교점';

module.exports = {
  id: 'function-graph',
  name: '函数图像',
  keywords: i18n.keywords('function-graph'),

  match(problem, opts = {}) {
    const t = String(problem || '').toLowerCase();
    let s = 0;
    if (new RegExp('(' + LINE_W + '|解析式)', 'i').test(t)) s += 3;
    if (new RegExp('(' + PARA_W + '|' + VERTEX_W + ')', 'i').test(t)) s += 4;
    if (/(斜率|截距|傾き|切片|기울기|절편|pente|Steigung|pendiente|pendenza|ميل|شیب|slope|intercept)/.test(t)) s += 3;
    if (new RegExp('(' + INTERSECT_W + ')', 'i').test(t)) s += 4;
    if (/(函数图像|函數圖像|グラフ|그래프|graph|رسم بياني|نمودار|座標|坐标|coordinate|repère|koordinate|coordenada|coordinata)/.test(t)) s += 2;
    if (/(y\s*=\s*[^。？?]*x)/.test(t)) s += 3;
    if (/(x²|x\^2)/.test(t)) s += 4;
    if (/(行程|距离.*时间|水温|temperature|distance.*time|درجة الحرارة|دما|거리|시간)/.test(t)) s += 1;
    // 强信号：直线经过两点（坐标点）→ 高分
    if (new RegExp('(' + LINE_W + ')', 'i').test(t) && /\(\s*-?\d+(?:\.\d+)?\s*[,،，]\s*-?\d+(?:\.\d+)?\s*\)/.test(t)) s += 6;
    // 函数求值：y=kx+b 在 x=? 时
    if (/(y\s*=\s*[+-]?\d*x|x\s*=\s*-?\d)/.test(t) && /(函数|函數|関数|함수|function|fonction|funktion|función|funzione|دالة|تابع)/.test(t)) s += 4;
    return s;
  },

  extract(problem, opts = {}) {
    const t = String(problem || '');
    const low = t.toLowerCase();

    const eqRe = /y\s*=\s*([+-]?\d*\.?\d*x(?:²)?(?:\s*[+-]\s*\d*\.?\d*(?:x(?:²)?)?)*)/g;
    const eqs = [];
    let m;
    while ((m = eqRe.exec(t)) !== null) eqs.push(m[1].trim());

    const ptRe = /\(\s*(-?\d+(?:\.\d+)?)\s*[,،，]\s*(-?\d+(?:\.\d+)?)\s*\)/g;
    const pts = [];
    while ((m = ptRe.exec(t)) !== null) pts.push([parseFloat(m[1]), parseFloat(m[2])]);

    const xVal = t.match(/x\s*=\s*(-?\d+(?:\.\d+)?)/);

    // 1) 两点求一次函数解析式
    if (pts.length >= 2 && new RegExp('(' + LINE_W + '|function|fonction|funktion|función|funzione|دالة|تابع|함수)', 'i').test(low)) {
      const [p1, p2] = pts;
      return { task: 'linear_points', p1, p2, confidence: 0.9, raw: t };
    }

    // 2) 二次函数顶点
    const quadEqs = eqs.map(e => parseQuad(e)).filter(Boolean);
    if (quadEqs.length >= 1 && new RegExp('(' + VERTEX_W + ')', 'i').test(low)) {
      return { task: 'quadratic_vertex', q: quadEqs[0], confidence: 0.9, raw: t };
    }
    if (quadEqs.length >= 1 && new RegExp('(' + PARA_W + ')', 'i').test(low)) {
      return { task: 'quadratic_vertex', q: quadEqs[0], confidence: 0.7, raw: t };
    }

    // 3) 两条直线交点
    const linEqs = eqs.map(e => parseLinear(e));
    if (linEqs.length >= 2 && new RegExp('(' + INTERSECT_W + ')', 'i').test(low)) {
      return { task: 'intersection', f1: linEqs[0], f2: linEqs[1], confidence: 0.9, raw: t };
    }

    // 4) 已知一次函数求某点函数值
    if (linEqs.length >= 1 && xVal) {
      return { task: 'linear_value', f: linEqs[0], x: parseFloat(xVal[1]), confidence: 0.85, raw: t };
    }

    // 5) 退化为画一条一次函数图像
    if (linEqs.length >= 1) {
      return { task: 'linear_value', f: linEqs[0], x: 1, confidence: 0.5, raw: t, graphOnly: true };
    }

    return null;
  },

  solve(params, opts = {}) {
    const lang = i18n.langOf(opts);
    const T = (key, v) => i18n.t('function-graph', lang, key, v);
    const steps = [];
    let answer, funcs = [], keyPoints = [], formula = '';

    switch (params.task) {
      case 'linear_points': {
        const [x1, y1] = params.p1, [x2, y2] = params.p2;
        const k = (y2 - y1) / (x2 - x1);
        const b = y1 - k * x1;
        const kr = r2(k), br = r2(b);
        answer = linearEq(kr, br);
        funcs = [{ type: 'line', k: kr, b: br, color: '#4f8cff' }];
        keyPoints = [
          { x: x1, y: y1, label: 'A(' + fnum(x1) + ',' + fnum(y1) + ')' },
          { x: x2, y: y2, label: 'B(' + fnum(x2) + ',' + fnum(y2) + ')' },
        ];
        if (x1 !== 0 && x2 !== 0) {
          keyPoints.push({ x: 0, y: br, label: T('label_intercept', { b: fnum(br) }) });
        }
        formula = T('f_lp', { y1: fnum(y1), y2: fnum(y2), x1: fnum(x1), x2: fnum(x2), k: fnum(kr), b: fnum(br) });
        steps.push({ narration: T('n_lp_1'), visualHint: 'concrete_travel' });
        steps.push({ narration: T('n_lp_2', { x1: fnum(x1), y1: fnum(y1), x2: fnum(x2), y2: fnum(y2) }), visualHint: 'graph_line' });
        steps.push({ narration: formula + ' — ' + answer, visualHint: 'formula' });
        break;
      }
      case 'linear_value': {
        const { k, b } = params.f;
        const y = k * params.x + b;
        funcs = [{ type: 'line', k, b, color: '#4f8cff' }];
        keyPoints = [
          { x: 0, y: b, label: '(0,' + fnum(b) + ')' },
          { x: params.x, y: r2(y), label: '(' + fnum(params.x) + ',' + fnum(r2(y)) + ')' },
        ];
        answer = params.graphOnly ? linearEq(k, b) : ('y=' + fnum(r2(y)));
        formula = T('f_lv', { k: fnum(k), x: fnum(params.x), b: fnum(b), y: fnum(r2(y)) });
        steps.push({ narration: T('n_lv_1'), visualHint: 'concrete_temp' });
        steps.push({ narration: T('n_lv_2', { x: fnum(params.x) }), visualHint: 'graph_line' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'quadratic_vertex': {
        const { a, b, c } = params.q;
        const h = -b / (2 * a);
        const vk = a * h * h + b * h + c;
        const hr = r2(h), vr = r2(vk);
        answer = T('ans_vertex', { x: fnum(hr), y: fnum(vr) });
        funcs = [{ type: 'parabola', a, b, c, color: '#f59e0b' }];
        keyPoints = [
          { x: hr, y: vr, label: T('label_vertex', { x: fnum(hr), y: fnum(vr) }) },
          { x: 0, y: c, label: '(0,' + fnum(c) + ')' },
        ];
        formula = T('f_qv', { b: fnum(b), a: fnum(a), h: fnum(hr), v: fnum(vr) });
        steps.push({ narration: T('n_qv_1'), visualHint: 'concrete_ball' });
        steps.push({ narration: T('n_qv_2'), visualHint: 'graph_parabola' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'intersection': {
        const k1 = params.f1.k, b1 = params.f1.b;
        const k2 = params.f2.k, b2 = params.f2.b;
        const xi = (b2 - b1) / (k1 - k2);
        const yi = k1 * xi + b1;
        const xr = r2(xi), yr = r2(yi);
        answer = T('ans_intersection', { x: fnum(xr), y: fnum(yr) });
        funcs = [
          { type: 'line', k: k1, b: b1, color: '#4f8cff' },
          { type: 'line', k: k2, b: b2, color: '#2fd6a5' },
        ];
        keyPoints = [{ x: xr, y: yr, label: '(' + fnum(xr) + ',' + fnum(yr) + ')' }];
        formula = T('f_in', { l1: linearEq(k1, b1).slice(2), l2: linearEq(k2, b2).slice(2), x: fnum(xr), y: fnum(yr) });
        steps.push({ narration: T('n_in_1'), visualHint: 'concrete_meet' });
        steps.push({ narration: T('n_in_2'), visualHint: 'graph_intersect' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      default:
        return { answer: null, steps: [], error: 'unknown_task' };
    }

    return { answer, steps, funcs, keyPoints, formula, task: params.task };
  },

  validate(params, solved, opts = {}) {
    if (!solved || !solved.answer) return { ok: false, reason: 'no_answer' };
    if (!solved.steps || solved.steps.length < 3) return { ok: false, reason: 'need_3_cpa_steps' };
    if (!Array.isArray(solved.funcs) || solved.funcs.length === 0) return { ok: false, reason: 'no_functions_to_plot' };
    if (!Array.isArray(solved.keyPoints) || solved.keyPoints.length === 0) return { ok: false, reason: 'no_key_points' };
    return { ok: true };
  },

  renderParams(solved, opts = {}) {
    const lang = i18n.langOf(opts);
    const T = (key) => i18n.t('function-graph', lang, key);
    return {
      type: 'function-graph',
      rtl: i18n.isRTL(lang),
      language: lang,
      task: solved.task,
      funcs: solved.funcs,
      keyPoints: solved.keyPoints,
      answer: solved.answer,
      formula: solved.formula,
      beats: [
        { id: 'concrete', duration: 5000, label: T('beat_concrete') },
        { id: 'graph', duration: 5000, label: T('beat_graph') },
        { id: 'formula', duration: 5000, label: T('beat_formula') },
      ],
      scenes: [
        { type: 'concrete', hint: solved.steps[0] && solved.steps[0].visualHint },
        { type: 'graph', funcs: solved.funcs, keyPoints: solved.keyPoints },
        { type: 'formula', text: solved.formula },
      ],
    };
  },
};
