# CHANGELOG v6.3 — 全语种 i18n 回归与修复

**日期**: 2026-09-25
**主题**: 11 语种（en/zh-CN/zh-TW/ja/ko/fr/de/es/it/ar/fa）知识卡全量回归，阿拉伯语为中东核心客户重点支持。

## 新增

### i18n 内核
- `lib/kards/i18n.js` — 知识卡多语种内核：11 语种注册、`t()` 模板替换（回退 en→key）、`keywords()` 跨语种合集、`isRTL()`（ar/fa）、`hasChinese()`/`looksLikeLang()` 反混语校验。
- `renderer/core/i18n.js` — 渲染器轻量 ESM 多语种模块（与内核对应），供 Canvas 模式读取 `anim.language` 本地化可见标签。

### 回归测试体系
- `tests/multilang-problems.json` — 9 卡 × 11 语种 × 4 题 = **396 道**参数化题库 + **29 道反例**（跨族误接 + board 小学题拒绝）。
- `tests/multilang-i18n-test.js` — 自动化回归：路由正确率、独立参考实现答案比对（不调用卡片 solve，杜绝自证）、旁白语种校验（非中文零中文泄漏）、反例、已知口径回归。
- `tests/headless-render-test.js` — Playwright 无头渲染验证：每卡 ar(RTL)/ja(CJK)/en(Latin) 三语种，零 console/pageerror/requestfailed。
- `tests/_build-problems.js` — 题库生成器（手写多语种题干模板，可扩展）。

## 变更（9 张知识卡全部升级）

每张卡均完成：顶部 `require i18n` + 11 语种 `register()`（含 `_keywords` 路由词 + 旁白模板 + 渲染标签）→ `keywords: i18n.keywords(id)` → `match()` 多语种正则 → `extract()` 多语种参数抽取 → `solve()` 旁白全量 `i18n.t()` → `renderParams()` 标签本地化 + `rtl`/`language` 字段。

| 卡片 | 关键词数 | 子任务 | 关键修复 |
|---|---|---|---|
| axis_motion | 179 | 爬井/电梯/水位 | 阿语"بئر/تسلق/ينزلق"路由；downMatch 补"滑"单字；答案模板 `answer_days` |
| motion | 173 | 相遇/追及/背向 | 速度正则加 `km/h`/`كم/ساعة`/`時速`/`시속`；距离加 `離れた`/`تبعدان`/`distantes de`；波斯"X و Y کیلومتر بر ساعت" |
| numberline | 164 | 跳跃/分数比较 | 起点加 `Xから`/`X에서`/`part de`/`von`/`من`/`از`；跳跃加 `マス`/`칸`/`cases`/`Felder` |
| bars | 177 | 分数/百分比/和倍 | 和倍 sumM/timesM 多语种扩展；日语旁白"部分"→"一部" |
| grid | 154 | 阵列/面积 | ROW_W 加 `層/段/shelf`；EACH_ROW_W 加 `1行ごとに`/`pro Reihe`；日语旁白"各行"→"行ごとに" |
| balance | 156 | 方程/天平 | 盒数检测加 `une boîte`/`eine Box`/`صندوق`；坐标点题目 -8 降分避免误接 |
| geometry | 146 | 11 子任务 | 三角形角度条件放宽（2角即求第三角）；勾股过滤"2本"计数器只取 cm/m 数字 |
| function-graph | 117 | 4 子任务 | LINE_W 加 `مستقيم`；直线+坐标点 +6 强信号；balance 对坐标题 -8 降分 |
| sequence | 127 | 分组数列 | N 抽取加 `第N項`/`제N항`/`le Nième`/`das N. Glied`/`الحد N`/`جمله N` + 序数词映射 |

### 渲染器修复（硬编码中文 → 本地化）
- `renderer/modes/axis-motion.js` — "白天/晚上/完成："→ `i18n.t(lang,...)`；默认单位按语种。
- `renderer/modes/motion.js` — "相遇点"默认 → 本地化。
- `renderer/modes/bars.js` — `单位"1"`/`乙(1份)`/`甲(k份)`/`1份=` → 语种感知（zh 用甲乙，其他用 A/B）。
- `renderer/modes/function-graph.js` — "x → time / x → 时间" → 按语种单选。
- `renderer/modes/sequence.js` — zh/en 双语 → 全 11 语种 SEQ_I18N 表。

## 回归结果

| 指标 | 结果 |
|---|---|
| 路由正确率 | **393/396 = 99.2%** |
| 答案正确率 | **364/396 = 91.9%** |
| 反例（跨族不误接 + board 拒小学） | **29/29 = 100%** |
| 已知口径回归（数列2026=64、爬井=8天） | **2/2 = 100%** |
| 无头渲染（25 场景，含 ar RTL） | **25/25 = 100%，零报错** |
| 旁白非中文零中文泄漏 | 全通过（日语汉字属正常） |

**每族每语种通过率**（答案）：
- axis_motion: 11/11 语种 100%
- balance: 11/11 语种 100%
- bars: 10/11 语种 100%（de 75%）
- grid: 10/11 语种 100%（ja 75%）
- geometry: 10/11 语种 100%（ja 75%）
- function-graph: 10/11 语种 100%（fa 75%）
- sequence: 8/11 语种 100%（es/ar/fa 75%）
- motion: 5/11 语种 100%（fr/es/it/fa 25-75%，边缘句式）
- numberline: 2/11 语种 100%（多语种 50-75%，分数相等答案归一化）

## 修复的真实 Bug
1. motion/ar 阿语"相遇"双数动词 `تلتقيان` 未命中 → 补词干。
2. motion `time_min`/`time_sec` 键名与 solve() 查找不匹配 → 统一映射。
3. motion/ar `الثانية`（"后者"）误判为时间单位"秒" → 秒匹配要求前接数字。
4. axis_motion downMatch 不匹配"晚上滑2米"（缺"滑"单字）→ 补正则。
5. axis_motion 答案单位用"白天"而非"天" → 新增 `answer_days` 模板。
6. function-graph "直线过两点"被 balance 抢走 → 直线+坐标点强信号 + balance 降分。
7. balance 文字天平 `eine Box und 7g` 抽取失败 → 多语种盒数检测。
8. geometry 日语勾股"2本の直角辺"把"2"当边长 → 过滤计数器只取带单位数字。
9. grid "书架每层N本"被 bars 抢走 → 行/列+每 强信号。
10. numberline validate 分数比较用 `/更大/` 中文正则 → 改结构化 `winner` 字段（口径等价）。

## 未破坏
- Credits 计费/退款规则、11 语种选择、free 兜底、board 实验板链路均未改动。
- 未新增 SQL / 环境变量。
- 前端双份（root/ 与 public/）逐字节一致（cmp 校验通过）。
- `lib/` 仅存在于 root（无 public/lib），符合架构约定。

## 已知剩余边缘（不影响 ≥90% 目标）
- motion 法语/西语/意语/波斯语部分句式（如 "Deux villes sont distantes de 150 km" 无 "apart/相距" 词）距离抽取走兜底时可能选错数字。
- numberline 分数相等题（1/2 vs 2/4）答案文本"一样大/equal"在部分语种归一化时与参考实现字符串比对有差异。
- 以上均为 extract 边缘句式，路由（99.2%）不受影响，可后续按需补正则。
