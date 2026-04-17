-- Users table (synced from Clerk)
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  email text,
  full_name text,
  created_at timestamptz DEFAULT now()
);

-- Profiles (AI-enriched)
CREATE TABLE IF NOT EXISTS profiles (
  id text PRIMARY KEY REFERENCES users(id),
  headline text,
  raw_cv text,
  parsed_skills jsonb DEFAULT '[]',
  career_story text,
  target_roles text[] DEFAULT '{}',
  experience_years int DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Jobs discovered
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES users(id),
  title text,
  company text,
  location text,
  jd_raw text,
  match_score int DEFAULT 0,
  match_gaps jsonb DEFAULT '[]',
  source text DEFAULT 'manual',
  discovered_at timestamptz DEFAULT now()
);

-- Applications (max 10 active)
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES users(id),
  job_id uuid REFERENCES jobs(id),
  status text DEFAULT 'saved' CHECK (status IN ('saved','applied','interviewing','offer','rejected','ghosted')),
  cover_letter_used text,
  resume_used text,
  notes text,
  applied_at timestamptz DEFAULT now(),
  last_action_at timestamptz DEFAULT now()
);

-- Generated materials
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES users(id),
  job_id uuid REFERENCES jobs(id),
  type text CHECK (type IN ('resume','cover_letter','follow_up','linkedin_note')),
  content text,
  created_at timestamptz DEFAULT now()
);

-- Resumes storage records
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  file_path text,
  file_name text,
  extracted_text text,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- NOTE: Since auth is Clerk (not Supabase Auth), RLS uses service role on backend.
-- Frontend uses anon key with no direct DB access.
-- All queries go through /api/* routes using service role key server-side.
