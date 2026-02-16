export const FEATURE_FLAGS = {
  // Keep payment flows behind a flag until Razorpay is integrated.
  enablePaymentFlows: process.env.NEXT_PUBLIC_ENABLE_PAYMENT_FLOWS === "true",
} as const;
