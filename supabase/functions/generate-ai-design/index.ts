
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { theme, answers } = await req.json();
    console.log("Received design generation request with theme:", theme);
    console.log("User answers:", answers);
    
    if (!theme || !answers || answers.length === 0) {
      return new Response(
        JSON.stringify({ error: "Theme and answers are required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Build a prompt based on the theme and answers
    let prompt = `Create a t-shirt design with theme: ${theme.name}. `;
    answers.forEach(answer => {
      prompt += `${answer.question}: ${answer.answer}. `;
    });
    
    console.log("Generated prompt for AI:", prompt);
    
    // Call the webhook to generate the image
    const webhookUrl = "https://n8.wikischool.com/webhook/generate-image";
    const response = await fetch(webhookUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        theme: theme,
        answers: answers,
        prompt: prompt 
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from image generation webhook:", errorText);
      throw new Error(`Failed to generate image: ${response.status} - ${errorText}`);
    }
    
    const imageData = await response.json();
    
    // Expected format from webhook: { imageUrl: "data:image/png;base64,..." } or { imageUrl: "https://..." }
    // If the webhook returns a different format, adjust accordingly
    if (!imageData.imageUrl) {
      throw new Error("Webhook response did not contain an imageUrl");
    }

    console.log("Received image URL from webhook, returning to client");
    
    return new Response(
      JSON.stringify({ 
        imageUrl: imageData.imageUrl,
        prompt: prompt
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in generate-ai-design function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
