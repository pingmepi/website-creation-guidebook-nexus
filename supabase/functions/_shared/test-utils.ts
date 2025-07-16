import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Test utilities for Edge Functions
export function createMockRequest(
  method: string = 'POST',
  body?: unknown,
  headers?: Record<string, string>
): Request {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token',
    ...headers
  };

  return new Request('http://localhost:8000/test', {
    method,
    headers: defaultHeaders,
    body: body ? JSON.stringify(body) : undefined
  });
}

export function createMockEnv(vars: Record<string, string>): void {
  // Mock Deno.env.get for testing
  const originalGet = Deno.env.get;
  Deno.env.get = (key: string) => vars[key] || originalGet(key);
}

export async function testErrorHandling() {
  console.log('🧪 Testing error handling utilities...');
  
  try {
    // Test imports
    const { EdgeFunctionError, ErrorType, createErrorResponse } = await import('./error-utils.ts');
    
    // Test EdgeFunctionError creation
    const error = new EdgeFunctionError(
      'Test error',
      ErrorType.VALIDATION,
      400,
      { test: 'data' },
      false
    );
    
    console.log('✅ EdgeFunctionError created successfully');
    
    // Test error response creation
    const response = createErrorResponse(error);
    const responseData = await response.json();
    
    console.log('✅ Error response created successfully:', responseData);
    
    return true;
  } catch (error) {
    console.error('❌ Error handling test failed:', error);
    return false;
  }
}

export async function testOpenAIUtils() {
  console.log('🧪 Testing OpenAI utilities...');
  
  try {
    // Test imports
    const { validateOpenAIRequest, sanitizePromptText } = await import('./openai-utils.ts');
    
    // Test prompt sanitization
    const sanitized = sanitizePromptText('Test prompt with <script>alert("xss")</script>');
    console.log('✅ Prompt sanitization works:', sanitized);
    
    // Test request validation
    try {
      validateOpenAIRequest({
        model: 'dall-e-3',
        prompt: 'Test prompt',
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json'
      });
      console.log('✅ Valid OpenAI request validation passed');
    } catch (validationError) {
      console.error('❌ Valid request validation failed:', validationError);
      return false;
    }
    
    // Test invalid request validation
    try {
      validateOpenAIRequest({
        model: 'invalid-model',
        prompt: '',
        n: -1
      });
      console.error('❌ Invalid request validation should have failed');
      return false;
    } catch (validationError) {
      console.log('✅ Invalid request validation correctly failed');
    }
    
    return true;
  } catch (error) {
    console.error('❌ OpenAI utils test failed:', error);
    return false;
  }
}

export async function runAllTests() {
  console.log('🚀 Running Edge Function utility tests...');
  
  const results = await Promise.all([
    testErrorHandling(),
    testOpenAIUtils()
  ]);
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('✅ All tests passed! Error handling utilities are working correctly.');
  } else {
    console.log('❌ Some tests failed. Please check the error handling utilities.');
  }
  
  return passed === total;
}

// Export test runner for direct execution
if (import.meta.main) {
  runAllTests();
}
