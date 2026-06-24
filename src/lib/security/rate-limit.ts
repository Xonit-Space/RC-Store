import { LRUCache } from 'lru-cache';
import { redisClient } from '@/services/redis';

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
  const defaultReset = now + windowMs;

  if (redisClient) {
    const redisKey = `rate_limit:${identifier}`;
    
    // Atomic increment
    const current = await redisClient.incr(redisKey);
    
    // If it's the first request in the window, set the expiry
    if (current === 1) {
      await redisClient.pexpire(redisKey, windowMs);
    }
    
    const remaining = Math.max(0, limit - current);
    
    // Optional: Fetch exact TTL for the reset time
    const ttl = await redisClient.pttl(redisKey);
    const actualReset = ttl > 0 ? now + ttl : defaultReset;

    return {
      success: current <= limit,
      limit,
      remaining,
      reset: actualReset,
    };
  }

  // Fallback to LRU memory cache
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

  return {
    success: record.count <= limit,
    limit,
    remaining,
    reset: record.lastReset + windowMs,
  };
}
