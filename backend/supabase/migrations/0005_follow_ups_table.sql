-- Follow-ups table: Track follow-up communications (emails, calls, messages)

CREATE TABLE IF NOT EXISTS follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('email', 'call', 'message', 'linkedin', 'other')),
  content text,
  sent_at timestamptz NOT NULL DEFAULT now(),
  response_received boolean DEFAULT false,
  response_date timestamptz,
  response_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only access their own follow-ups
CREATE POLICY "Users can read own follow_ups" ON follow_ups
FOR ALL
USING (user_id = auth.jwt() ->> 'sub')
WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_follow_ups_user_id ON follow_ups(user_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_application_id ON follow_ups(application_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_sent_at ON follow_ups(sent_at DESC);

-- Auto-update updated_at on modifications
CREATE TRIGGER trg_follow_ups_updated_at
BEFORE UPDATE ON follow_ups
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();
