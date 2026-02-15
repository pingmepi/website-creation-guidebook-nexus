-- Normalize historical payment transaction statuses to the canonical state space
UPDATE public.payment_transactions
SET status = CASE
  WHEN lower(status) IN ('completed', 'success', 'succeeded', 'paid', 'captured') THEN 'completed'
  WHEN lower(status) IN ('pending', 'created', 'issued', 'partially_paid') THEN 'pending'
  WHEN lower(status) IN ('cancelled', 'canceled') THEN 'cancelled'
  ELSE 'failed'
END;

-- Enforce canonical payment transaction statuses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'payment_transactions_status_check'
      AND conrelid = 'public.payment_transactions'::regclass
  ) THEN
    ALTER TABLE public.payment_transactions
    ADD CONSTRAINT payment_transactions_status_check
    CHECK (
      status = ANY (
        ARRAY[
          'pending'::text,
          'completed'::text,
          'failed'::text,
          'cancelled'::text
        ]
      )
    );
  END IF;
END
$$;
