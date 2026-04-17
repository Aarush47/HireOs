-- Resumes table for storing uploaded PDFs
CREATE TABLE IF NOT EXISTS resumes (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  file_url text not null,
  file_name text,
  file_size int,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint fk_user_id foreign key (user_id) references auth.users(id) on delete cascade
);

-- Enable RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own resumes
CREATE POLICY "Users manage own resumes"
ON resumes FOR ALL
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Create index for faster queries
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
