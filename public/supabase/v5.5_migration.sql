-- v5.5 SQL Migration: Weekly Reports + Feedback
-- Run in Supabase SQL Editor

-- Weekly reports table
CREATE TABLE IF NOT EXISTS weekly_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  emailed_at TIMESTAMPTZ,
  UNIQUE(user_id, week_start)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add weekly_report_email to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekly_report_email BOOLEAN DEFAULT true;

-- Add grade_band for age-adaptive font sizing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS grade_band TEXT DEFAULT '9-11';

-- Enable RLS
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY IF NOT EXISTS "Users can view own weekly reports"
  ON weekly_reports FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Service role manages weekly reports"
  ON weekly_reports FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "Anyone can submit feedback"
  ON feedback FOR INSERT WITH CHECK (true);
