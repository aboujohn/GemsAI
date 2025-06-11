import * as Joi from 'joi';

export interface EnvironmentVariables {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRATION_TIME: string;
  CORS_ORIGIN: string;
  // AWS Configuration
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION: string;
  AWS_S3_BUCKET_SKETCHES: string;
  AWS_S3_BUCKET_PRODUCTS: string;
  AWS_S3_BUCKET_USER_UPLOADS: string;
  AWS_S3_BUCKET_GIFTS: string;
  AWS_CLOUDFRONT_DOMAIN?: string;
  // Redis Configuration
  REDIS_ENABLED?: boolean;
  REDIS_HOST?: string;
  REDIS_PORT?: number;
  REDIS_PASSWORD?: string;
  REDIS_DB?: number;
  REDIS_TTL?: number;
  // AI Services Configuration
  OPENAI_API_KEY?: string;
  ELEVENLABS_API_KEY?: string;
}

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION_TIME: Joi.string().default('1d'),
  CORS_ORIGIN: Joi.string().default('*'),
  // AWS S3 and CloudFront configuration
  AWS_ACCESS_KEY_ID: Joi.string().optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
  AWS_REGION: Joi.string().default('us-east-1'),
  AWS_S3_BUCKET_SKETCHES: Joi.string().required(),
  AWS_S3_BUCKET_PRODUCTS: Joi.string().required(),
  AWS_S3_BUCKET_USER_UPLOADS: Joi.string().required(),
  AWS_S3_BUCKET_GIFTS: Joi.string().required(),
  AWS_CLOUDFRONT_DOMAIN: Joi.string().optional(),
  // Redis Configuration
  REDIS_ENABLED: Joi.boolean().default(false),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional(),
  REDIS_DB: Joi.number().default(0),
  REDIS_TTL: Joi.number().default(3600), // 1 hour default
  // AI Services Configuration
  OPENAI_API_KEY: Joi.string().optional(),
  ELEVENLABS_API_KEY: Joi.string().optional(),
  // Add other environment variables as needed for the application
}); 