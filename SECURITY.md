# SECURITY.md — HireOS Baseline

## Auth
- Clerk is the only authentication provider.
- Do not implement custom JWT flows.
- Validate session server-side on every protected route/action.

## Database Isolation (Supabase)
- Enable RLS on every table: `profiles`, `jobs`, `applications`, `materials`.
- Default deny until explicit policies are created.
- Use `auth.uid()` checks for every read/write policy.

## API Security
- Keep all Gemini and SerpAPI keys server-side only.
- Route AI usage through server endpoints/actions.
- Never expose provider secrets in client bundles.

## Input Security
- Sanitize all AI inputs:
  - strip HTML tags
  - normalize whitespace
  - enforce max length (`jd_raw` <= 10000 chars)
- Reject malformed payloads with schema validation (`zod`).

## Abuse and Cost Controls
- Rate limit AI endpoints to 20 requests/user/hour.
- Add per-endpoint validation and authentication checks before model invocation.
- Log request metadata without sensitive payload leakage.

## Data Integrity
- Enforce status enums and bounds in SQL.
- Enforce active-application cap (max 10) using a DB constraint/trigger.
- Store generated materials with explicit versioning.

## Verification Checklist
- Test RLS with anon key: cross-user reads and writes must fail.
- Test authenticated flows: owner reads/writes must pass.
- Confirm no secrets in environment variables.
- Confirm all AI endpoints deny unauthenticated requests.
