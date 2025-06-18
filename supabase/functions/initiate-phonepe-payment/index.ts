
// @ts-ignore - Deno URL imports are not recognized by TypeScript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore - Deno URL imports are not recognized by TypeScript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

// Retry mechanism for API calls
async function retryApiCall<T>(
  operation: () => Promise<T>, 
  maxRetries = 3, 
  delay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
  
  throw lastError!;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { orderId, amount, currency, paymentMethod = "PAY_PAGE", redirectUrl, callbackUrl }: PaymentRequest = await req.json();

    // PhonePe API configuration from environment variables
    const PHONEPE_MERCHANT_ID = Deno.env.get("PHONEPE_MERCHANT_ID") ?? "";
    const PHONEPE_SALT_KEY = Deno.env.get("PHONEPE_SALT_KEY") ?? "";
    const PHONEPE_SALT_INDEX = Deno.env.get("PHONEPE_SALT_INDEX") ?? "1";
    const PHONEPE_HOST_URL = Deno.env.get("PHONEPE_HOST_URL") ?? "https://api-preprod.phonepe.com/apis/pg-sandbox";

    if (!PHONEPE_MERCHANT_ID || !PHONEPE_SALT_KEY) {
      throw new Error("PhonePe configuration missing. Please set PHONEPE_MERCHANT_ID and PHONEPE_SALT_KEY environment variables.");
    }

    // Generate unique transaction ID
    const transactionId = `TXN_${orderId}_${Date.now()}`;

    // Get user profile for mobile number
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
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

    console.log("Payment payload:", JSON.stringify(paymentPayload, null, 2));

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

    console.log("Checksum:", checksumHex);

    // Make request to PhonePe with retry logic
    const phonePeResponse = await retryApiCall(async () => {
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
        throw new Error(`PhonePe API error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    }, 3, 1000);

    console.log("PhonePe response:", JSON.stringify(phonePeResponse, null, 2));

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
        console.error("Database error:", dbError);
        throw new Error("Failed to store transaction details");
      }

      return new Response(
        JSON.stringify({
          success: true,
          paymentUrl: phonePeResponse.data.instrumentResponse.redirectInfo.url,
          transactionId: transactionId
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      const errorCode = phonePeResponse.code || "PAYMENT_INITIATION_FAILED";
      const errorMessage = phonePeResponse.message || "Payment initiation failed";
      
      console.error("PhonePe payment initiation failed:", errorCode, errorMessage);
      
      throw new Error(JSON.stringify({
        code: errorCode,
        message: errorMessage,
        details: phonePeResponse
      }));
    }

  } catch (error) {
    console.error("PhonePe payment error:", error);
    
    let errorResponse = {
      success: false,
      error: "Payment initiation failed"
    };

    // Try to parse structured error
    try {
      const parsedError = JSON.parse(error.message);
      errorResponse = {
        success: false,
        error: parsedError.message || "Payment initiation failed",
        details: {
          code: parsedError.code || "UNKNOWN_ERROR"
        }
      };
    } catch {
      // Use generic error response
      errorResponse.error = error.message || "Payment initiation failed";
    }

    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
