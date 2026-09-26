// lib/anim-topology.js — 通用"场景拓扑 + 目标"层（举一反三，不逐题刷题）
// 作用：自由动画生成前，识别题目所处的【空间拓扑】和【数学目标】，
//       返回与具体题目无关、可复用于该结构所有变体的工程/数学规律（含公式）。
// 有限的拓扑/目标集合即可覆盖海量题目：
//   环形跑道/钟表/齿轮/旋转木马 → closed_loop；
//   最大利润/最省成本/最大面积/最优定价 → optimize（二次→抛物线顶点）。
'use strict';

// —— 多语言线索 ——
const LOOP_RE = /环形跑道|环形|跑道|操场|圆形|圆周|绕.*圈|circular track|running track|closed loop|around the track|oval track|円形|トラック|周回|원형|트랙|한 바퀴|piste circulaire|anneau|kreisbahn|laufbahn|pista circular|anello|circolare|مسار دائري|مضمار|دائري|دائرية|حلقي|حلقة|المضمار|مسیر دایره|حلقه|دایره‌ای/;
const OPT_RE = /最大利润|最大收益|最大盈利|利润最大|最多赚|最少|最省|最优定价|售价定为|定价.*为|maximum profit|maximize|max profit|minimum cost|optimal (price|cost)|best price|最大(利益|な)|最適|利益の最大|최대 이익|최적 가격|profit maximal|prix optimal|maximaler gewinn|optimaler preis|kosten minimal|beneficio máximo|precio óptimo|profitto massimo|prezzo ottimale|أقصى ربح|السعر الأمثل|حداکثر سود|قیمت بهینه|کمینه هزینه/;

const TOPOLOGIES = [
  { tag: 'closed_loop', re: LOOP_RE, law:
`CLOSED-LOOP / CIRCULAR TRACK — motion on a closed ring of circumference L:
- Draw the track as a stroked circle/ellipse ring; mark the common start point; every mover is a persistent dot ON the ring (never a straight line).
- Position each mover by ANGLE: theta = theta0 + sign*(s/L)*2*pi, with s = speed*elapsed; sign=+1 clockwise, -1 counter-clockwise; wrap theta mod 2*pi so they keep going around.
- SAME direction (chase): relative speed = |v1-v2|; starting together, the first catch is when the faster gains one full lap L: t = L/|v1-v2|. Highlight the gained lap and show each runner's lap count.
- OPPOSITE directions: relative speed = v1+v2; one angle increases, the other decreases. After time t the combined covered arc = (v1+v2)*t; distance ALONG the track = that value mod L, and the shorter-arc separation = min(d, L-d). They first meet when (v1+v2)*t = L.
- If the problem asks both a same-direction and an opposite-direction part, use two side-by-side panels. Label arc lengths, speeds and the meeting point.` },
  { tag: 'optimize', re: OPT_RE, law:
`OPTIMIZATION — choose a price/quantity that maximizes or minimizes an objective:
- Let the decision variable be x (e.g. selling price). From the "each +1 -> sales change by k" rule write demand q(x); revenue = x*q; total cost = unit*q + fixed; objective P(x) = revenue - cost.
- Simplify P(x). If P = a*x^2 + b*x + c: a<0 => downward parabola, MAXIMUM at the vertex x* = -b/(2a); a>0 => minimum there. Pbest = P(x*). Show the axis of symmetry.
- Plot axes (x = decision, y = objective) and the parabola; animate a point moving along the curve into the vertex and pulse it.
- Integer constraint (whole yuan / whole items): evaluate floor(x*) and ceil(x*) and keep the better feasible one.
- Interpret honestly: if Pbest < 0 the optimum only minimizes a loss. For "at least G": solve P(x) >= G — a quadratic inequality whose answer is the interval between the two roots — and state that feasible range.` },
];

/** 识别题目命中的拓扑/目标标签 */
function detectTopology(problem) {
  const t = String(problem || '').toLowerCase();
  return TOPOLOGIES.filter(x => x.re.test(t)).map(x => x.tag);
}

/** 返回命中拓扑的通用规律文本（注入自由动画 prompt）；未命中返回空串 */
function topologyGuide(problem) {
  const t = String(problem || '').toLowerCase();
  const hit = TOPOLOGIES.filter(x => x.re.test(t));
  if (!hit.length) return '';
  return '\n=== SCENE TOPOLOGY LAWS (generic rules for this problem structure; apply exactly) ===\n'
    + hit.map(x => x.law).join('\n\n') + '\n';
}

module.exports = { detectTopology, topologyGuide };
