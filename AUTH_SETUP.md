# Authentication Setup Guide

## Overview
The HireOS frontend now includes Clerk-based authentication with the following flow:

**Home Page** → "Get Started" button → Auth Page (Sign In/Sign Up) → Dashboard

## Quick Setup

### 1. Get Clerk API Keys
1. Go to [clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Copy your **Publishable Key**

### 2. Configure Environment Variables
Update `frontend/.env.local`:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

Replace `your_clerk_publishable_key_here` with your actual Clerk publishable key.

### 3. Run Development Server
```bash
cd frontend
npm run dev
```

The app will start at `http://localhost:5174/`

## Flow Details

### Routes
- **`/`** - Landing page with "Get Started" button
- **`/auth`** - Sign in/Sign up page
- **`/dashboard`** - Protected dashboard (requires authentication)

### Features
✅ Automatic redirects to auth for unauthenticated users  
✅ Automatic redirects to dashboard for authenticated users  
✅ Clerk-managed user sessions  
✅ User button with profile/sign-out in dashboard  
✅ Loading states during auth verification  

## Development Notes

### Key Components
- `src/routes/auth.tsx` - Authentication page with Clerk SignIn component
- `src/routes/dashboard.tsx` - Protected dashboard after login
- `src/components/site/Hero.tsx` - Updated with "Get Started" navigation

### Next Steps
1. ✅ Clerk authentication initialized
2. 📋 Add CV upload functionality to dashboard
3. 📋 Connect to backend API for job matching
4. 📋 Implement job application tracking

## Troubleshooting

**"Publishable key is not set" error**
- Verify `VITE_CLERK_PUBLISHABLE_KEY` is set in `.env.local`
- The key must start with `pk_`
- Restart dev server after updating .env

**Redirect loop**
- Clear browser cookies for localhost
- Ensure Clerk backend/frontend URLs are correctly configured in Clerk dashboard

**Build errors**
- Run `npm install` to ensure all dependencies are installed
- Run `npm run format` to fix formatting issues
