
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
      console.log(`Verification attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        console.log(`Retrying verification in ${delay}ms...`);
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
    const { transactionId } = await req.json();

    if (!transactionId) {
      throw new Error("Transaction ID is required");
    }

    // PhonePe API configuration from environment variables
    const PHONEPE_MERCHANT_ID = Deno.env.get("PHONEPE_MERCHANT_ID") ?? "";
    const PHONEPE_SALT_KEY = Deno.env.get("PHONEPE_SALT_KEY") ?? "";
    const PHONEPE_SALT_INDEX = Deno.env.get("PHONEPE_SALT_INDEX") ?? "1";
    const PHONEPE_HOST_URL = Deno.env.get("PHONEPE_HOST_URL") ?? "https://api-preprod.phonepe.com/apis/pg-sandbox";

    if (!PHONEPE_MERCHANT_ID || !PHONEPE_SALT_KEY) {
      throw new Error("PhonePe configuration missing. Please set PHONEPE_MERCHANT_ID and PHONEPE_SALT_KEY environment variables.");
    }

    // Create checksum for status check
    const checksumString = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${transactionId}` + PHONEPE_SALT_KEY;
    const checksum = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(checksumString)
    );
    const checksumHex = Array.from(new Uint8Array(checksum))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('') + "###" + PHONEPE_SALT_INDEX;

    console.log("Verification checksum:", checksumHex);

    // Check payment status with PhonePe using retry logic
    const statusData = await retryApiCall(async () => {
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
        throw new Error(`PhonePe status API error: ${statusResponse.status} ${statusResponse.statusText}`);
      }

      return statusResponse.json();
    }, 3, 1000);

    console.log("PhonePe status response:", JSON.stringify(statusData, null, 2));

    // Update payment status in database
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

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
        console.error("Error updating payment transaction:", updateError);
        throw new Error("Failed to update payment status");
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
          console.error("Error updating order status:", orderUpdateError);
          // Don't throw here as payment was successful
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          status: "completed",
          paymentData: statusData.data
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
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
        console.error("Error updating payment transaction:", updateError);
      }

      return new Response(
        JSON.stringify({
          success: false,
          status: paymentStatus.toLowerCase(),
          message: responseDescription,
          errorCode: responseCode
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Payment verification failed",
        errorCode: "VERIFICATION_ERROR"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
