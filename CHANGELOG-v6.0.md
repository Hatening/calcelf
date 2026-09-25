# CalcElf v6.0 变更日志 — 知识卡接入主程序 + 动画评分 + 题目仓库 + 每周蒸馏

## v6.0.0 — 2026-09-25

### 核心变更：知识卡（kard）接入主程序动画流程

**问题**：Phase1 建好了八族知识卡和 Canvas 渲染器，但主程序 `animation()` 仍然只走 free HTML 兜底，用户看不到确定性动画。

**修复**：`app.js` 的 `animation()` 改为 kard 优先三级链路：

1. **kard（确定性 Canvas）**：先 POST `/api/kard`（10s 超时），命中 `eligible+renderParams` 则：
   - 在 `#animBox` 内创建 `<iframe src="/renderer/index.html" sandbox="allow-scripts allow-same-origin">`
   - iframe load 后 `contentWindow.postMessage({animation: renderParams}, '*')`
   - 渲染器按 `animation.type` 分发到对应 Canvas 模式（numberline/bars/balance/geometry 等八族）
   - 全屏按钮、高度自适应（`__calfAnimHeight`，minH 420/620）对 kard 同样生效
2. **free HTML（受控兜底）**：kard 不 eligible 或超时 → `/api/animation`（60s，低思考、主/备分时间）
3. **plan（具象分镜）**：free 失败 → `/api/animation-plan`（30s）
4. **static（静态步骤卡）**：全部失败 → 文字步骤，永不白屏

任何一档成功即停。`ANIMATION_MODE` 变量与 plan/hybrid 分支保留未动。

**配套改动**：
- `api/kard.js`：turnstile 改为可选（有 token 才校验，无 token 跳过——kard 在 solve 之后调用，solve 已验证人机，且 kard 不扣费）
- `public/renderer/index.html` + `root/renderer/`：渲染成功后 `parent.postMessage({__calfAnimHeight: 520})`，父页面据此自适应 iframe 高度
- renderer 目录同时存在于根目录与 `public/`，部署后 `/renderer/` 路径可访问

### 新增：动画 5 星评分

- **UI**：动画卡片内、画面下方放 5 颗星（☆/★），动画渲染成功后出现（kard/free/plan 三种来源都显示，static 不显示）
  - 悬停预览填充（琥珀色 #f59e0b），点击提交 1–5
  - 提交后显示致谢文案，可改一次（"修改评分"按钮），再次提交后锁定
  - 11 语言本地化（中/英/日/韩/法/德/西/意/阿/波，ar/fa RTL 适配）
- **新表 `public.animation_ratings`**：id、user_id（可空）、device_id（可空）、problem_hash、family、source（kard/free/plan）、rating（smallint 1–5）、lang、created_at、updated_at
  - 两个部分唯一索引：登录 `(user_id, problem_hash)`、游客 `(device_id, problem_hash)`，upsert
- **新端点 `POST /api/rate-animation`**：登录取 user_id，否则取 body/header 的 device_id；校验 rating；限流（60s/15）；不扣 Credits；返回 `{ok, thanks}`

### 新增：题目自动收集与归类（asked_questions）

- **新表 `public.asked_questions`**：qid（uuid PK）、user_id（可空）、problem_text、problem_hash、source（image/text/voice）、lang、stage、family、kard_eligible、anim_source（kard/free/plan/static/none）、params jsonb、model、created_at
  - 索引：`(family, created_at)`、`(problem_hash)`
- **`api/solve.js`**：每次解题服务端立即 try/catch 插入一条基础行（不阻断响应、失败静默），并把 `qid` 随 solve 响应返回客户端（流式 SSE `result` 事件 + 非流式 JSON 均带 qid）
- **新端点 `POST /api/log-animation`**：按 qid 更新 family/kard_eligible/anim_source；需登录、不扣费、限流；客户端在动画流程结束（含失败/静态）后调用
- **hash 口径统一**：`crypto sha256`，归一空白（`\s+` → 单空格）后取题目文本

### 新增：每周蒸馏 cron + 零成本后台视图

- **新表 `public.distill_batches`**：id、period（如 `2026-W39`）、summary jsonb、low_rated jsonb、gaps jsonb、created_at
- **新端点 `api/cron-distill.js`**：
  - `CRON_SECRET` Bearer 鉴权（照抄 `cron-weekly-report.js`）
  - 统计自上次运行以来：按 family/lang 计数、按 problem_hash 去重聚类、平均分、无动画/兜底占比、覆盖缺口（有流量但 kard 命中率 <30% 或 family 为 null）、高频题 top10
  - 写入 `distill_batches`；有 `RESEND_API_KEY` + `ADMIN_EMAIL` 时发汇总邮件
  - 只产出汇总与待办清单，不自动改卡/上线
- **`vercel.json`**：crons 增加 `{"path":"/api/cron-distill","schedule":"30 14 * * 1"}`（每周一 14:30 UTC，在 weekly-report 之后半小时）
- **四个视图**（`create or replace`，可在 Supabase SQL Editor 直接跑）：
  - `v_questions_by_family`：按族/语言计数 + kard 命中 + 兜底数
  - `v_low_rated`：评分 ≤2 的题（join asked_questions 取题目文本）
  - `v_top_questions`：高频题 top50
  - `v_coverage`：各族 kard 覆盖率百分比

### 迁移文件：`supabase/v6.0_rating_warehouse.sql`

幂等（`if not exists` / `create or replace`），包含：
- `kard_cache`（Phase1 已有代码 upsert 此表，本次补建迁移）
- `animation_ratings`
- `asked_questions`
- `distill_batches`
- 四个视图
- 所有表启用 RLS，不建公开策略（仅 service_role 读写）

### 验证证据（无头回测）

用 Python + Playwright + 系统 Chromium 起本地站点，stub API 后验证：

| 验证项 | 结果 |
|---|---|
| kard iframe 在 `#animBox` 内创建（src 而非 srcdoc） | ✅ |
| iframe 内 Canvas 真实渲染（数轴 frog 从 3 跳到 8） | ✅ |
| 三帧截图（首拍/中间/结论），对象全程不消失 | ✅ 634×620 canvas |
| 5 星评分组件出现，可点击，提交后致谢 | ✅ 4 星高亮 |
| `/api/kard` 调用 | ✅ 1 次 |
| `/api/rate-animation` 调用（rating=4, source=kard） | ✅ |
| `/api/log-animation` 调用（qid 正确, anim_source=kard, kard_eligible=true） | ✅ |
| JS console 报错（业务相关） | 0（仅 2 个测试环境 404） |

截图保存在 `tests/v6-frames/`。

### 未破坏的既有功能

- 输入互斥/排队/未解题打字作补充
- practice 锁定（首次提交即锁、持久化、新题重置）
- 流式首字/打字机、思考三点
- 竖式对齐、昼夜太阳月亮、动画加宽
- free HTML / plan / static 三级兜底链
- 模型不写死、读环境变量（默认 deepseek-flash、兜底 deepseek-v4-pro）
- Credits 规则：解题 2、chat/voice/practice 1、动画 0、评分与日志 0
- 11 语言 i18n，可见文字不混语言

### 合规

- 只存题目文本与 hash，不存图片
- user_id 可空（游客用 device_id）
- 删除入口复用现有 privacy 工具
- 隐私政策已含"用于改进服务"
