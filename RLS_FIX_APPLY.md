# RLS Policy Fix - APPLY NOW

## The Problem
Your Supabase Storage RLS policy uses `auth.uid()` (Supabase Auth), but your app uses **Clerk**. Backend uploads with service role now bypass RLS entirely.

## What I Fixed
✅ Created `backend/lib/supabase/admin.ts` - exports supabaseAdmin with service role key
✅ Updated `backend/app/api/upload-resume/route.ts` - uses supabaseAdmin 
✅ Updated migration `backend/supabase/migrations/002_resume_storage_rls.sql` - allows service_role

## IMMEDIATE ACTION REQUIRED

### Step 1: Apply the RLS Migration

Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- Drop old auth.uid() policies (they don't work with Clerk)
DROP POLICY IF EXISTS "Allow authenticated users to upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own resumes" ON storage.objects;

-- Create NEW policy: service_role can upload (backend with admin key)
CREATE POLICY "Service role can manage all resumes"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'resumes')
WITH CHECK (bucket_id = 'resumes');
```

### Step 2: Restart Backend

```bash
# Kill the running backend process
pkill -f "next dev.*backend"

# Start it fresh
cd backend && npm run dev
```

### Step 3: Test Upload

1. Navigate to http://localhost:5175 (frontend)
2. Sign in with Clerk
3. Upload a PDF resume
4. Check Supabase Dashboard → Storage → resumes bucket
5. File should appear (not blocked by RLS)

## Verification

After upload, you should see:
- ✅ File in Supabase Storage at path: `{userId}/{filename.pdf}`
- ✅ File exists in resumes table in database
- ✅ No "RLS policy violation" error

If it still fails:
1. Check backend logs: `tail -f /tmp/backend.log`
2. Verify backend/.env.local has SUPABASE_SERVICE_ROLE_KEY
3. Confirm migration was applied (check Storage Policies in dashboard)
