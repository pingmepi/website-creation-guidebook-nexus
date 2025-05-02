
// Import using npm: prefix for Node.js packages in Edge Functions
import { createClient } from 'npm:@supabase/supabase-js';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This is now a Supabase Edge Function handler that works with Node.js
export default async function handler(req) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders 
    });
  }

  try {
    // Parse the request body
    const { theme, answers } = await req.json();
    console.log("Received design generation request with theme:", theme?.name || 'Unknown theme');
    console.log("User answers count:", answers?.length || 0);
    
    if (!theme || !answers || answers.length === 0) {
      return new Response(
        JSON.stringify({ error: "Theme and answers are required" }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Build a prompt based on the theme and answers
    let prompt = `Create a t-shirt design with theme: ${theme.name}. `;
    answers.forEach(answer => {
      prompt += `${answer.question}: ${answer.answer}. `;
    });
    
    console.log("Generated prompt for AI:", prompt);
    
    // Generate a mock image (base64 encoded) for testing
    // In production, this would be replaced with an actual AI model call
    const mockImageBase64 = generateMockImage();
    
    console.log("Generated mock image, returning to client");
    
    // Return the mock image directly as base64
    return new Response(
      JSON.stringify({ 
        imageUrl: `data:image/png;base64,${mockImageBase64}`,
        prompt: prompt
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error in generate-ai-design function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

// Generate a simple base64 encoded image for testing
function generateMockImage() {
  // This is a tiny red square as base64
  return "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAKElEQVQ4T2NkYGD4z0ABYBw1cDQMRzMMRjXDaDowmmsHR5QNznQ4mgYB8W0FAS7HDIYAAAAASUVORK5CYII=";
}
