-- HireOS Profiles Table Schema
-- Run this in: Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  full_name text,
  email text,
  phone text,
  location text,
  target_role text,
  years_experience int,
  skills text[],
  education jsonb,
  experience jsonb,
  raw_text text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read/write their own profile
CREATE POLICY "Users manage own profile"
ON profiles FOR ALL
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Create index for faster queries
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
