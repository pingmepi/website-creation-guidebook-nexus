
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
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
      console.error("❌ Missing required parameters", { hasTheme: !!theme, answersCount: answers?.length });
      return new Response(
        JSON.stringify({ error: "Theme and answers are required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get OpenAI API Key - check both possible environment variable names
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPEN_AI_API_KEY'); 
    if (!openaiApiKey) {
      console.error("❌ Missing OpenAI API Key");
      return new Response(
        JSON.stringify({ error: "Image generation service configuration error" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Validate answers input
    for (const answer of answers) {
      if (!answer.question || !answer.answer) {
        console.error("❌ Invalid answer format", answer);
        return new Response(
          JSON.stringify({ error: "Invalid answer format" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }
    
    // Generate enhanced prompt using the template
    const prompt = generatePrompt(theme, answers);
    console.log("🧠 Generated Prompt:", prompt);
    console.log("🧠 Prompt Length:", prompt.length);
    
    // Validate prompt
    if (!prompt || prompt.length < 10) {
      console.error("❌ Generated prompt is too short:", prompt);
      return new Response(
        JSON.stringify({ error: "Failed to generate a valid prompt" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    try {
      // Initialize OpenAI client
      const openai = new OpenAI({
        apiKey: openaiApiKey,
      });
      
      console.log("🖼️ Generating image with AI...");
      
      // Generate image with OpenAI API - simplified request format
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
      console.error("❌ API Error Status:", apiError.status);
      console.error("❌ API Error Type:", apiError.type);
      console.error("❌ API Error Message:", apiError.message);
      
      if (apiError.status === 400) {
        console.error("❌ OpenAI 400 Bad Request - Check prompt format or content policy violations");
        
        // Try with a fallback prompt to see if the API itself works
        try {
          console.log("🔄 Attempting fallback with simple prompt");
          const openai = new OpenAI({ apiKey: openaiApiKey });
          const fallbackResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: "A simple abstract t-shirt design with geometric shapes",
            n: 1,
            size: "1024x1024",
            response_format: "b64_json"
          });
          
          if (fallbackResponse.data[0]?.b64_json) {
            console.log("✅ Fallback prompt succeeded - original prompt likely violated policies");
            const fallbackImageBase64 = fallbackResponse.data[0].b64_json;
            
            return new Response(
              JSON.stringify({
                imageUrl: `data:image/png;base64,${fallbackImageBase64}`,
                prompt: "A simple abstract t-shirt design with geometric shapes",
                fallback: true
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } catch (fallbackError) {
          console.error("❌ Fallback also failed:", fallbackError);
        }
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Image generation API error", 
          details: `${apiError.status || 500} ${apiError.message || JSON.stringify(apiError)}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
  } catch (err) {
    console.error("❌ Function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Enhanced prompt generator with validation
function generatePrompt(theme, answers) {
  try {
    // Format theme information
    const themeName = theme.name || 'Unknown Theme';
    const themeDescription = theme.description || 'No description available';
    
    // Format Q&A section
    const formattedQA = answers.map(a => `Question: ${a.question}\nAnswer: ${a.answer}`).join('\n\n');
    
    // Use the provided template but clean up input
    const sanitizedThemeName = themeName.replace(/[^\w\s\-,.]/g, '').trim();
    const sanitizedDescription = themeDescription.replace(/[^\w\s\-,.]/g, '').trim();
    
    // Create a prompt that follows OpenAI guidelines
    const prompt = `Create a visually compelling t-shirt design illustration based on the theme: ${sanitizedThemeName}.
Theme description: ${sanitizedDescription}

The design should incorporate these preferences:
${formattedQA}

Keep the design coherent, purposeful, and suitable for a t-shirt print.
Emphasize creativity with a balanced, professional layout.
Use colors creatively while maintaining visual clarity.
Make the design suitable for placement on a t-shirt front.`;
    
    return prompt;
  } catch (error) {
    console.error("❌ Error generating prompt:", error);
    return "Create a simple, abstract t-shirt design with geometric shapes";
  }
}
