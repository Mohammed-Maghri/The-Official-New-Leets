interface RateLimitEntry {
  count: number;
  timestamps: number[];
  lastReset: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry>;
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60 * 60 * 1000, maxRequests: number = 1) {
    this.store = new Map();
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  check(identifier: string): { allowed: boolean; retryAfter?: number; current: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry) {
      this.store.set(identifier, {
        count: 1,
        timestamps: [now],
        lastReset: now,
      });
      return { allowed: true, current: 1 };
    }

    const validTimestamps = entry.timestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (validTimestamps.length < this.maxRequests) {
      validTimestamps.push(now);
      this.store.set(identifier, {
        count: validTimestamps.length,
        timestamps: validTimestamps,
        lastReset: entry.lastReset,
      });
      return { allowed: true, current: validTimestamps.length };
    }

    const oldestTimestamp = validTimestamps[0];
    const retryAfter = Math.ceil((oldestTimestamp + this.windowMs - now) / 1000);

    return {
      allowed: false,
      retryAfter,
      current: validTimestamps.length,
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.lastReset > this.windowMs * 2) {
        this.store.delete(key);
      }
    }
  }

  reset(identifier: string) {
    this.store.delete(identifier);
  }
}

export const feedbackRateLimiter = new RateLimiter(10 * 60 * 1000, 1);
