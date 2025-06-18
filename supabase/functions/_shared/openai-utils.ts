import { OpenAI } from 'npm:openai@4.29.1';
import { 
  EdgeFunctionError, 
  ErrorType, 
  retryOperation, 
  shouldRetryError,
  createErrorResponse,
  createSuccessResponse,
  logInfo,
  logError,
  logDebug,
  corsHeaders
} from './error-utils.ts';

// OpenAI error interface
export interface OpenAIError {
  status: number;
  type: string;
  code?: string | null;
  param?: string | null;
  message: string;
}

// OpenAI request validation
export interface OpenAIImageRequest {
  model: string;
  prompt: string;
  n?: number;
  size?: string;
  response_format?: string;
}

// Content safety filters
const PROHIBITED_CONTENT = [
  'explicit', 'sexual', 'violent', 'graphic', 'disturbing', 'harmful', 'illegal',
  'unethical', 'hateful', 'discriminatory', 'offensive'
];

// Valid OpenAI parameters
const VALID_MODELS = ['dall-e-2', 'dall-e-3'];
const VALID_SIZES = ['256x256', '512x512', '1024x1024', '1024x1792', '1792x1024'];
const VALID_FORMATS = ['url', 'b64_json'];

// OpenAI client factory
export function createOpenAIClient(apiKey: string, maxRetries: number = 3): OpenAI {
  return new OpenAI({
    apiKey,
    maxRetries
  });
}

// Validate OpenAI image generation request
export function validateOpenAIRequest(request: OpenAIImageRequest): void {
  // Validate model
  if (!request.model || !VALID_MODELS.includes(request.model)) {
    throw new EdgeFunctionError(
      `Invalid model. Must be one of: ${VALID_MODELS.join(', ')}`,
      ErrorType.VALIDATION,
      400
    );
  }

  // Validate prompt
  if (!request.prompt || typeof request.prompt !== 'string') {
    throw new EdgeFunctionError(
      'Prompt is required and must be a string',
      ErrorType.VALIDATION,
      400
    );
  }

  if (request.prompt.length < 10) {
    throw new EdgeFunctionError(
      'Prompt is too short (minimum 10 characters)',
      ErrorType.VALIDATION,
      400
    );
  }

  if (request.prompt.length > 4000) {
    throw new EdgeFunctionError(
      'Prompt is too long (maximum 4000 characters)',
      ErrorType.VALIDATION,
      400
    );
  }

  // Validate n parameter
  if (request.n !== undefined && (!Number.isInteger(request.n) || request.n < 1)) {
    throw new EdgeFunctionError(
      'Number of images (n) must be a positive integer',
      ErrorType.VALIDATION,
      400
    );
  }

  // Validate size
  if (request.size && !VALID_SIZES.includes(request.size)) {
    throw new EdgeFunctionError(
      `Invalid size. Must be one of: ${VALID_SIZES.join(', ')}`,
      ErrorType.VALIDATION,
      400
    );
  }

  // Validate response format
  if (request.response_format && !VALID_FORMATS.includes(request.response_format)) {
    throw new EdgeFunctionError(
      `Invalid response format. Must be one of: ${VALID_FORMATS.join(', ')}`,
      ErrorType.VALIDATION,
      400
    );
  }
}

// Check for prohibited content in prompt
export function validatePromptContent(prompt: string): void {
  const lowerPrompt = prompt.toLowerCase();
  const foundProhibited = PROHIBITED_CONTENT.find(term => lowerPrompt.includes(term));
  
  if (foundProhibited) {
    throw new EdgeFunctionError(
      'Prompt contains prohibited content',
      ErrorType.VALIDATION,
      400,
      { prohibitedTerm: foundProhibited }
    );
  }
}

// Sanitize text input for prompts
export function sanitizePromptText(text: any): string {
  if (!text || typeof text !== 'string') return '';
  
  // Remove potentially problematic characters
  let sanitized = text
    .replace(/[^\w\s\-,.!?:;()[\]{}]/g, '') // Only allow basic punctuation and alphanumeric
    .trim();
  
  // Remove potential prompt injection attempts
  sanitized = sanitized
    .replace(/ignore previous instructions/gi, '[redacted]')
    .replace(/ignore all instructions/gi, '[redacted]')
    .replace(/disregard/gi, '[consider]');
  
  // Limit length
  return sanitized.length > 500 ? sanitized.substring(0, 500) + '...' : sanitized;
}

// Generate image with OpenAI with comprehensive error handling
export async function generateImageWithRetry(
  client: OpenAI,
  request: OpenAIImageRequest
): Promise<any> {
  // Validate request before making API call
  validateOpenAIRequest(request);
  validatePromptContent(request.prompt);

  logDebug('OpenAI Request', {
    ...request,
    prompt: request.prompt.substring(0, 100) + '...' // Truncate for logging
  });

  const startTime = Date.now();
  
  try {
    const response = await retryOperation(
      () => client.images.generate(request),
      { maxRetries: 3, initialDelay: 1000 },
      (error) => {
        const openaiError = error as OpenAIError;
        // Only retry on rate limits or server errors
        return openaiError.status === 429 || (openaiError.status >= 500 && openaiError.status < 600);
      }
    );

    const duration = Date.now() - startTime;
    logInfo(`Image generation completed in ${duration}ms`);

    return response;
  } catch (error) {
    const openaiError = error as OpenAIError;
    logError('OpenAI API Error', {
      status: openaiError.status,
      type: openaiError.type,
      code: openaiError.code,
      message: openaiError.message
    });

    // Convert OpenAI errors to our standard error format
    throw convertOpenAIError(openaiError);
  }
}

// Convert OpenAI errors to EdgeFunctionError
export function convertOpenAIError(error: OpenAIError): EdgeFunctionError {
  let errorType = ErrorType.EXTERNAL_API;
  let retryable = false;
  let userMessage = 'Image generation failed';

  switch (error.type) {
    case 'invalid_request_error':
      errorType = ErrorType.VALIDATION;
      userMessage = 'Invalid request parameters';
      break;
    case 'rate_limit_exceeded':
      errorType = ErrorType.RATE_LIMIT;
      userMessage = 'Image generation service is currently busy, please try again later';
      retryable = true;
      break;
    case 'insufficient_quota':
      errorType = ErrorType.CONFIGURATION;
      userMessage = 'Image generation service is currently unavailable';
      break;
    default:
      userMessage = 'Image generation service error';
  }

  // Check for specific error codes
  if (error.code === 'content_policy_violation') {
    errorType = ErrorType.VALIDATION;
    userMessage = 'Content violates policy guidelines';
  }

  return new EdgeFunctionError(
    userMessage,
    errorType,
    error.status || 500,
    {
      originalError: error.message,
      code: error.code,
      param: error.param
    },
    retryable
  );
}

// Fallback image generation with simpler prompt
export async function generateFallbackImage(apiKey: string): Promise<Response> {
  logInfo('Attempting fallback image generation');
  
  try {
    const client = createOpenAIClient(apiKey, 0); // No retries for fallback
    
    const fallbackRequest: OpenAIImageRequest = {
      model: 'dall-e-2',
      prompt: 'A simple geometric pattern suitable for a t-shirt with blue and white colors',
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json'
    };

    const response = await client.images.generate(fallbackRequest);
    const imageBase64 = response.data[0]?.b64_json;

    if (imageBase64) {
      logInfo('Fallback image generation succeeded');
      return createSuccessResponse({
        imageUrl: `data:image/png;base64,${imageBase64}`,
        prompt: fallbackRequest.prompt,
        fallback: true
      });
    }

    throw new Error('No image data in fallback response');
  } catch (error) {
    logError('Fallback image generation failed', error);
    
    // Return static placeholder as final fallback
    return createSuccessResponse({
      error: 'Image generation service unavailable',
      fallback: true,
      placeholderImage: true,
      imageUrl: '/assets/images/design/placeholder.svg'
    });
  }
}

// Extract and validate image data from OpenAI response
export function extractImageData(response: any): { imageBase64?: string; imageUrl?: string } {
  const imageData = response.data?.[0];
  const imageBase64 = imageData?.b64_json;
  const imageUrl = imageData?.url;

  if (!imageBase64 && !imageUrl) {
    throw new EdgeFunctionError(
      'No image data returned from API',
      ErrorType.EXTERNAL_API,
      500,
      { responseData: response.data }
    );
  }

  return { imageBase64, imageUrl };
}
