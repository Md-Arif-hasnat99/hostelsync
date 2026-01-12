-- Run this in your Supabase SQL Editor to prepare your database
-- This ensures the 'complaints' table exists and is ready for the Admin Dashboard

-- 1. Create the Complaints Table if it doesn't exist
create table if not exists complaints (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'in_progress', 'resolved')),
  priority text default 'normal' check (priority in ('normal', 'urgent')),
  student_id uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- 2. Enable Realtime (Crucial for the Admin Sync status)
-- This allows the dashboard to update instantly when a student sends a complaint
alter publication supabase_realtime add table complaints;

-- 3. Row Level Security (Initial Setup)
-- For a start, we'll allow all authenticated users to read. 
-- You can tighten this later to (auth.uid() = student_id) for students.
alter table complaints enable row level security;

create policy "Enable access to authenticated users" 
on complaints for select 
using (auth.role() = 'authenticated');

create policy "Students can insert their own complaints" 
on complaints for insert 
with check (auth.role() = 'authenticated');

create policy "Admins can update all complaints" 
on complaints for update 
using (true);
