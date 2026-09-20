
## 致命问题修复
1. **app.js 未声明 `lastProfile`**：切换语言时 applyCreditMembershipLocale 抛 ReferenceError（v4.2 遗留问题），已补 `let lastProfile=null` 并在 profile 拉取后赋值。
2. **语言菜单被两套代码抢占**：theme-app.js 曾用错误的存储键（calfelf_lang）重建菜单并强制整页刷新，已删除该逻辑；语言统一由 app.js 原生 10 语种无刷新切换负责（存储键 calcelf_lang）。
3. **流式解题与原生 solve 并发**：解题按钮同时触发 SSE 流式与旧 JSON 流程，旧流程报错后把加载区隐藏，表现为"流式不出字"。改为 ui-enhance 在 DOMContentLoaded 后唯一覆盖 onclick，只走 SSE（失败自动回退 JSON）。

## UI/交互修复
4. 顶栏整合为**单一品牌入口**：吉祥物胶囊（未登录→打开登录弹窗；已登录→下拉菜单，显示真实昵称），隐藏重复的 Account 按钮与 emoji 头像；退出登录改为真实 `supabase.auth.signOut()`。
5. 删除写死的中文假仪表盘（12 / 94% / 🔥5）。
6. 购买/充值统一回归 **v4.2 原生 plansModal**（10 语种齐全、接 Stripe checkout），移除中文独占且未接线的自建弹窗；套餐 3 档 + 充值包 3 档完整显示。
7. 弹窗在四套主题下统一为浅色纸面并强制深色文字（修复极光主题白字白底、标题不可见）；弹窗内次级按钮对比度修复。
8. 极光（aurora）深色主题：补齐全员卡、Credits 组件、mini 统计、反馈卡等 v4.2 硬编码浅色组件的深色适配。
9. 补回 v4.2 Credits 组件在合并中丢失的基础布局规则（Plenty 状态胶囊错位、层级语义色）。
10. 主题保存/吉祥物配色 Toast、未登录头像胶囊标签支持 10 语种实时跟随。
11. /api/public-config 拉取失败时静默回退静态 config.js，不再向用户显示 JSON 报错。

## 验收结果（本地无头浏览器实测）
- 全部 JS `node --check` 0 错误；根目录与 public 前端文件逐字节一致；
- 10 语种菜单展开/切换（日文整页无刷新跟随、阿语 RTL 布局正确）；
- 四主题切换计算样式真实变色并持久化；吉祥物图片全部成功加载；
- 解题 SSE：阶段提示→逐字输出→最终分步结果（mock event-stream 实测）；
- 登录弹窗、原生购买弹窗（6 个卡片）正常；375px 移动端无横向溢出；
- 控制台无业务报错（本地静态服务器 /api/* 404 属预期，Vercel 部署后为函数）。

## 已知待办（不阻塞部署）
- 繁体中文（zh-TW）主词典未翻完，菜单暂保留 10 语种；CREDIT_METER_UI 已含 zh-TW。
- 字体当前走 Google Fonts CDN，建议后续把 woff2 自托管到 public/fonts（国内访问稳定性）。
- Stripe 真实收款、Vercel 环境变量、Supabase migration 按《清空重传操作指南》接线。
- 三个业务数值（动画扣 3/8、充值包三档、Credits 阈值 30/60/130）集中在 config.js，待产品拍板。
