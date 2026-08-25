-- Run this in the Supabase SQL Editor AFTER deploying the Clerk auth migration.
-- This drops the FK constraint linking profiles.id → auth.users
-- and changes the ID columns to text so they accept Clerk user IDs (e.g. "user_2abc...").

-- 1. Drop FK constraint on profiles (profiles.id no longer references auth.users)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Change profiles.id from UUID to TEXT (Clerk user IDs are text strings)
ALTER TABLE public.profiles ALTER COLUMN id TYPE text USING id::text;

-- 3. Change complaints.student_id from UUID to TEXT
ALTER TABLE public.complaints ALTER COLUMN student_id TYPE text USING student_id::text;

-- 4. Drop the old Supabase auth trigger (Clerk webhook handles profile creation now)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 5. Drop old client-facing RLS policies (all access now goes through service-role server actions)
DROP POLICY IF EXISTS "Read own complaints or all if admin" ON public.complaints;
DROP POLICY IF EXISTS "Admins can update complaints" ON public.complaints;
DROP POLICY IF EXISTS "Students can insert their own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable access to authenticated users" ON public.complaints;

-- Note: Row Level Security remains enabled on both tables as a safety net.
-- The service role key bypasses RLS — all enforcement happens in server actions.
-- This prevents any direct anon/authenticated client access from being meaningful.
