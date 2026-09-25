# CalcElf v6.1 变更日志 — edulab 板播放器接入高中学科/实验族 + 全量 Vendor 本地化

## v6.1.0 — 2026-09-25

### 核心变更：edulab 交互式板播放器作为第二渲染层接入

**问题**：v6.0 的 /renderer（Canvas 8 模式）覆盖小学故事/CPA 题型，但高中学科（函数图像、圆锥曲线、解析几何、立体几何、矢量、物理运动读数、3D 力场、化学反应、统计、逻辑）缺乏确定性渲染，全部走 free HTML 兜底，出图质量不稳定。

**修复**：在 v6.0 基础上叠加 edulab 板播放器，与现有 /renderer 共存（不替换），形成双渲染层：

| 渲染层 | 路径 | 覆盖族 | 数据格式 |
|---|---|---|---|
| /renderer（v6.0 既有） | `/renderer/index.html` | axis_motion / motion / numberline / bars / grid / balance / geometry / function-graph（小学） | `{animation: renderParams}` |
| /board（v6.1 新增） | `/board/2d.html` `/board/3d.html` `/board/reaction.html` `/board/solid.html` | 函数/圆锥/解析几何/矢量/物理运动/统计/逻辑（2d）、3D 力场（3d）、化学（reaction）、立体几何（solid） | `{board, lesson, steps}` |

**kard 端点新增 host 选择器**：
```json
{ "eligible": true, "family": "board_function_graph", "host": "2d",
  "board": {...edulab board JSON...}, "answer": "...", "steps": [...] }
```
- `host` = `"renderer"`（或缺失）→ 走现有 `presentKard(renderParams)`，向后兼容
- `host` = `"2d"`/`"3d"`/`"reaction"`/`"solid"` → 走新增 `presentBoard(host, payload)`，iframe 加载对应板播放器并 postMessage

**编排链路**（`lib/kards/orchestrator.js`）：
1. 先跑现有 renderer 族分类（8 族 keyword 匹配）
2. renderer 不命中 → 调 `tryBoard()`（`lib/board-router.js`）：关键词粗分类 → LLM 生成 board JSON → schema 校验 → 不合格重试一次 → 仍不合格走兜底
3. board 命中 → 返回含 `host` 的契约；board 不命中 → 保持原 free HTML 兜底

### 新增：4 个静态板播放器（/board/）

每个播放器从 edulab 模板改造，**零外部 CDN**，支持 postMessage 动态注入数据：

| 文件 | 源模板 | 能力 |
|---|---|---|
| `board/2d.html`（58KB） | edu-physics/template/board.html | Canvas 2D：圆锥曲线（圆/椭圆/双曲线/抛物线）、函数图像（含采样/切线/面积）、解析几何（直线/交点/垂足/反射）、矢量、参数滑块、读数监控、定值/范围/答案区间指示器、画笔涂鸦叠加层 |
| `board/3d.html`（21KB） | edu-physics-3d/template/board3d.html | Three.js r128 + OrbitControls：球体/箭头/参数曲线、3D 轨迹、洛伦兹力场景、自动旋转、读数 |
| `board/reaction.html`（53KB） | edu-chem-reaction/template/reaction.html | Three.js 分子结构、反应进度 morph、方程式、步骤条 |
| `board/solid.html`（38KB） | edu-solid-geometry/template/lesson.html | Three.js r160 ES module + CSS2DRenderer + MathJax：立体几何 3D 模型、标注、分步解析 |

**数据注入方式**：
- 源模板用 `<script id="lesson-data">__LESSON_DATA__</script>` + 顶层 `const DATA`
- 改为空数据岛 `{}` + `initBoard(payload)` 幂等初始化函数
- `window.addEventListener('message')` 监听，收到 `{board}` 或 `{lesson,steps,board}` 后重新渲染
- 无数据时显示"等待数据…"占位，不报错

### 新增：全量 Vendor 本地化（/vendor/，92 个文件）

彻底移除所有第三方 CDN 引用，弱网可用：

```
vendor/
├── three.min.js              Three.js r128 全局构建（2d/3d/reaction 用）
├── orbit-controls.js         r128 OrbitControls（挂载 THREE.OrbitControls）
├── katex.min.css             KaTeX 0.16.8 样式
├── katex.min.js              KaTeX 0.16.8 核心
├── auto-render.min.js        KaTeX auto-render
├── fonts/                    KaTeX 字体 60 个（woff2/woff/ttf）
├── board.css                 手写 Tailwind 替代 CSS（含 prose 排版，扫描 4 模板实际用到的类）
├── jsm/
│   ├── three.module.js       Three.js r160 ES module（solid 用）
│   ├── controls/OrbitControls.js
│   └── renderers/CSS2DRenderer.js
└── mathjax/
    ├── tex-mml-chtml.min.js  MathJax 3.2.2（solid 用）
    └── output/chtml/fonts/woff-v2/  22 个 woff 字体
```

`grep -r "cdn\|cdnjs\|unpkg\|cdn.tailwindcss" board/ vendor/` 无结果。

### 新增：board-schema 校验器（lib/board-schema.js）

复刻 DeepSeek edulab 判据，`validateBoard(board, host)` → `{ok, errors[]}`：

- **2d**：`view` 必须含 `xRange/yRange`；`conics` 的 `kind` 枚举（circle/ellipse/hyperbola/parabola）+ 必填参数（circle 需 r、ellipse/hyperbola 需 a/b、parabola 需 p）；`derived.type` 枚举（17 种几何操作）；`readouts.type` 枚举（10 种读数）；**`constant` 必须是对象 `{of,label}`，不得是字符串**；**`trace` 必须是对象 `{of,color}`，不得是数组**；`points` 值必须是坐标数组或对象
- **3d**：`objects.type` 枚举（sphere/arrow/curve）+ 必填字段；`trace` 对象校验
- **logic 族**：识别 `logicType/venn/truthTable/logicGates` 后跳过画板几何校验（文氏图/真值表无 xRange）
- **reaction/solid**：基本结构校验，不过度严格
- 数值字段允许字符串表达式（如 `"2*p"`）

正例 13/13 通过；负例（constant 字符串、trace 数组、view 缺 yRange、circle 缺 r 等）全部正确拒绝。

### 新增：10 族 board 提示词（lib/board-prompts.js）

`BOARD_PROMPTS` 对象，每族含 `system / userTemplate / schemaHint / example`：

| 族 ID | host | 覆盖 |
|---|---|---|
| board_function_graph | 2d | 函数图像、二次函数、三角函数、指数对数 |
| board_conics | 2d | 圆锥曲线、离心率、焦点准线 |
| board_analytic_geometry | 2d | 解析几何、直线与圆、轨迹 |
| board_vector | 2d | 平面向量、点积、数量积 |
| board_physics_motion | 2d | 运动学、抛体、读数实验 |
| board_statistics | 2d | 统计、正态分布、概率 |
| board_logic | 2d | 逻辑推理、集合、命题 |
| board_solid_geometry | solid | 立体几何、棱柱棱锥、二面角 |
| board_physics_3d | 3d | 3D 力场、洛伦兹力、空间向量 |
| board_chemistry | reaction | 化学反应、分子结构、化学平衡 |

每族 few-shot 从 13 个 lesson JSON 提炼，统一强调 constant/trace 必须是对象、view 含 xRange/yRange、conics/derived 枚举，教学叙事按"定义→滑块演示→结论/定值守恒"。

### 新增：board-router（lib/board-router.js）

`tryBoard(problem, opts)` 完整流程：
1. 关键词 + stage 粗分类（小学/CPA 关键词直接返回 no_board_match，留给 renderer）
2. 调 `lib/openai.js`（默认 deepseek-flash，兜底 deepseek-v4-pro，不写死模型名）生成 board JSON
3. `validateBoard` 校验，不合格重试一次（附错误提示）
4. 超时：单次 LLM 25s，整体 30s
5. 沙箱无 API key 时优雅降级返回 `{eligible:false, reason:'model_unavailable'}`，不抛错
6. 不扣费（解题扣费在 solve 端点统一处理）

### 修改：api/kard.js + lib/kards/orchestrator.js

- orchestrator 拆出 `runRendererCard()`，renderer 不命中后接 `tryBoard()`
- kard.js 区分 board / renderer 两种返回形状：board 结果写 kard_cache（render_params 存 board JSON，family 存 board 族 ID），返回含 `host` 的契约；renderer 保持原格式
- 复用 kard_cache 表，**未新增必需 SQL 表**
- 现有 renderer 八族流程完全不变（回归测试"苹果题"仍命中 bars）

### 修改：app.js（根 + public 镜像）

- `animation()` kard 命中分支：条件由 `kj.eligible && kj.renderParams` 放宽为 `kj.eligible`，新增 `host` 分支
- 新增 `presentBoard(host, payload)`：iframe `/board/{host}.html`，sandbox `allow-scripts allow-same-origin`，onload postMessage `{board, lesson, steps}`（3d 额外补 `board3d`）
- 新增 `openBoardFullscreen(host, payload)`：全屏版
- board 命中后同样显示 5 星评分、上报流程日志、不走兜底链
- `node --check` 通过，根/public 逐字节一致（182,591 字节）

### 无头回测证据

用 Python + Playwright + `/usr/local/bin/chromium` 起本地 http server，逐（模板×数据）配对渲染：

| 验证项 | 结果 |
|---|---|
| 2D 抛物线真的画出曲线（非只出 UI） | ✅ 黄色抛物线 + 切线 + 动点 + 面积填充 + 读数 f(1.5)=7.38 |
| 3D 洛伦兹力场景渲染 | ✅ 电荷球 + v/B/F 矢量 + 轨迹圆 |
| 化学反应 morph | ✅ 方程式 + 步骤条 + 进度滑块 |
| 立体几何 3D 模型 | ✅ 正四棱锥 P-ABCD + 标注 + 分步解析 |
| 13 lesson JSON 配对渲染 | ✅ 零 console 报错，零 vendor 404 |
| 现有 renderer axis_motion 回归 | ✅ |
| 5 星评分 widget 未破坏 | ✅ |

截图保存在 `tests/golden/`、`tests/board-smoke/`，详细报告见 `tests/TEST-REPORT-v6.1.md`。

### 未破坏的既有功能

- 输入互斥/排队/未解题打字作补充
- practice 锁定、流式打字机、思考三点、竖式对齐
- 昼夜太阳月亮、动画加宽
- free HTML / plan / static 三级兜底链
- 5 星评分（kard/free/plan 均显示，board 同样显示）
- asked_questions 采集、log-animation 上报
- 模型不写死、读环境变量
- Credits 规则：解题 2、chat/voice/practice 1、动画/评分/日志 0
- 11 语言 i18n，ar/fa RTL，可见文字不混语言
- 根/public 镜像一致

### 合规

- 只存题目文本与 hash，不存图片
- board 数据写入 kard_cache（已有表，含 cache_key/family/render_params/answer/lang）
- 登录/验证码/支付流程未改动

### 借鉴来源（仅参考，未部署运行时）

- Manim MCP / teach-math-with-manim：提炼"概念出现顺序"写进 board 提示词（定义→演示→结论）
- PhET 交互仿真：借鉴控制面板/滑块/实时读数的 UX 模式
- rendervid：搁置（React/TypeScript 构建框架，与无构建静态架构不兼容）
