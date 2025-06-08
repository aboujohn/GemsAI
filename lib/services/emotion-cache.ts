import { EmotionAnalysisResult, EmotionAnalysisRequest } from './openai';
import { createHash } from 'crypto';

// In-memory cache for development (in production, use Redis)
const cache = new Map<string, CacheEntry>();

interface CacheEntry {
  result: EmotionAnalysisResult;
  timestamp: number;
  expiresAt: number;
}

// Cache configuration
const CACHE_CONFIG = {
  // Cache TTL in milliseconds (6 hours)
  TTL: 6 * 60 * 60 * 1000,
  // Maximum cache size (number of entries)
  MAX_SIZE: 1000,
  // Cleanup interval (1 hour)
  CLEANUP_INTERVAL: 60 * 60 * 1000,
};

/**
 * Generate cache key from analysis request
 */
function generateCacheKey(request: EmotionAnalysisRequest): string {
  const { text, language = 'he', culturalContext = '' } = request;

  // Create a hash of the normalized text and parameters
  const normalizedText = text.trim().toLowerCase();
  const keyData = `${normalizedText}|${language}|${culturalContext}`;

  return createHash('sha256').update(keyData).digest('hex');
}

/**
 * Get cached emotion analysis result
 */
export function getCachedEmotionAnalysis(
  request: EmotionAnalysisRequest
): EmotionAnalysisResult | null {
  const key = generateCacheKey(request);
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  // Check if entry has expired
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.result;
}

/**
 * Cache emotion analysis result
 */
export function setCachedEmotionAnalysis(
  request: EmotionAnalysisRequest,
  result: EmotionAnalysisResult
): void {
  const key = generateCacheKey(request);
  const now = Date.now();

  const entry: CacheEntry = {
    result,
    timestamp: now,
    expiresAt: now + CACHE_CONFIG.TTL,
  };

  // Check cache size and cleanup if necessary
  if (cache.size >= CACHE_CONFIG.MAX_SIZE) {
    cleanupExpiredEntries();

    // If still at max size, remove oldest entries
    if (cache.size >= CACHE_CONFIG.MAX_SIZE) {
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      // Remove oldest 10% of entries
      const toRemove = Math.floor(entries.length * 0.1);
      for (let i = 0; i < toRemove; i++) {
        cache.delete(entries[i][0]);
      }
    }
  }

  cache.set(key, entry);
}

/**
 * Clean up expired cache entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const expiredKeys: string[] = [];

  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) {
      expiredKeys.push(key);
    }
  }

  expiredKeys.forEach(key => cache.delete(key));
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;

  for (const entry of cache.values()) {
    if (now > entry.expiresAt) {
      expiredEntries++;
    } else {
      validEntries++;
    }
  }

  return {
    totalEntries: cache.size,
    validEntries,
    expiredEntries,
    maxSize: CACHE_CONFIG.MAX_SIZE,
    ttlHours: CACHE_CONFIG.TTL / (60 * 60 * 1000),
  };
}

/**
 * Clear all cached entries
 */
export function clearEmotionCache(): void {
  cache.clear();
}

/**
 * Clear expired entries manually
 */
export function cleanupCache(): void {
  cleanupExpiredEntries();
}

// Set up automatic cleanup interval
if (typeof window === 'undefined') {
  // Only run cleanup in server environment
  setInterval(cleanupExpiredEntries, CACHE_CONFIG.CLEANUP_INTERVAL);
}

// Redis-based cache implementation for production
export class RedisEmotionCache {
  private redis: any; // Redis client type

  constructor(redisClient: any) {
    this.redis = redisClient;
  }

  async get(request: EmotionAnalysisRequest): Promise<EmotionAnalysisResult | null> {
    try {
      const key = `emotion:${generateCacheKey(request)}`;
      const cached = await this.redis.get(key);

      if (!cached) {
        return null;
      }

      return JSON.parse(cached) as EmotionAnalysisResult;
    } catch (error) {
      console.error('Redis cache get error:', error);
      return null;
    }
  }

  async set(request: EmotionAnalysisRequest, result: EmotionAnalysisResult): Promise<void> {
    try {
      const key = `emotion:${generateCacheKey(request)}`;
      const ttlSeconds = Math.floor(CACHE_CONFIG.TTL / 1000);

      await this.redis.setex(key, ttlSeconds, JSON.stringify(result));
    } catch (error) {
      console.error('Redis cache set error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.redis.keys('emotion:*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Redis cache clear error:', error);
    }
  }

  async getStats(): Promise<any> {
    try {
      const keys = await this.redis.keys('emotion:*');
      return {
        totalEntries: keys.length,
        ttlHours: CACHE_CONFIG.TTL / (60 * 60 * 1000),
      };
    } catch (error) {
      console.error('Redis cache stats error:', error);
      return { totalEntries: 0, ttlHours: 0 };
    }
  }
}

/**
 * Create appropriate cache instance based on environment
 */
export function createEmotionCache(redisClient?: any) {
  if (redisClient && process.env.NODE_ENV === 'production') {
    return new RedisEmotionCache(redisClient);
  }

  // Return in-memory cache interface for development
  return {
    async get(request: EmotionAnalysisRequest) {
      return getCachedEmotionAnalysis(request);
    },
    async set(request: EmotionAnalysisRequest, result: EmotionAnalysisResult) {
      setCachedEmotionAnalysis(request, result);
    },
    async clear() {
      clearEmotionCache();
    },
    async getStats() {
      return getCacheStats();
    },
  };
}
