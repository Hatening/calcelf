// ============================================================
// CalcElf 动画「零件箱 + 版式判定」（v5.9）
// 设计目的（来自与 DeepSeek / 千问 / Manus 的多轮复盘）：
//   1) 画面走 free（模型自由写一整页 HTML），保证能达到 DeepSeek 网页聊天那种具象、可教学的上限；
//   2) 但不让模型从最底层硬画（否则"青蛙变绿点、下降就消失"）——给它一套可直接粘贴的现成零件；
//   3) 版式必须跟题目天然写法一致：竖式 / 数字谜 → 按数位对齐的竖排棋盘，绝不允许排成横式。
// 本文件只在服务端使用（/lib），不放进 public/lib。
// ============================================================

const PARTS_VERSION = 'ce-parts-1.0';

// ------------------------------------------------------------
// 一、版式（archetype）判定
// ------------------------------------------------------------
function detectArchetype(rawProblem) {
  const t = String(rawProblem || '');
  const zh = t;
  const low = t.toLowerCase();

  // 1) 竖式 / 数字谜（汉字或字母代表数字、竖式计算、进退位）→ 竖排棋盘
  //    中文：竖式 / 列竖式 / 数字谜 / 汉字(字母)代表数字 / 进位 / 退位
  //    英文：column addition|subtraction / long multiplication|division / vertical / cryptarithm / alphametic
  const verticalZH = /竖式|数字谜|字母谜|汉字.{0,6}代表.{0,4}数字|字母.{0,6}代表.{0,4}数字|进位|退位|乘法竖式|除法竖式/;
  const verticalEN = /column\s+(addition|subtraction)|long\s+(multiplication|division)|vertical\s+(calculation|addition|subtraction|multiplication)|cryptarithm|alphametic|written\s+vertically/;
  // 形如「聪明智慧 × 9 = 慧智明聪」「ABCD × 4 = DCBA」的回文/数字谜
  const cryptShape = /([\u4e00-\u9fa5]{3,}|[A-Z]{3,})\s*[×x*]\s*\d+\s*=\s*([\u4e00-\u9fa5]{3,}|[A-Z]{3,})/;
  if (verticalZH.test(zh) || verticalEN.test(low) || cryptShape.test(t)) return 'vertical';

  // 2) 强分数信号（"平均分成N份取M份 / 几分之几"优先于几何——此时圆/长方形只是"整体1"）
  const fracStrongZH = /分数|分之|平均分(成)?|几分之几|约分|通分/;
  const fracStrongEN = /fraction|numerator|denominator|divide\s+into\s+\d+\s+equal/;
  if (fracStrongZH.test(zh) || fracStrongEN.test(low)) return 'fraction';

  // 3) 几何（图形 / 角 / 平行垂直 / 面积周长体积 / 坐标）
  const geoZH = /三角形|正方形|长方形|平行四边形|梯形|圆(形|锥|柱)?|椭圆|角(形)?|平行|垂直|面积|周长|体积|表面积|圆柱|圆锥|相似|全等|对称|如图|图中|线段|直线|射线|高|底边长/;
  const geoEN = /triangle|square|rectangle|parallelogram|trapezoid|circle|ellipse|angle|parallel|perpendicular|area|perimeter|volume|cylinder|cone|similar|congruent|symmetr|line segment|polygon|vertex|coordinate/;
  if (geoZH.test(zh) || geoEN.test(low)) return 'geometry';

  // 4) 弱分数信号（百分数 / 比例；放在几何之后，避免"相似三角形边长比例"被误判）
  const fracWeakZH = /百分|%|比例|比值/;
  const fracWeakEN = /percent|percentage|ratio/;
  if (fracWeakZH.test(zh) || fracWeakEN.test(low)) return 'fraction';

  // 5) 故事 / 应用题（含具体物体与情节）
  const storyZH = /青蛙|蜗牛|树|井|植树|行程|相遇|追及|工程|修路|分配|盈亏|年龄|鸡兔|利润|折扣|浓度|速度|路程|时间|平均(分给)?|每(人|天|小时|个)|多(了|余)|少(了)|剩(下|余)|一共|共有|商品|购物|钱|甲乙(两地|两车|两人)|船|火车|汽车|飞机/;
  const storyEN = /frog|snail|tree|well|plant|travel|meet|chase|journey|distribut|surplus|deficit|age|profit|discount|concentration|speed|distance|each|every|left over|remaining|in total|train|car|boat|plane|apples?|books?|students?|children|kids?/;
  if (storyZH.test(zh) || storyEN.test(low)) return 'story';

  return 'generic';
}

// ------------------------------------------------------------
// 二、各版式的强制指令（layout directive）
// ------------------------------------------------------------
function layoutDirective(archetype) {
  switch (archetype) {
    case 'vertical':
      return `*** MANDATORY LAYOUT: VERTICAL (column) board ***
This problem is a column calculation or a digit/letter cryptarithm. You MUST render it as a VERTICAL board that matches how it is written, using the "VERTICAL BOARD KIT" below.
- Align every number BY PLACE VALUE (ones under ones, tens under tens...), right-aligned. NEVER lay the equation out horizontally for this problem — the child must be able to compare digit by digit.
- Rows top to bottom: first operand, then the operator+second operand row, then a horizontal rule, then the result. Use empty operator-cells as spacers so columns line up.
- Show each carry/borrow small digit appearing at the right moment (use the .carry style), then the resulting digit.
- The SAME symbol (same Chinese character / letter) may appear in several cells: give those cells the SAME data-k value, and when its digit is found, flip ALL of them at once.
- Reveal digits step by step with the pop/flip animation; when fully solved, turn the board into the "done" green state.`;
    case 'geometry':
      return `*** MANDATORY LAYOUT: GEOMETRY figure ***
Draw the actual figure (use inline <svg>) with correct relative shape: sides, angles, parallel/perpendicular marks, equal-length tick marks, and labels (A/B/C…, given lengths/angles).
- Animate the CONSTRUCTION and the RELATIONS in order (e.g. draw the base, add the height, then shade/transform the part that matters). Do not just state a theorem.
- If an auxiliary line, a move, a cut-and-reassemble, or a coordinate is the key idea, show that change visibly, then state what equality it proves.
- Keep the figure centered and large; put a short explanation under it.`;
    case 'fraction':
      return `*** MANDATORY LAYOUT: FRACTION model ***
Show the WHOLE first (one bar or one pie), then divide it into equal parts with visible divider lines, then shade the exact number of parts in the problem.
- Animate parts being counted/shaded one by one; for operations, show the two wholes and the result aligned so equal parts can be compared.
- Use a bar for linear problems and a pie for "parts of a whole"; never replace the model with only a sentence.`;
    case 'story':
      return `*** MANDATORY LAYOUT: STORY scene with the real objects ***
Draw the concrete things from the story (use the matching ACTOR KIT snippet — do not hand-draw them as plain dots) and animate their states.
- Each actor keeps ONE stable identity from start to end; moving it only changes its position (use a single path or tween), it must never be deleted/recreated or vanish mid-motion.
- Day/night or before/after changes use an indicator (sun/moon) and keep the same figure. For two distribution plans, place them left vs right and link with the equality that solves the problem.
- Every logical step is a visible change of these objects, not a paragraph.`;
    default:
      return `*** MANDATORY LAYOUT: at least one real diagram ***
Even if the problem looks abstract, you MUST include a visual model — a comparison, a bar/number-line, a table, or a small diagram — that makes the key relationship visible. A page made only of text cards is not acceptable.`;
  }
}

// ------------------------------------------------------------
// 三、零件箱（可直接粘贴；放在模型 prompt 里）
// ------------------------------------------------------------
function partsBin() {
  return KIT;
}

const KIT = `=== REUSABLE PARTS KIT (paste these verbatim; they are guaranteed to render) ===
You are free to design layout, story, colors and pacing, BUT for the standard objects below prefer these ready-made pieces instead of drawing them from scratch. Put ACTOR snippets inside your own <svg viewBox="0 0 1000 600"> and move them by editing the translate(X,Y). Keep the same id/identity for an actor across the whole timeline.

--- KIT 1: VERTICAL BOARD (for vertical / cryptarithm problems) ---
CSS (put in your <style>); set N = number of columns = the digit count of the widest operand/result:
.vboard{margin:12px auto;display:grid;grid-template-columns:repeat(N,minmax(0,1fr));gap:8px;max-width:380px}
.vcell{aspect-ratio:1;display:grid;place-items:center;border-radius:14px;font-size:clamp(24px,6vw,36px);font-weight:800;color:#94a3b8;background:#f1f5ff;border:1px solid #dbe4ff}
.vop{background:transparent;border:none;display:grid;place-items:center;font-size:clamp(18px,5vw,26px);font-weight:700;color:#64748b}
.vline{grid-column:1/-1;height:3px;border-radius:3px;background:linear-gradient(90deg,transparent,#94a3b8 12%,#94a3b8 88%,transparent)}
.vcell.on{color:#0f2d6b;background:#dbe8ff;border-color:#7aa0f7;animation:vpop .5s cubic-bezier(.2,1.5,.45,1) both}
.vcell.carry{color:#b45309;background:#fff3d6;border-color:#f5b453;font-size:16px;align-self:start}
.vboard.done .vcell.on{color:#14532d;background:#dcfce7;border-color:#86efac}
@keyframes vpop{0%{transform:scale(.6) rotateY(70deg);opacity:.3}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
HTML pattern (example: a 4-digit cryptarithm; add/remove cells to match N; use empty <div class="vop"></div> spacers so digits align by place value):
<div class="vboard" id="vb">
  <!-- operand 1 -->
  <div class="vcell" data-k="A">?</div><div class="vcell" data-k="B">?</div><div class="vcell" data-k="C">?</div><div class="vcell" data-k="D">?</div>
  <!-- operator + operand 2 (right aligned; leading spacers) -->
  <div class="vop"></div><div class="vop">×</div><div class="vop"></div><div class="vop">9</div>
  <div class="vline"></div>
  <!-- result -->
  <div class="vcell" data-k="D">?</div><div class="vcell" data-k="C">?</div><div class="vcell" data-k="B">?</div><div class="vcell" data-k="A">?</div>
</div>
JS helper to flip every cell that shares a symbol at once:
function vReveal(k,val,carry){document.querySelectorAll('#vb .vcell[data-k="'+k+'"]').forEach(el=>{el.textContent=val;el.classList.remove('on');void el.offsetWidth;el.classList.add('on');});}

--- KIT 2: FROG ---
<g transform="translate(X,Y)" id="frog">
  <ellipse cx="0" cy="6" rx="20" ry="15" fill="#58b368"/>
  <circle cx="-11" cy="-9" r="7" fill="#fff"/><circle cx="-11" cy="-9" r="3" fill="#1f2937"/>
  <circle cx="11" cy="-9" r="7" fill="#fff"/><circle cx="11" cy="-9" r="3" fill="#1f2937"/>
  <path d="M-16 15 Q0 27 16 15" stroke="#3f8a4d" stroke-width="4" fill="none" stroke-linecap="round"/>
</g>

--- KIT 3: SNAIL ---
<g transform="translate(X,Y)" id="snail">
  <circle cx="-2" cy="-2" r="16" fill="#f2c14e"/>
  <circle cx="-2" cy="-2" r="10" fill="none" stroke="#9a6a2f" stroke-width="2.5"/>
  <circle cx="-2" cy="-2" r="5" fill="none" stroke="#9a6a2f" stroke-width="2.5"/>
  <path d="M12 8 h18" stroke="#c98a4b" stroke-width="7" stroke-linecap="round"/>
  <path d="M28 8 q5,-2 5,-9" stroke="#c98a4b" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="34" cy="-3" r="2.4" fill="#1f2937"/>
</g>

--- KIT 4: TREE (solid; dashed variant for an "empty/未种" tree) ---
<g transform="translate(X,Y)" id="tree">
  <rect x="-7" y="0" width="14" height="70" rx="6" fill="#9c6b43"/>
  <circle cx="0" cy="-24" r="40" fill="#5fae6e"/>
  <circle cx="-26" cy="-8" r="26" fill="#67b877"/>
  <circle cx="26" cy="-8" r="26" fill="#67b877"/>
</g>
<!-- empty / not-yet-planted: replace the three canopy circles with one dashed outline:
<circle cx="0" cy="-20" r="40" fill="none" stroke="#94a3b8" stroke-width="3" stroke-dasharray="7 8"/> -->

--- KIT 5: WELL / SHAFT (vertical, with depth ruler) ---
<g transform="translate(X,Y)" id="well">
  <rect x="-48" y="0" width="96" height="300" rx="14" fill="#1f2740" stroke="#3a466b" stroke-width="4"/>
  <ellipse cx="0" cy="8" rx="48" ry="14" fill="#2b3556"/>
  <line x1="-32" y1="26" x2="-32" y2="284" stroke="#5b689e" stroke-width="2" stroke-dasharray="3 13"/>
  <line x1="32" y1="26" x2="32" y2="284" stroke="#5b689e" stroke-width="2" stroke-dasharray="3 13"/>
</g>

--- KIT 6: KID / PERSON ---
<g transform="translate(X,Y)" id="kid">
  <circle cx="0" cy="-34" r="16" fill="#ffd9b0"/>
  <rect x="-15" y="-18" width="30" height="42" rx="13" fill="#5b8ff9"/>
</g>

--- KIT 7: DOG ---
<g transform="translate(X,Y)" id="dog">
  <ellipse cx="8" cy="8" rx="22" ry="13" fill="#b07a4f"/>
  <circle cx="-16" cy="-4" r="11" fill="#b07a4f"/>
  <circle cx="-21" cy="-12" r="4" fill="#8f5f3a"/>
  <circle cx="-18" cy="-5" r="1.8" fill="#1f2937"/>
  <path d="M28 4 q10,-2 14,-11" stroke="#b07a4f" stroke-width="5" fill="none" stroke-linecap="round"/>
  <rect x="-2" y="18" width="5" height="12" fill="#8f5f3a"/><rect x="15" y="18" width="5" height="12" fill="#8f5f3a"/>
</g>

--- KIT 8: SUN and MOON (day/night indicator, usually top-left) ---
<g transform="translate(X,Y)" id="sunIcon">
  <circle r="18" fill="#ffd166"/>
  <g stroke="#ffd166" stroke-width="4" stroke-linecap="round">
    <line x1="-30" y1="0" x2="-24" y2="0"/><line x1="24" y1="0" x2="30" y2="0"/>
    <line x1="0" y1="-30" x2="0" y2="-24"/><line x1="0" y1="24" x2="0" y2="30"/>
    <line x1="-21" y1="-21" x2="-17" y2="-17"/><line x1="17" y1="17" x2="21" y2="21"/>
    <line x1="21" y1="-21" x2="17" y2="-17"/><line x1="-17" y1="17" x2="-21" y2="21"/>
  </g>
</g>
<path d="M14 -16 a20 20 0 1 0 0 32 a16 16 0 1 1 0 -32 z" fill="#cdd9ff"/>

--- KIT 9: BALANCE SCALE (equality / equation meaning) ---
<g transform="translate(X,Y)" id="scale">
  <line x1="0" y1="12" x2="0" y2="-42" stroke="#64748b" stroke-width="5"/>
  <line x1="-52" y1="-42" x2="52" y2="-42" stroke="#64748b" stroke-width="5"/>
  <path d="M-80 -14 h30 l-15 17 z" fill="#5b8ff9"/>
  <path d="M50 -14 h30 l-15 17 z" fill="#f59e0b"/>
  <path d="M-15 12 h30 l7 13 h-44 z" fill="#64748b"/>
</g>

--- KIT 10: COORDINATE AXES ---
<g stroke="#475569" stroke-width="3">
  <line x1="60" y1="520" x2="940" y2="520"/><polygon points="940,520 926,513 926,527" fill="#475569"/>
  <line x1="90" y1="545" x2="90" y2="60"/><polygon points="90,60 83,74 97,74" fill="#475569"/>
</g>

--- KIT 11: FRACTION BAR (shade exact parts; width of shaded = parts/total × bar width) ---
<g id="fracBar">
  <rect x="200" y="270" width="600" height="44" rx="9" fill="#e5edff" stroke="#93b4f5" stroke-width="2"/>
  <!-- add vertical divider lines for equal parts; add one shaded rect from x=200 with the shaded width -->
</g>
=== END PARTS KIT ===`;

module.exports = { detectArchetype, layoutDirective, partsBin, PARTS_VERSION };
