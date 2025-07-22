
import { createClient } from "npm:@supabase/supabase-js@2";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Import shared utilities
import {
  EdgeFunctionError,
  ErrorType,
  createErrorResponse,
  createOptionsResponse,
  getRequiredEnvVar,
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

  logInfo("PhonePe webhook received");

  try {
    const supabaseUrl = getRequiredEnvVar("SUPABASE_URL");
    const supabaseKey = getRequiredEnvVar("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Verify webhook signature
    const xVerifyHeader = req.headers.get("X-VERIFY");
    const body = await req.text();

    if (!xVerifyHeader) {
      logError("Missing X-VERIFY header");
      throw new EdgeFunctionError(
        "Missing X-VERIFY header",
        ErrorType.AUTHENTICATION,
        401
      );
    }

    // Parse webhook payload
    let webhookData: Record<string, unknown>;
    try {
      webhookData = JSON.parse(body);
    } catch (error) {
      logError("Invalid JSON payload", error);
      throw new EdgeFunctionError(
        "Invalid JSON payload",
        ErrorType.VALIDATION,
        400,
        error
      );
    }

    logDebug("Webhook data", webhookData);

    const { response } = webhookData;

    if (!response) {
      logError("No response data in webhook");
      throw new EdgeFunctionError(
        "No response data in webhook",
        ErrorType.VALIDATION,
        400
      );
    }

    // Decode base64 response
    const decodedResponse = JSON.parse(atob(response));
    logDebug("Decoded response", decodedResponse);

    const { data } = decodedResponse;

    if (!data || !data.merchantTransactionId) {
      logError("Invalid webhook data structure");
      throw new EdgeFunctionError(
        "Invalid webhook data structure",
        ErrorType.VALIDATION,
        400
      );
    }

    const transactionId = data.merchantTransactionId;
    const paymentState = data.state;

    // Update payment transaction
    const { error: updateError } = await supabaseClient
      .from("payment_transactions")
      .update({
        status: paymentState === "COMPLETED" ? "completed" : "failed",
        gateway_response: data,
        failure_reason: data.responseCodeDescription,
        updated_at: new Date().toISOString()
      })
      .eq("gateway_transaction_id", transactionId);

    if (updateError) {
      logError("Error updating payment transaction", updateError);
      throw new EdgeFunctionError(
        "Failed to update payment transaction",
        ErrorType.DATABASE,
        500,
        updateError
      );
    }

    // Update order status if payment completed
    if (paymentState === "COMPLETED") {
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
    }

    logInfo(`Webhook processed successfully for transaction: ${transactionId}`);

    return new Response("OK", {
      headers: { "Content-Type": "text/plain" },
      status: 200,
    });

  } catch (error) {
    logError("Webhook processing error", error);

    // Handle our custom errors
    if (error instanceof EdgeFunctionError) {
      return createErrorResponse(error);
    }

    // Handle unknown errors
    return createErrorResponse(
      'Webhook processing failed',
      500,
      error.message
    );
  }
});
