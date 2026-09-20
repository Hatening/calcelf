create extension if not exists pgcrypto;

create table if not exists public.profiles(
 id uuid primary key references auth.users(id) on delete cascade,
 email text,
 account_role text not null default 'parent' check(account_role in('adult','parent')),
 stage_band text not null default 'prefer_not' check(stage_band in('primary_1_3','primary_3_6','middle_1_2','grade_9_12','prefer_not')),
 language text not null default 'en',
 plan text not null default 'free' check(plan in('free','student','plus','family')),
 credits_monthly integer not null default 0 check(credits_monthly>=0),
 credits_paid integer not null default 0 check(credits_paid>=0),
 credits_bonus integer not null default 0 check(credits_bonus>=0),
 monthly_grant integer not null default 0,
 monthly_reset_at timestamptz,
 subscription_started_at timestamptz,
 loyalty_reset_used_month text,
 free_solves_today integer not null default 0,
 free_solves_day date not null default current_date,
 stars integer not null default 0,
 lifetime_level integer not null default 1,
 lifetime_correct integer not null default 0,
 active_days integer not null default 0,
 monthly_level integer not null default 1,
 monthly_solved integer not null default 0,
 monthly_correct integer not null default 0,
 monthly_streak integer not null default 0,
 last_learning_day date,
 invite_code text unique,
 referred_by uuid references public.profiles(id),
 stripe_customer_id text,
 stripe_subscription_id text,
 created_at timestamptz not null default now()
);

create table if not exists public.credit_ledger(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 delta integer not null, bucket text not null, reason text not null, request_id text unique, created_at timestamptz not null default now()
);
create table if not exists public.solve_usage(
 id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null,
 service text not null, credits_charged integer not null, model text, input_tokens integer, output_tokens integer,
 success boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.rate_buckets(bucket_key text primary key,window_start timestamptz not null,count integer not null default 0,expires_at timestamptz not null);
create table if not exists public.security_events(id uuid primary key default gen_random_uuid(),user_id uuid references auth.users(id) on delete set null,event_type text not null,risk_score integer not null default 0,ip_day_hash text,install_hash text,email_hash text,meta jsonb not null default '{}',created_at timestamptz not null default now());
create table if not exists public.practice_items(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,level integer not null check(level between 1 and 3),source_problem_hash text,problem_text text,answer text,created_at timestamptz not null default now(),answered_at timestamptz);
create table if not exists public.practice_results(id uuid primary key default gen_random_uuid(),practice_id uuid not null references public.practice_items(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,correct boolean not null,response_seconds integer,created_at timestamptz not null default now());
create table if not exists public.badges(id text primary key,name text not null,icon text not null,condition_text text not null);
create table if not exists public.user_badges(user_id uuid not null references auth.users(id) on delete cascade,badge_id text not null references public.badges(id),earned_at timestamptz not null default now(),primary key(user_id,badge_id));
create table if not exists public.stripe_events(id text primary key,event_type text not null,created_at timestamptz not null default now());
create table if not exists public.invites(id uuid primary key default gen_random_uuid(),inviter_id uuid not null references auth.users(id) on delete cascade,invitee_id uuid references auth.users(id) on delete set null,code text not null,status text not null default 'pending',reward_credits integer not null default 0,reward_stars integer not null default 0,eligible_at timestamptz,created_at timestamptz not null default now());
create table if not exists public.star_redemptions(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,month text not null,created_at timestamptz not null default now());

insert into public.badges(id,name,icon,condition_text) values
('welcome','初识精灵','🧚','完成账户初始化'),('envoy','普瑞使者','🏅','完成 5 个新手任务'),('streak3','连续 3 天','🔥','连续学习 3 天'),('streak7','连续 7 天','🔥','连续学习 7 天'),('perfect1','首次满分','💯','首次练习答对'),('first_mastery','首个知识点','📚','首次完整练习闭环'),('triple','举一反三','🎯','完成 Level 1→2→3'),('days100','百日学者','🌳','累计有效学习 100 天'),('days365','年度传奇','🌟','累计有效学习 365 天')
on conflict(id) do nothing;

create or replace function public.consume_rate(p_key text,p_window_seconds int,p_limit int) returns boolean language plpgsql security definer as $$
declare n timestamptz:=now(); r public.rate_buckets%rowtype; begin select * into r from public.rate_buckets where bucket_key=p_key for update; if not found or r.expires_at<n then insert into public.rate_buckets(bucket_key,window_start,count,expires_at) values(p_key,n,1,n+make_interval(secs=>p_window_seconds)) on conflict(bucket_key) do update set window_start=excluded.window_start,count=1,expires_at=excluded.expires_at; return true; end if; if r.count>=p_limit then return false; end if; update public.rate_buckets set count=count+1 where bucket_key=p_key; return true; end $$;

create or replace function public.consume_credits(p_user_id uuid,p_amount int,p_reason text,p_request_id text) returns json language plpgsql security definer as $$
declare p public.profiles%rowtype; total int; need int:=p_amount; take int; used_bonus int:=0; used_monthly int:=0; used_paid int:=0; today date:=current_date; daily int:=3;
begin
 if exists(select 1 from public.credit_ledger where request_id=p_request_id) then return json_build_object('ok',true,'duplicate',true); end if;
 select * into p from public.profiles where id=p_user_id for update; if p.id is null then return json_build_object('ok',false,'reason','profile_missing'); end if;
 if p.free_solves_day<>today then update public.profiles set free_solves_day=today,free_solves_today=0 where id=p_user_id; p.free_solves_today=0; end if;
 total=p.credits_monthly+p.credits_paid+p.credits_bonus;
 if total>=need then
   take=least(p.credits_bonus,need); used_bonus=take; need=need-take; update public.profiles set credits_bonus=credits_bonus-take where id=p_user_id;
   if need>0 then take=least(p.credits_monthly,need); used_monthly=take; need=need-take; update public.profiles set credits_monthly=credits_monthly-take where id=p_user_id; end if;
   if need>0 then take=least(p.credits_paid,need); used_paid=take; need=need-take; update public.profiles set credits_paid=credits_paid-take where id=p_user_id; end if;
   insert into public.credit_ledger(user_id,delta,bucket,reason,request_id) values(p_user_id,-p_amount,'mixed',p_reason,p_request_id);
   select credits_monthly+credits_paid+credits_bonus into total from public.profiles where id=p_user_id;
   return json_build_object('ok',true,'remaining',total,'free',false,'used_bonus',used_bonus,'used_monthly',used_monthly,'used_paid',used_paid);
 end if;
 if p_reason='solve' and p.free_solves_today<daily then
   update public.profiles set free_solves_today=free_solves_today+1 where id=p_user_id;
   insert into public.credit_ledger(user_id,delta,bucket,reason,request_id) values(p_user_id,0,'free','free_daily_solve',p_request_id);
   return json_build_object('ok',true,'remaining',total,'free',true,'used_bonus',0,'used_monthly',0,'used_paid',0);
 end if;
 return json_build_object('ok',false,'reason','insufficient');
end $$;

create or replace function public.refund_credits(p_user_id uuid,p_amount int,p_bucket text,p_reason text,p_request_id text) returns int language plpgsql security definer as $$
declare total int;begin if exists(select 1 from public.credit_ledger where request_id=p_request_id) then select credits_monthly+credits_paid+credits_bonus into total from public.profiles where id=p_user_id; return total; end if; if p_bucket='monthly' then update public.profiles set credits_monthly=credits_monthly+p_amount where id=p_user_id; elseif p_bucket='bonus' then update public.profiles set credits_bonus=credits_bonus+p_amount where id=p_user_id; else update public.profiles set credits_paid=credits_paid+p_amount where id=p_user_id; end if; insert into public.credit_ledger(user_id,delta,bucket,reason,request_id) values(p_user_id,p_amount,p_bucket,p_reason,p_request_id); select credits_monthly+credits_paid+credits_bonus into total from public.profiles where id=p_user_id; return total;end $$;

create or replace function public.grant_credits(p_user_id uuid,p_amount int,p_bucket text,p_reason text,p_request_id text) returns int language plpgsql security definer as $$
declare total int;begin if exists(select 1 from public.credit_ledger where request_id=p_request_id) then select credits_monthly+credits_paid+credits_bonus into total from public.profiles where id=p_user_id; return total; end if; if p_bucket='monthly' then update public.profiles set credits_monthly=credits_monthly+p_amount where id=p_user_id; elseif p_bucket='bonus' then update public.profiles set credits_bonus=credits_bonus+p_amount where id=p_user_id; else update public.profiles set credits_paid=credits_paid+p_amount where id=p_user_id; end if; insert into public.credit_ledger(user_id,delta,bucket,reason,request_id) values(p_user_id,p_amount,p_bucket,p_reason,p_request_id); select credits_monthly+credits_paid+credits_bonus into total from public.profiles where id=p_user_id; return total;end $$;

alter table public.profiles enable row level security;
alter table public.practice_items enable row level security;
alter table public.practice_results enable row level security;
alter table public.user_badges enable row level security;
drop policy if exists "profile self" on public.profiles;
create policy "profile self" on public.profiles for select using(auth.uid()=id);
drop policy if exists "practice self" on public.practice_items;
create policy "practice self" on public.practice_items for select using(auth.uid()=user_id);
drop policy if exists "practice result self" on public.practice_results;
create policy "practice result self" on public.practice_results for select using(auth.uid()=user_id);
drop policy if exists "badge self" on public.user_badges;
create policy "badge self" on public.user_badges for select using(auth.uid()=user_id);

create or replace function public.on_user_created() returns trigger language plpgsql security definer as $$begin insert into public.profiles(id,email) values(new.id,new.email) on conflict(id) do nothing; insert into public.user_badges(user_id,badge_id) values(new.id,'welcome') on conflict do nothing; return new;end $$;
drop trigger if exists create_profile on auth.users;
create trigger create_profile after insert on auth.users for each row execute procedure public.on_user_created();
