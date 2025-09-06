
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
  getAuthenticatedUser,
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

interface PaymentRequest {
  orderId: string;
  amount: number; // in paise
  currency: string;
  paymentMethod?: string;
  redirectUrl: string;
  callbackUrl: string;
  userInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}



import { isRateLimited, rateLimitResponse } from '../_shared/rate-limit.ts';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createOptionsResponse();
  }

  logInfo("PhonePe payment initiation requested");

  // IP-based rate limit: 10 req/min per IP for payment initiation
  const rl = isRateLimited(req, { windowMs: 60_000, max: 10, keyPrefix: 'initiate-phonepe' });
  if (rl.limited) return rateLimitResponse(rl.retryAfter);

  try {
    // Parse request body
    const body = await parseJsonBody(req);
    const { orderId, amount, currency, paymentMethod = "PAY_PAGE", redirectUrl, callbackUrl }: PaymentRequest = body;

    // Create Supabase client
    const supabaseUrl = getRequiredEnvVar("SUPABASE_URL");
    const supabaseKey = getRequiredEnvVar("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const user = await getAuthenticatedUser(req, supabaseClient);

    // PhonePe API configuration from environment variables
    const PHONEPE_MERCHANT_ID = getRequiredEnvVar("PHONEPE_MERCHANT_ID");
    const PHONEPE_SALT_KEY = getRequiredEnvVar("PHONEPE_SALT_KEY");
    const PHONEPE_SALT_INDEX = Deno.env.get("PHONEPE_SALT_INDEX") ?? "1";
    const PHONEPE_HOST_URL = Deno.env.get("PHONEPE_HOST_URL") ?? "https://api-preprod.phonepe.com/apis/pg-sandbox";

    // Generate unique transaction ID
    const transactionId = `TXN_${orderId}_${Date.now()}`;

    // Get user profile for mobile number
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('id, full_name, avatar_url, marketing_emails')
      .eq('id', user.id)
      .single();

    // Prepare payment payload
    const paymentPayload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: user.id,
      amount: amount,
      redirectUrl: `${redirectUrl}?transactionId=${transactionId}&orderId=${orderId}`,
      redirectMode: "POST",
      callbackUrl: `${callbackUrl}?transactionId=${transactionId}&orderId=${orderId}`,
      mobileNumber: profile?.phone || "9999999999", // Fallback mobile number
      paymentInstrument: {
        type: paymentMethod === "UPI" ? "UPI_COLLECT" : "PAY_PAGE"
      }
    };

    logDebug("Payment payload", paymentPayload);

    // Encode payload to base64
    const base64Payload = btoa(JSON.stringify(paymentPayload));

    // Create checksum
    const checksumString = base64Payload + "/pg/v1/pay" + PHONEPE_SALT_KEY;
    const checksum = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(checksumString)
    );
    const checksumHex = Array.from(new Uint8Array(checksum))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('') + "###" + PHONEPE_SALT_INDEX;

    logDebug("Generated checksum", { checksumHex });

    // Make request to PhonePe with retry logic
    const phonePeResponse = await retryOperation(async () => {
      const response = await fetch(`${PHONEPE_HOST_URL}/pg/v1/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksumHex
        },
        body: JSON.stringify({
          request: base64Payload
        })
      });

      if (!response.ok) {
        throw new EdgeFunctionError(
          `PhonePe API error: ${response.status} ${response.statusText}`,
          ErrorType.EXTERNAL_API,
          response.status,
          undefined,
          shouldRetryError({ status: response.status })
        );
      }

      return response.json();
    }, { maxRetries: 3, initialDelay: 1000 }, shouldRetryError);

    logDebug("PhonePe response", phonePeResponse);

    if (phonePeResponse.success && phonePeResponse.data?.instrumentResponse?.redirectInfo?.url) {
      // Store transaction details in database
      const { error: dbError } = await supabaseClient
        .from("payment_transactions")
        .insert({
          order_id: orderId,
          amount: amount / 100, // Convert back to rupees for storage
          currency: currency,
          payment_gateway: "phonepe",
          gateway_transaction_id: transactionId,
          payment_method: paymentMethod,
          status: "pending",
          user_id: user.id
        });

      if (dbError) {
        logError("Database error", dbError);
        throw new EdgeFunctionError(
          "Failed to store transaction details",
          ErrorType.DATABASE,
          500,
          dbError
        );
      }

      logInfo("Payment initiation successful", { transactionId });
      return createSuccessResponse({
        success: true,
        paymentUrl: phonePeResponse.data.instrumentResponse.redirectInfo.url,
        transactionId: transactionId
      });
    } else {
      const errorCode = phonePeResponse.code || "PAYMENT_INITIATION_FAILED";
      const errorMessage = phonePeResponse.message || "Payment initiation failed";

      logError("PhonePe payment initiation failed", { errorCode, errorMessage });

      throw new EdgeFunctionError(
        errorMessage,
        ErrorType.EXTERNAL_API,
        400,
        {
          code: errorCode,
          details: phonePeResponse
        }
      );
    }

  } catch (error) {
    logError("PhonePe payment error", error);

    // Handle our custom errors
    if (error instanceof EdgeFunctionError) {
      return createErrorResponse(error);
    }

    // Handle unknown errors
    return createErrorResponse(
      'Payment initiation failed',
      500,
      error.message
    );
  }
});
