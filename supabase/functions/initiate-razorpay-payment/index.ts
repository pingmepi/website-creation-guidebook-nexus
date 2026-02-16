import { createClient } from "npm:@supabase/supabase-js@2";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import {
  EdgeFunctionError,
  ErrorType,
  createErrorResponse,
  createSuccessResponse,
  createOptionsResponse,
  parseJsonBody,
  getRequiredEnvVar,
  getAuthenticatedUser,
  retryOperation,
  shouldRetryError,
  logInfo,
  logError,
  logDebug,
} from "../_shared/error-utils.ts";
import { isRateLimited, rateLimitResponse } from "../_shared/rate-limit.ts";
import { PAYMENT_TRANSACTION_STATUS } from "../_shared/payment-order-status.ts";

declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
};

interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  callbackUrl: string;
}

const toBasicAuthHeader = (keyId: string, keySecret: string): string =>
  `Basic ${btoa(`${keyId}:${keySecret}`)}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createOptionsResponse();
  }

  const rl = isRateLimited(req, {
    windowMs: 60_000,
    max: 10,
    keyPrefix: "initiate-razorpay",
  });
  if (rl.limited) return rateLimitResponse(rl.retryAfter);

  logInfo("Razorpay payment initiation requested");

  try {
    const body = await parseJsonBody(req);
    const { orderId, amount, currency, callbackUrl }: PaymentRequest =
      body as PaymentRequest;

    if (!orderId || !amount || !currency || !callbackUrl) {
      throw new EdgeFunctionError(
        "orderId, amount, currency and callbackUrl are required",
        ErrorType.VALIDATION,
        400,
      );
    }

    const supabaseUrl = getRequiredEnvVar("SUPABASE_URL");
    const supabaseKey = getRequiredEnvVar("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    const user = await getAuthenticatedUser(req, supabaseClient);

    const RAZORPAY_KEY_ID = getRequiredEnvVar("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = getRequiredEnvVar("RAZORPAY_KEY_SECRET");
    const authHeader = toBasicAuthHeader(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET);

    const razorpayResponse = await retryOperation(
      async () => {
        const response = await fetch("https://api.razorpay.com/v1/payment_links", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({
            amount,
            currency,
            reference_id: orderId,
            callback_url: callbackUrl,
            callback_method: "get",
            notes: {
              order_id: orderId,
              user_id: user.id,
            },
          }),
        });

        if (!response.ok) {
          throw new EdgeFunctionError(
            `Razorpay API error: ${response.status} ${response.statusText}`,
            ErrorType.EXTERNAL_API,
            response.status,
            undefined,
            shouldRetryError({ status: response.status } as Error & { status?: number }),
          );
        }

        return response.json();
      },
      { maxRetries: 3, initialDelay: 1000 },
      shouldRetryError,
    );

    logDebug("Razorpay payment link response", razorpayResponse);

    if (!razorpayResponse?.id || !razorpayResponse?.short_url) {
      throw new EdgeFunctionError(
        "Invalid Razorpay response: missing link id/url",
        ErrorType.EXTERNAL_API,
        502,
      );
    }

    const { error: dbError } = await supabaseClient.from("payment_transactions").insert({
      order_id: orderId,
      amount: amount / 100,
      currency,
      payment_gateway: "razorpay",
      gateway_transaction_id: razorpayResponse.id,
      payment_method: "PAYMENT_LINK",
      status: PAYMENT_TRANSACTION_STATUS.PENDING,
      user_id: user.id,
      gateway_response: razorpayResponse,
    });

    if (dbError) {
      logError("Database error while storing Razorpay transaction", dbError);
      throw new EdgeFunctionError(
        "Failed to store transaction details",
        ErrorType.DATABASE,
        500,
        dbError,
      );
    }

    return createSuccessResponse({
      success: true,
      paymentUrl: razorpayResponse.short_url,
      transactionId: razorpayResponse.id,
    });
  } catch (error) {
    logError("Razorpay payment initiation error", error);

    if (error instanceof EdgeFunctionError) {
      return createErrorResponse(error);
    }

    return createErrorResponse("Payment initiation failed", 500, (error as Error).message);
  }
});
