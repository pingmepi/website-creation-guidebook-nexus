
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-verify",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("PhonePe webhook received");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get PhonePe configuration
    const PHONEPE_SALT_KEY = Deno.env.get("PHONEPE_SALT_KEY") ?? "";
    const PHONEPE_SALT_INDEX = Deno.env.get("PHONEPE_SALT_INDEX") ?? "1";

    if (!PHONEPE_SALT_KEY) {
      throw new Error("PhonePe configuration missing");
    }

    // Verify webhook signature
    const xVerifyHeader = req.headers.get("X-VERIFY");
    const body = await req.text();
    
    if (!xVerifyHeader) {
      console.error("Missing X-VERIFY header");
      return new Response("Unauthorized", { status: 401 });
    }

    // Parse webhook payload
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (error) {
      console.error("Invalid JSON payload:", error);
      return new Response("Bad Request", { status: 400 });
    }

    console.log("Webhook data:", JSON.stringify(webhookData, null, 2));

    const { response } = webhookData;
    
    if (!response) {
      console.error("No response data in webhook");
      return new Response("Bad Request", { status: 400 });
    }

    // Decode base64 response
    const decodedResponse = JSON.parse(atob(response));
    console.log("Decoded response:", JSON.stringify(decodedResponse, null, 2));

    const { data } = decodedResponse;
    
    if (!data || !data.merchantTransactionId) {
      console.error("Invalid webhook data structure");
      return new Response("Bad Request", { status: 400 });
    }

    const transactionId = data.merchantTransactionId;
    const paymentState = data.state;
    const responseCode = data.responseCode;

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
      console.error("Error updating payment transaction:", updateError);
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
          console.error("Error updating order status:", orderUpdateError);
        }
      }
    }

    console.log(`Webhook processed successfully for transaction: ${transactionId}`);

    return new Response("OK", {
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
      status: 200,
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      "Internal Server Error",
      {
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
        status: 500,
      }
    );
  }
});
