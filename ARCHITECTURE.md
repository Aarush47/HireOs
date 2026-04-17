# ARCHITECTURE.md — HireOS Data Flow

## System Overview
HireOS is a user-centric memory system for job search execution. The profile is the persistent memory layer; every downstream artifact (matches, materials, nudges) is derived from it.

## Core Components
- Backend: API handlers for job search and AI generation
- Auth: Clerk server-side
- Database and storage: Supabase Postgres + Storage
- AI orchestration: Gemini via server routes
- Job discovery: SerpAPI free tier + manual JD paste

## Canonical Data Model

### `profiles`
Single row per user (id = Clerk user id). Stores raw and refined identity:
- Raw CV
- Parsed skills
- Career story
- Tone profile
- Role/location targets

### `jobs`
All discovered or pasted jobs with parsed requirements and match metadata.

### `applications`
Execution state machine for active pipeline tracking, capped at 10 active items.

### `materials`
Versioned generated assets for each job: resume, cover letter, follow-up, linkedin note.

## End-to-End Data Flow

1. User signs up (Clerk)
2. Webhook/server action creates `profiles` row in Supabase
3. User pastes CV
4. Profile parsing skill extracts `parsed_skills` + `career_story`
5. User pastes JD or job arrives from SerpAPI
6. JD parsing skill structures `jd_parsed`
7. Match skill scores fit and writes `match_score`, `match_gaps`
8. User requests tailored materials
9. Tailoring skill writes versioned rows in `materials`
10. User moves cards in applications Kanban
11. Daily nudge cron scans stale states and creates nudge suggestions/drafts

## Agent Responsibilities

### match-agent
- Input: profile + `jd_raw`
- Output: `score`, `gaps`, `strengths`, verdict
- Write path: `jobs.match_score`, `jobs.match_gaps`

### material-agent
- Input: profile + job + type
- Output: tailored text body
- Write path: new `materials` row with version increment

### nudge-agent
- Input: applications timeline per user
- Output: nudge message + optional follow-up draft
- Write path: `applications.nudge_sent_at`, optional `materials` row

## Security and Isolation
- Every table has RLS enabled.
- Policy goal: user can read/write only rows where `user_id` or `id` maps to `auth.uid()`.
- No client-side service role keys.
- All AI and cron operations run server-side.

## Operational Constraints
- AI retries limited to 3 for structured parse tasks.
- JD input hard cap: 10,000 chars after sanitization.
- Rate limit: 20 AI calls per user per hour.
- Active application cap: 10 enforced by DB and UI.

## Demo-Critical Path (90 seconds)
1. Paste JD
2. See score + gaps
3. Generate tailored resume
4. Mark as applied
5. Show delayed follow-up nudge generation
