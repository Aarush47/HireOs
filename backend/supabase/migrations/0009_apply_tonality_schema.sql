-- Migration: Add tonality and personality profile support
-- Run this in Supabase SQL Editor to enable AI tonality chat

-- 1. Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tone_style text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS communication_style text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS personality_traits jsonb DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS career_preferences jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;

-- 2. Create tonality_conversations table
CREATE TABLE IF NOT EXISTS tonality_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_history jsonb DEFAULT '[]'::jsonb,
  stage integer DEFAULT 1,
  is_complete boolean DEFAULT false,
  analysis_result jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_tonality_user_id ON tonality_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_tonality_complete ON tonality_conversations(is_complete);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_complete);

-- 4. Enable RLS on tonality_conversations
ALTER TABLE tonality_conversations ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed since backend uses service role for all tonality operations
-- Frontend has no direct access to this table
