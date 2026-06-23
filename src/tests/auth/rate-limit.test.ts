import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { rateLimit } from '@/lib/security/rate-limit';

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow requests below the limit', async () => {
    const result = await rateLimit('test-user-1', 5, 60000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('should block requests above the limit', async () => {
    // Consume all tokens
    for (let i = 0; i < 5; i++) {
      await rateLimit('test-user-2', 5, 60000);
    }
    
    // This one should fail
    const result = await rateLimit('test-user-2', 5, 60000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should reset limits after the window expires', async () => {
    await rateLimit('test-user-3', 1, 60000);
    
    let result = await rateLimit('test-user-3', 1, 60000);
    expect(result.success).toBe(false); // Blocked

    // Advance time past the 60s window
    vi.advanceTimersByTime(61000);

    result = await rateLimit('test-user-3', 1, 60000);
    expect(result.success).toBe(true); // Allowed again
  });
});
