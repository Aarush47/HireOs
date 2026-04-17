-- Create tonality_conversations table
create table if not exists tonality_conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  session_id uuid default gen_random_uuid() not null,
  conversation_history jsonb default '[]'::jsonb,
  stage integer default 1,
  is_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table tonality_conversations enable row level security;

-- RLS policy: users can only see their own conversations
create policy "Users own conversations"
on tonality_conversations
for all using (auth.uid() = user_id);

-- Create indexes
create index idx_tonality_user_id on tonality_conversations(user_id);
create index idx_tonality_session_id on tonality_conversations(session_id);

-- Add columns to profiles table if they don't exist
alter table profiles add column if not exists tone_style text;
alter table profiles add column if not exists communication_style text;
alter table profiles add column if not exists personality_traits text[] default '{}';
alter table profiles add column if not exists career_preferences jsonb;
alter table profiles add column if not exists onboarding_complete boolean default false;
alter table profiles add column if not exists resume_text text;

-- Create index on onboarding_complete for faster lookups
create index if not exists idx_profiles_onboarding on profiles(onboarding_complete);
