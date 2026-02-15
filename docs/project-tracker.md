# Project Tracker

Purpose: compact project-level state snapshot for quick reuse across phases.

## Token-Saving Protocol

- Prefer referencing this file and `docs/agent-handoff.md` instead of replaying old chat.
- In chat, include only: current phase, blockers, and exact next step.
- Avoid pasting large logs unless requested.

## Active Focus

- Primary: manual order funnel from design page (no payment redirect) with event tracking.
- Secondary: production validation of Razorpay payment flow.

## Current Flags

- `NEXT_PUBLIC_ENABLE_PAYMENT_FLOWS=false` (default in `.env.example`)
  - Effect: cart trigger/sidebar hidden from header UI.
  - Note: underlying routes/components still exist.

## Phase Status

- Phase A: Payment CTA gating in header/cart UI
  - Status: Completed
  - Validation: Type check passed (`npx tsc --noEmit`)
- Phase B: Route-level gating and design-flow cleanup
  - Status: In Progress
  - Completed:
    - Route-level blocking added for `/cart` and `/checkout` via `middleware.ts`.
    - Provider-agnostic payment UX copy pass completed in checkout/payment UI.
  - Validation: Type check passed (`npx tsc --noEmit`)
- Phase C: Razorpay integration architecture
  - Status: Completed
  - Completed:
    - Added provider interface/types and current Razorpay adapter boundary in `src/lib/payments/*`.
    - Switched payment intent/verify calls in UI to use provider abstraction.
    - Added Razorpay adapter wiring as the active payment provider.
    - Added Razorpay edge functions for initiate/verify/webhook:
      - `supabase/functions/initiate-razorpay-payment/index.ts`
      - `supabase/functions/verify-razorpay-payment/index.ts`
      - `supabase/functions/webhook-razorpay-payment/index.ts`

 - Phase D: Security and tooling hardening
  - Status: Completed
  - Completed:
    - Webhook signature verification hardened for Razorpay.
    - Ownership enforcement added in Razorpay verification endpoint.
    - Lint pipeline fixed (`npm run lint` now executes successfully).
    - Regression suites added for route gating and provider contract behavior.

## Next Recommended Tasks

1. Add CI workflow to run `npm run lint` + `npx tsc --noEmit` + integration test entrypoint.
2. Add end-to-end smoke tests for manual order modal funnel (open -> submit -> order created).
3. Add backend email trigger integration for `pending_payment_collection` orders.
4. Reduce remaining lint warnings (hook dependency and react-refresh warnings).

## Security/Quality Notes (Known)

- Lint script is broken (`next lint` config mismatch on current setup).

## Recently Resolved

- Razorpay webhook now performs strict signature validation (timing-safe compare).
- Razorpay verification endpoint now enforces authenticated ownership checks.

## Context Rollover Rule

- When remaining context approaches 25%, append current progress to `docs/agent-handoff.md`, update this tracker if status changed, and continue in a new session from the latest handoff entry.
