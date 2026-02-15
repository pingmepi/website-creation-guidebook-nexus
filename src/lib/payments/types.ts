export interface CreatePaymentIntentRequest {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  redirectUrl: string;
  callbackUrl: string;
}

export interface CreatePaymentIntentResponse {
  paymentUrl: string;
}

export interface VerifyPaymentRequest {
  transactionId: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  errorCode?: string;
}
