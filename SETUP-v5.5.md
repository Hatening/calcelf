# CalcElf v5.5 SETUP Guide

## 1. Resend Email Setup
1. Go to https://resend.com and sign up
2. Verify your domain (or use onboarding@resend.dev for testing)
3. Get your API key from Resend dashboard
4. Add to Vercel environment variables:
   - `RESEND_API_KEY` = re_xxxxxxxxxxxxxxxx
   - `RESEND_FROM` = "CalcElf <noreply@yourdomain.com>" (optional, defaults to onboarding@resend.dev)

## 2. Vercel Cron Setup
1. Add `CRON_SECRET` to Vercel environment variables (generate a random string)
2. vercel.json already includes:
   ```json
   "crons": [{ "path": "/api/cron-weekly-report", "schedule": "0 14 * * 1" }]
   ```
3. Vercel automatically sends `Authorization: Bearer $CRON_SECRET` header
4. The cron runs every Monday at 14:00 UTC

## 3. Supabase Migration
Run in Supabase SQL Editor:
```sql
-- supabase/v5.5_migration.sql
```
This creates:
- `weekly_reports` table (user_id + week_start unique)
- `feedback` table
- `profiles.weekly_report_email` boolean (default true)
- `profiles.grade_band` text (default '9-11')

## 4. Full Environment Variable List
| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | AI solutions |
| `SUPABASE_URL` | Yes | Database |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Backend access |
| `CREEM_API_KEY` | Yes | Payments |
| `CREEM_WEBHOOK_SECRET` | Yes | Webhook verification |
| `RESEND_API_KEY` | No* | Weekly report emails (*only needed for emails) |
| `RESEND_FROM` | No | Custom sender address |
| `CRON_SECRET` | Yes** | Cron endpoint auth (**required if using weekly reports) |
| `NEXT_PUBLIC_TURNSTILE_SITEKEY` | No | Cloudflare Turnstile (optional bot protection) |

## 5. Deployment
1. Push all files to GitHub
2. Vercel auto-deploys
3. Run Supabase migration
4. Verify cron appears in Vercel dashboard → Crons
5. Test weekly report button in the app

---

## v5.5.1 补充说明
- Cron 端点同时接受 GET 与 POST；Vercel Cron 自动以 **GET** 调用并附带 `Authorization: Bearer $CRON_SECRET`，无需手动配置请求方法。
- 手动触发测试（浏览器或终端，替换 <SECRET> 与正式域名）：
  `curl -H "Authorization: Bearer <SECRET>" https://calcelf.vercel.app/api/cron-weekly-report`
  返回 `{"ok":true,"processed":N,"sent":N,"skipped":N,"failed":N}`；未配置 RESEND_API_KEY 时报告入库但 skipped。
- 一键退订链接由后端用 CRON_SECRET 做 HMAC 签名，无需额外密钥；CRON_SECRET 一旦更换，旧邮件中的退订链接会失效（用户可在应用内关闭）。
- 应用内点 📬 会实时按最近 7 天真实数据生成周报；整周无活动的用户显示空状态引导，且不会收到邮件。

---

## v5.5.2 补充说明（UI.docx 六项修复）

### 1. 人机验证（api/captcha.js）
- **无需建表、无需新增环境变量**。算术题答案保存在 HMAC 签名的 token 里（10 分钟有效），不下发到浏览器。
- 签名密钥优先读 `CRON_SECRET`，未配置时退化用 `SUPABASE_SERVICE_ROLE_KEY`。**强烈建议在 Vercel 设置 CRON_SECRET**（Settings → Environment Variables），否则同一套 service role key 也能签名，安全性弱一档。
- 上线后浏览器直接访问 `https://calcelf.vercel.app/api/captcha` 应返回类似 `{"token":"...","q":{"a":7,"b":3}}`；返回 404 说明 api/captcha.js 没部署上去。
- 可选的最终拦截：Supabase 后台 Authentication → Attack Protection → CAPTCHA，开启 Cloudflare Turnstile 或 hCaptcha，把 site key 填入站点配置（前端已预留 `turnstileSiteKey` 接线）。

### 2. Credits 使用记录
- 依赖已有的 `credit_ledger` 表（v5.2 schema 已含），无需新 migration。
- 验证：登录后访问 `https://calcelf.vercel.app/api/credits?history=1`，应返回 `ledger:[...]` 数组；未登录返回 401。

### 3. 注册同意元数据
- 注册时勾选的两个同意框会写入用户元数据 `consent_privacy / consent_coppa / consent_at`，可在 Supabase Authentication → Users → 对应用户的 Metadata 中查到，作为 COPPA 合规留证。

### 4. 字号放大
- 纯前端实现，无需配置。用户在首页 "Learning stage" 选择年级段后整页按 1.28/1.18/1.05/1.04/1.0 缩放，选择会随 profile 的 stage_band 保存，下次登录自动恢复。

### 5. 隐私中心 / Terms 中英切换
- 两个页面右上角有 EN/中 切换按钮，按浏览器语言自动选择并记忆；法律细则占位区等待正式法律文本补充（预计 Q4 2026）。

### 6. 本次改动文件清单（部署时这些文件必须同时更新根目录与 public/ 两份）
- `app.js`、`v55-enhance.js`
- `privacy-center.html`、`terms.html`
- `api/credits.js`、`api/captcha.js`（public/api/ 下同步副本）

---

## v5.5.3 部署说明（全球隐私/教育免责，11 语种外置）

### 1. 新增/改动文件（根目录与 public/ 必须各放一份，内容逐字节一致）
新增目录 `legal/`（共 12 个文件）：
- `legal/privacy.en.html`、`privacy.zh-CN.html`、`privacy.zh-TW.html`、`privacy.ja.html`、`privacy.ko.html`、`privacy.fr.html`、`privacy.de.html`、`privacy.es.html`、`privacy.it.html`、`privacy.ar.html`、`privacy.fa.html`
- `legal/regional-matrix.html`（11 辖区矩阵 + China PIPL + Appendix B）

改动文件（5 个）：
- `privacy-texts.js`（精简为短标签 + 按需 fetch，约 22KB）
- `privacy-center.html`（改为按语言自动跳转的落地页）
- `privacy.html`（改为跳转页）
- `index.html`（弹窗双勾选 + 隐私中心入口 + RTL 钩子）
- `app.js`（隐私模块：异步加载正文、双同意、倒计时在正文加载后启动、consent meta）

GitHub 网页上传注意：单 commit 100 文件上限，legal/ 目录 12 个文件可一次传完。

### 2. 工作原理（无需任何环境变量、无需建表）
- 用户首次打开首页 → 弹窗只加载短标签 → 用户滚动/等待时才 `fetch('/legal/privacy.<当前语言>.html')` 注入正文；切换语言后下次打开自动取对应语种文件。
- 直接访问 `/privacy-center.html` 或旧链接 `/privacy.html` 会按 `?lang=` → 已选语言 → 浏览器语言自动跳到对应语种文件；识别不了回落英文。
- 同意记录写在浏览器 localStorage（`calcelf_privacy_agreed_v1` + `calcelf_privacy_consent_meta`）；注册用户的家长同意仍随注册元数据写入 Supabase。

### 3. 上线前必做两件事
1. **替换法律实体占位符**：11 个 `legal/privacy.*.html` 与矩阵页中的 `[CalcElf Legal Entity Name]` 全部替换为正式公司主体名称/地址/联系信息（可全局搜索该字符串，共若干处）。
2. **律师审阅**：该法律文本为模板，不构成法律意见；COPPA 可验证家长同意、GDPR Art.8 年龄门槛、阿联酋/沙特等辖区要求差异较大，正式上线前需当地律师确认。

### 4. 部署后验证（约 2 分钟）
- 访问 `https://calcelf.vercel.app/legal/privacy.ja.html`：能看到日文 14 节声明。
- 访问 `https://calcelf.vercel.app/legal/privacy.ar.html`：整页从右向左。
- 访问 `https://calcelf.vercel.app/privacy-center.html?lang=ko`：地址自动变成 `/legal/privacy.ko.html`。
- 清浏览器缓存后首次打开首页：弹窗出现，正文区域短暂 loading 后填充；必须滚动到底并等待 5 秒、勾选两个框，按钮才可点。
- 看不到更新就 Ctrl+F5（Mac: Cmd+Shift+R）破 CDN 缓存。

### 5. 后期修改法律文本
- 只改 `legal/privacy.<语言>.html` 对应文件即可，主程序（app.js/index.html）不用动；弹窗每次都会取最新文件（浏览器缓存由 Vercel 缓存策略控制，必要时在 Vercel 重新部署刷新）。
- 新增语种：①加一个 `legal/privacy.<code>.html`；②在 `privacy-texts.js` 的 TEXTS/UI 文案表补短标签；③在各 legal 页顶部语言 pill 加入口。

---

## v5.5.4 部署说明（等级头像/幼圆字体/字号放大）
- 改动文件（根目录与 public/ 各一份）：`app.js`、`index.html`、`components.css`、`themes.css`。
- 无环境变量、无数据库变更。
- 新增三个 Google Fonts 字族（Baloo 2、M PLUS Rounded 1c、ZCOOL KuaiLe）；加载失败时自动回退系统圆润字体，不影响功能。
- 部署后强刷（Ctrl+F5）破 CDN 缓存；验证：登录后成长卡头像按终身等级显示不同颜色的 SVG（1 级嫩苗→7 级紫金星），等级名明显更圆、卡片字号更大。

---

## v5.5.5 部署说明（弹窗居中 + Terms 11 语种）
- 改动文件：`app.js`、`index.html`、`terms.html`、`legal/` 下 terms 11 个新文件 + privacy 11 个文件 + regional-matrix（根目录与 public/ 双份）。
- 无环境变量、无数据库变更。
- 新增 `#appZoomWrap` 包裹层包住 header/main/footer；如你本地对 index.html 有自定义改动，注意保留这个包裹层的开闭标签（`<body>` 后开始、第一个 `.modal` 前结束），否则学段 zoom 会回退到 body（弹窗偏移问题会复现）。
- 部署后强刷（Ctrl+F5）验证：①低分辨率窗口打开隐私弹窗，弹窗居中、两个勾选和按钮始终可见、滚轮只滚弹窗；②访问 /terms.html 自动进对应语种，顶栏下拉可切 11 种语言、logo 和 Back 回首页、滚动后右下有回顶按钮。
