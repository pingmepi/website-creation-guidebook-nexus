
export const phonePeErrorMessages: Record<string, string> = {
  // Payment Declined
  "PAYMENT_DECLINED": "Your payment was declined. Please try with a different payment method.",
  "INSUFFICIENT_FUNDS": "Insufficient funds in your account. Please try with a different account or card.",
  "CARD_EXPIRED": "Your card has expired. Please use a different card.",
  "INVALID_CARD": "Invalid card details. Please check and try again.",
  
  // Technical Errors
  "TRANSACTION_TIMEOUT": "Payment timed out. Please try again.",
  "NETWORK_ERROR": "Network error occurred. Please check your connection and try again.",
  "BANK_SERVER_ERROR": "Bank server is temporarily unavailable. Please try again later.",
  "GATEWAY_ERROR": "Payment gateway error. Please try again.",
  
  // User Actions
  "USER_CANCELLED": "Payment was cancelled by you.",
  "TRANSACTION_CANCELLED": "Transaction was cancelled.",
  
  // Merchant Errors
  "INVALID_MERCHANT": "Merchant configuration error. Please contact support.",
  "INVALID_AMOUNT": "Invalid transaction amount.",
  "DUPLICATE_TRANSACTION": "Duplicate transaction detected.",
  
  // Default
  "UNKNOWN_ERROR": "An unexpected error occurred. Please try again or contact support."
};

export const getErrorMessage = (errorCode: string): string => {
  return phonePeErrorMessages[errorCode] || phonePeErrorMessages["UNKNOWN_ERROR"];
};

export const isRetryableError = (errorCode: string): boolean => {
  const retryableErrors = [
    "TRANSACTION_TIMEOUT",
    "NETWORK_ERROR", 
    "BANK_SERVER_ERROR",
    "GATEWAY_ERROR"
  ];
  return retryableErrors.includes(errorCode);
};
