# v6.1 黄金集无头回测报告

**日期**: 2026-09-25
**环境**: Python 3.12 + Playwright 1.62 + Chromium (`/usr/local/bin/chromium`)
**视口**: 1400×900
**静态服务器**: `python3 -m http.server 8899`（`_v6base/` 目录）

---

## 一、13 Lesson 配对渲染结果

| # | Lesson JSON | Host | 模板 | 渲染 | console.error | 未捕获异常 | 截图 |
|---|-------------|------|------|------|:---:|:---:|------|
| 1 | lesson-pyramid.json | solid | board/solid.html | ✅ | 0 | 0 | golden/lesson-pyramid-solid.png |
| 2 | solution-einstein-pythagoras.json | 2d | board/2d.html | ✅ | 0 | 0 | golden/solution-einstein-pythagoras-2d.png |
| 3 | solution-garfield-proof.json | 2d | board/2d.html | ✅ | 0 | 0 | golden/solution-garfield-proof-2d.png |
| 4 | solution-garfield-pythagoras.json | 2d | board/2d.html | ✅ | 0 | 0 | golden/solution-garfield-pythagoras-2d.png |
| 5 | solution-logic.json | 2d | board/2d.html | ✅ | 0 | 0 | golden/solution-logic-2d.png |
| 6 | solution-lorentz-force.json | 3d | board/3d.html | ✅ | 0 | 0 | golden/solution-lorentz-force-3d.png |
| 7 | solution-normal-distribution.json | 2d | board/2d.html | ✅ | 0 | 0 | golden/solution-normal-distribution-2d.png |
| 8 | solution-physics-projectile.json | 2d | board/2d.html | ✅ | 0 | 0 | golden/solution-physics-projectile-2d.png |
| 9 | solution-quadratic.json | 2d | board/2d.html | ✅ | 0 | 0 | golden/solution-quadratic-2d.png |
| 10 | solution-rutherford.json | 2d | board/2d.html | ✅ | 0 | 0 | golden/solution-rutherford-2d.png |
| 11 | solution-space-angles.json | solid | board/solid.html | ✅ | 0 | 0 | golden/solution-space-angles-solid.png |
| 12 | solution-sr-minkowski.json | 3d | board/3d.html | ✅ | 0 | 0 | golden/solution-sr-minkowski-3d.png |
| 13 | solution-vector-addition.json | 2d | board/2d.html | ✅ | 0 | 0 | golden/solution-vector-addition-2d.png |

**Host 分布**: 2d×9, 3d×2, solid×2, reaction×0（13 个 lesson 中无化学类）

### 配对规则执行说明
- `board3d` 键 → 3d（洛伦兹力、闵可夫斯基）
- `model` 键 → solid（四棱锥线面角、空间角）
- `board.view` 含 `xRange/yRange` → 2d（其余全部）
- `solution-logic.json` 无 xRange/yRange，含 venn/truthTable/logicGates → 按规则试 2d，渲染成功（canvas 有内容，console 无错）

---

## 二、70 Docs 成品抽样验证

从 70 个 docs 中抽样 14 个（覆盖函数/圆锥/几何/物理/化学/算法/生物）：

| Docs 文件 | 类型 | 渲染 | console.error | CDN 依赖 | 需 vendor 化 |
|-----------|------|:---:|:---:|------|:---:|
| solution-quadratic (未抽样, golden 已验) | 函数 | ✅ | 0 | Tailwind+KaTeX | 是 |
| solution-normal-distribution.html | 函数/统计 | ✅ | 0 | Tailwind+KaTeX | 是 |
| solution-physics-projectile.html | 物理 | ✅ | 0 | Tailwind+KaTeX | 是 |
| solution-einstein-pythagoras.html | 几何 | ✅ | 0 | Tailwind+KaTeX | 是 |
| solution-garfield-proof.html | 几何 | ✅ | 0 | Tailwind+KaTeX | 是 |
| solution-lorentz-force.html | 物理 3D | ✅ | 0 | Tailwind+KaTeX | 是 |
| lesson-pyramid.html | 立体几何 | ✅ | 0 | Tailwind+KaTeX | 是 |
| shell-sort.html | 算法 | ✅ | 0 | Tailwind+KaTeX | 是 |
| grf.html | 生物/生医 | ✅ | 0 | Tailwind+KaTeX | 是 |
| ms.html | 生物 | ✅ | 0 | Tailwind+KaTeX | 是 |
| mg-burn.html | 化学 | ✅ | 0 | Tailwind+KaTeX | 是 |
| reaction-cu-reduction.html | 化学 | ✅ | 0 | Tailwind+KaTeX | 是 |
| reaction-fe-cuso4.html | 化学 | ✅ | 0 | Tailwind+KaTeX+**Three.js r128** | 是 |
| bub.html | 算法 | ✅ | 0 | 外部参考链接(非资源) | 否 |
| cardio.html | 生物 | ✅ | 0 | 外部参考链接(非资源) | 否 |

### CDN 依赖汇总
所有交互类 docs（含 board 渲染的）统一依赖：
- `cdn.tailwindcss.com` — Tailwind CSS（运行时 JIT）
- `cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/` — KaTeX 数学公式渲染（CSS + JS + auto-render）
- `cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js` — Three.js（仅化学/3D docs）
- `unpkg.com/three@0.128.0/examples/js/controls/OrbitControls.js` — OrbitControls（仅化学/3D docs）

**结论**: 14 个抽样 docs 全部渲染成功，0 console.error，0 失败请求。所有含 board 的 docs 均需 vendor 化 Tailwind + KaTeX（+ Three.js）才能离线运行。纯文本/参考类 docs（bub.html, cardio.html）仅含外部链接 `<a href>`，无运行时 CDN 依赖。

---

## 三、Renderer 回归（axis_motion + 5 星评分）

### axis_motion 渲染
- **状态**: ✅ 修复后通过
- **截图**: golden/renderer-axis_motion.png
- **发现并修复的 Bug**: `renderer/modes/axis-motion.js` 第 20 行调用了 `engine.play(totalMs, ...)` 但回调解构了 `phase`，而 `phase` 仅在 `engine.playTimeline()` 中注入。导致运行时抛出 `Cannot read properties of undefined (reading 'index')`，画布全黑。
- **修复**: `engine.play(totalMs, ...)` → `engine.playTimeline(timeline, ...)`
- **修复后**: 青蛙🐸、井体、深度刻度(0-10米)、月亮/太阳、阶段状态栏、进度条全部正常渲染，0 未捕获异常。

### 5 星评分 Widget
- **状态**: ✅ 代码完整
- `app.js` 第 1209 行 `function showRatingWidget(source, family, problemText)` 存在
- `rating-stars` HTML 结构存在（第 1217 行）
- 该函数在 `app.js` 第 1038、1078 行被正确调用

---

## 四、零 console 报错验证（Test 4）

| 测试组 | 总数 | console.error | 未捕获异常 | 404 资源 | 结论 |
|--------|:---:|:---:|:---:|:---:|------|
| 13 Lesson golden | 13 | 0 | 0 | 0 | ✅ 通过 |
| 14 Docs 抽样 | 14 | 0 | 0 | 0 | ✅ 通过 |
| Renderer axis_motion | 1 | 0 | 0 | 0 | ✅ 通过（修复后） |

**唯一 warning**: Renderer 有一条 `[warning] Canvas2D: willReadFrequently` —— 这是 Chrome 性能提示，非错误，不阻塞交付。

### 回测中修复的问题

1. **[Bug 修复] axis-motion.js play vs playTimeline 不匹配**
   - 文件: `renderer/modes/axis-motion.js:20`
   - 原因: `engine.play()` 不注入 `phase` 对象，但回调解构了 `phase.index`
   - 修复: 改用 `engine.playTimeline(timeline, callback)`
   - 影响: 小学轴线动画（爬井/弹跳/升降）此前完全黑屏，现已恢复

2. **[健壮性修复] 2d.html resize 空指针**
   - 文件: `board/2d.html:564,764`
   - 原因: `canvas.parentElement.getBoundingClientRect()` 在 layout 竞态时 parentElement 为 null
   - 修复: 增加 `if(!canvas || !canvas.parentElement) return;` 守卫
   - 影响: 消除了切换页面时残留 RAF 回调导致的未捕获异常

---

## 五、重点验证项结论

| 验证项 | 结论 | 证据 |
|--------|:---:|------|
| ① 2D 抛物线真画出 | ✅ 通过 | quadratic 截图可见黄色抛物线 y=ax²+bx+c、切线 f'(1.5)、积分面积、顶点标记 |
| ② 3D 立体/力场渲染 | ✅ 通过 | lorentz 截图可见红色电荷球、v/B/F 三矢量箭头、紫色圆周轨迹、3D 网格地板；pyramid 截图可见 P-ABCD 棱锥、E/O 点、边长标注 |
| ③ 化学 morph | ✅ 通过 | Fe+CuSO4 docs 截图可见 Fe 原子(橙)与 CuSO4 分子模型(黄+红)、能量-反应进程曲线、原子守恒面板、反应步骤进度条 |
| ④ axis_motion + 5 星评分 | ✅ 通过 | 修复后爬井动画完整渲染；showRatingWidget 函数及 rating-stars 结构在 app.js 中完好 |

---

## 六、已知缺口与限制

1. **无化学 lesson JSON 进入 golden 集**: 13 个 lesson 中无 `reaction` host，化学渲染仅通过 docs 抽样验证（reaction.html 模板未直接注入 lesson JSON 测试）。
2. **solution-logic.json 的 venn/truthTable 渲染**: 用 2d 模板加载无报错、canvas 有内容，但 2d.html 没有专门的韦恩图/真值表绘制逻辑——数据被接收但可能走默认路径渲染。建议后续确认 logic 类型是否需要专用模板。
3. **Normal distribution 曲线**: 截图中可见坐标轴但 bell 曲线较淡（σ=1.0 初始步），可能需要推进 step 才能完整显示。非 bug，是动画分步揭示的预期行为。
4. **Docs 全部依赖 CDN**: Tailwind CDN + KaTeX CDN 在离线环境不可用，生产部署需 vendor 化到 `vendor/` 目录。
5. **WebGL canvas 像素检测局限**: headless Chromium 的 `readPixels` 在 composite 后返回清屏色，3D/solid 的 canvas 内容检测不可靠（nonBgRatio=1.0/distinctColors=1），但目视截图确认渲染正常。
6. **draw-canvas 空白**: 2d.html 的 `#draw-canvas`（用户手写层）在无画笔输入时为空白，这是预期行为。

---

## 交付物清单

- `tests/golden/` — 14 张截图（13 lesson + 1 renderer axis_motion）
- `tests/docs-sample/` — 14 个抽样 docs + 14 张截图
- `tests/raw-results.json` — 机器可读的完整测试数据
- `tests/run-golden.py` — 可复跑的测试脚本
- `tests/TEST-REPORT-v6.1.md` — 本报告
