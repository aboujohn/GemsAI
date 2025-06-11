#!/usr/bin/env node

/**
 * This script validates that all required environment variables are set before building the application.
 * It should be run as part of the build process.
 */

// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (error) {
  // Continue without .env.local if it doesn't exist or can't be read
}

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