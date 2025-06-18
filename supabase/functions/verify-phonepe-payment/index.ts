
import { createClient } from "npm:@supabase/supabase-js@2";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Import shared utilities
import {
  EdgeFunctionError,
  ErrorType,
  createErrorResponse,
  createSuccessResponse,
  createOptionsResponse,
  parseJsonBody,
  getRequiredEnvVar,
  retryOperation,
  shouldRetryError,
  logInfo,
  logError,
  logDebug
} from '../_shared/error-utils.ts';

// Type declaration for Deno global
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createOptionsResponse();
  }

  logInfo("PhonePe payment verification requested");

  try {
    const body = await parseJsonBody(req);
    const { transactionId } = body;

    if (!transactionId) {
      throw new EdgeFunctionError(
        "Transaction ID is required",
        ErrorType.VALIDATION,
        400
      );
    }

    // PhonePe API configuration from environment variables
    const PHONEPE_MERCHANT_ID = getRequiredEnvVar("PHONEPE_MERCHANT_ID");
    const PHONEPE_SALT_KEY = getRequiredEnvVar("PHONEPE_SALT_KEY");
    const PHONEPE_SALT_INDEX = Deno.env.get("PHONEPE_SALT_INDEX") ?? "1";
    const PHONEPE_HOST_URL = Deno.env.get("PHONEPE_HOST_URL") ?? "https://api-preprod.phonepe.com/apis/pg-sandbox";

    // Create checksum for status check
    const checksumString = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${transactionId}` + PHONEPE_SALT_KEY;
    const checksum = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(checksumString)
    );
    const checksumHex = Array.from(new Uint8Array(checksum))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('') + "###" + PHONEPE_SALT_INDEX;

    logDebug("Verification checksum", { checksumHex });

    // Check payment status with PhonePe using retry logic
    const statusData = await retryOperation(async () => {
      const statusResponse = await fetch(
        `${PHONEPE_HOST_URL}/pg/v1/status/${PHONEPE_MERCHANT_ID}/${transactionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": checksumHex,
            "X-MERCHANT-ID": PHONEPE_MERCHANT_ID
          }
        }
      );

      if (!statusResponse.ok) {
        throw new EdgeFunctionError(
          `PhonePe status API error: ${statusResponse.status} ${statusResponse.statusText}`,
          ErrorType.EXTERNAL_API,
          statusResponse.status,
          undefined,
          shouldRetryError({ status: statusResponse.status })
        );
      }

      return statusResponse.json();
    }, { maxRetries: 3, initialDelay: 1000 }, shouldRetryError);

    logDebug("PhonePe status response", statusData);

    // Update payment status in database
    const supabaseUrl = getRequiredEnvVar("SUPABASE_URL");
    const supabaseKey = getRequiredEnvVar("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    if (statusData.success && statusData.data?.state === "COMPLETED") {
      // Payment successful
      const { error: updateError } = await supabaseClient
        .from("payment_transactions")
        .update({
          status: "completed",
          gateway_response: statusData.data,
          updated_at: new Date().toISOString()
        })
        .eq("gateway_transaction_id", transactionId);

      if (updateError) {
        logError("Error updating payment transaction", updateError);
        throw new EdgeFunctionError(
          "Failed to update payment status",
          ErrorType.DATABASE,
          500,
          updateError
        );
      }

      // Update order status
      const { data: transaction } = await supabaseClient
        .from("payment_transactions")
        .select("order_id")
        .eq("gateway_transaction_id", transactionId)
        .single();

      if (transaction) {
        const { error: orderUpdateError } = await supabaseClient
          .from("orders")
          .update({
            status: "confirmed",
            updated_at: new Date().toISOString()
          })
          .eq("id", transaction.order_id);

        if (orderUpdateError) {
          logError("Error updating order status", orderUpdateError);
          // Don't throw here as payment was successful
        }
      }

      logInfo("Payment verification successful", { transactionId });
      return createSuccessResponse({
        success: true,
        status: "completed",
        paymentData: statusData.data
      });
    } else {
      // Payment failed or pending
      const paymentStatus = statusData.data?.state || "failed";
      const responseCode = statusData.data?.responseCode || "UNKNOWN_ERROR";
      const responseDescription = statusData.data?.responseCodeDescription || "Payment verification failed";

      const { error: updateError } = await supabaseClient
        .from("payment_transactions")
        .update({
          status: paymentStatus.toLowerCase(),
          gateway_response: statusData.data,
          failure_reason: responseDescription,
          updated_at: new Date().toISOString()
        })
        .eq("gateway_transaction_id", transactionId);

      if (updateError) {
        logError("Error updating payment transaction", updateError);
      }

      logInfo("Payment verification completed", {
        transactionId,
        status: paymentStatus.toLowerCase(),
        responseCode
      });

      return createSuccessResponse({
        success: false,
        status: paymentStatus.toLowerCase(),
        message: responseDescription,
        errorCode: responseCode
      });
    }

  } catch (error) {
    logError("Payment verification error", error);

    // Handle our custom errors
    if (error instanceof EdgeFunctionError) {
      return createErrorResponse(error);
    }

    // Handle unknown errors
    return createErrorResponse(
      'Payment verification failed',
      500,
      error.message
    );
  }
});
