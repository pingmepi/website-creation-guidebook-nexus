import { createClient } from '@supabase/supabase-js';
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Import shared utilities
import {
  EdgeFunctionError,
  ErrorType,
  createErrorResponse,
  createSuccessResponse,
  createOptionsResponse,
  parseJsonBody,
  validateRequired,
  validateArray,
  getRequiredEnvVar,
  logInfo,
  logError,
  logDebug
} from '../_shared/error-utils.ts';

import {
  createOpenAIClient,
  generateImageWithRetry,
  generateFallbackImage,
  extractImageData,
  sanitizePromptText,
  OpenAIImageRequest
} from '../_shared/openai-utils.ts';

// Type declaration for Deno global
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

// Start Edge Function
Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return createOptionsResponse();
  }

  logInfo("Function invoked");

  try {
    // Parse JSON safely
    const body = await parseJsonBody(req);
    logDebug("Request Payload", body);

    const { theme, answers, userId } = body as {
      theme: { id: string | number; name?: string };
      answers: Array<{ question: string; answer: string }>;
      userId?: string
    };

    // Validate required parameters
    validateRequired(theme, 'theme');
    validateRequired(answers, 'answers');
    validateArray(answers, 'answers');

    // Get OpenAI API Key
    const openaiApiKey = getRequiredEnvVar('OPEN_AI_API_KEY');

    // Validate answers input more thoroughly
    const validAnswers = answers.filter((answer) =>
      answer && typeof answer.question === 'string' && typeof answer.answer === 'string'
    );

    if (validAnswers.length === 0) {
      throw new EdgeFunctionError(
        'No valid answers provided',
        ErrorType.VALIDATION,
        400,
        { answers }
      );
    }

    // Generate enhanced prompt using the template
    const prompt = generatePrompt(theme, validAnswers);
    logDebug("Generated Prompt", { prompt, length: prompt.length });

    // Enhanced prompt validation
    if (!prompt || prompt.length < 10) {
      throw new EdgeFunctionError(
        'Failed to generate a valid prompt',
        ErrorType.INTERNAL,
        500,
        { prompt }
      );
    }

    try {
      // Create OpenAI client
      const openai = createOpenAIClient(openaiApiKey);

      logInfo("Generating image with AI");

      // Prepare the API request payload
      const imageGenRequest: OpenAIImageRequest = {
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
      };

      // Generate image with comprehensive error handling and retry logic
      const response = await generateImageWithRetry(openai, imageGenRequest);

      logInfo("Image generation successful");
      logDebug("Response data", { imageCount: response.data?.length || 0 });

      // Extract and validate image data
      const { imageBase64 } = extractImageData(response);

      // Save to DB if userId is provided
      if (userId) {
        try {
          const supabaseUrl = getRequiredEnvVar('SUPABASE_URL');
          const supabaseKey = getRequiredEnvVar('SUPABASE_SERVICE_ROLE_KEY');

          const supabase = createClient(supabaseUrl, supabaseKey);
          
          // Convert theme.id to proper UUID format if it's a number
          let themeId: string | null = null;
          if (theme.id) {
            if (typeof theme.id === 'number') {
              // Map numeric theme IDs to UUIDs - this would need proper mapping
              themeId = null; // Skip theme_id for now if it's numeric
            } else if (typeof theme.id === 'string' && theme.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
              themeId = theme.id;
            }
          }
          
          const sanitize = (s: string) => s.replace(/<[^>]*>/g, '').trim();
          const { error } = await supabase.from('ai_generated_designs').insert({
            user_id: userId,
            design_image: `data:image/png;base64,${imageBase64}`,
            prompt: sanitize(prompt),
            theme_id: themeId,
            is_favorite: false
          });

          if (error) {
            logError("Database insert error", error);
          } else {
            logInfo("Design saved to database");
          }
        } catch (dbError) {
          logError("Database operation failed", dbError);
          // Don't fail the request if DB save fails
        }
      }

      // Return the generated image
      return createSuccessResponse({
        imageUrl: `data:image/png;base64,${imageBase64}`,
        prompt
      });

    } catch (apiError) {
      logError("OpenAI API Error", apiError);

      // Check if it's a validation error that might benefit from fallback
      if (apiError instanceof EdgeFunctionError &&
          apiError.type === ErrorType.VALIDATION &&
          apiError.statusCode === 400) {
        logInfo("Attempting fallback due to validation error");
        return await generateFallbackImage(openaiApiKey);
      }

      // For other errors, re-throw to be handled by outer catch
      throw apiError;
    }

  } catch (err) {
    logError("Function error", err);

    // Handle our custom errors
    if (err instanceof EdgeFunctionError) {
      return createErrorResponse(err);
    }

    // Handle unknown errors
    return createErrorResponse(
      'Internal Server Error',
      500,
      err.message
    );
  }
});

// Enhanced prompt generator with validation and sanitization
function generatePrompt(theme: { name?: string; description?: string }, answers: Array<{ question: string; answer: string }>): string {
  try {
    // Format theme information
    const themeName = theme.name || 'Unknown Theme';
    const themeDescription = theme.description || 'No description available';

    // Sanitize theme information
    const sanitizedThemeName = sanitizePromptText(themeName);
    const sanitizedDescription = sanitizePromptText(themeDescription);

    // Format Q&A section with sanitization
    const formattedQA = answers.map(a => {
      const sanitizedQuestion = sanitizePromptText(a.question);
      const sanitizedAnswer = sanitizePromptText(a.answer);
      return `Question: ${sanitizedQuestion}\nAnswer: ${sanitizedAnswer}`;
    }).join('\n\n');

    // Create a prompt that follows OpenAI guidelines
    const prompt = `Create a flat, high-resolution illustration for print influenced by  
    Themes: ${sanitizedThemeName} and 
    Theme description: ${sanitizedDescription}

The design should incorporate these preferences:
${formattedQA}

Requirements:
- Show ONLY the design artwork, without any additional elements or text.
- DO NOT include any t-shirt, clothing, model, or mockup.
- Isolate the design on a plain white background.
- Avoid 3D, shadows, or folds.
- Use a clean, vector-style design suitable for printing.
- No text unless explicitly requested.
- Ensure the design is centered and balanced.
`;

    return prompt;
  } catch (error) {
    logError("Error generating prompt", error);
    return "Create a simple, abstract t-shirt design with geometric shapes";
  }
}


