-- Create profiles table to store user metadata (role, department, name)
-- This references auth.users so profiles are auto-deleted when a user is removed

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  role text not null default 'student' check (role in ('student', 'faculty', 'admin')),
  department text not null default '',
  semester integer,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- RLS policies: users can read/update their own profile
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Allow public reads so the app can look up any user's basic info
create policy "profiles_select_all" on public.profiles
  for select using (true);
