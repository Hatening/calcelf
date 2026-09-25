// ============================================================
// CalcElf 固定动画分镜（AnimationPlan）v1.5 (v5.7.6)
// v1.5：新增 motion 场景（相遇/追及/同向背向：固定轨道+移动圆脸+相遇点+时间算式）。
// CalcElf 固定动画分镜（AnimationPlan）v1.4 (v5.7.5)
// v1.4：新增 diagram 场景（number_line/coordplane/linegraph/angle/triangle/rectangle/circle/
//       areagrid/spinner/arraydots 十种固定教学图形），覆盖整数、坐标函数、几何、面积、概率、乘法阵列。
// v1.3：盈亏题 compare 自动展开五段视觉（planA/planB/diff/gap/total），不再用 say 文字叙述。
// v1.2：全局视觉门禁——任何分镜必须含 eq/bar/barstep/layers/compare 之一，纯文本分镜判不合格；
//       prompt 强制盈亏题走 surplus_deficit/compare、所有可见文字跟随请求语言。
// 模型只允许产出受白名单约束的 JSON 分镜；这里做确定性校验与清洗。
// 校验失败 → 上层回退到静态步骤卡，绝不渲染模型自由 HTML。
// 支持模板：
//   linear_equation（方程天平）
//   fraction / ratio / percentage（条形模型）
//   sequence（规律递推：层数/图形按规则增长，数值由前端确定性计算）
//   surplus_deficit（盈亏分配：两种分配方案，一多一少，数值由前端确定性计算）
//   generic（通用故事板：show/say/eq/check/answer，任何可解题目都应尽量可视化）
// ============================================================

const LIB_VERSION = 'ce-anim-3.4';
const PROBLEM_TYPES = ['linear_equation', 'fraction', 'ratio', 'percentage', 'sequence', 'surplus_deficit', 'motion', 'story_world', 'geometry', 'force', 'circuit', 'molecule', 'process', 'word_problem', 'generic'];
const ACTOR_TYPES = ['frog','tree','tree_dash','sapling','well','person','dog','cat','rabbit','bird','butterfly','cloud','sun','box','apple','ball','car','house','book','water','flower','fish'];
// v3.4 具象质量门：只有这些"真正画图/动画"的场景才算可视化。
// adaptive 是"编号步骤+说明+公式"的文字列表（=用户看到的"解题步骤"），不计入；
// show/say/check/answer 是纯文字，也不计入。不含任一具象场景的分镜一律判不合格 → 上层落自由生成。
const CONCRETE_VISUAL = ['eq','bar','barstep','layers','compare','diagram','motion','wellclimb','world','geometry','force','circuit','molecule','process'];
function isConcretePlan(plan) {
  // {eligible:false} 或无 scenes 的对象自然返回 false
  return !!(plan && Array.isArray(plan.scenes) &&
    plan.scenes.some(s => s && CONCRETE_VISUAL.includes(s.t)));
}
const WC_I18N = {
  en:       { day: 'Day {n} · daytime', night: 'Night {n}', out: 'climbs out!' },
  'zh-CN':  { day: '第{n}天 白天', night: '第{n}天 晚上', out: '跳出井口！' },
  'zh-TW':  { day: '第{n}天 白天', night: '第{n}天 晚上', out: '跳出井口！' },
  ja:       { day: '第{n}日 昼', night: '第{n}日 夜', out: '飛び出した！' },
  ko:       { day: '제{n}일 낮', night: '제{n}일 밤', out: '탈출!' },
  fr:       { day: 'Jour {n}', night: 'Nuit {n}', out: 'il sort !' },
  de:       { day: 'Tag {n}', night: 'Nacht {n}', out: 'geschafft!' },
  es:       { day: 'Día {n}', night: 'Noche {n}', out: '¡sale!' },
  it:       { day: 'Giorno {n}', night: 'Notte {n}', out: 'esce!' },
  ar:       { day: 'اليوم {n} نهارًا', night: 'الليلة {n}', out: 'خرج!' },
  fa:       { day: 'روز {n}', night: 'شب {n}', out: 'بیرون آمد!' }
};

// 确定性题型识别：高置信的常见 K12 题型直接锁定 problemType + 必备场景，
// 不依赖模型自由分类；识别不准返回 null（交回模型判断）。
function detectArchetype(problem) {
  const t = String(problem || '');
  const low = t.toLowerCase();
  // 青蛙/动物爬井（爬上去又滑下来）
  if (/(井|well)/.test(low) && /(爬|climb)/.test(low) && /(滑|slip|fall back|fallback)/.test(low))
    return { problemType: 'story_world', requireScene: 'wellclimb', note: 'a creature climbs a vertical well/shaft and slips back; day and night alternate' };
  // 盈亏问题：两种分配，一剩一缺
  const left = /(剩|余|多出?\s*\d|leftover|left over|\d+\s+left)/.test(low);
  const short = /(少|缺|short|need|lacks?\b)/.test(low);
  const per = /(每人|每个|每个小朋友|each|per (person|kid|child|student))/.test(low);
  if (per && left && short)
    return { problemType: 'surplus_deficit', requireScene: 'compare', note: 'two allocation plans, one left over and one short' };
  // 行程：相遇/追及/同向
  if (/(相遇|相向|toward (each other)?|meet(ing)?|追及|chase|catch up|同向|same direction)/.test(low) ||
      (/(km\/h|m\/min|mph|速度|speed)/.test(low) && /(相距|路程|distance|apart|between)/.test(low)))
    return { problemType: 'motion', requireScene: 'motion', note: 'objects moving, meeting or chasing' };
  // 数列规律
  if (/(找规律|规律|第\s*\d+\s*个|sequence|terms?|pattern)/.test(low) && /(\d+[，,、\s]+\d+|\.\.\.|…)/.test(t))
    return { problemType: 'sequence', requireScene: 'layers', note: 'terms growing by a fixed rule' };
  // 百分数 / 分数 / 比例
  if (/(%|percent)/.test(low)) return { problemType: 'percentage', requireScene: 'bar', note: 'percent of a quantity' };
  if (/(\d+\s*\/\s*\d+|分之|fraction)/.test(low)) return { problemType: 'fraction', requireScene: 'bar', note: 'fraction of a whole' };
  if (/(的比|比是|比例|ratio|\d+\s*:\s*\d+)/.test(low)) return { problemType: 'ratio', requireScene: 'bar', note: 'ratio relationship' };
  // 动物/角色在故事里移动
  const animal = /(青蛙|蛙|狗|犬|兔|猫|鸟|猴|乌龟|frog|dog|rabbit|cat|bird|monkey|turtle|tortoise)/.test(low);
  const move = /(爬|走|跑|跳|搬|运|游|飞|climb|walk|run|jump|carry|swim|fly)/.test(low);
  if (animal && move) return { problemType: 'story_world', requireScene: 'world', note: 'an animal moves through the story' };
  return null;
}
const EQ_OPS = ['add', 'subtract', 'multiply', 'divide'];
const SHADES = ['blue', 'amber', 'green', 'gray', 'sky'];
const DIAGRAM_KINDS = ['number_line','coordplane','linegraph','angle','triangle','rectangle','circle','areagrid','spinner','arraydots'];
const MIN_MS = 1500, MAX_MS = 6000, DEFAULT_MS = 3200;

function buildPlannerPrompt(b, stepCount) {
  return `
You are CalcElf's Animation Director. You do NOT write code, HTML, CSS or SVG.
You describe scenes as ONE JSON object of structured facts; the renderer draws everything in a fixed friendly style. All visible text MUST be in language: ${b.language || 'en'}. Stage: ${b.stage || 'prefer_not'}.
${b.archetype ? '*** ARCHETYPE LOCK (high-confidence pattern match — you MUST follow) *** Classify as problemType "'+b.archetype.problemType+'" and the plan MUST include a "'+b.archetype.requireScene+'" scene. Reason: '+b.archetype.note+'. Do not override this lock.' : ''}
${b.amplify ? '*** PREVIOUS ATTEMPT WAS REJECTED as too text-only / formulaic *** You MUST now list "entities" (the real objects in the problem, each with a stable id and a built-in type) AND include at least ONE concrete animated visual scene: "world" (a moving creature/object story), "bar"/"barstep" (fraction/ratio/percent), "motion" (travel/meeting/chasing), "compare" (two allocation plans), "layers" (growing sequence) or "diagram" (geometry/numbers). A plan made only of show/say/adaptive/check/answer is INVALID.' : ''}

PROBLEM:
${String(b.problem || '').slice(0, 2000)}

VERIFIED SOLUTION STEPS (do not invent different math; index starts at 1):
${JSON.stringify((b.solutions || []).slice(0, 1), null, 0).slice(0, 3800)}

=== YOUR JOB ===
Reconstruct this problem into a clear visual LESSON: where it starts, each operation, how the quantity changes, and the verified answer. Use the visual that genuinely clarifies THIS problem. NEVER force a balance scale, a bar, a person, an atom or an equation when a different picture (or a plain step timeline) is clearer.

=== STEP 1: CLASSIFY ===
- "linear_equation": one-variable equation, same operation on both sides (2x+5=17).
- "fraction"/"ratio"/"percentage": equal-part bar (tape) models.
- "sequence": figures/terms that grow by a fixed recurrence.
- "surplus_deficit": TWO allocation plans, one with items left over, one short.
- "motion": distance/rate/time, objects moving toward / chasing / same direction.
- "geometry": points, segments, angles, triangles, circles, area relationships.
- "force": physics forces / acceleration, a body with arrows.
- "circuit": connected electrical components, current/voltage.
- "molecule": atoms, bonds, ions or a reaction.
- "process": flow, levels, or a quantity transformed across states/days.
- "story_world": a story where a creature/object/vehicle moves through states (animals, people carrying items, a journey). For a VERTICAL climb-and-slip (a frog/snail in a well or shaft, climbs by day and slips by night) use the compact "wellclimb" scene; for other moving stories use "world" scenes.
- "word_problem": multi-step real-life problem where a quantity changes across actions (use adaptive/process/bar).
- "generic": anything else solvable.
Output {"eligible":false} ONLY for non-academic input (chit-chat, greeting, empty).

=== STEP 2: SCENES ===
Text scenes:
- {"t":"show","text":"<short restatement, plain unicode math>"}
- {"t":"say","text":"<=80 chars, one kid-friendly sentence"}
- {"t":"check","text":"2(6)+5 = 17","label":"<=40 chars, substitute to verify"}
- {"t":"answer","text":"x = 6","label":"<=40 chars"}
PREFERRED for most word problems and whenever a fixed subject icon would feel forced — the adaptive teaching timeline:
- {"t":"adaptive","title":"<=60 chars","summary":"<=120 chars, the big idea","steps":[
    {"label":"<=32 chars, this step","explanation":"<=150 chars, what happens and why","formula":"<=90 chars, short plain text","from":"<state before>","to":"<state after>"}
  ],"answerLabel":"<=60 chars, final answer"}
  Use 2..8 steps; from/to are the quantity before and after each operation; numbers MUST come from the verified solution. The renderer lays these out as a clean numbered timeline — this is free composition, NOT a fixed icon.
Fixed visual scenes (use only when they genuinely fit):
- {"t":"eq","from":"2x + 5 = 17","to":"2x = 12","op":"subtract","value":"5","label":"...","step":1}  op add|subtract|multiply|divide.
- {"t":"bar"/"t":"barstep","label":"...","bars":[{"cells":12,"segs":[{"a":1,"b":3,"shade":"blue","label":"1/4"}]}]}
      cells 2..24; up to 3 bars; shade blue|amber|green|gray|sky; a,b 1-based inclusive.
- {"t":"layers","label":"...","rowsLabel":"Layer","start":2,"recMul":2,"recAdd":1,"showRows":5,"asks":[{"label":"Layer 6","n":6}],"answerLabel":"..."}
      value(k)=value(k-1)×recMul+recAdd; start 0..9999; recMul 1..9; recAdd -99..999; showRows 2..8; asks n 2..40.
- {"t":"compare","unit":"trees","perA":5,"extra":3,"perB":6,"lack":3,"people":6,"answerLabel":"..."}
      Plan A perA each + extra left; Plan B perB each but lack short; perB>perA; numbers must satisfy perA*people+extra == perB*people-lack.
- {"t":"diagram","kind":"number_line|coordplane|linegraph|angle|triangle|rectangle|circle|areagrid|spinner|arraydots","label":"..."}
      number_line(min,max,value); coordplane(points:[{x,y,label}]); linegraph(slope,intercept); angle(degrees); triangle(a,b,c); rectangle(w,h); circle(r); areagrid(cols,rows,filled); spinner(segments); arraydots(rows,cols).
- {"t":"motion","label":"...","startLabel":"A","endLabel":"B","distance":2400,"unit":"m",
   "objs":[{"label":"A","color":0,"from":4,"to":54,"dir":"right","speed":"65 m/min"},
           {"label":"B","color":1,"from":96,"to":54,"dir":"left","speed":"55 m/min"}],
   "meet":54,"timeLabel":"2400 m · t = 2400/(65+55) = 20 min"}
      positions 0=left,100=right; objs 1..2; meet optional.
- {"t":"geometry","points":[{"id":"A","label":"A","x":10,"y":80},{"id":"B","label":"B","x":90,"y":80}],"segments":[{"from":"A","to":"B"}],"formula":"..."}
      up to 12 points (coordinates 0..100), 16 segments.
- {"t":"force","body":"block","forces":[{"label":"push","direction":"right","magnitude":30,"unit":"N"}],"netLabel":"..."}
      direction left|right|up|down; up to 6 forces.
- {"t":"circuit","components":[{"id":"b","label":"battery","kind":"battery","x":15,"y":50},{"id":"l","label":"lamp","kind":"lamp","x":80,"y":50}],"connections":[{"from":"b","to":"l"}],"formula":"..."}
- {"t":"molecule","atoms":[{"id":"o1","element":"O","x":30,"y":50},{"id":"h1","element":"H","x":70,"y":50}],"bonds":[{"from":"o1","to":"h1","order":1}],"reactionLabel":"..."}
- {"t":"process","source":{"label":"before","x":15,"y":50},"target":{"label":"after","x":85,"y":50},"particles":6,"formula":"..."}

VERTICAL WELL / CLIMB-AND-SLIP (frog or snail in a well/shaft/pole that climbs by day and slips back by night) — output ONE COMPACT scene; the system expands every day/night beat, moves the climber along a ruler, and switches a sun/moon indicator top-left:
- {"t":"wellclimb","depth":10,"up":3,"down":2,"unit":"m"}
  depth = total height to escape (2..60); up = distance climbed each day (1..depth); down = distance slipped each night (0..up-1); if up>=depth it escapes on day 1. The last day it reaches the top it does NOT slip. Numbers MUST match the verified solution. Do NOT use "world" (that is a horizontal stage) or "adaptive" for this.

STORY-WORLD scenes (PREFERRED for any story with a moving creature/object, e.g. a frog climbing a well):
- First list entities, each with a stable id and a built-in type:
  "entities":[{"id":"frog1","type":"frog","label":"Frog"},{"id":"well1","type":"well","label":"Well"}]
  Use ONLY these types (never invent): frog,tree,tree_dash,sapling,well,person,dog,cat,rabbit,bird,butterfly,cloud,sun,box,apple,ball,car,house,book,water,flower,fish.
  Normalize synonyms (蛙→frog; 小狗/狗/犬→dog; 井/水井→well; 小朋友/男孩/女孩→person).
- {"t":"world","caption":"<=120 chars, what happens in this beat","actors":[
    {"id":"frog1","type":"frog","x":120,"y":170},
    {"id":"well1","type":"well","x":270,"y":150}],
  "moves":[{"target":"frog1","path":[[120,170],[150,120],[180,70]],"dur":2}]}
  Coordinates: ground y about 170; higher on screen = SMALLER y (top about 40); x 20..380.
  An actor is created ONCE and keeps the SAME id for its whole life. Climbing up and slipping down are TWO moves (or two world scenes) on the SAME id; NEVER delete or recreate it. Up = y decreases; down = y increases.

*** MANDATORY VISUAL RULE ***
Every eligible plan MUST contain at least one CONCRETE animated graphic: "eq","bar","barstep","layers","compare","diagram","motion","wellclimb","world","geometry","force","circuit","molecule" or "process". A plan made only of show/say/check/answer, or a text step-list ("adaptive": numbered explanations + formulas), is INVALID and will be rejected. Draw the problem's real objects/quantities and animate their changes. All visible text MUST be in the requested language (${b.language || 'en'}); never leave English when another language is requested.

=== STEP 3: RHYTHM ===
- most word problems: show → adaptive → answer.
- fraction/ratio/percentage: show → bar → barstep... → answer.
- sequence: show → layers → answer.
- surplus_deficit: show → ONE compare → answer (no say; the system expands it).
- motion: show → motion → answer.
- story_world (vertical well/climb-slip): show(optional) → ONE wellclimb (system expands day/night) → answer.
- story_world (other moving stories): show(optional) → world beats (same actor id) → answer.
- geometry/force/circuit/molecule: show → the subject scene (plus adaptive only if it clarifies) → answer.

=== RULES ===
1. All numbers must match the verified steps; never change the math.
2. One scene teaches ONE change. Scenes 3..12. Plain unicode only (+ − × ÷ =, fractions 1/4): NO LaTeX, NO tags, NO markdown, NO urls.
3. Keep text short and warm; the relationship is the star. Prefer the most specific type; never return eligible:false for a genuine academic problem.

=== OUTPUT ===
Output ONLY the JSON object, no markdown fences or commentary:
{"eligible":true,"problemType":"linear_equation|fraction|ratio|percentage|sequence|surplus_deficit|motion|story_world|geometry|force|circuit|molecule|process|word_problem|generic","entities":[{"id":"frog1","type":"frog","label":"Frog"}],"scenes":[ ... ]}
or {"eligible":false}
or {"eligible":false}`;
}

function cleanStr(x, max) {
  let s = String(x == null ? '' : x);
  s = s.replace(/```/g, '').replace(/<[^>]*>/g, '').replace(/https?:\/\/\S+/g, '').replace(/\\[a-zA-Z]+/g, '').trim();
  if (max && s.length > max) s = s.slice(0, max);
  return s;
}

function clampMs(v) {
  const n = Number(v);
  if (!isFinite(n)) return DEFAULT_MS;
  return Math.max(MIN_MS, Math.min(MAX_MS, n));
}

function numIn(v, lo, hi, dft) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : dft;
}
function intIn(v, lo, hi, dft) {
  const n = parseInt(v, 10);
  if (!isFinite(n)) return dft;
  return Math.max(lo, Math.min(hi, n));
}

function validatePlan(raw, stepCount, lang) {
  if (!raw || typeof raw !== 'object') throw Error('plan not object');
  if (raw.eligible === false) return { eligible: false };
  if (raw.eligible !== true && !Array.isArray(raw.scenes)) return { eligible: false };
  const problemType = PROBLEM_TYPES.includes(raw.problemType) ? raw.problemType : null;
  if (!problemType) return { eligible: false };
  if (!Array.isArray(raw.scenes) || raw.scenes.length < 2) return { eligible: false };
  let entities = [];
  if (Array.isArray(raw.entities)) {
    entities = raw.entities.slice(0, 16).map(e0 => {
      if (!e0) return null;
      const id = cleanStr(e0.id, 24);
      if (!id) return null;
      const e = { id };
      if (ACTOR_TYPES.includes(e0.type)) e.type = e0.type;
      e.label = cleanStr(e0.label, 24);
      return e;
    }).filter(Boolean);
  }

  let wc = null;
  (Array.isArray(raw.scenes) ? raw.scenes : []).forEach((sc0) => {
    if (wc || !sc0) return;
    const tt = String(sc0.t || sc0.type || '').toLowerCase();
    if (tt !== 'wellclimb' || Array.isArray(sc0.beats)) return;
    const depth = intIn(sc0.depth, 2, 60, 0);
    if (!depth) return;
    const up = intIn(sc0.up != null ? sc0.up : sc0.climb, 1, depth, 0);
    if (!up) return;
    const down = intIn(sc0.down != null ? sc0.down : sc0.slip, 0, up, 0);
    const unit = cleanStr(sc0.unit, 6) || 'm';
    wc = { depth, up, down, unit };
  });
  const scenes = [];
  for (const sc0 of raw.scenes.slice(0, 12)) {
    if (!sc0 || typeof sc0 !== 'object') continue;
    const t = sc0.t || sc0.type;
    const ms = clampMs(sc0.ms || sc0.durationMs || DEFAULT_MS);
    if (t === 'show' || t === 'show_problem') {
      const text = cleanStr(sc0.text || sc0.latex, 160);
      if (text) scenes.push({ t: 'show', text, ms });
    } else if (t === 'say' || t === 'explanation') {
      const text = cleanStr(sc0.text || sc0.label, 120);
      if (text) scenes.push({ t: 'say', text, ms: Math.min(ms, 4000) });
    } else if (t === 'eq' || t === 'transform_equation') {
      if (problemType !== 'linear_equation' && problemType !== 'generic') continue;
      const from = cleanStr(sc0.from ?? sc0.fromLatex, 80);
      const to = cleanStr(sc0.to ?? sc0.toLatex, 80);
      const opRaw = sc0.op?.kind ? String(sc0.op.kind).replace('_both_sides', '') : sc0.op;
      const op = EQ_OPS.includes(opRaw) ? opRaw : 'add';
      const value = cleanStr(sc0.value ?? sc0.operation?.valueLatex ?? '', 24);
      const label = cleanStr(sc0.label, 80);
      let step = parseInt(sc0.verifiedStepId?.toString().replace(/\D/g, '') || sc0.step, 10);
      if (!isFinite(step) || step < 1) step = scenes.filter(s => s.t === 'eq').length + 1;
      if (stepCount && step > stepCount) step = Math.min(step, stepCount);
      if (from && to) scenes.push({ t: 'eq', from, to, op, value, label, step, ms: 4200 });
    } else if (t === 'check' || t === 'verification') {
      const text = cleanStr(sc0.text ?? sc0.latex, 80);
      const label = cleanStr(sc0.label, 60);
      if (text) scenes.push({ t: 'check', text, label, ms: 3000 });
    } else if (t === 'answer' || t === 'answer_reveal') {
      const text = cleanStr(sc0.text ?? sc0.latex ?? sc0.answer, 80);
      const label = cleanStr(sc0.label, 60);
      if (text) scenes.push({ t: 'answer', text, label, ms: 3200 });
    } else if (t === 'bar' || t === 'barstep') {
      if (!['fraction', 'ratio', 'percentage', 'generic'].includes(problemType)) continue;
      const barsIn = Array.isArray(sc0.bars) ? sc0.bars : [];
      const bars = [];
      for (const br0 of barsIn.slice(0, 3)) {
        const cells = Math.max(2, Math.min(24, parseInt(br0.cells, 10) || 0));
        if (!cells) continue;
        const segs = [];
        for (const sg0 of (Array.isArray(br0.segs) ? br0.segs : []).slice(0, 6)) {
          const a = Math.max(1, parseInt(sg0.a ?? sg0.from, 10));
          const b = Math.min(cells, parseInt(sg0.b ?? sg0.to, 10));
          if (!isFinite(a) || !isFinite(b) || b < a) continue;
          const shade = SHADES.includes(sg0.shade) ? sg0.shade : 'blue';
          const label = cleanStr(sg0.label, 20);
          segs.push({ a, b, shade, label });
        }
        if (!segs.length) continue;
        bars.push({ cells, segs, label: cleanStr(br0.label, 30) });
      }
      const label = cleanStr(sc0.label, 80);
      if (bars.length) scenes.push({ t: t === 'barstep' ? 'barstep' : 'bar', label, bars, ms: 4200 });
    } else if (t === 'layers') {
      if (problemType !== 'sequence') continue;
      const start = intIn(sc0.start, 0, 9999, 0);
      const recMul = intIn(sc0.recMul, 1, 9, 2);
      const recAdd = intIn(sc0.recAdd, -99, 999, 1);
      if (recMul === 1 && recAdd === 0) continue;
      const showRows = intIn(sc0.showRows, 2, 8, 5);
      const asksIn = Array.isArray(sc0.asks) ? sc0.asks : [];
      const asks = [];
      for (const a0 of asksIn.slice(0, 2)) {
        const n = intIn(a0 && a0.n, 2, 40, 0);
        if (!n || n <= showRows) continue;
        asks.push({ label: cleanStr(a0.label, 12) || ('n=' + n), n });
      }
      if (!asks.length) continue;
      // 确定性地算一遍，数值爆掉（超过 1e9）则放弃该场景
      let v = start, ok = true;
      const maxN = Math.max(showRows, ...asks.map(a => a.n));
      for (let i = 2; i <= maxN; i++) { v = v * recMul + recAdd; if (Math.abs(v) > 1e9) { ok = false; break; } }
      if (!ok) continue;
      scenes.push({
        t: 'layers',
        label: cleanStr(sc0.label, 20),
        rowsLabel: cleanStr(sc0.rowsLabel, 6),
        start, recMul, recAdd, showRows, asks,
        answerLabel: cleanStr(sc0.answerLabel, 30),
        ms: 5200
      });
    } else if (t === 'compare') {
      if (problemType !== 'surplus_deficit') continue;
      const perA = intIn(sc0.perA, 1, 999, 0), perB = intIn(sc0.perB, 1, 999, 0);
      const extra = intIn(sc0.extra, 0, 9999, 0), lack = intIn(sc0.lack, 0, 9999, 0);
      const people = intIn(sc0.people, 1, 9999, 0);
      if (!perA || !perB || !people) continue;
      const totalA = perA * people + extra, totalB = perB * people - lack;
      // 两种方案必须描述同一总数，否则模型抽错了数字，宁可不渲染该场景
      if (totalA !== totalB || totalA <= 0) continue;
      scenes.push({
        t: 'compare',
        label: cleanStr(sc0.label, 20),
        unit: cleanStr(sc0.unit, 6),
        perA, perB, extra, lack, people, total: totalA,
        answerLabel: cleanStr(sc0.answerLabel, 30),
        ms: 5200
      });
    } else if (t === 'diagram') {
      const kind = String(sc0.kind ?? sc0.element ?? '');
      if (!DIAGRAM_KINDS.includes(kind)) continue;
      const d = { t: 'diagram', kind, label: cleanStr(sc0.label, 80), ms: Math.min(ms, 4600) };
      if (kind === 'number_line') {
        d.min = intIn(sc0.min, -99, 99, 0);
        d.max = intIn(sc0.max, d.min + 1, d.min + 12, d.min + 10);
        d.value = intIn(sc0.value, d.min, d.max, d.min);
      } else if (kind === 'coordplane') {
        const pts = [];
        for (const p0 of (Array.isArray(sc0.points) ? sc0.points : []).slice(0, 4)) {
          if (!p0) continue;
          const x = intIn(p0.x, -8, 8, NaN), y = intIn(p0.y, -8, 8, NaN);
          if (!isFinite(x) || !isFinite(y)) continue;
          pts.push({ x, y, label: cleanStr(p0.label, 10) });
        }
        if (!pts.length) continue;
        d.points = pts;
      } else if (kind === 'linegraph') {
        d.slope = intIn(sc0.slope, -3, 3, 1);
        d.intercept = intIn(sc0.intercept, -6, 6, 0);
      } else if (kind === 'angle') {
        d.degrees = intIn(sc0.degrees, 1, 359, 60);
      } else if (kind === 'triangle') {
        d.a = cleanStr(sc0.a, 8); d.b = cleanStr(sc0.b, 8); d.c = cleanStr(sc0.c, 8);
      } else if (kind === 'rectangle') {
        d.w = intIn(sc0.w, 1, 999, 0); d.h = intIn(sc0.h, 1, 999, 0);
        if (!d.w || !d.h) continue;
      } else if (kind === 'circle') {
        d.r = intIn(sc0.r, 1, 999, 0);
        if (!d.r) continue;
      } else if (kind === 'areagrid') {
        d.cols = intIn(sc0.cols, 1, 12, 0); d.rows = intIn(sc0.rows, 1, 8, 0);
        if (!d.cols || !d.rows) continue;
        d.filled = intIn(sc0.filled, 0, d.cols * d.rows, 0);
      } else if (kind === 'spinner') {
        d.segments = intIn(sc0.segments, 2, 12, 6);
      } else if (kind === 'arraydots') {
        d.rows = intIn(sc0.rows, 1, 6, 0); d.cols = intIn(sc0.cols, 1, 8, 0);
        if (!d.rows || !d.cols) continue;
      }
      scenes.push(d);
    } else if (t === 'motion') {
      if (problemType !== 'motion' && problemType !== 'generic') continue;
      const distance = intIn(sc0.distance, 1, 999999, 0);
      if (!distance) continue;
      const objs = [];
      for (const o0 of (Array.isArray(sc0.objs) ? sc0.objs : []).slice(0, 2)) {
        if (!o0) continue;
        const from = intIn(o0.from, 4, 96, NaN), to = intIn(o0.to, 4, 96, NaN);
        if (!isFinite(from) || !isFinite(to)) continue;
        const dir = o0.dir === 'left' ? 'left' : 'right';
        objs.push({
          label: cleanStr(o0.label, 8) || (dir === 'left' ? 'B' : 'A'),
          color: !!o0.color, from, to, dir, speed: cleanStr(o0.speed, 14)
        });
      }
      if (!objs.length) continue;
      const d = {
        t: 'motion', label: cleanStr(sc0.label, 80), ms: Math.min(ms, 7000),
        startLabel: cleanStr(sc0.startLabel, 6) || 'A',
        endLabel: cleanStr(sc0.endLabel, 6) || 'B',
        distance, unit: cleanStr(sc0.unit, 6), objs
      };
      const meet = intIn(sc0.meet, 4, 96, NaN);
      if (isFinite(meet)) d.meet = meet;
      d.timeLabel = cleanStr(sc0.timeLabel, 40);
      scenes.push(d);
    } else if (t === 'world') {
      const actors = (Array.isArray(sc0.actors) ? sc0.actors : []).slice(0, 12).map(a0 => {
        if (!a0) return null;
        const id = cleanStr(a0.id, 24);
        if (!id) return null;
        const type = ACTOR_TYPES.includes(a0.type) ? a0.type : 'ball';
        const o = { id, type, x: numIn(a0.x, 10, 390, 200), y: numIn(a0.y, 30, 200, 170) };
        const sc = Number(a0.scale);
        if (isFinite(sc) && sc > 0.4 && sc < 2.2 && sc !== 1) o.scale = sc;
        if (a0.hide) o.hide = 1;
        if (a0.show) o.show = 1;
        return o;
      }).filter(Boolean);
      const moves = (Array.isArray(sc0.moves) ? sc0.moves : []).slice(0, 8).map(m0 => {
        if (!m0) return null;
        const target = cleanStr(m0.target, 24);
        const path = (Array.isArray(m0.path) ? m0.path : []).slice(0, 8)
          .map(pt => [numIn(pt && pt[0], 10, 390, 200), numIn(pt && pt[1], 30, 200, 170)]);
        return { target, path, dur: numIn(m0.dur, 0.6, 8, 2) };
      }).filter(m => m && m.target && m.path.length >= 2);
      if (!actors.length && !moves.length) continue;
      let wms = 1500 + moves.reduce((z, m) => z + m.dur * 1000, 0);
      wms = Math.max(MIN_MS, Math.min(9000, wms));
      scenes.push({ t: 'world', caption: cleanStr(sc0.caption || sc0.text, 120), actors, moves, ms: wms });
    } else if (t === 'adaptive') {
      const rawSteps = Array.isArray(sc0.steps) ? sc0.steps : [];
      const steps = rawSteps.slice(0, 8).map(st => ({
        label: cleanStr(st.label, 32),
        explanation: cleanStr(st.explanation || st.text, 150),
        formula: cleanStr(st.formula, 90),
        from: st.from == null ? '' : cleanStr(st.from, 40),
        to: st.to == null ? '' : cleanStr(st.to, 40)
      })).filter(st => st.label || st.explanation || st.formula || st.from !== '' || st.to !== '');
      if (steps.length) {
        scenes.push({
          t: 'adaptive', ms: Math.max(4200, Math.min(9000, ms)),
          title: cleanStr(sc0.title, 80), summary: cleanStr(sc0.summary, 120),
          steps, answerLabel: cleanStr(sc0.answerLabel, 60)
        });
      }
    } else if (t === 'geometry') {
      if (problemType !== 'geometry' && problemType !== 'generic') continue;
      const pts = (Array.isArray(sc0.points) ? sc0.points : []).slice(0, 12).map(p => ({
        id: cleanStr(p.id, 24) || 'p', label: cleanStr(p.label, 24),
        x: numIn(p.x, 0, 100, 50), y: numIn(p.y, 0, 100, 50)
      }));
      const segs = (Array.isArray(sc0.segments) ? sc0.segments : []).slice(0, 16).map(g => ({
        from: cleanStr(g.from, 24), to: cleanStr(g.to, 24)
      })).filter(g => g.from && g.to);
      if (pts.length >= 2 && segs.length) scenes.push({
        t: 'geometry', ms: Math.min(ms, 7000), points: pts, segments: segs,
        formula: cleanStr(sc0.formula, 90)
      });
    } else if (t === 'force') {
      if (problemType !== 'force' && problemType !== 'generic') continue;
      const forces = (Array.isArray(sc0.forces) ? sc0.forces : []).slice(0, 6).map((f, i) => ({
        label: cleanStr(f.label, 24) || ('F' + (i + 1)),
        direction: ['left', 'right', 'up', 'down'].includes(f.direction) ? f.direction : 'right',
        magnitude: numIn(f.magnitude, 0, 999999, 0), unit: cleanStr(f.unit, 8) || 'N'
      }));
      if (forces.length) scenes.push({
        t: 'force', ms: Math.min(ms, 7000),
        body: cleanStr(sc0.body, 16) || 'object', forces, netLabel: cleanStr(sc0.netLabel, 50)
      });
    } else if (t === 'circuit') {
      if (problemType !== 'circuit' && problemType !== 'generic') continue;
      const comps = (Array.isArray(sc0.components) ? sc0.components : []).slice(0, 8).map((c, i) => ({
        id: cleanStr(c.id, 20) || ('c' + i),
        label: cleanStr(c.label, 20) || cleanStr(c.kind, 16) || 'part',
        kind: cleanStr(c.kind, 16) || 'part',
        x: numIn(c.x, 5, 95, 20 + i * 12), y: numIn(c.y, 10, 90, 50)
      }));
      const conns = (Array.isArray(sc0.connections) ? sc0.connections : []).slice(0, 12).map(c => ({
        from: cleanStr(c.from, 20), to: cleanStr(c.to, 20)
      })).filter(c => c.from && c.to);
      if (comps.length >= 2 && conns.length) scenes.push({
        t: 'circuit', ms: Math.min(ms, 7000), components: comps,
        connections: conns, formula: cleanStr(sc0.formula, 90)
      });
    } else if (t === 'molecule') {
      if (problemType !== 'molecule' && problemType !== 'generic') continue;
      const atoms = (Array.isArray(sc0.atoms) ? sc0.atoms : []).slice(0, 16).map((a, i) => ({
        id: cleanStr(a.id, 20) || ('a' + i), element: cleanStr(a.element, 5) || 'X',
        x: numIn(a.x, 5, 95, 20 + (i % 5) * 15), y: numIn(a.y, 10, 90, 40 + Math.floor(i / 5) * 20)
      }));
      const bonds = (Array.isArray(sc0.bonds) ? sc0.bonds : []).slice(0, 20).map(b => ({
        from: cleanStr(b.from, 20), to: cleanStr(b.to, 20), order: intIn(b.order, 1, 3, 1)
      })).filter(b => b.from && b.to);
      if (atoms.length && bonds.length) scenes.push({
        t: 'molecule', ms: Math.min(ms, 7000), atoms, bonds,
        reactionLabel: cleanStr(sc0.reactionLabel, 80)
      });
    } else if (t === 'process') {
      if (problemType !== 'process' && problemType !== 'word_problem' && problemType !== 'generic') continue;
      const src = {
        label: cleanStr(sc0.source && sc0.source.label, 30),
        x: numIn(sc0.source && sc0.source.x, 0, 100, 15), y: numIn(sc0.source && sc0.source.y, 0, 100, 50)
      };
      const tgt = {
        label: cleanStr(sc0.target && sc0.target.label, 30),
        x: numIn(sc0.target && sc0.target.x, 0, 100, 85), y: numIn(sc0.target && sc0.target.y, 0, 100, 50)
      };
      if (src.label && tgt.label) scenes.push({
        t: 'process', ms: Math.min(ms, 7000), source: src, target: tgt,
        particles: intIn(sc0.particles, 1, 30, 6), formula: cleanStr(sc0.formula, 90)
      });
    }
  }

  // 各题型必须有对应的主动画场景
  const has = ty => scenes.some(s => s.t === ty);
  if (problemType === 'linear_equation' && !has('eq')) return { eligible: false };
  if (['fraction', 'ratio', 'percentage'].includes(problemType) && !has('bar')) return { eligible: false };
  if (problemType === 'sequence' && !has('layers')) return { eligible: false };
  if (problemType === 'motion' && !has('motion')) return { eligible: false };
  if (problemType === 'story_world' && !wc && !has('world')) return { eligible: false };
  if (problemType === 'surplus_deficit' && !has('compare')) return { eligible: false };
  if (problemType === 'geometry' && !has('geometry')) return { eligible: false };
  if (problemType === 'force' && !has('force')) return { eligible: false };
  if (problemType === 'circuit' && !has('circuit')) return { eligible: false };
  if (problemType === 'molecule' && !has('molecule')) return { eligible: false };
  if ((problemType === 'process' || problemType === 'word_problem') &&
      !CONCRETE_VISUAL.some(has)) return { eligible: false };
  // v1.3：盈亏题把单个 compare 确定性展开为五段视觉分镜，去掉重复的 say/answer 文字
  if (problemType === 'surplus_deficit') {
    const ci = scenes.findIndex(s => s.t === 'compare');
    const c = scenes[ci];
    const dPer = c.perB - c.perA;
    if (dPer <= 0) return { eligible: false };
    const gap = c.extra + c.lack;
    if (gap % dPer !== 0 || gap / dPer !== c.people) return { eligible: false };
    const common = {
      t: 'compare', label: c.label, unit: c.unit,
      perA: c.perA, perB: c.perB, extra: c.extra, lack: c.lack,
      people: c.people, total: c.total, dPer, gap
    };
    const phases = ['planA', 'planB', 'diff', 'gap', 'total'];
    const expanded = phases.map((ph, k) => Object.assign({}, common, {
      phase: ph,
      ms: ph === 'diff' || ph === 'gap' ? 4200 : 3800
    }));
    const head = scenes.filter(s => s.t === 'show');
    scenes.length = 0;
    scenes.push(...head, ...expanded);
  }
  if (wc) {
    const { depth, up, down, unit } = wc;
    if (up < depth && up - down <= 0) return { eligible: false };
    const WL = WC_I18N[lang] || WC_I18N.en;
    const head = scenes.filter((x) => x.t === 'show');
    const beats = [];
    let h = 0, day = 1, guard = 0;
    while (guard++ < 240) {
      const ds = h, de = h + up;
      if (de >= depth) {
        beats.push({ t: 'wellclimb', depth, unit, sky: 'sun', prevHeight: ds, height: depth,
          beatLabel: WL.day.replace('{n}', day), caption: ds + ' + ' + up + ' = ' + depth + ' · ' + WL.out,
          chip: depth + ' ' + unit, ms: 3400 });
        break;
      }
      beats.push({ t: 'wellclimb', depth, unit, sky: 'sun', prevHeight: ds, height: de,
        beatLabel: WL.day.replace('{n}', day), caption: '+' + up + ' = ' + de + ' ' + unit,
        chip: de + ' ' + unit, ms: 2600 });
      if (down > 0) {
        const ne = de - down;
        beats.push({ t: 'wellclimb', depth, unit, sky: 'moon', prevHeight: de, height: ne,
          beatLabel: WL.night.replace('{n}', day), caption: '−' + down + ' = ' + ne + ' ' + unit,
          chip: ne + ' ' + unit, ms: 2600 });
        h = ne;
      } else { h = de; }
      day++;
    }
    scenes.length = 0;
    scenes.push(...head, ...beats);
  }

  // v3.4 全局具象质量门：任何题型都必须至少有一个"真正画图/动画"的场景；
  // adaptive（编号步骤+说明+公式的文字列表）与 show/say/check/answer 均不算，纯文本分镜一律判不合格。
  if (!scenes.some(s => CONCRETE_VISUAL.includes(s.t))) return { eligible: false };
  if (problemType === 'generic') {
    // 通用故事板：至少 3 个场景，必须有 answer，且至少一个具象可视化主体（含 world）
    if (!has('answer') || scenes.length < 3) return { eligible: false };
    if (!CONCRETE_VISUAL.some(has)) return { eligible: false };
  }
  if (scenes.length < 2) return { eligible: false };

  return { eligible: true, plan: { version: '3.3', problemType, theme: 'adaptive_first', entities, scenes } };
}

module.exports = { buildPlannerPrompt, validatePlan, detectArchetype, isConcretePlan, CONCRETE_VISUAL, LIB_VERSION };
