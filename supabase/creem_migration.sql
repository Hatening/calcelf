-- CalcElf Creem 收款迁移（在 Supabase SQL Editor 整段运行一次，幂等可重复执行）
-- 1) Creem webhook 事件幂等表
create table if not exists public.creem_events(
  id text primary key,
  event_type text not null,
  created_at timestamptz not null default now()
);
alter table public.creem_events enable row level security;
-- service_role 绕过 RLS 写入；匿名/登录用户无权读写
drop policy if exists creem_events_no_anon on public.creem_events;

-- 2) profiles 增加 Creem 客户/订阅编号（与 Stripe 字段并存，互不影响）
alter table public.profiles add column if not exists creem_customer_id text;
alter table public.profiles add column if not exists creem_subscription_id text;
create index if not exists idx_profiles_creem_sub on public.profiles(creem_subscription_id);
