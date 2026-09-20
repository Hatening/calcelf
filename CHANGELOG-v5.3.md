# CHANGELOG v5.3 — 动画免费并入解题 · 国产代码模型 · 充值包定稿

## 一、动画课件不再单独扣 Credits（对标 Photomath/Khanmigo）
- `api/animation.js`：移除全部扣费逻辑；注册登录用户解题后点动画不再扣额度。
- 匿名用户仍不可用（返回 ANON_ANIMATION_BLOCKED，前端引导注册）。
- 新增防滥用频率限制：每分钟 8 次、每小时 40 次（超限返回 RATE_LIMITED）。
- 前端 10 语种（英/简中/法/德/西/意/阿/日/韩/波斯）：
  - 动画勾选框提示统一改为"已包含在解题中，不额外消耗 Credits"；
  - 动画加载、注册引导、限流提示、失败提示全部按当前语言显示（此前是写死中文）。
- `lib/credits.js`：COST.animation = 0；`config.js` 同步为 0。
- solve_usage 台账照常记录每次动画，credits_charged 恒为 0，并记录实际命中模型与 token 数。

## 二、动画模型切换（阿里云百炼兼容接口，仅改模型名）
- 默认模型：qwen3-coder-flash（代码专用，输出 ¥4/百万 token，全天不涨价）。
- 兜底模型：flash 输出为空/过短/不是完整 HTML 时，自动用 qwen3-coder-plus 重试一次，
  返回体带 fallback:true，台账模型名标注 (fallback)。
- 输出上限 max_tokens：12000 → 7500（按实际计费，上限只用于砍成本尾巴）。
- 均可用环境变量覆盖：ANIMATION_MODEL / ANIMATION_FALLBACK_MODEL / ANIMATION_MAX_TOKENS。

## 三、业务数值定稿
- 充值包三档：100/$4.99、250/$9.99、600/$19.99（原 500、1500 全部替换）。
  - 涉及：index.html 购买弹窗、app.js 本地化、config.js、config/plans.json、
    api/checkout.js 价格映射、api/stripe-webhook.js 到账映射。
- Credits 四层阈值定稿：≥130 充裕 / 60–129 良好 / 30–59 偏低 / <30 告急。
- 解题仍为 2 credits/次，chat/voice/practice 各 1。

## 四、部署后必须在平台侧做的两件事
1. Stripe 后台新建两个一次性付款 Price：$9.99（250 credits）、$19.99（600 credits），
   并在 Vercel 环境变量新增 STRIPE_PRICE_PACK250、STRIPE_PRICE_PACK600（值为 price_xxx），
   重新部署。旧的 PACK500/PACK1500 变量保留无妨，已不再使用。
2. 阿里云百炼控制台确认工作区已开通 qwen3-coder-flash、qwen3-coder-plus；
   若模型 ID 带日期后缀，用环境变量 ANIMATION_MODEL / ANIMATION_FALLBACK_MODEL 指定确切 ID。

## 五、验证
- node --check 全部改动 JS 通过；JSON 校验通过。
- 桩件单测：匿名 403；flash 失败自动 plus 兜底成功；flash 正常时不调用 plus。
- Playwright：购买弹窗显示 100/250/600；10 语种动画提示与加载文案正确；阿/波斯 RTL 正常；无 JS 报错。
