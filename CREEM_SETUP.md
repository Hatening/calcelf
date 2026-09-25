# CalcElf × Creem 收款接入指南（大陆主体可用，无需海外公司）

本包已内置 Creem 收款：**只要在 Vercel 配置了 `CREEM_API_KEY`，网站下单会自动走 Creem**；
没配置时仍走原来的 Stripe，两套代码并存、互不影响。

需要改动/新增的文件：
- `api/checkout.js`（改造：自动分流 Creem / Stripe）
- `api/creem-webhook.js`（新增：Creem 付款回调，验签后才发 Credits / 开通订阅）
- `supabase/creem_migration.sql`（新增：回调幂等表 + profiles 两个 Creem 字段）

---

## 第一步：在 Creem 建 6 个产品（Product catalogue）

在你截图的 Creem 沙箱后台，点左侧菜单 **Product catalogue** → **New product**，依次建 6 个（货币选 USD）：

| 产品名 | 类型 | 价格 | 建好后复制的 ID 对应环境变量 |
|---|---|---|---|
| Student | Recurring（按月订阅 every month） | $4.99/月 | CREEM_PRODUCT_STUDENT |
| Plus | Recurring（按月） | $9.99/月 | CREEM_PRODUCT_PLUS |
| Family | Recurring（按月） | $19.99/月 | CREEM_PRODUCT_FAMILY |
| 100 Credits | Standard / One-time（一次性） | $4.99 | CREEM_PRODUCT_PACK100 |
| 250 Credits | Standard / One-time | $9.99 | CREEM_PRODUCT_PACK250 |
| 600 Credits | Standard / One-time | $19.99 | CREEM_PRODUCT_PACK600 |

每个产品详情页有一个 `prod_xxxxxxxx` 编号，逐个复制保存（建议临时贴在记事本里，标明哪个是哪个）。

## 第二步：拿 API Key（左侧 Shortcuts → API keys）

点你截图左侧栏的 **API keys** → Create API key（沙箱 key 形如 `creem_test_...`），复制保存。

## 第三步：配置 Webhook（Developers → Webhook）

1. 左侧菜单 **Apps**（或右上角齿轮 Settings → **Developers**）里找到 **Webhooks** → Add endpoint。
2. Endpoint URL 填：
   ```
   https://calcelf.vercel.app/api/creem-webhook
   ```
   （如果你有自定义域名，把域名换掉，路径不变。）
3. 订阅事件：**最简单是事件留空（留空 = 接收全部事件）**；或手动勾选：
   - `checkout.completed`（首次付款成功：发充值包 Credits / 开通订阅）
   - `subscription.paid`（每月续费成功：重置当月订阅额度）
   - `subscription.canceled`、`subscription.paused`、`subscription.expired`（订阅终止：降为 free）
   - 建议一并勾上 `refund.created`、`dispute.created`（以后做对账用）
4. 保存后点 Reveal 复制签名密钥，形如 `whsec_xxxxxxxx`。
5. （可选，先验通 URL）保存后在该 endpoint 页面点 **Send test event**，再到 Vercel → Functions
   日志看 `/api/creem-webhook` 是否收到请求并返回 200。

> 注意：Webhook 必须是 **Vercel 上已部署的公网地址**，本地地址 Creem 访问不到。

## 第四步：Supabase 建表（一次性）

打开 Supabase → SQL Editor → New query，把 `supabase/creem_migration.sql` 的内容整段粘贴 → Run。
看到 Success 即可（语句幂等，重复运行无害）。它会建 `creem_events` 幂等表，并给 `profiles` 表加
`creem_customer_id`、`creem_subscription_id` 两列。

## 第五步：Vercel 填环境变量并重新部署

Vercel → 你的项目 → Settings → Environment Variables，逐条新增：

```
CREEM_API_KEY=creem_test_xxxxxxxx
CREEM_WEBHOOK_SECRET=whsec_xxxxxxxx
CREEM_PRODUCT_STUDENT=prod_xxx
CREEM_PRODUCT_PLUS=prod_xxx
CREEM_PRODUCT_FAMILY=prod_xxx
CREEM_PRODUCT_PACK100=prod_xxx
CREEM_PRODUCT_PACK250=prod_xxx
CREEM_PRODUCT_PACK600=prod_xxx
```

`APP_URL=https://calcelf.vercel.app` 保持原样。保存后到 Deployments → 最新部署右侧 **Redeploy**
（环境变量改完必须重新部署才生效）。

> 说明：代码会根据 key 前缀自动选环境——`creem_test_` 走沙箱、正式 key 走正式环境，
> 不需要额外配置 API 地址。沙箱的产品、key、webhook 都必须在顶部显示 "Sandbox" 时创建。

## 第六步：沙箱下单测试

1. 网站上注册/登录一个测试账号，点任意套餐的购买按钮，应跳到 Creem 的沙箱收银台。
2. 按 Creem 沙箱提示用测试卡完成支付（沙箱页面会给出测试卡号；不要用真实卡）。
3. 支付完跳回网站，验证：
   - 充值包：Credits 立即增加（250 包到账 250）；
   - 订阅：头像菜单里套餐变为 Student/Plus/Family，当月额度到账；
   - Supabase 表里 `creem_events` 出现事件记录，`profiles` 的 `plan`、`creem_subscription_id` 已更新。
4. 没到账就去 Vercel → Functions → `/api/creem-webhook` 看日志：
   - `Invalid Creem signature` = webhook secret 填错；
   - 404 = 新代码没部署上去或 URL 填错；
   - `CREEM_WEBHOOK_SECRET not configured` = 环境变量没保存/没 Redeploy。

## 第七步：切换正式环境收钱

测试没问题后，点后台右上角 **Switch to live account**，在正式环境**重做前三步**（正式环境的产品、
API key、webhook 与沙箱完全独立，需要重新创建）：
1. 建同样 6 个正式产品，复制正式 `prod_` 编号；
2. 建正式 API key（`creem_live_...`）和正式 webhook（URL 不变，拿新的 `whsec_`）；
3. 在 **Settings → Business → Linked accounts and payouts** 填写你的国内银行账户信息用于打款；
4. 回 Vercel 把 8 个 `CREEM_*` 变量替换成正式值 → Redeploy，即开始真实收款。

费率参考：Creem 作为 Merchant of Record 收 3.9% + $0.40/笔，自动处理欧美增值税/销售税、拒付和发票；
打款到国内银行卡，打款手续费 7 美元/欧元或打款额 1%（取高者），具体以后台最新说明为准。
