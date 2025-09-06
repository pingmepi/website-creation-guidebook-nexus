# Tech Stack

This document summarizes the key technologies used by the Custom T‑Shirt Hub project. Expand with versions and rationale as needed.

## Frontend
- Vite + React + TypeScript
- Tailwind CSS (see tailwind.config.ts)
- shadcn/ui components (see components.json)

## State & Data
- Supabase (Auth, Database, Storage)

## Backend/Edge
- Supabase Edge Functions (Deno)
- Shared utilities under `supabase/functions/_shared`

## Tooling
- ESLint + Prettier + TypeScript config (see eslint.config.js, tsconfig*.json)
- Vercel (deployment) — per vercel.json

## Environment & Config
- Vite env variables via `import.meta.env.*`
- .env (local), with `.env.example` guidance in docs

## Notes
- For imports in Supabase Edge Functions, prefer `npm:` specifiers over direct URLs as per project conventions.
- Domain: merekapade.com (use in sitemap.xml and related SEO configs).

