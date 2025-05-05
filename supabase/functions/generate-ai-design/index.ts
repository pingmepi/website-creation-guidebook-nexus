
// Import using npm: prefix for Node.js packages in Edge Functions
// This import is resolved through the import_map.json file
// which maps '@supabase/supabase-js' to 'npm:@supabase/supabase-js@2'
import { createClient } from '@supabase/supabase-js';

// Import Deno types
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

// Declare Deno namespace for TypeScript
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  export const env: Env;
}

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Define types for our function
interface RequestData {
  theme: { name: string; id?: string };
  answers: Array<{ question: string; answer: string }>;
  userId?: string;
}

// Supabase Edge Function handler
export default async function handler(req: Request) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204 // Explicitly set 204 No Content status
    });
  }

  try {
    // Parse the request body
    const { theme, answers, userId } = await req.json() as RequestData;
    console.log("Received design generation request with theme:", theme);
    console.log("User answers:", answers);
    console.log("User ID (if provided):", userId);

    if (!theme || !answers || answers.length === 0) {
      return new Response(
        JSON.stringify({ error: "Theme and answers are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build a prompt based on the theme and answers
    let prompt = `Create a t-shirt design with theme: ${theme.name}. `;
    answers.forEach(answer => {
      prompt += `${answer.question}: ${answer.answer}. `;
    });

    console.log("Generated prompt for AI:", prompt);

    // Log webhook call attempt
    console.log("🔄 WEBHOOK CALL ATTEMPT - Calling webhook at:", 'https://webhook.miles-api.com/webhook/testing-1243');

    // Track timing
    const startTime = Date.now();

    // Call the webhook to generate an image
    console.log("🔄 WEBHOOK REQUEST - Sending payload:", { prompt });

    // Add timeout to the fetch request to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let response: Response;
    let imageData: any;

    try {
      try {
        response = await fetch('https://webhook.miles-api.com/webhook/testing-1243', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
          signal: controller.signal
        });
      } finally {
        // Clear the timeout since the request completed or failed
        clearTimeout(timeoutId);
      }

      // Log response status
      console.log(`✅ WEBHOOK RESPONSE - Status: ${response.status}, Time taken: ${Date.now() - startTime}ms`);

      if (!response.ok) {
        throw new Error(`Webhook responded with status: ${response.status}`);
      }

      imageData = await response.json();

      // Log successful response (without the full base64 image for brevity)
      console.log("✅ WEBHOOK SUCCESS - Response received:", {
        hasImageData: !!imageData.image_base64,
        imageDataLength: imageData.image_base64 ? imageData.image_base64.length : 0
      });

      // Save to ai_generated_designs if userId is provided
      if (userId && imageData.image_base64) {
        try {
          // Get Supabase environment variables with detailed logging
          console.log("🔍 Attempting to retrieve Supabase credentials");
          const supabaseUrl = getEnvVariable('SUPABASE_URL', true);
          console.log("✅ SUPABASE_URL retrieved successfully");
          const supabaseServiceRoleKey = getEnvVariable('SUPABASE_SERVICE_ROLE_KEY', true);
          console.log("✅ SUPABASE_SERVICE_ROLE_KEY retrieved successfully");

          // Create Supabase client using validated environment variables
          const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

          // Save the design to the database
          const { data, error } = await supabase
            .from('ai_generated_designs')
            .insert({
              user_id: userId,
              design_image: `data:image/png;base64,${imageData.image_base64}`,
              prompt: prompt,
              theme_id: theme.id || null,
              is_favorite: false
            });

          if (error) {
            console.error("❌ DATABASE ERROR:", error);
          } else {
            console.log("✅ Design saved to database:", data);
          }
        } catch (dbError) {
          console.error("❌ DATABASE OPERATION ERROR:", dbError);
          // Continue execution even if database operation fails
        }
      }

      // Return the base64 image data
      return new Response(
        JSON.stringify({
          imageUrl: `data:image/png;base64,${imageData.image_base64}`,
          prompt: prompt
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (webhookError) {
      console.error("❌ WEBHOOK ERROR:", webhookError);
      return new Response(
        JSON.stringify({
          error: webhookError.message,
          errorType: webhookError.name,
          timestamp: new Date().toISOString()
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("❌ ERROR in generate-ai-design function:", error);
    console.error("❌ ERROR details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Use mock image in development or if configured
    const useMockImage = getEnvVariable('USE_MOCK_IMAGE');
    if (useMockImage === 'true') {
      console.log("🔄 Using mock image due to error and USE_MOCK_IMAGE=true");
      const mockImage = generateMockImage();
      return new Response(
        JSON.stringify({
          imageUrl: `data:image/png;base64,${mockImage}`,
          prompt: "Error occurred, using mock image",
          isMock: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        error: error.message,
        errorType: error.name,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Helper function to get and validate environment variables
function getEnvVariable(key: string, required = false): string {
  const value = Deno.env.get(key);
  if (required && !value) {
    console.error(`❌ Required environment variable ${key} is missing`);
    throw new Error(`Required environment variable ${key} is missing`);
  }
  return value || '';
}

// Generate a simple base64 encoded image for testing
function generateMockImage() {
  // This is a tiny red square as base64
  return "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAKElEQVQ4T2NkYGD4z0ABYBw1cDQMRzMMRjXDaDowmmsHR5QNznQ4mgYB8W0FAS7HDIYAAAAASUVORK5CYII=";
}
