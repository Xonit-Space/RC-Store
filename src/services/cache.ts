type CacheItem<T> = {
  value: T
  expiresAt: number
}

// In-memory cache store (falls back to local memory if Redis is unconfigured)
const memoryCache = new Map<string, CacheItem<any>>()

export async function cacheSet<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
  const expiresAt = Date.now() + ttlSeconds * 1000
  memoryCache.set(key, { value, expiresAt })
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const item = memoryCache.get(key)
  if (!item) return null

  if (Date.now() > item.expiresAt) {
    memoryCache.delete(key)
    return null
  }

  return item.value as T
}

export async function cacheDelete(key: string): Promise<void> {
  memoryCache.delete(key)
}

/**
 * Enterprise Token-Bucket Rate Limiter:
 * Defends authentication actions and payment gates against spam.
 */
export class RateLimiter {
  private static buckets = new Map<string, { tokens: number; lastRefill: number }>()

  static isAllowed(
    key: string,
    limit = 10,       // Max bucket size
    refillRate = 1    // Tokens refilled per minute
  ): { allowed: boolean; remaining: number } {
    const now = Date.now()
    const bucket = this.buckets.get(key) || { tokens: limit, lastRefill: now }

    // Refill bucket based on time passed
    const elapsedMinutes = (now - bucket.lastRefill) / 60000
    const refillAmount = elapsedMinutes * refillRate
    const tokens = Math.min(limit, bucket.tokens + refillAmount)

    if (tokens >= 1) {
      this.buckets.set(key, { tokens: tokens - 1, lastRefill: now })
      return { allowed: true, remaining: Math.floor(tokens - 1) }
    }

    return { allowed: false, remaining: 0 }
  }
}
