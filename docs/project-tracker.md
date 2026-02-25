# Project Tracker

Purpose: compact project-level state snapshot for quick reuse across phases.

## Token-Saving Protocol

- Prefer referencing this file and `docs/agent-handoff.md` instead of replaying old chat.
- In chat, include only: current phase, blockers, and exact next step.
- Avoid pasting large logs unless requested.

## Active Focus

- Primary: P0 transactional emails (Welcome, Order Confirmation) for the manual order funnel.
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

 - Phase E: GA4-compatible event tracking via GTM
  - Status: Completed
  - Completed:
    - Core infrastructure: `src/lib/trackEvent.ts` (generic dataLayer dispatcher) + GTM snippet in `app/layout.tsx` (behind `NEXT_PUBLIC_GTM_ID`).
    - Auth events: `LoginDialog.tsx` (modal open, login/signup attempt/success/fail, Google), `LogoutButton.tsx` (logout).
    - Design funnel: `ThemeSelector.tsx` (select/deselect/filter/complete), `QuestionFlow.tsx` (answered/completed/skipped), `CustomizationSection.tsx` (color/size/save).
    - Order funnel: `PlaceOrderButton.tsx` migrated from `emitFunnelEvent` to `trackEvent` (CTA click, modal open/close/submit, validation fail, order created/failed).
    - Cart: `AddToCartButton.tsx` (add_to_cart), `CartSidebar.tsx` (cart_viewed, remove_from_cart).
    - Checkout: `checkout/page.tsx` (begin_checkout, add_shipping_info, add_payment_info).
    - Payment: `PaymentGateway.tsx` (payment_initiated/failed/timeout/retried).
    - Browse: `TshirtCard.tsx` (view_item), `shop/page.tsx` (view_item_list).
    - Dashboard: `dashboard/page.tsx` (dashboard_viewed).
    - Design page: `design/page.tsx` (design_started).
  - Validation: `npx tsc --noEmit` passed with zero errors.

## Deferred Tasks

- **P0 Emails (next sprint)**:
  - Welcome Email on `signup_success`
  - Order Confirmation to customer on `order_created`
  - Admin Notification on `order_created`
- **P1 Emails**:
  - Payment Confirmation on `payment_success`
  - Payment Failure Notice on `payment_failed`
- **P2 Emails / Automations**:
  - Design Saved Nudge (if user saves but doesn't order within 24h)
  - Payment Reminders for pending `manual_email_collection` orders
  - Cart Abandonment Nudge
- **Infrastructure for Emails**:
  - Choose email provider (Resend/Postmark/SES)
  - Supabase Edge Function for email dispatch
  - `pg_cron` or external scheduler for delayed emails
- **GTM tag configuration** (operator-level; done in GTM UI, not code)
- **Deprecate `src/lib/funnelEvents.ts`** (no more imports after PlaceOrderButton migration)

## Next Recommended Tasks

1. Implement P0 email triggers (Welcome + Order Confirmation via Supabase Edge Function).
2. Add CI workflow to run `npm run lint` + `npx tsc --noEmit` + integration test entrypoint.
3. Add end-to-end smoke tests for manual order modal funnel (open -> submit -> order created).
4. Reduce remaining lint warnings (hook dependency and react-refresh warnings).

## Security/Quality Notes (Known)

- Lint script is broken (`next lint` config mismatch on current setup).

## Recently Resolved

- Razorpay webhook now performs strict signature validation (timing-safe compare).
- Razorpay verification endpoint now enforces authenticated ownership checks.

## Context Rollover Rule

- When remaining context approaches 25%, append current progress to `docs/agent-handoff.md`, update this tracker if status changed, and continue in a new session from the latest handoff entry.
