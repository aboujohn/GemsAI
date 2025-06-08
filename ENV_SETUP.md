# Environment Variables Setup

## Overview

GemsAI requires various environment variables for configuration. This document explains how to set up the environment variables for development and production environments.

## Setting Up Environment Variables

1. Copy the appropriate template file to create your environment file:
   - For local development: Copy `env-template.txt` to `.env.local`
   - For development environment: Copy `env-development.txt` to `.env.development`
   - For production environment: Copy `env-production.txt` to `.env.production`

2. Fill in the required values in your environment files.

## Required Environment Variables

### Supabase Configuration

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
```

These variables are required for authentication and database access. You can find these values in your Supabase project dashboard.

### AI Services

```
OPENAI_API_KEY=your-openai-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

These keys are required for AI features like story processing, emotion detection, assistant conversation, and text-to-speech.

### AWS S3 and CloudFront

```
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET_NAME=your-s3-bucket-name
AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain
AWS_REGION=us-east-1
```

These variables are required for media storage and CDN delivery.

### Payment Processors

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

NEXT_PUBLIC_PAYPLUS_MERCHANT_ID=your-payplus-merchant-id
PAYPLUS_API_KEY=your-payplus-api-key
PAYPLUS_SECRET_KEY=your-payplus-secret-key
PAYPLUS_WEBHOOK_SECRET=your-payplus-webhook-secret
```

These variables are required for payment processing.

## Environment-Specific Variables

Some variables have different values depending on the environment:

### Development Environment

```
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEBUG=true
NEXT_PUBLIC_ENABLE_MOCKS=true
```

### Production Environment

```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://gemsai.com
DEBUG=false
NEXT_PUBLIC_ENABLE_MOCKS=false
```

## Security Notes

- Never commit `.env.*` files to the repository.
- Store production secrets securely and use a secure method to deploy them.
- Rotate API keys regularly, especially for production environments.
- Use environment-specific API keys for different environments. 