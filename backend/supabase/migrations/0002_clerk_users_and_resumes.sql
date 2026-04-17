-- Clerk users + resume upload storage

create table if not exists public.users (
  id text primary key,
  email text,
  first_name text,
  last_name text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  file_url text not null,
  extracted_text text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.resumes enable row level security;

create policy "Users can read own record" on public.users
for all
using (id = auth.jwt() ->> 'sub')
with check (id = auth.jwt() ->> 'sub');

create policy "Users can read own resumes" on public.resumes
for all
using (user_id = auth.jwt() ->> 'sub')
with check (user_id = auth.jwt() ->> 'sub');

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

create policy "Users upload own resumes"
on storage.objects
for insert
with check (
  bucket_id = 'resumes'
  and auth.jwt() ->> 'sub' = (storage.foldername(name))[1]
);

create policy "Users read own resumes"
on storage.objects
for select
using (
  bucket_id = 'resumes'
  and auth.jwt() ->> 'sub' = (storage.foldername(name))[1]
);

create policy "Users delete own resumes"
on storage.objects
for delete
using (
  bucket_id = 'resumes'
  and auth.jwt() ->> 'sub' = (storage.foldername(name))[1]
);
