-- 🔥 CORRECT RLS POLICY FOR RESUME UPLOADS
-- Run this in: Supabase Dashboard → SQL Editor

-- First, enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop any existing incorrect policies (if any)
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own resumes" ON storage.objects;

-- ✅ ALLOW SERVICE ROLE (backend with admin key) - NO RLS CHECK
-- This allows backend API to upload resumes for authenticated Clerk users
CREATE POLICY "Service role can manage all resumes"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'resumes')
WITH CHECK (bucket_id = 'resumes');

-- Verify policies are created
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

