#!/usr/bin/env node

/**
 * This script validates that all required environment variables are set before building the application.
 * It should be run as part of the build process.
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_JWT_SECRET',
  'OPENAI_API_KEY',
];

const missingEnvVars = requiredEnvVars.filter((envVar) => {
  const value = process.env[envVar];
  return !value || value.trim() === '';
});

if (missingEnvVars.length > 0) {
  console.error('❌ Error: Missing required environment variables:');
  missingEnvVars.forEach((envVar) => {
    console.error(`  - ${envVar}`);
  });
  console.error('\nPlease set these variables in your .env file or environment.');
  console.error('See ENV_SETUP.md for more information.');
  process.exit(1);
}

console.log('✅ All required environment variables are set.');
process.exit(0); 