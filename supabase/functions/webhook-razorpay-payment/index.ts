import { createClient } from "npm:@supabase/supabase-js@2";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import {
  EdgeFunctionError,
  ErrorType,
  createErrorResponse,
  createOptionsResponse,
  getRequiredEnvVar,
  logInfo,
  logError,
  logDebug,
} from "../_shared/error-utils.ts";
import {
  ORDER_STATUS_AFTER_SUCCESSFUL_PAYMENT,
  PAYMENT_TRANSACTION_STATUS,
  mapRazorpayStatusToPaymentTransactionStatus,
} from "../_shared/payment-order-status.ts";

declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
};

const encoder = new TextEncoder();

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const timingSafeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
};

const computeRazorpaySignature = async (
  payload: string,
  secret: string,
): Promise<string> => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toHex(new Uint8Array(sig));
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createOptionsResponse();
  }

  logInfo("Razorpay webhook received");

  try {
    const signature = req.headers.get("X-Razorpay-Signature");
    if (!signature) {
      throw new EdgeFunctionError(
        "Missing X-Razorpay-Signature header",
        ErrorType.AUTHENTICATION,
        401,
      );
    }

    const body = await req.text();
    const webhookSecret = getRequiredEnvVar("RAZORPAY_WEBHOOK_SECRET");
    const expectedSignature = await computeRazorpaySignature(body, webhookSecret);

    if (!timingSafeEqual(signature, expectedSignature)) {
      throw new EdgeFunctionError(
        "Invalid webhook signature",
        ErrorType.AUTHENTICATION,
        401,
      );
    }

    const payload = JSON.parse(body);
    logDebug("Verified Razorpay webhook payload", payload);

    const paymentLink =
      payload?.payload?.payment_link?.entity ??
      payload?.payload?.payment?.entity ??
      null;
    const transactionId =
      paymentLink?.id ||
      payload?.payload?.payment?.entity?.order_id ||
      payload?.payload?.payment?.entity?.id;

    if (!transactionId) {
      throw new EdgeFunctionError(
        "Missing transaction identifier in webhook payload",
        ErrorType.VALIDATION,
        400,
      );
    }

    const eventType = payload?.event || "unknown";
    const paidEvent =
      eventType === "payment_link.paid" || eventType === "payment.captured";
    const rawStatus =
      paymentLink?.status || payload?.payload?.payment?.entity?.status || eventType;
    const status = paidEvent
      ? PAYMENT_TRANSACTION_STATUS.COMPLETED
      : mapRazorpayStatusToPaymentTransactionStatus(rawStatus);

    const supabaseUrl = getRequiredEnvVar("SUPABASE_URL");
    const supabaseKey = getRequiredEnvVar("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    const { error: txUpdateError } = await supabaseClient
      .from("payment_transactions")
      .update({
        status,
        gateway_response: payload,
        failure_reason: paidEvent ? null : eventType,
        updated_at: new Date().toISOString(),
      })
      .eq("gateway_transaction_id", transactionId)
      .eq("payment_gateway", "razorpay");

    if (txUpdateError) {
      throw new EdgeFunctionError(
        "Failed to update payment transaction",
        ErrorType.DATABASE,
        500,
        txUpdateError,
      );
    }

    if (paidEvent) {
      const { data: txRow } = await supabaseClient
        .from("payment_transactions")
        .select("order_id")
        .eq("gateway_transaction_id", transactionId)
        .eq("payment_gateway", "razorpay")
        .single();

      if (txRow?.order_id) {
        const { error: orderUpdateError } = await supabaseClient
          .from("orders")
          .update({
            status: ORDER_STATUS_AFTER_SUCCESSFUL_PAYMENT,
            updated_at: new Date().toISOString(),
          })
          .eq("id", txRow.order_id);

        if (orderUpdateError) {
          logError("Failed to update order after webhook", orderUpdateError);
        }
      }
    }

    return new Response("OK", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    logError("Razorpay webhook processing error", error);

    if (error instanceof EdgeFunctionError) {
      return createErrorResponse(error);
    }

    return createErrorResponse(
      "Webhook processing failed",
      500,
      (error as Error).message,
    );
  }
});
