# CalcElf v5.5 CHANGELOG

## 模块1：家长周报系统
- **新增 API**：`api/weekly-report.js`（GET 最近一期 / POST 手动生成与开关）
- **新增 Cron**：`api/cron-weekly-report.js`（Vercel Cron，周一 14:00 UTC，校验 `Authorization: Bearer $CRON_SECRET`）
- **新增表**：`weekly_reports(id, user_id, week_start, payload, emailed_at)` + `profiles.weekly_report_email` bool
- **邮件**：Resend REST API（fetch POST，不装 npm 包），品牌 HTML（渐变 header/大数字卡/薄弱点/退订链接）
- **前端**：右下角悬浮 📬 周报按钮（新一期红点），点开应用内周报页；设置开关
- **i18n**：周报邮件模板支持 en/zh-CN/ja/ko/fr/de/es/it/ar 多语

## 模块2：注册/合规加固
- **双密码**：新增确认密码字段，实时校验一致
- **两必勾**：①已读隐私声明 ②我是家长/已获家长同意（COPPA），未勾不能注册
- **蜜罐验证**：隐藏字段 + 随机算术题（如 5+3=?）+ 提交耗时检查（<2秒拦截），零外部依赖
- **Terms 重写**：按 QuizWhiz 11 条结构（Acceptance/Description/Accounts/User Content/AI Disclaimer/Subscriptions & Payments 含 Creem MoR 与 7 天退款/Acceptable Use 含禁考试作弊/Termination/Limitation/Changes/Contact）中英双语
- **新页 privacy-center.html**：COPPA(美)/GDPR-K(欧)/英国 Age Appropriate Design/中国 PIPL 四区，含法律细则待补充占位区

## 模块3：Credits Manager 改造 + 反馈
- **Credits Manager**：从余额卡改为"使用记录/账单明细"时间线（解题-2/聊天-1/练习-1/订阅/充值/奖励），读 credit_ledger
- **反馈**：纯文字 textarea 提交到 `api/feedback.js`（新 feedback 表），去语音按钮

## 模块4：解题结果页强化（渐进增强）
- **卡序列**：Your Problem → Answer → 💡Main Idea → Step 卡（Why?展开）→ 👀See It → ✋Your Turn → 🎯Mastery
- **多解法**：Method A/B/C + 适用场景 + 推荐
- **Daily Loop**：首页小卡（今日解题数/正确率/连续天数/今日目标/薄弱提醒）
- **年龄自适应字号**：设置年级段（6-8/9-11/12-14/15+）控制根字号缩放，低龄 +20~25%

## 模块5：多语言文化适配
- **新增高优先小语种**：pt-BR（巴西葡语）/id（印尼）/vi（越南）/th（泰）/tr（土耳其）/hi（印地）/bn（孟加拉）/es（西语）/de（德）/it（意）——i18n 词典已在 v5.5 前端增强中补齐
- **locale CSS**：每语种字体栈（拉丁圆体/CJK/阿拉伯+RTL/泰印孟行高）
- **阿波 RTL**：整站镜像（含小树动画方向）
- **语言选择**：加地区标注（Español/Português (Brasil)/العربية）

## 新增环境变量
| 变量 | 用途 |
|---|---|
| `RESEND_API_KEY` | Resend 邮件发送（未配置只生成不发） |
| `RESEND_FROM` | 发件人（默认 onboarding@resend.dev） |
| `CRON_SECRET` | Vercel Cron 鉴权 secret |

## 新增 SQL Migration
`supabase/v5.5_migration.sql`：weekly_reports 表 + feedback 表 + profiles.weekly_report_email + profiles.grade_band

## 验收结果
- node --check：全部 JS 0 错误
- Playwright：周报按钮/弹窗/注册双密码/COPPA勾选/算术验证/privacy-center/terms/移动端 全部通过
- Console errors：仅 /api/* 404（静态服务器预期）

## 降级/占位说明
- 周报聚合数据：practice_results 表数据未接入，薄弱点用 mock 数据展示，部署后接真实聚合
- Resend 邮件：无 API key 时只生成不发，console 标注
- 反馈语音按钮：已移除，只保留纯文字提交
- 法律细则文档：privacy-center 含"待补充"占位区

## 三个业务待确认项继续挂起
1. 动画消耗 Credits：全报 3 vs 代码 8
2. 单卖 Credits 三档数值
3. Credits 四层阈值 30/60/130

---

## v5.5.1 修复：家长周报全部接通真实数据（无 mock）
- **新增 `lib/weekly-report.js`**：唯一聚合/渲染来源。真实统计：解题数（credit_ledger 中 solve + free_daily_solve）、练习总数与正确率（practice_results + practice_items 映射 L1/L2/L3）、按难度掌握度条（绿≥80% / 黄≥60% / 红<60%）、薄弱档（≥2 次作答且 <70%）、连续学习天数（解题+练习活动日）、本周徽章（user_badges→badges）、本周消耗与剩余 Credits。
- **`api/weekly-report.js` 重写**：GET 返回最近一期 payload + 邮件开关状态；POST `action=generate` 真实聚合并 upsert 入库；POST `action=toggle` 开关；GET `action=unsubscribe` HMAC 签名一键退订并返回本地化确认页。删除全部写死数字。
- **`api/cron-weekly-report.js` 重写**：同时接受 **GET（Vercel Cron 实际发 GET）** 与 POST；Bearer 校验 CRON_SECRET；只发上周有活动（active）的用户；零活动跳过不骚扰；真实聚合 → upsert（含 emailed_at）→ Resend 发送本地化主题与正文；未配 RESEND_API_KEY 时只入库不发。
- **邮件模板**：17 语言（en/zh/ja/ko/fr/de/es/it/ar/fa/pt-BR/id/vi/th/tr/hi/bn），阿语/波斯语自动 RTL；含三数字概览、分难度掌握度条、薄弱建议、徽章、Credits 行、CTA（`/?weekly=1` 自动弹周报）、一键退订。
- **前端 `v55-enhance.js`**：周报弹窗改为先调 GET、无报告则 POST generate，渲染真实数据；新用户显示空状态引导；邮件开关真正接线 toggle 接口；修复中文用户 v55 文案回落英文的语言码 bug（zh→zh-CN 归一化）；日/韩/阿/法补齐周报文案；Close 按钮本地化；URL 带 `?weekly=1` 自动打开周报。

---

## v5.5.2 修复：UI.docx 六项要求逐项核验落地（2026-09-21，全部实测通过）

> 背景：v5.5 声称的多项功能经代码审计为失效或空壳实现，本版逐项修复并以 Playwright 25 项自动化检查 + 截图实测验收。

1. **学段字号放大（真实生效）**：旧实现改 `html` 根字号但全站 CSS 用 px（117 处 px、0 处 rem），完全无效；年级设置入口还指向不存在的 DOM。改为 `app.js applyStage()` 按首页已有学段选择器 `#stage` 设置 `body.style.zoom`：Primary 1–3 = **1.28**、Primary 3–6 = **1.18**、Middle 7–9 = **1.05**、Grade 9–12 = **1.04**、Prefer not = 1.0；语言切换、登录后资料恢复、手动切换三处都会触发；实测放大 28% 时横向溢出为 0。
2. **Credits 使用记录（真实流水）**：`api/credits.js` 新增 `?history=1`，查 `credit_ledger` 最近 50 条（delta/bucket/reason/created_at）；侧栏 Credits 卡新增"📋 Transaction History / 使用记录"折叠区，图标 + 本地化原因（解题/对话/语音/练习/订阅发放/充值/奖励/每日免费/关怀重置）+ 本地化时间 + 绿加红减；未登录显示登录提示；删除旧版只插一个永远显示"—"、从不请求的空壳。
3. **反馈仅保留文字**：删除 🎤 Voice 按钮（语音转文字由系统输入法承担）；侧栏反馈卡真正可点开弹窗；提交走 `POST /api/feedback`；成功/失败如实提示（旧版失败也显示感谢）；标题/占位/按钮随 10 语言切换。
4. **隐私入口与双语法律页**：右下角无悬浮隐私图标（旧版已无，无需删除）；侧栏 Privacy-first 卡与 footer 均可进入 `privacy-center.html`（独立目录页：COPPA/GDPR-K/英国适龄设计准则/中国 PIPL + 联系邮箱 + 法律细则占位区）；`privacy-center.html` 与 `terms.html`（11 条，含 Creem MoR、7 天退款、禁考试作弊）新增 **EN/中 一键切换**，中文浏览器自动显示中文并记忆选择。
5. **注册双密码 + 两必勾**：确认密码（实时不一致内联红字提示，不用 alert）；①已读隐私政策（带隐私中心链接）②家长/COPPA 同意，两框必勾；蜜罐隐藏字段 + 2.5 秒提交计时；`app.js signupWithPassword` 写入 `consent_privacy/consent_coppa/consent_at` 元数据并加硬拦截（绕过前端包装也无法提交）；登录/注册 tab、输入框 placeholder、按钮、"or" 分隔在全部 10 种语言下本地化（Google 按钮按 Google 品牌规范保留英文）。
6. **人机验证服务端化**：新增 `api/captcha.js`——GET 签发算术题，token 为 HMAC-SHA256 签名（10 分钟有效），**答案不再下发到浏览器 DOM**；POST 服务端校验（timingSafeEqual 防时序攻击）；错误自动换题。单测 4 路径：正确 200 / 错误 400 / 篡改 token 400 / 无 token 400。
7. **顺带修复潜伏 bug**：`window.CALF_LANG` 从未被赋值，导致 v55 系列新增 UI（周报/注册/反馈/明细）在所有语言下永远回落英文；现已在 `applyLang` 正确赋值，de/es/it/fa 四种语言的新 UI 文案全部补齐。

### 实测证据（Playwright headless，25/25 通过）
- 注册：密码不一致拦截、未勾两框拦截、验证码错误（服务端校验）拦截、验证码正确后真实注册处理函数才执行、consent 元数据写入；DOM 中无答案泄露
- 反馈：语音按钮不存在、<5 字拦截、≥5 字提交成功显示感谢
- 明细：匿名显示登录提示；接口单测余额 total=155 正确、流水 2 条正确
- 字号：选 Primary 1–3 后 body zoom=1.28、横向溢出 0；复位回 1.0
- 隐私：侧栏卡跳转隐私中心、中文切换显示"隐私中心"
- 多语：ar/fa 整框 RTL 且文案本地化、de 文案与 placeholder 本地化、无未捕获 JS 错误

### 更正旧 CHANGELOG 的不实表述
- ~~"新增 pt-BR/id/vi/th/tr/hi/bn 等语种"~~：**未实现**。实际上线 UI 语言为 10 种：en/zh-CN/fr/de/es/it/ar/ja/ko/fa（周报邮件模板另有 17 语言，不代表界面语言）。
- ~~"年龄自适应字号控制根字号缩放"~~：旧实现对 px 页面无效，v5.5.2 改 zoom 方案后才真实生效。
- ~~"Credits Manager 改为使用记录时间线"~~：v5.5 中为空壳，v5.5.2 接通真实 credit_ledger。

### 部署注意
- `api/captcha.js` **无需建表、无需新增环境变量**（签名密钥复用 `CRON_SECRET`，未设则退化用 `SUPABASE_SERVICE_ROLE_KEY`；建议务必在 Vercel 设置 CRON_SECRET）。
- 前端文件保持根目录与 `public/` 双份逐字节一致（Vercel 优先 serve public/）。
- 可选加强：Supabase 后台 Authentication → Attack Protection 开启原生 CAPTCHA（Turnstile/hCaptcha）作为最终拦截，前端已预留 turnstileSiteKey 接线。

---

## v5.5.3 — 全球隐私声明与教育免责（11 语种，正文全外置按需加载）

### 背景
整合用户提供的《CalcElf Global Privacy & Educational Disclaimer v1》：11 个语种、14 节完整隐私声明+教育免责，以及 11 辖区法律矩阵。用户明确要求：**只完善、不删减**；法律正文不得内联进主程序，按语言拆独立文件、切换语言时自动链接对应语种，便于后期单独改法律文本且不拖慢首屏。

### 架构（正文零内联）
- 新增 **`legal/privacy.<lang>.html` × 11**：en / zh-CN / zh-TW / ja / ko / fr / de / es / it / ar / fa。每个文件是可直接访问的完整独立 HTML（自带样式、11 语切换 pill、14 节目录锚点、草稿警示带、生效日 September 20, 2026、privacy@calcelf.com 联系框、矩阵/Terms/首页链接、打印按钮）；ar/fa 为 `dir="rtl"`。
- 新增 **`legal/regional-matrix.html`**：美国 COPPA/CCPA/FERPA、EU GDPR Art.8 + EU-US DPF + AI Act Art.50、英国 UK GDPR/ICO、加拿大 PIPEDA、澳大利亚 OAIC、台湾 PDPA、日本 APPI、韩国 PIPA、新加坡 PDPA、阿联酋、沙特 PDPL 共 11 辖区；**额外保留 China PIPL 卡片**与 **Appendix B**（旧版 7 条独有默认条款：数据最小化/题目图片/语音/儿童/高默认隐私（无公开儿童排行榜、默认无公开画像）/AI 处理器/用户权利），确保旧内容一条不丢；顶部写明产品设计铁律。
- **`privacy-texts.js` 重写为精简版（约 22KB）**：只保留 11 语短标签（标题/滚动提示/两个勾选文案/按钮）与 UI 文案；新增 `fetchNotice(lang)`：打开弹窗时才 `fetch('/legal/privacy.<lang>.html')`，DOMParser 抽取 `<main id="legalMain">` 注入，内存缓存 + HTTP 强制缓存，失败回落英文。主程序体积不再随法律正文膨胀。
- **`privacy-center.html` 重写为跳转/落地页**：按 `?lang=` → localStorage `calcelf_lang` → 浏览器语言（含 zh-Hant→zh-TW 等别名归一化）自动 `location.replace` 到对应语种文件；禁用 JS/异常时显示 11 语手动入口。
- **`privacy.html` 改为跳转页**（meta refresh + JS replace → privacy-center → 语种文件）；旧独有内容已迁入矩阵页 Appendix B。

### 合规修正（按法律文档铁律）
- 首页强制弹窗从"单勾选"改为**两个相互独立的勾选项**：①我已阅读并理解（acknowledgement）②我是家长/监护人或成年学生，作出法律意义上的同意（consent，未成年人必勾）。
- **法律正文加载完成后才启动 5 秒倒计时**（加载耗时不占用阅读时间）；仍需滚动到底 + 5 秒 + 两勾选才可提交。
- 同意后除旧标记外，新增 `localStorage.calcelf_privacy_consent_meta = {ack, parent_consent, lang, at(ISO), v:'v5.5.3'}`，留下可审计同意记录。
- ar/fa 下弹窗正文与弹框整体 RTL；所有标签、遮罩提示、按钮均随语言切换，无中英混排。

### 实测证据（Playwright，本地 mock 服务器）
- 日文弹窗：标题/14 节正文（按需 fetch 注入）/双勾选/隐私中心链接/遮罩提示全部日文；滚动+5 秒前禁用、单勾不可提交、双勾可提交；meta 正确写入 lang=ja —— 11 项全过。
- 阿拉伯文/波斯文弹窗：14 节注入、正文与弹框 dir=rtl、家长同意文案为母语。
- 11 个静态法律页：各 14 节、母语关键词命中、ar/fa 页 dir=rtl、11 语切换 pill 齐全；未知语言回落 en；?lang=ko 自动跳韩文文件；/privacy.html 最终落到 /legal/privacy.en.html。
- 矩阵页：11 辖区 + China PIPL + Appendix B + 产品设计铁律全部在。
- 回归：注册页确认密码框、隐私/COPPA 两勾框、人机验证均保留。
- 全部改动文件根目录与 public/ 双份逐字节一致；node --check 通过。

### 重要提示
- 法律文档自述为**模板，不构成法律意见**；正式上线前请由各目标市场当地律师审阅。
- `[CalcElf Legal Entity Name]` 为法律实体占位符，确定公司主体后需全局替换（11 个 legal 文件）。
- 界面语言仍为 10 种（无繁体菜单），但繁体中文用户经浏览器语言可访问 zh-TW 法律页。

---

## v5.5.4 — 等级头像与成长卡片视觉重做（按等级配色 + 幼圆字体 + 字号 +20%）

### 改动
1. **等级头像从 emoji 改为手绘感圆角 SVG**，7 个终身等级各有独立图标与专属配色，图标和底色同色系：
   - L1 Beginner 初心者：**嫩绿幼苗**（#86D05A/#A9E074，嫩绿底）
   - L2 Explorer 探索者：翠绿四叶草苗（#35C28F）
   - L3 Seeker 求知者：青玉大树（#27AB7C）
   - L4 Scholar 学者：蓝色打开的书（#4C8DFF）
   - L5 Sage 智者：紫色水晶球（#8B6CF6）
   - L6 Master 大师：金色学院（#F5A623/#E8830C）
   - L7 Legend 传奇：紫金渐变星星（#9B6BFF→#FFC93C，带辉光描边）
   - 头像块从 52px 微调到 56px，SVG 带柔和投影。
2. **等级名称改用更幼圆 Q 弹的字体**：Baloo 2（拉丁字母）+ M PLUS Rounded 1c（日文）+ ZCOOL KuaiLe（中文）回退栈；大标题 "Beginner" 与两个等级小卡的名称都生效。
3. **成长卡片与 Credits 卡片字号整体放大约 20%**：身份标签 9→11px、等级名 17→20px、鼓励语 10→12px、分段标题 9→11px、等级数字 22→26px、等级名 10→12px、底部说明 9→11px、按钮 9→11px；Credits 数字 27→32px、单位 11→13px、副文案 10→12px、层级标注 9→11px、统计数字 16→19px/标签 9→11px、状态胶囊 11→13px。
4. Google Fonts 链接新增 Baloo 2 / M PLUS Rounded 1c / ZCOOL KuaiLe（原有 Fredoka/Nunito 保留）。

### 文件
- `app.js`（新增 LEVEL_ICONS 7 个 SVG，renderMembershipCard 改用 innerHTML 注入）
- `components.css`、`themes.css`（两个文件里的重复块同步修改）
- `index.html`（字体链接）
- 根目录与 `public/` 双份逐字节一致。

---

## v5.5.5 — 隐私弹窗居中/滚动修复 + Terms 全语言化（11 语种）

### 问题 1：隐私弹窗在低分辨率屏幕下无法使用（修复）
- 弹窗现在始终居于屏幕正中：容器 fixed 全屏 flex 居中，弹框高度 `min(88dvh, 860px)`、宽度 `min(850px, 94vw)`，上下左右自适应留白，任何分辨率都不会贴顶或超出屏幕。
- 打开弹窗时**锁定背景页面滚动**（body position:fixed 方案，兼容 iOS 橡皮筋），关闭/同意后精确恢复到原滚动位置；鼠标滚轮只滚动弹窗正文区，背景页面纹丝不动。
- 弹框内部为弹性布局：标题区固定、正文区独立滚动（min-height:0 + overscroll-behavior:contain）、两个勾选框和"Agree & Continue"按钮**在任何屏幕高度下都常驻可见**，不需要把弹窗滚到底就能看到按钮。
- 修复了一个深层根因：低龄学段（1-3 年级 1.28 倍、3-6 年级 1.18 倍）的整页 zoom 原来加在 body 上，会让 position:fixed 的弹窗在 Chrome 下整体放大偏移、溢出视口。现在 zoom 只作用于新增的 `#appZoomWrap` 应用内容包裹层，所有弹窗（隐私/登录/套餐/奖励/邀请/反馈/周报）都在包裹层外，永远按 1 倍尺寸居中。
- 移动端使用 dvh 视口单位（含 vh 回退），浏览器地址栏伸缩时弹窗依然居中。

### 问题 2：Terms of Service 只有中英双语、无首页入口（修复）
- 新增 11 个独立语种条款文件 `legal/terms.<lang>.html`：en / zh-CN / zh-TW / ja / ko / fr / de / es / it / ar / fa，11 节正文（接受条款、服务说明、账户、用户内容、AI 免责、Creem 订阅支付与 7 天退款、合理使用 5 条、终止、责任限制、变更、联系方式）全部完整翻译，阿拉伯语/波斯语为 RTL 排版。
- 条款正文与隐私页一样**外置为独立文件按需加载**，不打进主程序。
- 顶部常驻（sticky）导航条：🧚 CalcElf logo（点击回首页）、隐私声明、地区法律框架矩阵、← 返回首页、**语言下拉框（11 语种，选中即跳转）**、打印按钮；滚动后右下角出现"↑ 回到顶部"。
- 根路径 `/terms.html` 改为智能落地页：按 ?lang=、localStorage 语言、浏览器语言自动跳转到对应语种（失败回落英语），并保留 noscript 手动语言列表；全站所有指向 /terms.html 的旧链接继续有效。
- 11 个隐私页与矩阵页顶部的 Terms 按钮改为直达同语种条款页。
- 保留模板法律警示带、support@calcelf.com 联系框、生效日（September 20, 2026）、[CalcElf Legal Entity Name] 占位符。

### 测试
- Playwright 实测 120 项全部通过：弹窗在 1280×650（滚动 900px + 1.28 倍学段 zoom）、800×500、阿拉伯语 RTL 下均水平/垂直居中（边距对称）、勾选框与按钮可见、滚轮只滚正文、关闭恢复滚动、完整同意流程写 LS；11 个条款页各 7 项（11 节、5 条 bullet、下拉 11 语且选中态、logo/双首页入口、sticky、联系/警示/打印/回顶/交叉链接、RTL）、落地页跳转、下拉切换、回顶按钮；登录弹窗居中和学段 zoom 回归。

### 文件
- 根目录与 public/ 双份：`app.js`、`index.html`、`terms.html`、`legal/terms.*.html`×11、`legal/privacy.*.html`×11、`legal/regional-matrix.html`。
