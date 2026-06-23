import { LRUCache } from 'lru-cache';

// Basic memory rate limiter fallback
const rateLimitCache = new LRUCache<string, { count: number; lastReset: number }>({
  max: 5000,
  ttl: 60 * 1000, // 1 minute
});

export async function rateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60 * 1000
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const now = Date.now();
  let record = rateLimitCache.get(identifier);

  if (!record) {
    record = { count: 0, lastReset: now };
  }

  // If window has passed, reset count
  if (now - record.lastReset > windowMs) {
    record.count = 0;
    record.lastReset = now;
  }

  record.count += 1;
  rateLimitCache.set(identifier, record);

  const remaining = Math.max(0, limit - record.count);
  const reset = record.lastReset + windowMs;

  return {
    success: record.count <= limit,
    limit,
    remaining,
    reset,
  };
}
