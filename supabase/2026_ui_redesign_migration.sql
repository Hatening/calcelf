-- =========================================================
-- CalcElf UI 重设计 migration：主题与吉祥物偏好
-- 在现有 profiles 表上新增两个字段，不破坏现有数据。
-- 执行方式：Supabase Dashboard → SQL Editor → 粘贴运行
-- =========================================================

-- 1. 主题偏好（elf / cloud / story / aurora）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'elf'
  CHECK (theme IN ('elf','cloud','story','aurora'));

-- 2. 吉祥物配色（teal / blue / purple）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mascot_color TEXT DEFAULT 'teal'
  CHECK (mascot_color IN ('teal','blue','purple'));

-- 3. 语言偏好（zh / en / ja / ko / fr）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_lang TEXT DEFAULT 'zh'
  CHECK (preferred_lang IN ('zh','en','ja','ko','fr'));

-- 4. 年级（用于注册时默认推荐主题）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS grade_band TEXT
  CHECK (grade_band IN ('1-3','3-6','7-9','10-12','prefer_not'));

-- 5. RLS：用户只能读写自己的偏好
-- （如已有 profiles 的 RLS policy，这里不需要重复；
--   只需确保 theme / mascot_color / preferred_lang / grade_band 字段在
--   现有的 "Users can update own profile" policy 允许的列里。）

-- 验证：
-- SELECT id, email, theme, mascot_color, preferred_lang, grade_band FROM profiles LIMIT 5;
