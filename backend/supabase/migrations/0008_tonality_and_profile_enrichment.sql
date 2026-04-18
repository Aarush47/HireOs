-- Add tonality columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tone_style text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS communication_style text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS personality_traits jsonb DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS career_preferences jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;

-- Tonality conversation sessions table
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

-- Enable RLS on tonality_conversations
ALTER TABLE tonality_conversations ENABLE ROW LEVEL SECURITY;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_tonality_user_id ON tonality_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_tonality_complete ON tonality_conversations(is_complete);

-- NOTE: All tonality routes use service role, so no RLS policies needed for backend.
-- Frontend has no direct access to this table anyway.
