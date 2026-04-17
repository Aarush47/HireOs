# 🔴 Resume Upload Debugging Guide

## ⚡ Quick Fix Checklist

### Step 1: Fix RLS Policy (REQUIRED)

Go to: **Supabase Dashboard → SQL Editor**

Copy & paste the entire content from:
```
backend/supabase/migrations/002_resume_storage_rls.sql
```

Click **Execute** ✅

This ensures uploads are allowed for authenticated users.

---

## 🔍 Debug Flow (Follow Exactly)

### Step 2: Check Backend Logging

**Terminal where backend is running** should now show detailed logs:

```
🔍 UPLOAD DEBUG — userId: user_2x8y9z0a...
📁 FILE DEBUG: { exists: true, name: 'resume.pdf', type: 'application/pdf', size: 245632 }
📤 UPLOAD START — path: user_2x8y9z0a/1713456789-resume.pdf
✅ UPLOAD SUCCESS — data: { id: '...', ... }
✅ DATABASE SAVED — userId: user_2x8y9z0a
```

**If you see any ❌ errors**, that's your problem. Report them exactly.

---

## 🌐 Check Browser Network Request

1. **Open browser DevTools** → `F12`
2. Go to **Network** tab
3. Upload resume
4. Click the request named `/api/upload-resume` (or similar)
5. Check **Response** tab

### ✅ Success Response (200):
```json
{
  "file_url": "user_2x8y9z0a/1713456789-resume.pdf",
  "extracted_text": "John Doe\n Software Engineer..."
}
```

### ❌ Error Response (500):
```json
{
  "error": "RLS policy prevents upload",
  "details": { ... }
}
```

---

## 🎯 Most Likely Issues

### Issue 1: `userId: null`
```
❌ AUTH FAILED — userId is null
```

**Fix:** 
- Are you logged in? Try signing out and back in
- Check Clerk is properly initialized in frontend
- Make sure you're actually authenticated to Clerk

### Issue 2: `RLS policy prevents upload`
```
❌ UPLOAD ERROR: { message: "RLS policy prevents upload" }
```

**Fix:**
- Run the SQL migration: `002_resume_storage_rls.sql`
- Ensure policy was created (you should see 0 rows → 3 rows in policies)

### Issue 3: `bucket_id 'resumes' does not exist`
```
❌ UPLOAD ERROR: { message: "Bucket 'resumes' does not exist" }
```

**Fix:**
- Create bucket manually in Supabase:
  - Storage → New Bucket → Name: `resumes`
  - Privacy: Private (RLS will control access)

---

## 🧪 Test Upload Step-by-Step

### 1. Verify Auth Works
Check backend logs show real userId, not `null`

```bash
# If null → auth is broken
# If has value like user_xxx → auth is working ✅
```

### 2. Verify File is Valid
Check backend logs show file details:

```bash
# Should see:
# 📁 FILE DEBUG: { exists: true, name: 'resume.pdf', type: 'application/pdf', size: 245632 }

# If size: 0 → empty file
# If type is wrong → wrong file type
```

### 3. Verify RLS Policy Works
After running SQL migration, check in Supabase:
- Dashboard → SQL Editor → run this:

```sql
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

Should see 3 policies:
- ✅ Allow authenticated users to upload resumes
- ✅ Allow users to read their own resumes  
- ✅ Allow users to delete their own resumes

### 4. Verify Upload Path is Correct
Backend log should show:

```bash
# CORRECT:
📤 UPLOAD START — path: user_2x8y9z0a/1713456789-resume.pdf
✅ UPLOAD SUCCESS

# WRONG (if you see this, RLS is blocking):
📤 UPLOAD START — path: resume.pdf
❌ UPLOAD ERROR: { message: "RLS policy prevents upload" }
```

---

## 🚨 Emergency: Temporarily Disable RLS

**ONLY if you're sure policy is correct but still blocked:**

```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

Then test upload.

**If it works now:**
→ RLS policy is incorrect → re-run the migration SQL

**If it still fails:**
→ It's a different issue (auth, file type, bucket name, etc)

---

## 📊 Expected File Structure After Upload

In Supabase Storage → resumes bucket:

```
resumes/
  └── user_2x8y9z0a/        ← your userId
        └── 1713456789-resume.pdf
        └── 1713456800-resume.pdf
```

Each upload creates a unique timestamp.

---

## ✅ Complete Success Checklist

- [ ] Backend shows `🔍 UPLOAD DEBUG — userId: user_xxx`
- [ ] Backend shows `📁 FILE DEBUG: { exists: true, ...`
- [ ] Backend shows `✅ UPLOAD SUCCESS`
- [ ] Backend shows `✅ DATABASE SAVED`
- [ ] Browser shows 200 response with file_url
- [ ] Supabase Storage shows file in `resumes/userId/` folder
- [ ] Supabase resumes table has new row with file_url

---

## 🐛 Send Me This If Still Stuck

1. **Backend console output** (copy the whole log from upload attempt)
2. **Browser network response** (screenshot of Response tab)
3. **Error message** (exact text from either)

Then I'll spot the bug in one shot.
