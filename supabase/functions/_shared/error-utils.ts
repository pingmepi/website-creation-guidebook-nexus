import "jsr:@supabase/functions-js/edge-runtime.d.ts";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Standard CORS and Security headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Standard error response interface
export interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
  fallback?: boolean;
  placeholderImage?: boolean;
  imageUrl?: string;
}

// Standard success response interface
export interface SuccessResponse {
  success: boolean;
  [key: string]: unknown;
}

// Error types for better categorization
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  EXTERNAL_API = 'EXTERNAL_API_ERROR',
  DATABASE = 'DATABASE_ERROR',
  CONFIGURATION = 'CONFIGURATION_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  INTERNAL = 'INTERNAL_ERROR',
  NETWORK = 'NETWORK_ERROR'
}

// Custom error class with additional context
export class EdgeFunctionError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly retryable: boolean;

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    statusCode: number = 500,
    details?: unknown,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'EdgeFunctionError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.retryable = retryable;
  }
}

// Retry configuration interface
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

// Default retry configuration
export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
};

// Generic retry function with exponential backoff
export async function retryOperation<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  shouldRetry?: (error: Error) => boolean
): Promise<T> {
  const finalConfig = { ...defaultRetryConfig, ...config };
  let lastError: Error = new Error('Operation failed');
  let delay = finalConfig.initialDelay;

  for (let attempt = 1; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${attempt}/${finalConfig.maxRetries} failed:`, error);

      // Check if we should retry this error
      if (shouldRetry && !shouldRetry(error as Error)) {
        break;
      }

      // Don't retry on the last attempt
      if (attempt === finalConfig.maxRetries) {
        break;
      }

      // Wait before retrying
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Exponential backoff with max delay cap
      delay = Math.min(delay * finalConfig.backoffMultiplier, finalConfig.maxDelay);
    }
  }

  throw lastError;
}

// Helper function to determine if an error should be retried
export function shouldRetryError(error: Error & { status?: number }): boolean {
  // Retry on network errors, rate limits, and server errors
  if (error instanceof EdgeFunctionError) {
    return error.retryable;
  }

  // For HTTP errors, retry on 429 (rate limit) and 5xx (server errors)
  if (error.status) {
    return error.status === 429 || (error.status >= 500 && error.status < 600);
  }

  // For fetch errors, retry on network issues
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }

  return false;
}

// Response builder functions
export function createErrorResponse(
  error: string | EdgeFunctionError,
  statusCode?: number,
  details?: unknown
): Response {
  let errorData: ErrorResponse;
  let status: number;

  if (error instanceof EdgeFunctionError) {
    errorData = {
      error: error.message,
      code: error.type,
      details: (error.details || details) as string
    };
    status = error.statusCode;
  } else {
    errorData = {
      error: typeof error === 'string' ? error : 'Unknown error',
      details: details as string
    };
    status = statusCode || 500;
  }

  return new Response(
    JSON.stringify(errorData),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status
    }
  );
}

export function createSuccessResponse(data: unknown, statusCode: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: statusCode
    }
  );
}

export function createOptionsResponse(): Response {
  return new Response('ok', {
    headers: corsHeaders,
    status: 200
  });
}

// Input validation utilities
export function validateRequired(value: unknown, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throw new EdgeFunctionError(
      `${fieldName} is required`,
      ErrorType.VALIDATION,
      400
    );
  }
}

export function validateArray(value: unknown, fieldName: string, minLength: number = 1): void {
  if (!Array.isArray(value)) {
    throw new EdgeFunctionError(
      `${fieldName} must be an array`,
      ErrorType.VALIDATION,
      400
    );
  }
  if (value.length < minLength) {
    throw new EdgeFunctionError(
      `${fieldName} must contain at least ${minLength} item(s)`,
      ErrorType.VALIDATION,
      400
    );
  }
}

export function validateString(value: unknown, fieldName: string, minLength: number = 1): void {
  if (typeof value !== 'string') {
    throw new EdgeFunctionError(
      `${fieldName} must be a string`,
      ErrorType.VALIDATION,
      400
    );
  }
  if (value.length < minLength) {
    throw new EdgeFunctionError(
      `${fieldName} must be at least ${minLength} character(s) long`,
      ErrorType.VALIDATION,
      400
    );
  }
}

export function validateNumber(value: unknown, fieldName: string, min?: number, max?: number): void {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new EdgeFunctionError(
      `${fieldName} must be a valid number`,
      ErrorType.VALIDATION,
      400
    );
  }
  if (min !== undefined && value < min) {
    throw new EdgeFunctionError(
      `${fieldName} must be at least ${min}`,
      ErrorType.VALIDATION,
      400
    );
  }
  if (max !== undefined && value > max) {
    throw new EdgeFunctionError(
      `${fieldName} must be at most ${max}`,
      ErrorType.VALIDATION,
      400
    );
  }
}

// Environment variable validation
export function getRequiredEnvVar(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new EdgeFunctionError(
      `Missing required environment variable: ${name}`,
      ErrorType.CONFIGURATION,
      500
    );
  }
  return value;
}

export function getOptionalEnvVar(name: string, defaultValue: string = ''): string {
  return Deno.env.get(name) ?? defaultValue;
}

// JSON parsing with error handling
export async function parseJsonBody(req: Request): Promise<Record<string, unknown>> {
  try {
    return await req.json();
  } catch (error) {
    throw new EdgeFunctionError(
      'Invalid JSON in request body',
      ErrorType.VALIDATION,
      400,
      (error as Error).message
    );
  }
}

// Authentication helper
export async function getAuthenticatedUser(req: Request, supabaseClient: unknown): Promise<{ id: string; email?: string }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new EdgeFunctionError(
      'Missing Authorization header',
      ErrorType.AUTHENTICATION,
      401
    );
  }

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await (supabaseClient as any).auth.getUser(token);

  if (error || !data.user) {
    throw new EdgeFunctionError(
      'Invalid or expired token',
      ErrorType.AUTHENTICATION,
      401,
      error
    );
  }

  return data.user;
}

// Logging utilities with consistent formatting
export function logInfo(message: string, data?: unknown): void {
  console.log(`✅ ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

export function logError(message: string, error?: unknown): void {
  console.error(`❌ ${message}`, error);
}

export function logWarning(message: string, data?: unknown): void {
  console.warn(`⚠️ ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

export function logDebug(message: string, data?: unknown): void {
  console.log(`🔍 ${message}`, data ? JSON.stringify(data, null, 2) : '');
}
