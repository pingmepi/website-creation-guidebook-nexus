import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import { OpenAI } from 'openai';
// Import Deno Edge Runtime types
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Type declaration for Deno global
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

// Type definitions for OpenAI errors (to help with TypeScript validation)
interface OpenAIError {
  status: number;
  type: string;
  code?: string | null;
  param?: string | null;
  message: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // Start with 1s delay, will increase with exponential backoff

// OpenAI prompt safety filters
const PROHIBITED_CONTENT = [
  'explicit', 'sexual', 'violent', 'graphic', 'disturbing', 'harmful', 'illegal',
  'unethical', 'hateful', 'discriminatory', 'offensive'
];

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
      console.error("❌ Invalid request JSON:", e);
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Log request payload for debugging
    console.log("📦 Request Payload:", JSON.stringify(body, null, 2));
    
    const { theme, answers, userId } = body;
    if (!theme || !answers) {
      console.error("❌ Missing required parameters", { hasTheme: !!theme, hasAnswers: !!answers });
      return new Response(
        JSON.stringify({ error: "Theme and answers are required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Validate answers is an array with content
    if (!Array.isArray(answers) || answers.length === 0) {
      console.error("❌ Answers must be a non-empty array", { answersType: typeof answers, isArray: Array.isArray(answers), length: answers?.length });
      return new Response(
        JSON.stringify({ error: "Answers must be a non-empty array" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get OpenAI API Key - check both possible environment variable names
    const openaiApiKey = Deno.env.get('OPEN_AI_API_KEY'); 
    if (!openaiApiKey) {
      console.error("❌ Missing OpenAI API Key");
      return new Response(
        JSON.stringify({ error: "Image generation service configuration error" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Validate answers input more thoroughly
    const validAnswers = answers.filter(answer => 
      answer && typeof answer.question === 'string' && typeof answer.answer === 'string'
    );
    
    if (validAnswers.length === 0) {
      console.error("❌ No valid answers provided", { answers });
      return new Response(
        JSON.stringify({ error: "No valid answers provided" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Generate enhanced prompt using the template
    const prompt = generatePrompt(theme, validAnswers);
    console.log("🧠 Generated Prompt:", prompt);
    console.log("🧠 Prompt Length:", prompt.length);
    
    // Enhanced prompt validation
    if (!prompt || prompt.length < 10) {
      console.error("❌ Generated prompt is too short:", prompt);
      return new Response(
        JSON.stringify({ error: "Failed to generate a valid prompt" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Check for prohibited content in the prompt
    const containsProhibitedContent = PROHIBITED_CONTENT.some(term => 
      prompt.toLowerCase().includes(term)
    );
    
    if (containsProhibitedContent) {
      console.error("❌ Prompt contains prohibited content");
      return new Response(
        JSON.stringify({ error: "The generated prompt contains prohibited content" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    try {
      // Initialize OpenAI client with improved config
      const openai = new OpenAI({
        apiKey: openaiApiKey,
        maxRetries: MAX_RETRIES, // Built-in retry mechanism
      });
      
      console.log("🖼️ Generating image with AI...");
      
      // Prepare the API request payload
      const imageGenRequest = {
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
      };
      
      console.log("🔄 OpenAI Request Payload:", JSON.stringify({
        ...imageGenRequest,
        prompt: imageGenRequest.prompt.substring(0, 100) + '...' // Truncate for logging
      }, null, 2));
      
      // Additional validation for OpenAI payload
      const validationResult = validateOpenAIPayload(imageGenRequest);
      if (!validationResult.valid) {
        console.error("❌ Invalid OpenAI payload:", validationResult.issues);
        return new Response(
          JSON.stringify({ error: "Invalid OpenAI payload", details: validationResult.issues }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      // Measure request timing for debugging
      const startTime = Date.now();
      console.log(`⏱️ Starting OpenAI request at ${new Date().toISOString()}`);
      
      // Generate image with OpenAI API with retry logic
      let response;
      let retryCount = 0;
      let lastError: OpenAIError | null = null;
      
      while (retryCount < MAX_RETRIES) {
        try {
          response = await openai.images.generate(imageGenRequest);
          break; // Success, exit the retry loop
        } catch (error) {
          // Cast error to our defined OpenAI error type
          lastError = error as OpenAIError;
          console.error(`❌ API Error (attempt ${retryCount + 1}/${MAX_RETRIES}):`, lastError);
          
          // Only retry on rate limits or server errors (not validation errors)
          if (lastError.status === 429 || (lastError.status >= 500 && lastError.status < 600)) {
            retryCount++;
            if (retryCount < MAX_RETRIES) {
              const delay = RETRY_DELAY_MS * Math.pow(2, retryCount - 1); // Exponential backoff
              console.log(`🕒 Retrying after ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          } else {
            break; // Don't retry client errors
          }
        }
      }
      
      // Log timing information
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`⏱️ OpenAI request completed in ${duration}ms`);
      
      if (!response) {
        // If we've exhausted retries or had a client error
        const errorStatus = lastError?.status || 500;
        const errorType = lastError?.type || 'unknown_error';
        const errorMessage = lastError?.message || 'Unknown error';
        
        console.error(`❌ OpenAI API Error: ${errorStatus} ${errorType} - ${errorMessage}`);
        
        // Customize error messages based on the error type
        let userErrorMessage = "Failed to generate image";
        switch (errorType) {
          case 'invalid_request_error':
            userErrorMessage = "Invalid request parameters";
            // Try with fallback if it's a 400 error (likely prompt issue)
            if (errorStatus === 400) {
              return await handleFallbackPrompt(openaiApiKey, corsHeaders);
            }
            break;
          case 'rate_limit_exceeded':
            userErrorMessage = "Image generation service is currently busy, please try again later";
            break;
          case 'insufficient_quota':
            userErrorMessage = "Image generation service is currently unavailable";
            break;
          default:
            userErrorMessage = "Image generation service error";
        }
        
        return new Response(
          JSON.stringify({ 
            error: userErrorMessage,
            details: `${errorStatus} ${errorType}: ${errorMessage}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: errorStatus }
        );
      }
      
      console.log("✅ Image generation successful");
      console.log(`✅ Response contains ${response.data?.length || 0} images`);
      
      // Extract base64 image data with validation
      const imageData = response.data?.[0];
      const imageBase64 = imageData?.b64_json;
      const imageUrl = imageData?.url; // Some APIs return URL instead of base64
      
      if (!imageBase64 && !imageUrl) {
        console.error("❌ No image data in response:", JSON.stringify(response.data));
        return new Response(
          JSON.stringify({ error: "Failed to generate image - no image data returned" }),
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
      // Enhanced error logging for OpenAI errors
      console.error("❌ API Error:", apiError);
      const typedError = apiError as OpenAIError;
      console.error("❌ API Error Status:", typedError.status);
      console.error("❌ API Error Type:", typedError.type);
      console.error("❌ API Error Code:", typedError.code || "none");
      console.error("❌ API Error Param:", typedError.param || "none");
      console.error("❌ API Error Message:", typedError.message);
      
      // Check for specific error codes that might help debugging
      if (typedError.status === 400) {
        const errorDetails = {
          status: typedError.status,
          type: typedError.type,
          message: typedError.message,
          code: typedError.code,
          param: typedError.param
        };
        
        console.error("❌ 400 Bad Request Details:", JSON.stringify(errorDetails, null, 2));
        
        // Common 400 errors with OpenAI
        if (typedError.code === 'content_policy_violation') {
          console.error("❌ Content policy violation detected. Using fallback prompt.");
          return await handleFallbackPrompt(openaiApiKey, corsHeaders);
        }
        
        if (typedError.param === 'prompt') {
          console.error("❌ Issue with the prompt parameter. Using fallback prompt.");
          return await handleFallbackPrompt(openaiApiKey, corsHeaders);
        }
        
        // For any other 400 error, try the fallback
        return await handleFallbackPrompt(openaiApiKey, corsHeaders);
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Image generation API error", 
          details: `${typedError.status || 500} ${typedError.message || JSON.stringify(apiError)}` 
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

// Extracted fallback prompt handler
async function handleFallbackPrompt(apiKey: string, corsHeaders: any): Promise<Response> {
  console.log("🔄 Attempting fallback with simple prompt");
  try {
    const openai = new OpenAI({ 
      apiKey,
      maxRetries: 0 // Don't retry in fallback to avoid cascading timeouts
    });
    
    // Single very simple fallback that's less likely to trigger content filters
    const fallbackPrompt = "A simple geometric pattern suitable for a t-shirt with blue and white colors";
    
    try {
      console.log("🔄 Trying fallback prompt with DALL-E 2");
      
      // Debug the request payload
      console.log("📦 Fallback request payload:", JSON.stringify({
        model: "dall-e-2",
        prompt: fallbackPrompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
      }, null, 2));
      
      // Use DALL-E 2 with minimal parameters
      const fallbackResponse = await openai.images.generate({
        model: "dall-e-2", 
        prompt: fallbackPrompt,
        n: 1,
        size: "1024x1024", 
        response_format: "b64_json"
      });
      
      const fallbackImageBase64 = fallbackResponse.data[0]?.b64_json;
      
      if (fallbackImageBase64) {
        console.log("✅ Fallback image generation succeeded");
        return new Response(
          JSON.stringify({
            imageUrl: `data:image/png;base64,${fallbackImageBase64}`,
            prompt: fallbackPrompt,
            fallback: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error("No image data in fallback response");
    } catch (error) {
      console.error("❌ DALL-E 2 fallback failed:", error);
      
      // Try URL response format as last resort
      try {
        console.log("🔄 Trying URL response format as last resort");
        
        const urlFallbackResponse = await openai.images.generate({
          model: "dall-e-2",
          prompt: fallbackPrompt,
          n: 1,
          size: "512x512", // Use smaller size for URL format
          response_format: "url" // Try URL format instead of b64_json
        });
        
        const fallbackImageUrl = urlFallbackResponse.data[0]?.url;
        
        if (fallbackImageUrl) {
          console.log("✅ URL fallback succeeded");
          return new Response(
            JSON.stringify({
              imageUrl: fallbackImageUrl,
              prompt: fallbackPrompt,
              fallback: true
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        throw new Error("No image URL in fallback response");
      } catch (urlError) {
        console.error("❌ URL fallback also failed:", urlError);
        // Continue to static fallback
      }
    }
    
    // If all OpenAI attempts failed, use a static placeholder
    console.log("🔄 Using static placeholder image as final fallback");
    return new Response(
      JSON.stringify({ 
        error: "Image generation service unavailable",
        fallback: true,
        placeholderImage: true,
        // Use existing placeholder in assets
        imageUrl: "/assets/images/design/placeholder.svg"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 } // Return 200 with placeholder
    );
    
  } catch (fallbackError) {
    console.error("❌ Complete fallback failure:", fallbackError);
    
    // Return a predefined static image as last resort with 200 status
    return new Response(
      JSON.stringify({ 
        error: "Image generation service unavailable",
        fallback: true,
        placeholderImage: true,
        // Use existing placeholder in assets
        imageUrl: "/assets/images/design/placeholder.svg"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
}

// Enhanced prompt generator with validation and sanitization
function generatePrompt(theme: any, answers: any[]): string {
  try {
    // Format theme information
    const themeName = theme.name || 'Unknown Theme';
    const themeDescription = theme.description || 'No description available';
    
    // More thorough input sanitization
    const sanitizedThemeName = sanitizeText(themeName);
    const sanitizedDescription = sanitizeText(themeDescription);
    
    // Format Q&A section with sanitization
    const formattedQA = answers.map(a => {
      const sanitizedQuestion = sanitizeText(a.question);
      const sanitizedAnswer = sanitizeText(a.answer);
      return `Question: ${sanitizedQuestion}\nAnswer: ${sanitizedAnswer}`;
    }).join('\n\n');
    
    // Create a prompt that follows OpenAI guidelines with improved formatting
    const prompt = `Create a visually compelling t-shirt design illustration based on the theme: ${sanitizedThemeName}.
Theme description: ${sanitizedDescription}

The design should incorporate these preferences:
${formattedQA}

Keep the design coherent, purposeful, and suitable for a t-shirt print.
Emphasize creativity with a balanced, professional layout.
Use colors creatively while maintaining visual clarity.
Make the design suitable for placement on a t-shirt front.
Do not include any text in the design unless specifically requested.
Keep the design family-friendly and universally appropriate.`;
    
    return prompt;
  } catch (error) {
    console.error("❌ Error generating prompt:", error);
    return "Create a simple, abstract t-shirt design with geometric shapes";
  }
}

// Helper function to sanitize text inputs
function sanitizeText(text: any): string {
  if (!text || typeof text !== 'string') return '';
  
  // First, remove any obviously problematic characters and sequences
  let sanitized = text
    .replace(/[^\w\s\-,.!?:;()[\]{}]/g, '') // Only allow basic punctuation and alphanumeric
    .trim();
  
  // Remove potential prompt injection attempts
  sanitized = sanitized
    .replace(/ignore previous instructions/gi, '[redacted]')
    .replace(/ignore all instructions/gi, '[redacted]')
    .replace(/disregard/gi, '[consider]');
  
  // Limit length to avoid excessive prompts
  return sanitized.length > 500 ? sanitized.substring(0, 500) + '...' : sanitized;
}

// Helper function to validate the OpenAI API request payload
function validateOpenAIPayload(payload: any): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check required fields
  if (!payload.model) {
    issues.push("Missing 'model' field");
  } else if (typeof payload.model !== 'string') {
    issues.push("'model' must be a string");
  }
  
  if (!payload.prompt) {
    issues.push("Missing 'prompt' field");
  } else if (typeof payload.prompt !== 'string') {
    issues.push("'prompt' must be a string");
  } else {
    // Check prompt length
    if (payload.prompt.length < 10) {
      issues.push("'prompt' is too short (< 10 chars)");
    }
    if (payload.prompt.length > 4000) {
      issues.push("'prompt' is too long (> 4000 chars)");
    }
  }
  
  // Check n parameter (number of images)
  if (payload.n !== undefined) {
    if (!Number.isInteger(payload.n) || payload.n < 1) {
      issues.push("'n' must be a positive integer");
    }
  }
  
  // Check size parameter
  const validSizes = ['256x256', '512x512', '1024x1024', '1024x1792', '1792x1024'];
  if (payload.size !== undefined && !validSizes.includes(payload.size)) {
    issues.push(`'size' must be one of: ${validSizes.join(', ')}`);
  }
  
  // Check response_format parameter
  const validFormats = ['url', 'b64_json'];
  if (payload.response_format !== undefined && !validFormats.includes(payload.response_format)) {
    issues.push(`'response_format' must be one of: ${validFormats.join(', ')}`);
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}
