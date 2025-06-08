import { LRUCache } from 'lru-cache';

interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max unique tokens per interval
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface TokenData {
  count: number;
  reset: number;
}

// Create LRU cache for rate limiting
const cache = new LRUCache<string, TokenData>({
  max: 500, // Maximum number of unique tokens to track
  ttl: 60 * 1000, // 1 minute TTL
});

export function rateLimit(options: RateLimitOptions) {
  const { interval, uniqueTokenPerInterval } = options;

  return {
    async check(limit: number, token: string): Promise<RateLimitResult> {
      const now = Date.now();
      const windowStart = now - interval;
      const reset = now + interval;

      // Get or create token data
      let tokenData = cache.get(token);

      if (!tokenData || tokenData.reset <= now) {
        // Reset or create new token data
        tokenData = {
          count: 0,
          reset: reset,
        };
      }

      // Check if limit exceeded
      if (tokenData.count >= limit) {
        return {
          success: false,
          limit,
          remaining: 0,
          reset: tokenData.reset,
        };
      }

      // Increment count and update cache
      tokenData.count++;
      cache.set(token, tokenData);

      return {
        success: true,
        limit,
        remaining: limit - tokenData.count,
        reset: tokenData.reset,
      };
    },

    // Get current status without incrementing
    async status(token: string): Promise<{ count: number; reset: number }> {
      const tokenData = cache.get(token);
      const now = Date.now();

      if (!tokenData || tokenData.reset <= now) {
        return { count: 0, reset: now + interval };
      }

      return { count: tokenData.count, reset: tokenData.reset };
    },

    // Clear rate limit for a token
    async clear(token: string): Promise<void> {
      cache.delete(token);
    },

    // Get cache statistics
    getStats() {
      return {
        size: cache.size,
        maxSize: cache.max,
        ttl: cache.ttl,
      };
    },
  };
}

// Redis-based rate limiter for production
export class RedisRateLimit {
  private redis: any;
  private options: RateLimitOptions;

  constructor(redisClient: any, options: RateLimitOptions) {
    this.redis = redisClient;
    this.options = options;
  }

  async check(limit: number, token: string): Promise<RateLimitResult> {
    const now = Date.now();
    const key = `rate_limit:${token}`;
    const reset = now + this.options.interval;

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline();
      pipeline.get(key);
      pipeline.incr(key);
      pipeline.expire(key, Math.ceil(this.options.interval / 1000));

      const results = await pipeline.exec();
      const currentCount = parseInt(results[1][1]) || 1;

      if (currentCount > limit) {
        return {
          success: false,
          limit,
          remaining: 0,
          reset,
        };
      }

      return {
        success: true,
        limit,
        remaining: limit - currentCount,
        reset,
      };
    } catch (error) {
      console.error('Redis rate limit error:', error);
      // Fallback to allowing the request if Redis fails
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset,
      };
    }
  }

  async status(token: string): Promise<{ count: number; reset: number }> {
    const key = `rate_limit:${token}`;
    const now = Date.now();

    try {
      const count = await this.redis.get(key);
      const ttl = await this.redis.ttl(key);

      return {
        count: parseInt(count) || 0,
        reset: ttl > 0 ? now + ttl * 1000 : now + this.options.interval,
      };
    } catch (error) {
      console.error('Redis rate limit status error:', error);
      return { count: 0, reset: now + this.options.interval };
    }
  }

  async clear(token: string): Promise<void> {
    const key = `rate_limit:${token}`;
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis rate limit clear error:', error);
    }
  }
}

// Create rate limiter instance based on environment
export function createRateLimit(options: RateLimitOptions, redisClient?: any) {
  if (redisClient && process.env.NODE_ENV === 'production') {
    return new RedisRateLimit(redisClient, options);
  }

  return rateLimit(options);
}

// Predefined rate limiters for common use cases
export const emotionAnalysisLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export const apiLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 1000,
});

export const strictLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100,
});
