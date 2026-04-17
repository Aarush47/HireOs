-- Interviews table: Track interview rounds and progress

CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  round_number int NOT NULL DEFAULT 1,
  stage text NOT NULL CHECK (stage IN ('phone_screen', 'technical', 'behavioral', 'system_design', 'final', 'offer', 'other')),
  scheduled_at timestamptz,
  completed_at timestamptz,
  interviewer_name text,
  interviewer_email text,
  meeting_link text,
  notes text,
  feedback text,
  rating int CHECK (rating >= 0 AND rating <= 100),
  next_steps text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only access their own interviews
CREATE POLICY "Users can read own interviews" ON interviews
FOR ALL
USING (user_id = auth.jwt() ->> 'sub')
WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_at ON interviews(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_interviews_round ON interviews(application_id, round_number);

-- Auto-update updated_at on modifications
CREATE TRIGGER trg_interviews_updated_at
BEFORE UPDATE ON interviews
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();
