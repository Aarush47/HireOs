# 🔧 Upload Debugging — Step by Step

## ✅ tsconfig.json Fixed

The issue was that tsconfig was configured for Vite/React, not Next.js. Next.js auto-corrected it.

✅ Backend now builds correctly

---

## 🐛 If Upload Still Fails

### Check #1: Backend Running?

In backend terminal, look for:
```
✓ Ready in 1.2s
```

If you see errors, report them exactly as they appear.

### Check #2: Frontend Connected?

Open browser DevTools (F12) → Network tab → Upload file

Look for request: `POST http://localhost:3000/api/upload-resume`

If you see:
- ❌ **404** → Backend not running
- ❌ **401** → Auth failed (not logged in)
- ❌ **500** → Server error (see backend logs)
- ✅ **200** → Success! Check response

### Check #3: Backend Logs

When you upload, backend terminal should show:

```
🔍 UPLOAD DEBUG — userId: user_xxx
📁 FILE DEBUG: { exists: true, name: 'resume.pdf', ... }
📤 UPLOAD START — path: user_xxx/timestamp-resume.pdf
```

If you see **❌ errors** instead, copy the exact error message.

### Check #4: Network Response

In DevTools Network tab:
- Click the upload request
- Go to **Response** tab
- Copy the exact JSON response

---

## 🎯 What To Do Now

1. **Start fresh:**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend (new terminal)
   cd frontend && npm run dev
   ```

2. **Check backend console shows:**
   ```
   ready - started server on 0.0.0.0:3000
   ```

3. **Go to http://localhost:5174**

4. **Try uploading a PDF**

5. **Report what you see:**
   - Backend console output
   - Browser network response (DevTools)
   - Any error messages

---

## 📋 Common Issues & Fixes

### Issue: "Cannot POST /api/upload-resume"
- Backend not running
- Fix: Restart backend with `npm run dev`

### Issue: "Unauthorized"
- Not logged in to Clerk
- Fix: Sign out and back in

### Issue: "Request failed"
- Backend crashed
- Fix: Check backend terminal for errors

### Issue: Nothing happens when uploading
- Frontend not connected to backend
- Fix: Check `frontend/.env.local` has `VITE_BACKEND_URL=http://localhost:3000`

### Issue: Backend shows "userId: null"
- Auth failed
- Fix: Verify Clerk keys in `backend/.env.local`

### Issue: Backend shows "RLS policy prevents upload"
- SQL migrations not run
- Fix: Run all 3 migrations in Supabase SQL Editor

---

## 🔍 Quick Test Script

Run this in backend terminal to verify config:

```bash
node -e "console.log({
  clerk: !!process.env.CLERK_SECRET_KEY,
  supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabase_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  gemini: !!process.env.GEMINI_API_KEY
})"
```

Should show all `true`:
```
{ clerk: true, supabase_url: true, supabase_key: true, gemini: true }
```

If any are `false`, that env var is missing.

---

## 📝 Send Me This If Still Stuck

Copy & paste:

1. **Backend console output** (full terminal output)
2. **Browser network response** (entire Response JSON)
3. **Error message** (if any)

Then I'll pinpoint the exact issue.

---

## ✅ Expected Success Flow

1. Upload PDF
2. Backend logs:
   ```
   🔍 UPLOAD DEBUG — userId: user_2x8...
   📁 FILE DEBUG: { exists: true, ...
   ✅ UPLOAD SUCCESS
   ✅ DATABASE SAVED
   ```
3. Frontend shows success message
4. File appears in Supabase Storage
5. Row appears in Supabase resumes table

---

**Test now with fixed tsconfig and report what happens!**
