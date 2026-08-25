-- Run this in your Supabase SQL Editor to prepare your database and fix RBAC security issues

-- 1. Create Profiles Table if it doesn't exist
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null default 'student' check (role in ('student', 'admin')),
  full_name text,
  hostel text,
  room text,
  created_at timestamp with time zone default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Drop policy if it exists to allow clean re-runs
drop policy if exists "Users can view own profile" on public.profiles;

-- Users can read their own profile (necessary for frontend routing/identification)
create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

-- 2. Trigger Function to auto-create user profiles upon auth registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, hostel, room, role)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'hostel',
    new.raw_user_meta_data->>'room',
    'student' -- always default to student; admin roles must be granted manually
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Fix Row Level Security policies on complaints table
drop policy if exists "Enable access to authenticated users" on public.complaints;
drop policy if exists "Admins can update all complaints" on public.complaints;
drop policy if exists "Read own complaints or all if admin" on public.complaints;
drop policy if exists "Admins can update complaints" on public.complaints;

-- Students can read only their own complaints; Admins can read all complaints
create policy "Read own complaints or all if admin"
on public.complaints for select
using (
  auth.uid() = student_id
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Only Admins can update complaints (changing status/priority)
create policy "Admins can update complaints"
on public.complaints for update
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 4. One-time backfill for existing test accounts (if any)
insert into public.profiles (id, full_name, hostel, room, role)
select 
  id, 
  raw_user_meta_data->>'name', 
  raw_user_meta_data->>'hostel', 
  raw_user_meta_data->>'room', 
  coalesce(raw_user_meta_data->>'role', 'student')
from auth.users
on conflict (id) do nothing;
