# Resume Parsing Setup - Phase 2

## ✅ What's Been Set Up

1. **Supabase Table**
   - `profiles` table with user resume data
   - RLS policies configured
   - SQL migration file created: `backend/supabase/migrations/001_profiles_table.sql`

2. **Backend API Route**
   - Created: `backend/src/api/parse-resume/route.ts`
   - Uses Gemini AI for resume parsing
   - Saves extracted data to Supabase
   - Requires auth via Clerk

3. **Frontend Component**
   - Created: `frontend/src/components/dashboard/ResumeUploadPanel.tsx`
   - Drag & drop or click to upload PDF
   - Shows parsed results with skills, experience, education
   - Integrated into `/dashboard`

4. **Environment Files**
   - Backend: `backend/.env.local` (with your credentials)
   - Frontend: `frontend/.env.local` (Clerk key + backend URL)

## 📋 Pre-Launch Checklist

Before running, complete these steps in order:

### 1. Create Supabase Table

Go to: https://app.supabase.com → Your Project → SQL Editor

Copy & paste from: `backend/supabase/migrations/001_profiles_table.sql`

Click **Execute** and verify success.

### 2. Verify Backend Environment

Check `backend/.env.local` has all 4 keys:
```
✓ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
✓ CLERK_SECRET_KEY
✓ NEXT_PUBLIC_SUPABASE_URL
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
✓ SUPABASE_SERVICE_ROLE_KEY
✓ GEMINI_API_KEY
```

All are already set in `backend/.env.local` from your credentials.

### 3. Verify Frontend Environment

Check `frontend/.env.local` has:
```
✓ VITE_CLERK_PUBLISHABLE_KEY
✓ VITE_BACKEND_URL=http://localhost:3000
```

Already set.

## 🚀 Running Everything

**Terminal 1 — Start Backend**
```bash
cd backend
npm run dev
# Server will run on http://localhost:3000
```

**Terminal 2 — Start Frontend**
```bash
cd frontend
npm run dev
# App will run on http://localhost:5174
```

## ✅ Verification Steps

1. **Frontend loads**
   - Visit http://localhost:5174
   - Should not show any errors

2. **Auth works**
   - Click "Get Started" → should redirect to Clerk auth
   - Sign up/login
   - Should see dashboard with resume upload panel

3. **Resume parsing works**
   - In dashboard, click "Upload your resume"
   - Select a PDF file
   - Status should show "Parsing resume with AI..."
   - After ~10 seconds, should see "✓ PARSED — Name | X skills | Y jobs"
   - Scroll down to see parsed data

4. **Data saved to Supabase**
   - Go to Supabase dashboard
   - Navigate to `profiles` table
   - Should see a new row with your user_id
   - Columns should be populated with: full_name, email, skills[], experience[], education[]

## 🐛 Troubleshooting

**"Unauthorized" error on upload**
→ Backend not running or Clerk auth not working
→ Check Terminal 1 is running backend on port 3000

**"Parse failed" error**
→ Gemini API key invalid or request failed
→ Check `backend/.env.local` has correct GEMINI_API_KEY
→ Check network request in browser dev tools

**"Connection refused" error**
→ Backend not running or wrong port
→ Make sure you ran `npm run dev` in backend folder
→ Verify it's running on http://localhost:3000

**Data not saving to Supabase**
→ RLS policy issue or wrong credentials
→ Make sure profiles table SQL migration ran successfully
→ Check SUPABASE_SERVICE_ROLE_KEY is correct

## 📊 Expected Output

When you upload a resume and it parses successfully, you should see:

```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-0123",
  "location": "San Francisco, CA",
  "target_role": "Senior Software Engineer",
  "years_experience": 8,
  "skills": ["JavaScript", "React", "TypeScript", "Node.js", ...],
  "experience": [
    {
      "title": "Senior Developer",
      "company": "Tech Company",
      "duration": "2020-Present",
      "bullets": ["Led team of 5...", "Increased performance by 40%..."]
    }
  ],
  "education": [
    {
      "degree": "B.S. Computer Science",
      "institution": "MIT",
      "year": "2016"
    }
  ]
}
```

## 🔍 Debug Mode

To see full API responses in browser console:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Upload resume
4. Should see "Full profile:" logged with complete data

## 📚 Next Steps (Phase 3)

After resume parsing is working:
- [ ] Add job search API (Adzuna/RapidAPI integration)
- [ ] Implement job matching scorer
- [ ] Create job feed UI

---

**Questions?** Check:
- API routes: `backend/src/api/parse-resume/route.ts`
- Frontend component: `frontend/src/components/dashboard/ResumeUploadPanel.tsx`
- Environment: `backend/.env.local` and `frontend/.env.local`
