export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const PAYMENT_TRANSACTION_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export type PaymentTransactionStatus =
  (typeof PAYMENT_TRANSACTION_STATUS)[keyof typeof PAYMENT_TRANSACTION_STATUS];

export const ORDER_STATUS_AFTER_SUCCESSFUL_PAYMENT: OrderStatus =
  ORDER_STATUS.PROCESSING;

export const mapRazorpayStatusToPaymentTransactionStatus = (
  status: string | undefined,
): PaymentTransactionStatus => {
  const normalized = (status ?? "").toLowerCase();

  if (normalized === "paid" || normalized === "captured") {
    return PAYMENT_TRANSACTION_STATUS.COMPLETED;
  }

  if (
    normalized === "created" ||
    normalized === "issued" ||
    normalized === "pending" ||
    normalized === "partially_paid"
  ) {
    return PAYMENT_TRANSACTION_STATUS.PENDING;
  }

  if (normalized.includes("cancel")) return PAYMENT_TRANSACTION_STATUS.CANCELLED;
  return PAYMENT_TRANSACTION_STATUS.FAILED;
};
