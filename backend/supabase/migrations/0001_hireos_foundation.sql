-- HireOS foundation schema + security
-- Apply this migration before wiring app features.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key,
  full_name text,
  headline text,
  raw_cv text,
  parsed_skills jsonb not null default '{}'::jsonb,
  career_story text,
  tone_profile text,
  target_roles text[] not null default '{}',
  target_locations text[] not null default '{}',
  experience_years int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  company text not null,
  location text,
  jd_raw text not null,
  jd_parsed jsonb not null default '{}'::jsonb,
  source text not null check (source in ('paste', 'serpapi', 'manual')),
  match_score int check (match_score between 0 and 100),
  match_gaps jsonb not null default '[]'::jsonb,
  discovered_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  status text not null check (status in ('saved','applied','interviewing','offer','rejected','ghosted')),
  applied_at timestamptz,
  last_action_at timestamptz not null default now(),
  resume_used text,
  cover_letter_used text,
  notes text,
  nudge_sent_at timestamptz,
  nudge_dismissed bool not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  type text not null check (type in ('resume','cover_letter','follow_up','linkedin_note')),
  content text not null,
  version int not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists idx_jobs_user_id on public.jobs(user_id);
create index if not exists idx_applications_user_id on public.applications(user_id);
create index if not exists idx_materials_user_id on public.materials(user_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.touch_updated_at();

create or replace function public.enforce_active_application_limit()
returns trigger
language plpgsql
as $$
declare
  active_count integer;
begin
  if new.status in ('saved', 'applied', 'interviewing') then
    select count(*) into active_count
    from public.applications
    where user_id = new.user_id
      and status in ('saved', 'applied', 'interviewing')
      and (tg_op = 'INSERT' or id <> new.id);

    if active_count >= 10 then
      raise exception 'Active application limit (10) exceeded';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_application_active_limit on public.applications;
create trigger trg_application_active_limit
before insert or update on public.applications
for each row
execute function public.enforce_active_application_limit();

alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.materials enable row level security;

-- Profiles policy: row id equals authenticated user id.
drop policy if exists user_isolation on public.profiles;
create policy user_isolation on public.profiles
for all
using (id = auth.uid())
with check (id = auth.uid());

-- Jobs policy: row user_id equals authenticated user id.
drop policy if exists user_isolation on public.jobs;
create policy user_isolation on public.jobs
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Applications policy: row user_id equals authenticated user id.
drop policy if exists user_isolation on public.applications;
create policy user_isolation on public.applications
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Materials policy: row user_id equals authenticated user id.
drop policy if exists user_isolation on public.materials;
create policy user_isolation on public.materials
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());
