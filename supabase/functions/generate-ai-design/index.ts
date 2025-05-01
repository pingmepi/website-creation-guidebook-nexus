
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
    
    // For now, we're just returning a placeholder image
    // In a real implementation, this would call an AI image generation service with the prompt
    const placeholderImageUrl = "https://mqqgfcghppkivptpjwxi.supabase.co/storage/v1/object/public/assets/placeholder.svg";
    
    // Log the response we're sending back
    console.log("Returning placeholder image URL:", placeholderImageUrl);
    
    return new Response(
      JSON.stringify({ 
        imageUrl: placeholderImageUrl,
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
