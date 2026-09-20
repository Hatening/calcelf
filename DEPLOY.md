# CalcElf 上线 Step by Step

## A. 域名
主域名使用 `www.calcelf.com`；`calcelf.com`、`www.calcelf.net`、`calcelf.net` 全部 301 到主域名。这样搜索引擎和支付回跳只有一个 canonical URL。

## B. GitHub
1. 建 private repo：`calcelf`。
2. 上传整个项目。
3. 不上传 `.env.local`、真实密钥。

## C. Vercel
1. Import GitHub repo。
2. 商业项目选 Vercel Pro；当前官方 Pro 为 $20/月并包含 $20 usage credit；Hobby 是个人/非商业用途。 
3. Framework 选 Other。
4. Deploy。
5. Vercel Domains 添加 `calcelf.com`、`www.calcelf.com`。
6. 按 Vercel 的 DNS 提示在域名 DNS 配 A/CNAME。
7. 把 .net 域名在 DNS/Redirect Rules 做 301 到 `https://www.calcelf.com/$1`。

## D. Supabase
1. 新建 project `calcelf-prod`。
2. SQL Editor 执行 `supabase/schema.sql`。
3. Authentication → URL Configuration：Site URL = `https://www.calcelf.com`；添加 redirect `https://www.calcelf.com/**`。
4. 邮箱登录先使用 Magic Link。
5. RLS 保持开启；service role key 只能在 Vercel。
6. Pro 当前从 $25/月；如果早期只是封测，可先评估 Free，但正式生产注意项目暂停、配额和数据备份策略。 

## E. Cloudflare Turnstile
1. 创建 Turnstile widget。
2. Hostnames 加 `www.calcelf.com` 和 `calcelf.com`。
3. Managed mode。
4. Site Key → `TURNSTILE_SITE_KEY`；Secret → `TURNSTILE_SECRET_KEY`。
5. 当前 Turnstile Free 可用于大多数生产应用，且 unlimited challenges；以后只有在需要高级 bot/device 信号时再考虑 Enterprise。 

## F. OpenAI
1. 创建 API project/key。
2. Vercel 添加 `OPENAI_API_KEY`。
3. `SOLVE_MODEL` / `ANIMATION_MODEL` 写你实际账户有权限使用的模型。
4. 当前示例 `gpt-5.6-luna` 是成本敏感、高并发模型，官方当前标价 $0.20/M input、$1.20/M output；正式上线前以你的账户价格页为准。 

## G. Stripe
先开 Test mode。
创建 six products/prices：
- Student subscription $4.99/month
- Plus subscription $9.99/month
- Family subscription $19.99/month
- 100 credits $4.99 one-time
- 500 credits $9.99 one-time
- 1,500 credits $19.99 one-time

环境变量填写 price IDs。
Webhook：
`https://www.calcelf.com/api/stripe-webhook`
事件至少：checkout.session.completed / invoice.paid / customer.subscription.deleted。
支付成功的 Credits 只能 webhook 发放。

## H. 账户上线策略
为了让儿童隐私设计简单：
- 核心流程不要求姓名、学校、生日、精确年级、住址、联系人、精确位置。
- 学习阶段用宽范围。
- 产品的付费账户默认由 adult/parent/guardian 持有；目标地区如要求儿童同意/家长授权，按实际法律流程实现。

## I. 第一次正式测试
1. 注册一个 test parent account。
2. 选小学 1–3；确认字体/圆角/颜色发生变化。
3. 切换 English/Chinese/French/German/Spanish/Italian/Arabic；整个 UI 必须切换，Arabic 必须 RTL。
4. 图片题；人工补文字。
5. 关闭 animation 再解题，确认没有动画 API 调用。
6. 打开 animation，确认扣费。
7. 连续追问，确认只发送题目摘要 + 当前问题。
8. 点击 Practice Level 1/2/3。
9. 检查 Stars。
10. 用测试卡购买 Credits；确认 webhook 入账。
11. 测试重复 webhook 不重复入账。
12. 测试取消订阅。
13. 测试 Credits 用完后的关怀重置。
14. 清除浏览器 localStorage 后重新注册，测试 anti-abuse gate。

## J. 上线监控
每天看：
AI cost / solve success / animation success / average tokens / credits purchased / credits consumed / signup abuse / false-positive rate / refund rate / subscription retention。

## K. 合规上线闸门
Privacy/Terms 页面必须替换模板，填写你的真实运营主体、客服联系方式、供应商、数据保留和删除周期。
美国：检查 COPPA 是否适用。
英国：检查 Children’s Code。
欧盟：检查 GDPR 儿童处理、同意年龄差异、DPIA、跨境传输。
支付：确认销售国家税务、退款和消费者保护规则。

## L. 第二阶段
把 Practice、Grade、Stars、Level、Invite、Care Reset 做成完整个人中心；再做 Capacitor iOS/Android。不要在 Web MVP 阶段同时维护两套客户端。
