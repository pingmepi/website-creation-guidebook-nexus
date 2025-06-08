
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  orderId: string;
  amount: number; // in paise
  currency: string;
  redirectUrl: string;
  callbackUrl: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { orderId, amount, currency, redirectUrl, callbackUrl }: PaymentRequest = await req.json();

    // PhonePe API configuration
    const PHONEPE_MERCHANT_ID = Deno.env.get("PHONEPE_MERCHANT_ID") ?? "";
    const PHONEPE_SALT_KEY = Deno.env.get("PHONEPE_SALT_KEY") ?? "";
    const PHONEPE_SALT_INDEX = Deno.env.get("PHONEPE_SALT_INDEX") ?? "1";
    const PHONEPE_HOST_URL = Deno.env.get("PHONEPE_HOST_URL") ?? "https://api-preprod.phonepe.com/apis/pg-sandbox";

    // Generate unique transaction ID
    const transactionId = `TXN_${orderId}_${Date.now()}`;

    // Prepare payment payload
    const paymentPayload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: user.id,
      amount: amount,
      redirectUrl: redirectUrl,
      redirectMode: "POST",
      callbackUrl: callbackUrl,
      mobileNumber: "9999999999", // You might want to get this from user profile
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

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

    // Make request to PhonePe
    const phonePeResponse = await fetch(`${PHONEPE_HOST_URL}/pg/v1/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksumHex
      },
      body: JSON.stringify({
        request: base64Payload
      })
    });

    const responseData = await phonePeResponse.json();

    if (responseData.success && responseData.data?.instrumentResponse?.redirectInfo?.url) {
      // Store transaction details in database
      const { error: dbError } = await supabase
        .from("payment_transactions")
        .insert({
          order_id: orderId,
          amount: amount / 100, // Convert back to rupees for storage
          currency: currency,
          payment_gateway: "phonepe",
          gateway_transaction_id: transactionId,
          payment_method: "UPI",
          status: "pending"
        });

      if (dbError) {
        console.error("Database error:", dbError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          paymentUrl: responseData.data.instrumentResponse.redirectInfo.url,
          transactionId: transactionId
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      throw new Error(responseData.message || "Payment initiation failed");
    }

  } catch (error) {
    console.error("PhonePe payment error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Payment initiation failed" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
