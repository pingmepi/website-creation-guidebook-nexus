# Test User Implementation Guide (Stub)

This guide describes how to enable a test user for development flows.

## Goals
- Allow developers to log in quickly without external identity providers.
- Seed predictable data for design flows.

## Suggested Approach
1. Environment toggle (e.g., `VITE_ENABLE_TEST_USER=true`).
2. Frontend utility that, when enabled, exposes a "Login as Test User" CTA in development.
3. Supabase: create a test user account and seed minimal related data.

## Steps (High Level)
- Add the env variable to `.env.example` and local `.env`.
- In the auth UI, if `import.meta.env.VITE_ENABLE_TEST_USER === 'true'`, show the test‑user login button.
- Implement a small client helper to sign in using Supabase with stored test credentials or magic link.
- Provide a script/SQL snippet to seed the test user in Supabase.

## Notes
- Never enable test users in production.
- Ensure RLS policies still apply; grant only minimal permissions.

