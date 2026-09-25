# CHANGELOG v5.4 — Creem 收款接入（大陆主体可直接收款）

## 背景
Stripe 不支持中国大陆主体直接开户。v5.4 新增 Creem（Merchant of Record，支持大陆卖家、
打款到国内银行卡、自动处理欧美税务）作为第一收款通道；Stripe 代码保留，可随时切回。

## 文件变更
| 文件 | 状态 | 说明 |
|---|---|---|
| `api/checkout.js` | 改造 | 配置了 `CREEM_API_KEY` 自动走 Creem，否则走 Stripe；前端调用方式不变（POST {product} → {url}） |
| `api/creem-webhook.js` | 新增 | Creem 回调：HMAC-SHA256 验签 `creem-signature`、事件幂等、发货/开通/续费/降级 |
| `supabase/creem_migration.sql` | 新增 | `creem_events` 幂等表；`profiles` 增加 `creem_customer_id`、`creem_subscription_id` |
| `CREEM_SETUP.md` | 新增 | 后台点击级配置指南（建产品→API key→Webhook→SQL→环境变量→沙箱测试→切正式） |

## 业务规则（与 v5.3.1 一致，未改动）
- 充值包：pack100 $4.99/100、pack250 $9.99/250、pack600 $19.99/600，走 `grant_credits` 入 paid 桶。
- 订阅：student $4.99/月发 250、plus $9.99/月发 800、family $19.99/月发 2200；
  `subscription.paid` 续费当月把订阅额度重置满额；取消/暂停/过期降为 free。
- Creem 事件处理：`checkout.completed`（order.status=paid 才发货）、`subscription.paid`、
  `subscription.canceled/paused/expired`；同一 event id 重复投递只处理一次。

## 新增环境变量（Vercel）
`CREEM_API_KEY`、`CREEM_WEBHOOK_SECRET`、
`CREEM_PRODUCT_STUDENT/PLUS/FAMILY/PACK100/PACK250/PACK600`（值为 Creem 后台的 prod_ 编号）。
配置步骤见 CREEM_SETUP.md。

## 测试记录
本地模拟 8 个场景全部通过：充值包发货、订阅开通、pending 不发货、重复事件幂等、
续费重置额度、取消降级、伪造签名 400、未登录下单 401、非法产品 400。
