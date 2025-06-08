
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transactionId } = await req.json();

    // PhonePe API configuration
    const PHONEPE_MERCHANT_ID = Deno.env.get("PHONEPE_MERCHANT_ID") ?? "";
    const PHONEPE_SALT_KEY = Deno.env.get("PHONEPE_SALT_KEY") ?? "";
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

    // Check payment status with PhonePe
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

    const statusData = await statusResponse.json();

    // Update payment status in database
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (statusData.success && statusData.data?.state === "COMPLETED") {
      // Payment successful
      await supabaseClient
        .from("payment_transactions")
        .update({
          status: "completed",
          gateway_response: statusData.data,
          updated_at: new Date().toISOString()
        })
        .eq("gateway_transaction_id", transactionId);

      // Update order status
      const { data: transaction } = await supabaseClient
        .from("payment_transactions")
        .select("order_id")
        .eq("gateway_transaction_id", transactionId)
        .single();

      if (transaction) {
        await supabaseClient
          .from("orders")
          .update({
            status: "confirmed",
            updated_at: new Date().toISOString()
          })
          .eq("id", transaction.order_id);
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
      
      await supabaseClient
        .from("payment_transactions")
        .update({
          status: paymentStatus.toLowerCase(),
          gateway_response: statusData.data,
          failure_reason: statusData.data?.responseCodeDescription,
          updated_at: new Date().toISOString()
        })
        .eq("gateway_transaction_id", transactionId);

      return new Response(
        JSON.stringify({
          success: false,
          status: paymentStatus.toLowerCase(),
          message: statusData.data?.responseCodeDescription || "Payment verification failed"
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
        error: error.message || "Payment verification failed" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
