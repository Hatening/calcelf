// lib/board-prompts.js — 各族 board JSON 生成提示词
// 导出 BOARD_PROMPTS：key = 族 ID，value = { host, system, userTemplate, schemaHint, example }
// 教学叙事顺序统一为：定义 → 演示（滑块/交互）→ 结论（定值/守恒/公式）。
// 每族给一个精简的 board JSON few-shot（从 13 个 lesson 提炼）。

'use strict';

// 各族共用的硬性结构约束（会拼进每个 system prompt）
const COMMON_RULES = `
【输出格式】只输出一个 JSON 对象，不要任何解释文字、不要 markdown 代码块包裹。结构为：
{
  "answer": "最终答案文本（含 $...$ LaTeX）",
  "steps": [{ "title": "步骤标题", "content": "<p>HTML 内容，公式用 $...$</p>" }, ...],
  "board": { ...edulab board 对象... }
}

【board 硬性格式约束 —— 违反将被服务端校验拒绝】
1. board.view 必须是对象，且含 xRange:[数,数]、yRange:[数,数]（逻辑控制台族除外）。
2. board.param（若有）必须是对象 {name,label?,min,max,step?,value?,ticks?}；参数名必须是合法标识符（如 t/k/a/e，不能用 θ 等 Unicode）。
3. board.scalars（若有）是数组 [{name, expr}]，expr 是字符串表达式。
4. board.conics（若有）是数组，每项 {name, kind}，kind 只能是 circle/ellipse/hyperbola/parabola：
   circle 需 r；ellipse/hyperbola 需 a、b；parabola 需 p。a/b/r/p 可以是数字或表达式字符串。
5. board.derived（若有）是数组，每项必须含 type，且 type 只能取自给定枚举。
6. board.readouts（若有）是数组，每项含 id、label、type。
7. board.constant（若有）必须是对象 {of:"某个readout的id", label?}，或 null —— 绝不能写成字符串！
8. board.trace（若有）必须是对象 {of:"某个点/derived名", color?}，或 null —— 绝不能写成字符串或数组！
9. board.points（若有）是对象映射：每个值是 [x,y] 数组，或 {xy:[x,y],color?,label?,emphasis?,hidden?} 对象，或 {type:构造类型,...}。
10. 数值坐标/参数可以是数字，也可以是表达式字符串（如 "2*p"、"sqrt(a*a+b*b)"），支持 + - * / ^ sqrt sin cos tan exp log abs PI。
11. 三角函数用弧度；角度需自己乘 PI/180。
12. steps 按教学叙事写：先定义概念，再演示交互（滑块拖动看什么），最后给结论/公式/守恒关系。content 用 HTML 片段。
`.trim();

const BOARD_PROMPTS = {
  // ---------------------------------------------------------- 1. 函数图像
  board_function_graph: {
    host: '2d',
    system: `你是高中数学交互画板生成器，负责把"函数图像"类题目生成 edulab 2D board JSON。
覆盖：一次/二次函数、三角函数、指数/对数函数、f(x) 图像、顶点、切线、面积。
${COMMON_RULES}
本族 board 常用字段：view、param（滑块驱动一个系数）、scalars（命名派生量）、
functions:[{name,expr,color,label}]（函数曲线）、points、derived、readouts、constant、legend。
derived type 本族常用：point_on_function、tangent_at_function、area_under_curve、vector、segment、polygon。
readout type 本族常用：expr、function_at、derivative_at、area_value。`,
    userTemplate: `请为下面这道题生成交互教学 board。\n题目：{{problem}}\n学段：{{stage}}。语言：{{lang}}。`,
    schemaHint:
      'functions[].expr 用 param 名引用滑块（如 a*x^2+b*x+c）；tangent_at_function 需给 derivative；constant.of 指向一个 readout id 表示恒等关系。',
    example: {
      view: { xRange: [-4, 4], yRange: [-2, 10] },
      param: { name: 'a', label: '$a$', min: 0.5, max: 3, step: 0.1, value: 1.5, ticks: ['0.5','1','1.5','2','2.5','3'] },
      scalars: [
        { name: 'b', expr: '2' }, { name: 'c', expr: '1' },
        { name: 'disc', expr: 'b*b - 4*a*c' },
        { name: 'vx', expr: '-b/(2*a)' }, { name: 'vy', expr: '(4*a*c - b*b)/(4*a)' },
      ],
      functions: [{ name: 'f', expr: 'a*x^2 + b*x + c', color: 'curve', label: '$y=ax^2+bx+c$' }],
      points: { V: { xy: ['vx', 'vy'], color: 'ptA', label: 'V', emphasis: true } },
      derived: [
        { type: 'point_on_function', name: 'P', function: 'f', x: 1.5, color: 'ptB', label: 'P' },
        { type: 'tangent_at_function', name: 'T', function: 'f', point: 'P', derivative: '2*a*x + b', color: 'tangent', dashed: true },
      ],
      readouts: [
        { id: 'vx_ro', label: '顶点 $x$', type: 'expr', expr: 'vx', digits: 2 },
        { id: 'disc_ro', label: '$\\Delta=b^2-4ac$', type: 'expr', expr: 'disc', digits: 3, highlight: true },
      ],
      constant: { of: 'disc_ro', label: '$\\Delta \\equiv 1$' },
    },
  },

  // ---------------------------------------------------------- 2. 圆锥曲线
  board_conics: {
    host: '2d',
    system: `你是高中解析几何交互画板生成器，负责"圆锥曲线"类题目：椭圆、双曲线、抛物线、圆，离心率、焦点、准线、弦、轨迹。
${COMMON_RULES}
本族用 board.conics 声明曲线：{name, kind, a,b,r,p, center:[x,y], orient?, color, label, asymptotes?}。
derived type 本族常用：point_on_conic、tangent_at、line_through_points、intersect_line_conic、vector、segment、trace（轨迹）。
readout type 本族常用：expr、coord、length、distance、dot、slope、area_triangle。
滑块常驱动离心率 e 或动点参数 t，a/b 可写成表达式字符串随滑块重算。`,
    userTemplate: `请为下面这道圆锥曲线题生成交互教学 board。\n题目：{{problem}}\n学段：{{stage}}。语言：{{lang}}。`,
    schemaHint:
      'hyperbola 需 orient:"x"/"y" 与 a、b；parabola 需 p；point_on_conic 用 conic 名 + t 参数；trace.of 指向动点名以描轨迹。',
    example: {
      view: { xRange: [-6, 10], yRange: [-5, 5] },
      points: { Au: [0, 0], nucleus: [0, 0] },
      param: { name: 'b', label: '瞄准距离 $b$', min: 0.3, max: 4, step: 0.05, value: 1.5 },
      scalars: [
        { name: 'a', expr: '1.0' }, { name: 'b_semi', expr: 'b' },
        { name: 'c_semi', expr: 'sqrt(a^2 + b^2)' },
        { name: 'Px', expr: '-c_semi + a*cosh(1.2)' }, { name: 'Py', expr: 'b_semi*sinh(1.2)' },
      ],
      conics: [{ name: 'trajectory', kind: 'hyperbola', orient: 'x', center: ['-c_semi', 0], a: 'a', b: 'b_semi', color: 'locus', asymptotes: true, label: '$\\alpha$ 轨迹' }],
      derived: [
        { type: 'point_on_conic', name: 'P', conic: 'trajectory', t: '1.2', color: 'ptB', label: '$\\alpha$', emphasis: true },
        { type: 'vector', name: 'v_vec', from: 'P', to: ['Px+1', 'Py+1'], color: 'vec', label: '$\\vec{v}$' },
      ],
      readouts: [{ id: 'b_val', label: '瞄准距离 $b$', type: 'expr', expr: 'b', digits: 2 }],
    },
  },

  // ---------------------------------------------------------- 3. 解析几何 / 平面几何
  board_analytic_geometry: {
    host: '2d',
    system: `你是平面/解析几何交互画板生成器，负责：直线方程、圆的方程、轨迹方程、斜率、垂足、中点、反射、勾股定理、三角形/多边形面积。
${COMMON_RULES}
derived type 本族常用：line_through_points、line_through_angle、line_through_slope、line_x_eq_my_c、
midpoint、foot_perp、reflect、point_reflect、intersect_line_line、tangent_at、vector、segment、polygon。
readout type 本族常用：expr、area_triangle、angle、distance、length、slope、distance_point_line。
points 可用 [x,y]、{xy} 或几何构造对象 {type:midpoint/foot/on_ray/reflect/rotate,...}。
annotations 可加 {type:right_angle, vertex, arms:[p1,p2]} 直角记号。
教学叙事：先建系/定义图形 → 滑块演示边长/角度变化 → 面积/恒等结论（constant 指示器）。`,
    userTemplate: `请为下面这道平面/解析几何题生成交互教学 board。\n题目：{{problem}}\n学段：{{stage}}。语言：{{lang}}。`,
    schemaHint:
      'constant.of 指向验证恒等式的 readout（如 a^2+b^2-c^2 应恒为 0）；polygon 用 pts 点名数组 + color 半透明填充；foot_perp 需 point 与 line 名。',
    example: {
      view: { xRange: [-0.8, 7], yRange: [-0.8, 7] },
      points: {
        C: { xy: [0, 0], color: 'point', label: 'C', emphasis: true },
        B: { xy: ['t', 0], color: 'point', label: 'B', emphasis: true },
        A: { xy: [0, '6-t'], color: 'point', label: 'A', emphasis: true },
      },
      param: { name: 't', label: '直角边 $a=BC$', min: 1, max: 5, step: 0.1, value: 3, ticks: ['1','3','5'] },
      scalars: [
        { name: 'a', expr: 't' }, { name: 'b', expr: '6-t' }, { name: 'c', expr: 'sqrt(a*a+b*b)' },
      ],
      derived: [
        { type: 'line_through_points', name: 'AB', a: 'A', b: 'B', color: 'line' },
        { type: 'foot_perp', name: 'D', point: 'C', line: 'AB', color: 'fixed', label: 'D', emphasis: true },
        { type: 'polygon', pts: ['A', 'B', 'C'], color: 'rgba(251,191,36,0.2)', stroke: '#64748b' },
      ],
      readouts: [
        { id: 'c_val', label: '斜边 $c$', type: 'expr', expr: 'c', digits: 2 },
        { id: 'S', label: '$S_{\\triangle ABC}$', type: 'area_triangle', pts: ['A','B','C'] },
        { id: 'chk', label: '$a^2+b^2-c^2$', type: 'expr', expr: 'a*a+b*b-c*c', digits: 10, highlight: true },
      ],
      constant: { of: 'chk', label: '$a^2+b^2-c^2 \\equiv 0$' },
    },
  },

  // ---------------------------------------------------------- 4. 平面向量
  board_vector: {
    host: '2d',
    system: `你是平面向量交互画板生成器，负责：向量加法（平行四边形法则）、点积/数量积、夹角、分量分解、模长。
${COMMON_RULES}
derived type 本族常用：vector（from/to 点名）、parallelogram（vectors:[va,vb]）、vector_components（of 点）、segment。
readout type 本族常用：expr、dot、length、angle、coord。
用 scalars 算 bx/by（b_len*cos/sin）、sx/sy（和向量）、dot、mag。
教学叙事：向量加法/平行四边形法则定义 → 滑块改变方向角演示分量与点积变化 → 垂直时点积为 0 的结论。`,
    userTemplate: `请为下面这道平面向量题生成交互教学 board。\n题目：{{problem}}\n学段：{{stage}}。语言：{{lang}}。`,
    schemaHint:
      'vector 需 from/to（点名）；parallelogram 需 vectors 数组；角度滑块记得 *PI/180 转弧度；constant 可固定一个模长。',
    example: {
      view: { xRange: [-2, 7], yRange: [-2, 6] },
      param: { name: 'theta', label: '$\\theta$', min: 0, max: 360, step: 5, value: 45, ticks: ['0','45','90','180','270','360'] },
      scalars: [
        { name: 'ax', expr: '2' }, { name: 'ay', expr: '1' }, { name: 'b_len', expr: '3' },
        { name: 'bx', expr: 'b_len*cos(theta*PI/180)' }, { name: 'by', expr: 'b_len*sin(theta*PI/180)' },
        { name: 'sx', expr: 'ax+bx' }, { name: 'sy', expr: 'ay+by' },
        { name: 'dot', expr: 'ax*bx+ay*by' },
      ],
      points: { O: [0,0], A_end: ['ax','ay'], B_end: ['bx','by'], Sum: ['sx','sy'] },
      derived: [
        { type: 'vector', name: 'va', from: 'O', to: 'A_end', color: 'vecA', label: '$\\mathbf{a}$' },
        { type: 'vector', name: 'vb', from: 'O', to: 'B_end', color: 'vecB', label: '$\\mathbf{b}$' },
        { type: 'vector', name: 'vsum', from: 'O', to: 'Sum', color: 'vecSum', label: '$\\mathbf{a}+\\mathbf{b}$' },
        { type: 'parallelogram', vectors: ['va','vb'], color: 'area' },
      ],
      readouts: [
        { id: 'dotv', label: '$\\mathbf{a}\\cdot\\mathbf{b}$', type: 'expr', expr: 'dot', digits: 3, highlight: true },
      ],
    },
  },

  // ---------------------------------------------------------- 5. 物理运动学
  board_physics_motion: {
    host: '2d',
    system: `你是物理运动学交互画板生成器，负责：抛体/平抛/自由落体、速度/加速度/位移矢量、机械能守恒、读数实验。
${COMMON_RULES}
derived type 本族常用：vector（from/to，画速度/位移分量箭头）、segment。
用 points 表示质点（xy 随 t 变），trace:{of:"质点名",color} 描轨迹。
scalars 写物理量：vx、vy、x、y、Ek、Ep、E。
教学叙事：运动分解（水平匀速/竖直匀变速）定义 → 滑块 t 演示轨迹与速度分量 → 机械能守恒结论（constant 指示器）。`,
    userTemplate: `请为下面这道运动学题生成交互教学 board。\n题目：{{problem}}\n学段：{{stage}}。语言：{{lang}}。`,
    schemaHint:
      'trace.of 必须是对象 {of:"P",color:"locus"}；vector 用点名作 from/to；constant.of 指向守恒量 readout（如 E）。',
    example: {
      view: { xRange: [-0.5, 11.5], yRange: [-0.8, 3.5] },
      points: {
        O: { xy: [0,0], color: 'point', label: 'O', emphasis: true },
        P: { xy: ['x','y'], color: 'ptA', label: 'P', emphasis: true },
      },
      param: { name: 't', label: '时间 $t$ (s)', min: 0, max: 2, step: 0.02, value: 0, ticks: ['0','1','2'] },
      scalars: [
        { name: 'v0', expr: '10' }, { name: 'theta', expr: '45' }, { name: 'g', expr: '9.8' },
        { name: 'vx', expr: 'v0*cos(theta*PI/180)' },
        { name: 'vy', expr: 'v0*sin(theta*PI/180)-g*t' },
        { name: 'x', expr: 'vx*t' }, { name: 'y', expr: 'v0*sin(theta*PI/180)*t-0.5*g*t*t' },
        { name: 'E', expr: '0.5*(vx*vx+vy*vy)+g*y' },
      ],
      derived: [{ type: 'vector', from: 'O', to: 'P', color: 'line', label: '$\\vec{r}$' }],
      readouts: [
        { id: 'x', label: '水平位移 $x$', type: 'expr', expr: 'x', digits: 2 },
        { id: 'E', label: '总机械能 $E$', type: 'expr', expr: 'E', digits: 4, highlight: true },
      ],
      trace: { of: 'P', color: 'locus' },
      constant: { of: 'E', label: '$E_k+E_p \\equiv 50$' },
    },
  },

  // ---------------------------------------------------------- 6. 统计 / 概率分布
  board_statistics: {
    host: '2d',
    system: `你是统计可视化交互画板生成器，负责：正态分布、概率密度、均值/方差/标准差、直方图、箱线图、区间概率。
${COMMON_RULES}
可用 datasets:[{name,values:[...数值],color,label}] 放采样数据；functions:[{name,expr,color,label}] 放概率密度曲线。
derived type 本族常用：area_under_curve（function+xRange+baseline）、histogram（dataset+bins）、box_plot（dataset+at）。
readout type 本族常用：expr、probability、mean、stddev、median。
教学叙事：正态分布定义与 PDF → 滑块 σ 演示钟形曲线与 μ±σ 区间概率 → 68/95/99.7 结论。`,
    userTemplate: `请为下面这道统计/概率题生成交互教学 board。\n题目：{{problem}}\n学段：{{stage}}。语言：{{lang}}。`,
    schemaHint:
      'area_under_curve 需 function 名 + xRange + baseline；histogram 需 dataset + bins；probability readout 需 function + xRange。',
    example: {
      view: { xRange: [-4, 4], yRange: [-0.05, 0.85] },
      param: { name: 'sigma', label: '$\\sigma$', min: 0.5, max: 2.5, step: 0.1, value: 1.0, ticks: ['0.5','1','1.5','2','2.5'] },
      scalars: [{ name: 'mu', expr: '0' }],
      functions: [{ name: 'norm', expr: '1/(sigma*sqrt(2*PI))*exp(-(x-mu)^2/(2*sigma^2))', color: 'curve', label: '$N(0,\\sigma^2)$' }],
      derived: [
        { type: 'area_under_curve', name: 'area68', function: 'norm', xRange: ['-sigma','sigma'], baseline: 0, color: 'area' },
      ],
      readouts: [
        { id: 'prob68', label: '$P(\\mu\\pm\\sigma)$', type: 'probability', function: 'norm', xRange: ['-sigma','sigma'], digits: 4, highlight: true },
      ],
      constant: { of: 'prob68', label: '$\\approx 0.6827$' },
    },
  },

  // ---------------------------------------------------------- 7. 逻辑 / 集合
  board_logic: {
    host: '2d',
    system: `你是逻辑/集合交互控制台生成器，负责：文氏图（集合交并补）、真值表（命题联结词）、逻辑门。
${COMMON_RULES}
本族 board 不画坐标系，是自由控制台结构：
{
  "consoleTitle": "逻辑控制台",
  "logicType": "venn",               // venn | truthTable | gates
  "venn": { "sets": [{label, elements:[...]}], "highlight": "interAB" },
  "truthTable": { "inputs":[{name,label}], "outputs":[{name,label,expr}] },
  "logicGates": [{type:"AND|OR|NOT|NAND|NOR|XOR", x, y, size, label}],
  "param": { ...滑块... },
  "readouts": [...]
}
注意：本族不需要 view/conics/points/derived。constant/trace 仍必须是对象或 null。`,
    userTemplate: `请为下面这道逻辑/集合题生成交互控制台 board。\n题目：{{problem}}\n语言：{{lang}}。`,
    schemaHint:
      'venn.sets 给集合标签与元素；truthTable.outputs.expr 用 p ∧ q 这种写法；logicGates.type 仅限六种门。',
    example: {
      consoleTitle: '逻辑控制台',
      logicType: 'venn',
      venn: { sets: [{label:'A',elements:['1','2','3']},{label:'B',elements:['3','4','5']}], highlight: 'interAB' },
      truthTable: {
        inputs: [{name:'p',label:'p'},{name:'q',label:'q'}],
        outputs: [
          { name:'conj', label:'p∧q', expr:'p ∧ q' },
          { name:'disj', label:'p∨q', expr:'p ∨ q' },
          { name:'impl', label:'p→q', expr:'p → q' },
        ],
      },
      logicGates: [
        { type:'AND', x:50, y:60, size:35, label:'AND' },
        { type:'OR', x:250, y:60, size:35, label:'OR' },
      ],
      readouts: [{ id:'note', label:'说明', type:'expr', expr:'1' }],
    },
  },

  // ---------------------------------------------------------- 8. 立体几何
  board_solid_geometry: {
    host: 'solid',
    system: `你是立体几何 Three.js 场景生成器，负责：棱柱/棱锥/正方体、二面角、线面角、异面直线角、体积、空间向量建系。
${COMMON_RULES}
本族 board 是 solid 模型结构（不是 2D 坐标画板）：
{
  "target": [x,y,z], "initialCamera": [x,y,z],
  "points": { "A":[0,0,0], "B":[1,0,0], ... },     // three 坐标（y 向上）
  "spheres": ["A","B",...],                          // 画小球+标签的点
  "edges": [ {a,b, color?, dashed?, name?} ],        // 骨架棱
  "elements": {                                      // 可切换命名元素
    "Line_X": {type:"line", a, b, color?, depthTest?},
    "Plane_Y": {type:"plane", pts:[p1,p2,p3,p4]},
    "Normal":  {type:"arrow", origin, dir:[0,0,1], length, color},
    "Axis":    {type:"axes", size},
    "Len":     {type:"measure", a, b, label}
  }
}
host=solid，校验较宽松，但 points 必须是 {名字:[x,y,z]}，edges 每项含 a/b。
教学叙事：建系写各点坐标 → 用向量法算方向向量/法向量 → 套线面角/异面角公式给结论。`,
    userTemplate: `请为下面这道立体几何题生成交互 3D 模型 board。\n题目：{{problem}}\n语言：{{lang}}。`,
    schemaHint:
      'elements.type 仅 line/plane/arrow/axes/measure；line 需 a/b 点名；plane 需 pts(3或4点)；measure 给已知棱长度。',
    example: {
      target: [1, 1, 1], initialCamera: [6, 5, 7],
      points: {
        A: [0,0,0], B: [2,0,0], C: [2,2,0], D: [0,2,0],
        A1: [0,0,2], B1: [2,0,2], C1: [2,2,2], D1: [0,2,2],
      },
      spheres: ['A','B','C','D','A1','B1','C1','D1'],
      edges: [
        {a:'A',b:'B'},{a:'B',b:'C'},{a:'C',b:'D'},{a:'D',b:'A'},
        {a:'A1',b:'B1'},{a:'B1',b:'C1'},{a:'C1',b:'D1'},{a:'D1',b:'A1'},
        {a:'A',b:'A1'},{a:'B',b:'B1'},{a:'C',b:'C1'},{a:'D',b:'D1'},
      ],
      elements: {
        Line_A1C: { type:'line', a:'A1', b:'C1', color:'emphasis', depthTest:false },
        Plane_ABCD: { type:'plane', pts:['A','B','C','D'] },
        Normal_Vector: { type:'arrow', origin:'A', dir:[0,0,1], length:1.6, color:'normal' },
        Axis: { type:'axes', size:2.6 },
      },
    },
  },

  // ---------------------------------------------------------- 9. 3D 物理
  board_physics_3d: {
    host: '3d',
    system: `你是 Three.js 3D 物理场景生成器，负责：洛伦兹力/叉积右手定则、3D 力场、空间矢量、电磁波、原子轨道。
${COMMON_RULES}
本族 board 是 board3d 结构（字段名仍叫 board）：
{
  "view": { cameraPos:[x,y,z], target:[x,y,z], showGrid:true, showAxes:true },
  "param": { name,label,min,max,step,value },
  "scalars": [{name,expr}],
  "objects": [
    {"type":"sphere", position:[x,y,z], radius, color, label},
    {"type":"arrow", from:[x,y,z], to:[x,y,z], color, headLength, headWidth},
    {"type":"curve", tMin,tMax, segments, color, "expr":{"x":"...","y":"...","z":"..."}}
  ],
  "readouts": [{id,label,type:"expr",expr,digits}],
  "trace": {"of":["ex","ey","ez"], color, samples}   // 3D trace.of 是 [x,y,z] 表达式数组
}
host=3d。objects 每项 type 只能 sphere/arrow/curve；sphere 需 position+radius；arrow 需 from+to；curve 需 expr:{x,y,z}。
教学叙事：物理规律定义（F=qv×B）→ 滑块角度演示三矢量空间关系 → 右手定则/特殊角度结论。`,
    userTemplate: `请为下面这道 3D 物理题生成交互 board3d。\n题目：{{problem}}\n语言：{{lang}}。`,
    schemaHint:
      'arrow.from/to 与 sphere.position 可以是表达式字符串数组；curve.expr.x/y/z 都是字符串；trace.of 在 3D 下是 3 个表达式的数组。',
    example: {
      view: { cameraPos: [6,4,8], target: [0,0,0], showGrid: true, showAxes: true },
      param: { name: 't', label: '角度 $\\theta$ (°)', min: 0, max: 360, step: 1, value: 45, ticks: ['0','180','360'] },
      scalars: [
        { name: 'v0', expr: '5' }, { name: 'B0', expr: '2' },
        { name: 'vx', expr: 'v0*cos(t*PI/180)' }, { name: 'vy', expr: 'v0*sin(t*PI/180)' },
        { name: 'Fx', expr: 'vy*B0' }, { name: 'Fy', expr: '-vx*B0' },
      ],
      objects: [
        { id:'charge', type:'sphere', position:[0,0,0], radius:0.35, color:'#f87171', label:'电荷' },
        { id:'v_arrow', type:'arrow', from:[0,0,0], to:['vx*1.5','vy*1.5',0], color:'#60a5fa', headLength:0.4, headWidth:0.2 },
        { id:'B_arrow', type:'arrow', from:[0,0,0], to:[0,0,'B0*1.5'], color:'#34d399', headLength:0.4, headWidth:0.2 },
        { id:'F_arrow', type:'arrow', from:[0,0,0], to:['Fx*0.3','Fy*0.3',0], color:'#fbbf24', headLength:0.35, headWidth:0.18 },
      ],
      readouts: [
        { id:'F_mag', label:'$|\\vec{F}|$', type:'expr', expr:'sqrt(Fx*Fx+Fy*Fy)', digits:2, color:'#fbbf24' },
      ],
    },
  },

  // ---------------------------------------------------------- 10. 化学反应
  board_chemistry: {
    host: 'reaction',
    system: `你是化学反应交互场景生成器，负责：化学方程式配平、分子/原子结构、化学键、化学平衡、氧化还原电子转移、燃烧/酯化等。
${COMMON_RULES}
本族 board 结构较自由（host=reaction，校验宽松），基本结构：
{
  "meta": { "title":"...", "engine":"morph|mechanism", "accent":"amber|indigo|violet",
            "flame":false, "electrons":false, "energy":false },
  "equation": "CH4 + 2O2 = CO2 + 2H2O",
  "species": [ { "id":"ch4", "name":"CH4", "atoms":[...] } ],
  "atoms": [ { "id":"H1", "el":"H", "from":[x1,y1], "to":[x2,y2] } ],
  "bonds": [ { "a":"C1", "b":"H1" } ],
  "electrons": [...]   // 氧化还原电子转移（可选）
}
host=reaction，只要求 board 是非空对象。请确保方程已配平、原子守恒。
教学叙事：写出并配平方程式 → 演示断键/成键（原子从反应物态运动到产物态）→ 配平系数与守恒结论。`,
    userTemplate: `请为下面这道化学题生成交互反应 board。\n题目：{{problem}}\n语言：{{lang}}。`,
    schemaHint:
      'equation 字符串要配平；atoms 每项 from/to 给反应物态/产物态坐标；氧化还原题设 meta.electrons=true；燃烧题设 meta.flame=true。',
    example: {
      meta: { title: '甲烷燃烧', engine: 'morph', accent: 'amber', flame: true },
      equation: 'CH4 + 2O2 -> CO2 + 2H2O',
      species: [
        { id: 'ch4', name: 'CH4' },
        { id: 'o2', name: 'O2' },
        { id: 'co2', name: 'CO2' },
        { id: 'h2o', name: 'H2O' },
      ],
      atoms: [
        { id: 'C1', el: 'C', from: [-4, 0], to: [0, 0] },
        { id: 'O1', el: 'O', from: [-1, 0], to: [1.2, 0] },
        { id: 'O2', el: 'O', from: [1, 0], to: [-1.2, 0] },
      ],
      bonds: [
        { a: 'C1', b: 'O1' }, { a: 'C1', b: 'O2' },
      ],
    },
  },
};

// 族 → host 映射（与任务约定一致）
const FAMILY_HOSTS = {
  board_function_graph: '2d',
  board_conics: '2d',
  board_analytic_geometry: '2d',
  board_vector: '2d',
  board_physics_motion: '2d',
  board_statistics: '2d',
  board_logic: '2d',
  board_solid_geometry: 'solid',
  board_physics_3d: '3d',
  board_chemistry: 'reaction',
};

module.exports = { BOARD_PROMPTS, FAMILY_HOSTS, COMMON_RULES };
