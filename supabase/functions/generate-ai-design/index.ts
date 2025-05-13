
import { createClient } from 'npm:@supabase/supabase-js';
import OpenAI from 'npm:openai@4.29.1';
// Import Deno Edge Runtime types
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Start Edge Function
Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
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
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const { theme, answers, userId } = body;
    if (!theme || !answers || answers.length === 0) {
      return new Response(
        JSON.stringify({ error: "Theme and answers are required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get OpenAI API Key
    const openaiApiKey = Deno.env.get('OPEN_AI_API_KEY'); // Using the key as specified
    if (!openaiApiKey) {
      console.error("❌ Missing OpenAI API Key");
      return new Response(
        JSON.stringify({ error: "Image generation service configuration error" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Generate enhanced prompt using the template
    const prompt = generatePrompt(theme, answers);
    console.log("🧠 Generated Prompt:", prompt);
    
    try {
      // Initialize OpenAI client
      const openai = new OpenAI({
        apiKey: openaiApiKey,
      });
      
      console.log("🖼️ Generating image with AI...");
      
      // Generate image with OpenAI API
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
      });
      
      console.log("✅ Image generation successful");
      
      // Extract base64 image data
      const imageBase64 = response.data[0]?.b64_json;
      
      if (!imageBase64) {
        console.error("❌ No image data in response");
        return new Response(
          JSON.stringify({ error: "Failed to generate image" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      // Save to DB if userId is provided
      if (userId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!supabaseUrl || !supabaseKey) {
          console.error("❌ Missing Supabase env vars");
        } else {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { error } = await supabase.from('ai_generated_designs').insert({
            user_id: userId,
            design_image: `data:image/png;base64,${imageBase64}`,
            prompt: prompt,
            theme_id: theme.id || null,
            is_favorite: false
          });
          
          if (error) console.error("❌ DB Insert Error:", error);
        }
      }
      
      // Return the generated image
      return new Response(
        JSON.stringify({
          imageUrl: `data:image/png;base64,${imageBase64}`,
          prompt
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
      
    } catch (apiError) {
      console.error("❌ API Error:", apiError);
      return new Response(
        JSON.stringify({ error: "Image generation API error", details: apiError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
  } catch (err) {
    console.error("❌ Function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Enhanced prompt generator
function generatePrompt(theme, answers) {
  // Format theme information
  const themeName = theme.name || 'Unknown Theme';
  const themeDescription = theme.description || 'No description available';
  
  // Format Q&A section
  const formattedQA = answers.map(a => `Question: ${a.question}\nAnswer: ${a.answer}`).join('\n\n');
  
  // Use the provided template
  return `Create a visually compelling t-shirt design illustration based on the selected themes: ${themeName}
These themes evoke the following ideas: ${themeDescription}

The design should align with the user's intent and preferences:
${formattedQA}

Keep the design coherent, purposeful, and appropriate for the context described.
Emphasize creativity and intent, and feel free to abstract or symbolize key elements from the answers.
Avoid visual clutter and prioritize visual clarity and balance.

The image should be well-balanced and suitable for placement on a t-shirt. Use colors creatively, possibly including hints of the theme's base colors.`;
}
