// Lightweight in-memory rate limiter for Supabase Edge Functions (per instance)
// Uses IP or user id from Authorization header when available

export interface RateLimitOptions {
  windowMs: number; // window size in ms
  max: number; // max requests per window
  keyPrefix?: string; // optional namespace
}

const buckets = new Map<string, { count: number; resetAt: number }>();

export function getClientKey(req: Request, keyPrefix = 'rl'): string {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
  return `${keyPrefix}:${ip}`;
}

export function isRateLimited(req: Request, opts: RateLimitOptions): { limited: boolean; retryAfter?: number } {
  const now = Date.now();
  const key = getClientKey(req, opts.keyPrefix);
  const entry = buckets.get(key);

  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { limited: false };
  }

  if (entry.count < opts.max) {
    entry.count += 1;
    return { limited: false };
  }

  const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
  return { limited: true, retryAfter };
}

export function rateLimitResponse(retryAfter?: number): Response {
  return new Response(
    JSON.stringify({ error: 'Too Many Requests', retryAfter }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter ?? 60),
        'Cache-Control': 'no-store',
      }
    }
  );
}

