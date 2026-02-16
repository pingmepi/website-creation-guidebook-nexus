import {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from "@/lib/payments/types";

export interface PaymentProvider {
  createIntent(
    request: CreatePaymentIntentRequest,
  ): Promise<CreatePaymentIntentResponse>;
  verify(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse>;
  webhook(payload: unknown): Promise<void>;
}
