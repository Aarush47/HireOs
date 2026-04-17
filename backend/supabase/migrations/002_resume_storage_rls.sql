-- 🔥 CORRECT RLS POLICY FOR RESUME UPLOADS
-- Run this in: Supabase Dashboard → SQL Editor

-- First, enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop any existing incorrect policies (if any)
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their folder" ON storage.objects;

-- ✅ CORRECT POLICY: Allow authenticated users to upload to their own folder
CREATE POLICY "Allow authenticated users to upload resumes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND
  auth.uid()::text = split_part(name, '/', 1)
);

-- ✅ Allow users to read their own files
CREATE POLICY "Allow users to read their own resumes"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND
  auth.uid()::text = split_part(name, '/', 1)
);

-- ✅ Allow users to delete their own files
CREATE POLICY "Allow users to delete their own resumes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  auth.uid()::text = split_part(name, '/', 1)
);

-- Verify policies are created
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
