import { createClient } from 'npm:@supabase/supabase-js';
// Import Deno Edge Runtime types
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
// Start Edge Function
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
      status: 204
    });
  }
  console.log("✅ Function invoked");
  try {
    // Parse JSON safely
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return jsonError("Invalid JSON", 400);
    }
    const { theme, answers, userId } = body;
    if (!theme || !answers || answers.length === 0) {
      return jsonError("Theme and answers are required", 400);
    }
    // Generate prompt
    let prompt = `Create a t-shirt design with theme: ${theme.name}. `;
    answers.forEach((a)=>{
      prompt += `${a.question}: ${a.answer}. `;
    });
    console.log("🧠 Prompt:", prompt);
    // Call webhook
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), 30000);
    let webhookResponse;
    try {
      webhookResponse = await fetch('https://webhook.miles-api.com/webhook/testing-1243', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt
        }),
        signal: controller.signal
      });
    } finally{
      clearTimeout(timeout);
    }
    if (!webhookResponse.ok) {
      return jsonError(`Webhook error: ${webhookResponse.status}`, 500);
    }
    const imageData = await webhookResponse.json();
    console.log("📦 Webhook response received");
    // Save to DB if userId is provided
    if (userId && imageData.image_base64) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (!supabaseUrl || !supabaseKey) {
        console.error("❌ Missing Supabase env vars");
      } else {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { error } = await supabase.from('ai_generated_designs').insert({
          user_id: userId,
          design_image: `data:image/png;base64,${imageData.image_base64}`,
          prompt: prompt,
          theme_id: theme.id || null,
          is_favorite: false
        });
        if (error) console.error("❌ DB Insert Error:", error);
      }
    }
    return new Response(JSON.stringify({
      imageUrl: `data:image/png;base64,${imageData.image_base64}`,
      prompt
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error("❌ Function error:", err);
    return jsonError("Internal Server Error", 500);
  }
});
// Utility: JSON error response
function jsonError(message, status = 500) {
  return new Response(JSON.stringify({
    error: message
  }), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
