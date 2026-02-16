import { supabase } from "@/integrations/supabase/client";
import { PaymentProvider } from "@/lib/payments/provider";
import {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from "@/lib/payments/types";

export class RazorpayProvider implements PaymentProvider {
  async createIntent(
    request: CreatePaymentIntentRequest,
  ): Promise<CreatePaymentIntentResponse> {
    const { data, error } = await supabase.functions.invoke(
      "initiate-razorpay-payment",
      { body: request },
    );

    if (error) {
      throw error;
    }

    if (!data?.paymentUrl) {
      throw new Error("Failed to create Razorpay payment intent");
    }

    return { paymentUrl: data.paymentUrl as string };
  }

  async verify(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    const { data, error } = await supabase.functions.invoke(
      "verify-razorpay-payment",
      {
        body: request,
      },
    );

    if (error) {
      throw error;
    }

    return {
      success: Boolean(data?.success),
      message: data?.message,
      errorCode: data?.errorCode,
    };
  }

  async webhook(): Promise<void> {
    // Webhooks are handled by edge functions/server routes.
    return;
  }
}
