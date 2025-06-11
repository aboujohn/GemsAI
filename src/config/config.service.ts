import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './env/env.validation';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService<EnvironmentVariables, true>) {}

  get nodeEnv(): string {
    return this.configService.get('NODE_ENV', { infer: true });
  }

  get port(): number {
    return this.configService.get('PORT', { infer: true });
  }

  get databaseUrl(): string {
    return this.configService.get('DATABASE_URL', { infer: true });
  }

  get jwtSecret(): string {
    return this.configService.get('JWT_SECRET', { infer: true });
  }

  get jwtExpirationTime(): string {
    return this.configService.get('JWT_EXPIRATION_TIME', { infer: true });
  }

  get corsOrigin(): string {
    return this.configService.get('CORS_ORIGIN', { infer: true });
  }

  // AWS Configuration
  get awsAccessKeyId(): string | undefined {
    return this.configService.get('AWS_ACCESS_KEY_ID', { infer: true });
  }

  get awsSecretAccessKey(): string | undefined {
    return this.configService.get('AWS_SECRET_ACCESS_KEY', { infer: true });
  }

  get awsRegion(): string {
    return this.configService.get('AWS_REGION', { infer: true });
  }

  get awsS3BucketSketches(): string {
    return this.configService.get('AWS_S3_BUCKET_SKETCHES', { infer: true });
  }

  get awsS3BucketProducts(): string {
    return this.configService.get('AWS_S3_BUCKET_PRODUCTS', { infer: true });
  }

  get awsS3BucketUserUploads(): string {
    return this.configService.get('AWS_S3_BUCKET_USER_UPLOADS', { infer: true });
  }

  get awsS3BucketGifts(): string {
    return this.configService.get('AWS_S3_BUCKET_GIFTS', { infer: true });
  }

  get awsCloudFrontDomain(): string | undefined {
    return this.configService.get('AWS_CLOUDFRONT_DOMAIN', { infer: true });
  }

  // Redis Configuration
  get redisEnabled(): boolean {
    return this.configService.get('REDIS_ENABLED', { infer: true }) ?? false;
  }

  get redisHost(): string {
    return this.configService.get('REDIS_HOST', { infer: true }) ?? 'localhost';
  }

  get redisPort(): number {
    return this.configService.get('REDIS_PORT', { infer: true }) ?? 6379;
  }

  get redisPassword(): string | undefined {
    return this.configService.get('REDIS_PASSWORD', { infer: true });
  }

  get redisDb(): number {
    return this.configService.get('REDIS_DB', { infer: true }) ?? 0;
  }

  get redisTtl(): number {
    return this.configService.get('REDIS_TTL', { infer: true }) ?? 3600;
  }

  // AI Services Configuration
  get openAiApiKey(): string | undefined {
    return this.configService.get('OPENAI_API_KEY', { infer: true });
  }

  get elevenLabsApiKey(): string | undefined {
    return this.configService.get('ELEVENLABS_API_KEY', { infer: true });
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }
}
