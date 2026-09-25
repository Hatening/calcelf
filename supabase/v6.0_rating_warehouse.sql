-- =====================================================================
-- CalcElf v6.0 迁移 — 评分仓库 / 问答日志 / 蒸馏批次
-- 幂等：可在 Supabase SQL Editor 直接运行一次，重复执行安全。
-- 依赖：pgcrypto 扩展已在 supabase/schema.sql 中 create extension if not exists pgcrypto;
--       本文件不重复启用。gen_random_uuid() 由此扩展提供。
-- =====================================================================

-- (a) kard_cache —— api/kard.js 已在 upsert 此表，此处补建迁移
create table if not exists public.kard_cache (
  cache_key text primary key,
  family text,
  render_params jsonb not null,
  answer text,
  lang text,
  created_at timestamptz not null default now()
);
alter table public.kard_cache enable row level security;
-- 不建公开策略：仅 service_role (admin) 读写。

-- (b) animation_ratings —— 用户/设备对单题动画质量的 1-5 评分
create table if not exists public.animation_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  device_id text,
  problem_hash text not null,
  family text,
  source text not null check (source in ('kard','free','plan')),
  rating smallint not null check (rating between 1 and 5),
  lang text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- 部分唯一索引：登录用户按 user_id+problem_hash 唯一；匿名按 device_id+problem_hash 唯一
create unique index if not exists idx_ratings_user_problem
  on public.animation_ratings (user_id, problem_hash) where user_id is not null;
create unique index if not exists idx_ratings_device_problem
  on public.animation_ratings (device_id, problem_hash) where device_id is not null;
create index if not exists idx_ratings_created_at
  on public.animation_ratings (created_at);
alter table public.animation_ratings enable row level security;
-- 不建公开策略：仅 service_role 读写。

-- (c) asked_questions —— 每次解题落一条原始问题记录（用于覆盖/蒸馏分析）
create table if not exists public.asked_questions (
  qid uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  problem_text text not null,
  problem_hash text not null,
  source text not null check (source in ('image','text','voice')),
  lang text,
  stage text,
  family text,
  kard_eligible boolean,
  anim_source text check (anim_source in ('kard','free','plan','static','none')),
  params jsonb,
  model text,
  created_at timestamptz not null default now()
);
create index if not exists idx_asked_family_created
  on public.asked_questions (family, created_at);
create index if not exists idx_asked_hash
  on public.asked_questions (problem_hash);
alter table public.asked_questions enable row level security;
-- 不建公开策略：仅 service_role 读写。

-- (d) distill_batches —— 每周蒸馏快照
create table if not exists public.distill_batches (
  id uuid primary key default gen_random_uuid(),
  period text not null,
  summary jsonb not null default '{}',
  low_rated jsonb,
  gaps jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_distill_period on public.distill_batches (period);

-- (e) 四个分析视图
create or replace view public.v_questions_by_family as
select family,
       lang,
       count(*) as total,
       count(distinct problem_hash) as unique_questions,
       count(*) filter (where kard_eligible = true) as kard_hits,
       count(*) filter (where anim_source = 'static' or anim_source = 'none') as fallback_count
from public.asked_questions
group by family, lang
order by total desc;

create or replace view public.v_low_rated as
select ar.rating, ar.family, ar.source, ar.problem_hash, aq.problem_text, ar.created_at
from public.animation_ratings ar
left join public.asked_questions aq on ar.problem_hash = aq.problem_hash
where ar.rating <= 2
order by ar.created_at desc;

create or replace view public.v_top_questions as
select problem_hash,
       problem_text,
       count(*) as ask_count,
       max(family) as family,
       max(created_at) as last_asked
from public.asked_questions
group by problem_hash, problem_text
order by ask_count desc
limit 50;

create or replace view public.v_coverage as
select family,
       count(*) as total,
       count(*) filter (where kard_eligible = true) as kard_eligible_count,
       round(100.0 * count(*) filter (where kard_eligible = true) / nullif(count(*), 0), 1) as kard_rate_pct,
       count(*) filter (where anim_source in ('static','none')) as fallback_count
from public.asked_questions
group by family
order by total desc;
