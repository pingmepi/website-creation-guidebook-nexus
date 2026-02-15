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
import {
  ORDER_STATUS_AFTER_SUCCESSFUL_PAYMENT,
  PAYMENT_TRANSACTION_STATUS,
  mapRazorpayStatusToPaymentTransactionStatus,
} from "../_shared/payment-order-status.ts";

declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
};

interface VerifyRequest {
  transactionId: string;
}

const toBasicAuthHeader = (keyId: string, keySecret: string): string =>
  `Basic ${btoa(`${keyId}:${keySecret}`)}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createOptionsResponse();
  }

  const rl = isRateLimited(req, {
    windowMs: 60_000,
    max: 15,
    keyPrefix: "verify-razorpay",
  });
  if (rl.limited) return rateLimitResponse(rl.retryAfter);

  logInfo("Razorpay payment verification requested");

  try {
    const body = await parseJsonBody(req);
    const { transactionId }: VerifyRequest = body as VerifyRequest;

    if (!transactionId) {
      throw new EdgeFunctionError(
        "Transaction ID is required",
        ErrorType.VALIDATION,
        400,
      );
    }

    const supabaseUrl = getRequiredEnvVar("SUPABASE_URL");
    const supabaseKey = getRequiredEnvVar("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    const user = await getAuthenticatedUser(req, supabaseClient);

    const { data: existingTransaction, error: txError } = await supabaseClient
      .from("payment_transactions")
      .select("id, order_id, user_id")
      .eq("gateway_transaction_id", transactionId)
      .eq("payment_gateway", "razorpay")
      .single();

    if (txError || !existingTransaction) {
      throw new EdgeFunctionError(
        "Payment transaction not found",
        ErrorType.VALIDATION,
        404,
      );
    }

    if (existingTransaction.user_id !== user.id) {
      throw new EdgeFunctionError(
        "Unauthorized access to payment transaction",
        ErrorType.AUTHORIZATION,
        403,
      );
    }

    const RAZORPAY_KEY_ID = getRequiredEnvVar("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = getRequiredEnvVar("RAZORPAY_KEY_SECRET");
    const authHeader = toBasicAuthHeader(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET);

    const linkData = await retryOperation(
      async () => {
        const response = await fetch(
          `https://api.razorpay.com/v1/payment_links/${transactionId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: authHeader,
            },
          },
        );

        if (!response.ok) {
          throw new EdgeFunctionError(
            `Razorpay verification API error: ${response.status} ${response.statusText}`,
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

    logDebug("Razorpay verification response", linkData);

    const paid = linkData?.status === "paid";
    const paymentStatus = paid
      ? PAYMENT_TRANSACTION_STATUS.COMPLETED
      : mapRazorpayStatusToPaymentTransactionStatus(linkData?.status);
    const failureReason = paid
      ? null
      : linkData?.status_reason || "Payment verification failed";

    const { error: updateError } = await supabaseClient
      .from("payment_transactions")
      .update({
        status: paymentStatus,
        gateway_response: linkData,
        failure_reason: failureReason,
        updated_at: new Date().toISOString(),
      })
      .eq("gateway_transaction_id", transactionId);

    if (updateError) {
      throw new EdgeFunctionError(
        "Failed to update payment status",
        ErrorType.DATABASE,
        500,
        updateError,
      );
    }

    if (paid) {
      const { error: orderUpdateError } = await supabaseClient
        .from("orders")
          .update({
          status: ORDER_STATUS_AFTER_SUCCESSFUL_PAYMENT,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingTransaction.order_id)
        .eq("user_id", user.id);

      if (orderUpdateError) {
        logError("Error updating order status", orderUpdateError);
      }

      return createSuccessResponse({
        success: true,
        status: PAYMENT_TRANSACTION_STATUS.COMPLETED,
        paymentData: linkData,
      });
    }

    return createSuccessResponse({
      success: false,
      status: paymentStatus,
      message: failureReason,
      errorCode: (linkData?.status || "UNKNOWN_ERROR").toUpperCase(),
    });
  } catch (error) {
    logError("Razorpay payment verification error", error);

    if (error instanceof EdgeFunctionError) {
      return createErrorResponse(error);
    }

    return createErrorResponse("Payment verification failed", 500, (error as Error).message);
  }
});
