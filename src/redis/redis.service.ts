import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '../config/config.service';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.redisEnabled;
    
    if (this.enabled) {
      this.initializeRedis();
    } else {
      this.logger.log('Redis is disabled - using fallback methods');
    }
  }

  private initializeRedis(): void {
    try {
      this.client = new Redis({
        host: this.configService.redisHost,
        port: this.configService.redisPort,
        password: this.configService.redisPassword,
        db: this.configService.redisDb,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
      });

      this.client.on('connect', () => {
        this.logger.log('Redis connected successfully');
      });

      this.client.on('error', (error) => {
        this.logger.error('Redis connection error:', error);
      });

      this.client.on('close', () => {
        this.logger.warn('Redis connection closed');
      });

    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error);
      this.client = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis connection closed');
    }
  }

  /**
   * Get a value from Redis cache
   * If Redis is disabled or unavailable, returns null
   */
  async get(key: string): Promise<string | null> {
    if (!this.enabled || !this.client) {
      return null;
    }

    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set a value in Redis cache
   * If Redis is disabled or unavailable, operation is silently skipped
   */
  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    if (!this.enabled || !this.client) {
      return false;
    }

    try {
      const actualTtl = ttl || this.configService.redisTtl;
      await this.client.setex(key, actualTtl, value);
      return true;
    } catch (error) {
      this.logger.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete a key from Redis cache
   * If Redis is disabled or unavailable, operation is silently skipped
   */
  async del(key: string): Promise<boolean> {
    if (!this.enabled || !this.client) {
      return false;
    }

    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      this.logger.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Check if Redis is enabled and connected
   */
  isAvailable(): boolean {
    return this.enabled && this.client !== null;
  }

  /**
   * Get the raw Redis client (for advanced operations)
   * Only use this when you need access to Redis-specific features
   */
  getClient(): Redis | null {
    return this.client;
  }

  /**
   * Clear all keys matching a pattern
   * If Redis is disabled or unavailable, operation is silently skipped
   */
  async clearPattern(pattern: string): Promise<number> {
    if (!this.enabled || !this.client) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        return await this.client.del(...keys);
      }
      return 0;
    } catch (error) {
      this.logger.error(`Redis clear pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Get multiple keys at once
   * If Redis is disabled or unavailable, returns empty array
   */
  async mget(keys: string[]): Promise<(string | null)[]> {
    if (!this.enabled || !this.client || keys.length === 0) {
      return new Array(keys.length).fill(null);
    }

    try {
      return await this.client.mget(...keys);
    } catch (error) {
      this.logger.error('Redis MGET error:', error);
      return new Array(keys.length).fill(null);
    }
  }

  /**
   * Set multiple key-value pairs at once
   * If Redis is disabled or unavailable, operation is silently skipped
   */
  async mset(pairs: Record<string, string>, ttl?: number): Promise<boolean> {
    if (!this.enabled || !this.client) {
      return false;
    }

    try {
      const pipeline = this.client.pipeline();
      const actualTtl = ttl || this.configService.redisTtl;
      
      Object.entries(pairs).forEach(([key, value]) => {
        pipeline.setex(key, actualTtl, value);
      });
      
      await pipeline.exec();
      return true;
    } catch (error) {
      this.logger.error('Redis MSET error:', error);
      return false;
    }
  }
} 