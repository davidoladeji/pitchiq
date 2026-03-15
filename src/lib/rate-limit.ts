// Simple in-memory rate limiter using sliding window
const rateMap = new Map<string, { count: number; resetAt: number }>();

// Clean up stale entries periodically
setInterval(() => {
  const now = Date.now();
  rateMap.forEach((val, key) => {
    if (val.resetAt < now) rateMap.delete(key);
  });
}, 60_000);

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  { maxRequests, windowMs }: { maxRequests: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || entry.resetAt < now) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { success: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}
