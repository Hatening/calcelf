-- ============================================================
-- CalcElf v5.7.0 · 固定动画分镜缓存表
-- 在 Supabase → SQL Editor 中整段运行一次即可（幂等，可重复执行）。
-- 不运行也不影响功能：/api/animation-plan 会自动跳过缓存、每次实时生成。
-- ============================================================

create table if not exists public.animation_plans (
  cache_key   text primary key,
  plan        jsonb not null,
  lang        text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_animation_plans_created
  on public.animation_plans (created_at);

-- 仅后端 service role（Vercel 服务端）读写；
-- 开启 RLS 且不建任何面向用户的策略，匿名/登录用户都无法直接访问该表。
alter table public.animation_plans enable row level security;

-- （可选）保留最近 60 天缓存，防止表无限增长。
-- 需要 pg_cron 扩展；Supabase 自带 pg_cron 时可取消注释执行：
-- select cron.schedule(
--   'cleanup-animation-plans-daily',
--   '30 3 * * *',
--   $$ delete from public.animation_plans where created_at < now() - interval '60 days'; $$
-- );
