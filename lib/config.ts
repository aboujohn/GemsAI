import { z } from 'zod';

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Supabase
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1),
  
  // AI Services
  OPENAI_API_KEY: z.string().min(1),
  ELEVENLABS_API_KEY: z.string().optional(),
  
  // AWS S3 and CloudFront
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET_NAME: z.string().optional(),
  AWS_CLOUDFRONT_DOMAIN: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  
  // Redis Configuration
  REDIS_URL: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  
  // Payment Processors
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  PAYPLUS_API_KEY: z.string().optional(),
  PAYPLUS_SECRET_KEY: z.string().optional(),
  PAYPLUS_WEBHOOK_SECRET: z.string().optional(),
  
  // Email Service
  EMAIL_SERVER: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  
  // Analytics and Monitoring
  SLACK_WEBHOOK_URL: z.string().optional(),
  
  // Feature Flags
  ENABLE_SOCIAL_LOGIN: z.string().transform((val) => val === 'true').default('false'),
  ENABLE_CUSTOM_JEWELRY: z.string().transform((val) => val === 'true').default('false'),
});

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
const clientSchema = z.object({
  // Application
  NEXT_PUBLIC_APP_URL: z.string().url(),
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  
  // Payment Processors
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_PAYPLUS_MERCHANT_ID: z.string().optional(),
  
  // Analytics and Monitoring
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  
  // Development Settings
  NEXT_PUBLIC_ENABLE_MOCKS: z.string().transform((val) => val === 'true').default('false'),
  NEXT_PUBLIC_DISABLE_ANALYTICS: z.string().transform((val) => val === 'true').default('false'),
  NEXT_PUBLIC_SHOW_DEV_TOOLS: z.string().transform((val) => val === 'true').default('false'),
  
  // API URLs
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_BACKEND_URL: z.string().url().optional(),
  
  // Feature Flags
  NEXT_PUBLIC_ENABLE_EXPERIMENTAL_FEATURES: z.string().transform((val) => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_DASHBOARD_ADMIN: z.string().transform((val) => val === 'true').default('false'),
  NEXT_PUBLIC_IMAGE_OPTIMIZATION: z.string().transform((val) => val === 'true').default('true'),
  NEXT_PUBLIC_CDN_ENABLED: z.string().transform((val) => val === 'true').default('true'),
  
  // Error Tracking
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js edge runtime,
 * so we need to destruct manually.
 *
 * @see https://github.com/vercel/next.js/issues/28774
 */
const processEnv = {
  // Server-side Environment Variables
  NODE_ENV: process.env.NODE_ENV,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  AWS_CLOUDFRONT_DOMAIN: process.env.AWS_CLOUDFRONT_DOMAIN,
  AWS_REGION: process.env.AWS_REGION,
  REDIS_URL: process.env.REDIS_URL,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  PAYPLUS_API_KEY: process.env.PAYPLUS_API_KEY,
  PAYPLUS_SECRET_KEY: process.env.PAYPLUS_SECRET_KEY,
  PAYPLUS_WEBHOOK_SECRET: process.env.PAYPLUS_WEBHOOK_SECRET,
  EMAIL_SERVER: process.env.EMAIL_SERVER,
  EMAIL_FROM: process.env.EMAIL_FROM,
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
  ENABLE_SOCIAL_LOGIN: process.env.ENABLE_SOCIAL_LOGIN,
  ENABLE_CUSTOM_JEWELRY: process.env.ENABLE_CUSTOM_JEWELRY,
  
  // Client-side Environment Variables
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_PAYPLUS_MERCHANT_ID: process.env.NEXT_PUBLIC_PAYPLUS_MERCHANT_ID,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  NEXT_PUBLIC_ENABLE_MOCKS: process.env.NEXT_PUBLIC_ENABLE_MOCKS,
  NEXT_PUBLIC_DISABLE_ANALYTICS: process.env.NEXT_PUBLIC_DISABLE_ANALYTICS,
  NEXT_PUBLIC_SHOW_DEV_TOOLS: process.env.NEXT_PUBLIC_SHOW_DEV_TOOLS,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  NEXT_PUBLIC_ENABLE_EXPERIMENTAL_FEATURES: process.env.NEXT_PUBLIC_ENABLE_EXPERIMENTAL_FEATURES,
  NEXT_PUBLIC_ENABLE_DASHBOARD_ADMIN: process.env.NEXT_PUBLIC_ENABLE_DASHBOARD_ADMIN,
  NEXT_PUBLIC_IMAGE_OPTIMIZATION: process.env.NEXT_PUBLIC_IMAGE_OPTIMIZATION,
  NEXT_PUBLIC_CDN_ENABLED: process.env.NEXT_PUBLIC_CDN_ENABLED,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
};

// Don't touch the part below
// --------------------------

const merged = serverSchema.merge(clientSchema);
/** @type z.infer<merged>
 *  @ts-ignore - can't type this properly in jsdoc */
let env = process.env;

// Temporarily disable env validation for development
if (!!process.env.SKIP_ENV_VALIDATION == false && process.env.NODE_ENV !== 'development') {
  const parsedEnv = merged.safeParse(processEnv);

  if (parsedEnv.success === false) {
    console.error(
      '❌ Invalid environment variables:',
      parsedEnv.error.flatten().fieldErrors
    );
    throw new Error('Invalid environment variables');
  }

  env = parsedEnv.data;
}

export const config = {
  app: {
    url: env.NEXT_PUBLIC_APP_URL,
    environment: env.NODE_ENV,
  },
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    jwtSecret: env.SUPABASE_JWT_SECRET,
  },
  ai: {
    openaiKey: env.OPENAI_API_KEY,
    elevenLabsKey: env.ELEVENLABS_API_KEY,
  },
  storage: {
    aws: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      s3BucketName: env.AWS_S3_BUCKET_NAME,
      cloudFrontDomain: env.AWS_CLOUDFRONT_DOMAIN,
      region: env.AWS_REGION,
    },
    redis: {
      url: env.REDIS_URL,
      password: env.REDIS_PASSWORD,
    },
  },
  payment: {
    stripe: {
      publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      secretKey: env.STRIPE_SECRET_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    },
    payplus: {
      merchantId: env.NEXT_PUBLIC_PAYPLUS_MERCHANT_ID,
      apiKey: env.PAYPLUS_API_KEY,
      secretKey: env.PAYPLUS_SECRET_KEY,
      webhookSecret: env.PAYPLUS_WEBHOOK_SECRET,
    },
  },
  email: {
    server: env.EMAIL_SERVER,
    from: env.EMAIL_FROM,
  },
  analytics: {
    posthog: {
      key: env.NEXT_PUBLIC_POSTHOG_KEY,
      host: env.NEXT_PUBLIC_POSTHOG_HOST,
      disabled: env.NEXT_PUBLIC_DISABLE_ANALYTICS,
    },
    slack: {
      webhookUrl: env.SLACK_WEBHOOK_URL,
    },
  },
  features: {
    enableSocialLogin: env.ENABLE_SOCIAL_LOGIN,
    enableCustomJewelry: env.ENABLE_CUSTOM_JEWELRY,
    enableExperimental: env.NEXT_PUBLIC_ENABLE_EXPERIMENTAL_FEATURES,
    enableDashboardAdmin: env.NEXT_PUBLIC_ENABLE_DASHBOARD_ADMIN,
    imageOptimization: env.NEXT_PUBLIC_IMAGE_OPTIMIZATION,
    cdnEnabled: env.NEXT_PUBLIC_CDN_ENABLED,
  },
  development: {
    enableMocks: env.NEXT_PUBLIC_ENABLE_MOCKS,
    showDevTools: env.NEXT_PUBLIC_SHOW_DEV_TOOLS,
  },
  api: {
    url: env.NEXT_PUBLIC_API_URL,
    backendUrl: env.NEXT_PUBLIC_BACKEND_URL,
  },
  sentry: {
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  },
} as const;

export type Config = typeof config;
