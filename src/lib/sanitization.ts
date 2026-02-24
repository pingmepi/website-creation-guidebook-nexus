// Minimal sanitization utilities for client-side safety
// NOTE: Keep lightweight and dependency-free per user's preference to avoid adding DOMPurify unless requested

// Strip HTML tags and risky characters from plain text inputs
export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') return '';
  const withoutTags = input.replace(/<[^>]*>/g, '');
  // Allow basic punctuation, letters, numbers and spaces; collapse whitespace
  const basic = withoutTags.replace(/[^A-Za-z0-9 .,!?;:'"()_/@#&%+\-[\]]+/g, ' ');
  return basic.trim().replace(/\s{2,}/g, ' ');
}

// Deep sanitize an object's string fields
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  const clone: any = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === 'string') {
      clone[key] = sanitizeText(value);
    } else if (value && typeof value === 'object') {
      clone[key] = sanitizeObject(value);
    } else {
      clone[key] = value;
    }
  }
  return clone as T;
}

// Validate an image data URL (PNG/JPEG/WebP) with size guard
export function isSafeImageDataUrl(dataUrl: unknown, maxBytes = 5 * 1024 * 1024): boolean {
  if (typeof dataUrl !== 'string') return false;
  if (!/^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/.test(dataUrl)) return false;
  try {
    const base64 = dataUrl.split(',')[1] || '';
    // Rough size estimate: 4/3 * base64 length
    const estimatedBytes = Math.floor((base64.length * 3) / 4);
    return estimatedBytes <= maxBytes;
  } catch {
    return false;
  }
}

// Sanitize an answers array (question/answer strings only)
export function sanitizeAnswers(answers: Array<{ question: string; answer: string }> = []) {
  return answers
    .filter(a => a && typeof a.question === 'string' && typeof a.answer === 'string')
    .map(a => ({
      question: sanitizeText(a.question),
      answer: sanitizeText(a.answer)
    }));
}

// Utility to JSON.stringify safely after sanitization
export function safeStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return '{}';
  }
}
