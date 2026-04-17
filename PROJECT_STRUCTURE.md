# HireOS Project Structure

## 📁 Backend Organization

```
hire-os/
├── backend/                 # Backend Services
│   ├── src/
│   │   ├── api/             # API Route Handlers
│   │   │   ├── webhooks/    # Clerk sync, external services
│   │   │   ├── ai/          # AI generation endpoints
│   │   │   └── jobs/        # Job search endpoints
│   │   └── lib/
│   │       ├── supabase/    # Database clients (admin, server)
│   │       └── auth/        # Authentication utilities
│   ├── supabase/
│   │   └── migrations/      # Database schema migrations
│   └── .env.local           # Backend secrets
├── .clerk/                  # Clerk auth config
├── .env.local               # Root environment (shared)
├── ARCHITECTURE.md          # Data models & flow
├── AGENT.md                 # Build guidelines
├── SKILLS.md                # Agent capabilities
└── SECURITY.md              # Auth & RLS policies
```

## 🔧 Backend Setup

### Database
- Migrations: `backend/supabase/migrations/`
- API handlers: `backend/src/api/`

### Environment
- Clerk keys in `.env.local`
- Supabase config in `.env.local`

## 🔐 Environment Variables

**Backend** (`.env.local`):
- `CLERK_SECRET_KEY`: Clerk server-side key
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `GEMINI_API_KEY`: Google Gemini API key

## 🚀 Next Steps

1. **Set up backend server** (Express/Hono) using `backend/src/api/` handlers
2. **Deploy backend** to Cloudflare/Railway

## 🚀 Next Steps

1. **Test API routes** in `src/app/api/`
2. **Ensure backend services** are properly configured
3. **Deploy** to Vercel
