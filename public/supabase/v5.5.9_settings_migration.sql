-- ============================================================
-- CalcElf v5.5.9 —— 学习档案 / 解析偏好 / 家长周报 设置字段
-- 在 Supabase → SQL Editor 中整段运行一次即可（幂等，可重复执行）
-- ============================================================

-- 1) 解析详细度：answer_only=只给答案 / steps=分步讲解(默认) / detailed=详细讲解
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS explain_level TEXT NOT NULL DEFAULT 'steps';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_explain_level_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_explain_level_check
      CHECK (explain_level IN ('answer_only','steps','detailed'));
  END IF;
END $$;

-- 2) 学科偏好（多选，逗号分隔的 key，例如 'math,physics'）；空字符串 = 未设置
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subject_pref TEXT NOT NULL DEFAULT '';

-- 3) 家长周报：接收邮箱（可与登录邮箱不同；为空则发到注册邮箱）
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS weekly_report_to TEXT;

-- 4) 家长周报总开关（v5.5 已建过，这里做幂等保护）
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS weekly_report_email BOOLEAN NOT NULL DEFAULT true;

-- 完成。可执行下面一句验证新字段：
-- select explain_level, subject_pref, weekly_report_to, weekly_report_email from profiles limit 5;
