# HireOS Integration Guide

## ✅ Current Status
- ✅ Frontend authentication (Clerk) configured
- ⏳ Backend API setup in progress
- ⏳ Database connection setup

## 📋 Setup Steps

### Step 1: Frontend Environment (✅ DONE)

The Clerk key is already added to `frontend/.env.local`:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_cHJvbXB0LXN0YWctNDUuY2xlcmsuYWNjb3VudHMuZGV2JA
```

### Step 2: Backend Setup (⏳ TODO)

The backend code in `/backend/src/api/` contains Next.js API routes that need to run on a backend server.

**Option A: Run as Next.js Server (Recommended)**

1. Create a `backend/package.json`:
```bash
cd backend
npm init -y
npm install next @clerk/nextjs @supabase/supabase-js dotenv
```

2. Create `.env.local` in backend folder with:
```env
CLERK_SECRET_KEY=sk_test_SHv4CRcJTZruFGbjSvPwsELBWk2jeSEIL81efmXV2i
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cHJvbXB0LXN0YWctNDUuY2xlcmsuYWNjb3VudHMuZGV2JA
NEXT_PUBLIC_SUPABASE_URL=https://fmaqsothfqnjunmqbbwn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtYXFzb3RoZnFuanVubXFiYnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MjM3NDAsImV4cCI6MjA5MTk5OTc0MH0.tJ5c1-9bRIl-ynwx0o1dMaxKFOZX8NN7P5vkqVrGbYU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtYXFzb3RoZnFuanVubXFiYnduIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQyMzc0MCwiZXhwIjoyMDkxOTk5NzQwfQ.hqq_BBoXvAHOzI-am-8N2YqZx9aWTmLj50llo-0JNYw
GEMINI_API_KEY=AQ.Ab8RN6JD6nH_aZui9FqCt5keXzNJvhD0blDsnPO8mR7VuexCGA
X_RAPIDAPI_KEY=5d3ab8d1d3msh1aa79892504b5bdp199751jsnf1238831e11c
ADZUNA_APP_ID=default-application_11819288
ADZUNA_API_KEY=6a6ceab34a66f48b938d73f82e14d52d
```

**Option B: Deploy to Vercel**

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Step 3: Frontend Configuration

Update `frontend/src/lib/api.ts` (create if not exists) to point to backend:

```typescript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000';

export async function apiCall(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}
```

### Credentials Provided
- ✅ Clerk keys configured
- ✅ Supabase URL & keys noted
- ✅ Gemini API key noted
- ✅ Adzuna & RapidAPI keys noted

### Next: Backend API Integration

The backend needs to:
1. Sync Clerk users to Supabase via webhooks (/api/webhooks/clerk)
2. Parse CV uploads (/api/ai/parse-cv)
3. Match jobs to profiles (/api/ai/match)
4. Generate materials (/api/ai/generate-material)
5. Search jobs (/api/jobs/search)

Would you like me to:
1. Set up a Node.js/Express backend wrapper?
2. Convert backend to standalone API?
3. Deploy to Vercel?

Recommended: Deploy to Vercel (easiest, no local setup needed)
