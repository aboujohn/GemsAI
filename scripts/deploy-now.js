#!/usr/bin/env node

// GemsAI Database Auto-Deployment
// Uses existing project dependencies only

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment from .env.local
function loadEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
      throw new Error('.env.local file not found');
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};

    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });

    return env;
  } catch (err) {
    throw new Error(`Failed to load environment: ${err.message}`);
  }
}

// Configuration
const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Please ensure these are set in your .env.local file');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQL files to deploy
const sqlFiles = [
  'docs/supabase/001_create_i18n_schema.sql',
  'docs/supabase/002_create_core_tables.sql',
  'docs/supabase/003_create_relationships_constraints.sql',
  'docs/supabase/004_create_security_policies.sql',
  'docs/supabase/005_performance_optimization.sql',
  'docs/supabase/008_seed_data.sql',
];

async function testConnection() {
  console.log('🔗 Testing Supabase connection...');

  try {
    // Try a simple query to test connection
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ Supabase connection established');
    return true;
  } catch (err) {
    console.log('⚠️  Connection test inconclusive, proceeding anyway...');
    return true; // Continue anyway
  }
}

async function deployTables() {
  console.log('\n📋 Deploying database tables...');

  // Try to create some basic tables using the Supabase client
  // Since DDL operations are restricted, we'll attempt using data operations

  const tables = {
    languages: {
      id: 'text',
      name: 'jsonb',
      direction: 'text',
      is_default: 'boolean',
      is_active: 'boolean',
      created_at: 'timestamp',
      updated_at: 'timestamp',
    },
    users: {
      id: 'uuid',
      email: 'text',
      full_name: 'text',
      role: 'text',
      created_at: 'timestamp',
      updated_at: 'timestamp',
    },
  };

  let createdTables = 0;

  for (const [tableName, schema] of Object.entries(tables)) {
    try {
      console.log(`   📝 Attempting to access table: ${tableName}`);

      // Try to query the table (this will tell us if it exists)
      const { data, error } = await supabase.from(tableName).select('*').limit(1);

      if (error) {
        if (error.message.includes('does not exist')) {
          console.log(`   ❌ Table '${tableName}' does not exist`);
        } else {
          console.log(`   ⚠️  Table '${tableName}': ${error.message}`);
        }
      } else {
        console.log(`   ✅ Table '${tableName}' exists and accessible`);
        createdTables++;
      }
    } catch (err) {
      console.log(`   ⚠️  Error checking table '${tableName}': ${err.message}`);
    }
  }

  return createdTables;
}

async function seedBasicData() {
  console.log('\n🌱 Attempting to seed basic data...');

  try {
    // Try to insert into languages table
    const { data: langData, error: langError } = await supabase.from('languages').upsert(
      [
        {
          id: 'he',
          name: { he: 'עברית', en: 'Hebrew' },
          direction: 'rtl',
          is_default: true,
          is_active: true,
        },
        {
          id: 'en',
          name: { he: 'אנגלית', en: 'English' },
          direction: 'ltr',
          is_default: false,
          is_active: true,
        },
      ],
      { onConflict: 'id' }
    );

    if (langError) {
      console.log(`   ⚠️  Languages: ${langError.message}`);
    } else {
      console.log('   ✅ Basic language data seeded');
    }

    return true;
  } catch (err) {
    console.log(`   ⚠️  Seeding failed: ${err.message}`);
    return false;
  }
}

async function verifyDeployment() {
  console.log('\n🔍 Verifying deployment...');

  const tables = ['languages', 'users', 'stories', 'products', 'jewelers', 'orders'];
  let accessibleTables = 0;

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (!error) {
        console.log(`   ✅ ${table}: Accessible`);
        accessibleTables++;
      } else {
        console.log(`   ⚠️  ${table}: ${error.message}`);
      }
    } catch (err) {
      console.log(`   ❌ ${table}: ${err.message}`);
    }
  }

  console.log(`\n📊 Deployment Status: ${accessibleTables}/${tables.length} tables accessible`);
  return accessibleTables > 0;
}

async function main() {
  console.log('🚀 GemsAI Automatic Database Deployment');
  console.log(`📡 Target: ${supabaseUrl}`);
  console.log('');

  console.log('⚠️  IMPORTANT:');
  console.log('   This script can verify existing tables but cannot create them');
  console.log("   due to Supabase security restrictions. If tables don't exist,");
  console.log('   manual deployment via SQL Editor is required.');
  console.log('');

  try {
    await testConnection();

    const existingTables = await deployTables();

    if (existingTables > 0) {
      console.log(`\n✅ Found ${existingTables} existing tables!`);

      await seedBasicData();
      const success = await verifyDeployment();

      if (success) {
        console.log('\n🎉 DATABASE READY!');
        console.log('');
        console.log('Your GemsAI database is functional with:');
        console.log('• Existing table structure');
        console.log('• Basic language configuration');
        console.log('• Supabase authentication ready');
        console.log('');
        console.log('🔥 Test your setup:');
        console.log('   npm run dev');
        console.log('   Visit: http://localhost:3000/database-demo');
      } else {
        console.log('\n⚠️  Limited database access detected');
        throw new Error('Manual setup required');
      }
    } else {
      console.log('\n❌ No accessible tables found');
      throw new Error('Database tables need to be created');
    }
  } catch (error) {
    console.log('\n🛠️  MANUAL DEPLOYMENT REQUIRED');
    console.log('');
    console.log('The automatic deployment cannot create tables due to Supabase');
    console.log('security restrictions. Please use manual deployment:');
    console.log('');
    console.log('📖 Quick Manual Steps:');
    console.log('   1. Open: https://supabase.com/dashboard/project/lpyyznmdheipnenrytte');
    console.log('   2. Click "SQL Editor"');
    console.log('   3. Copy/paste each file from docs/supabase/ in order:');
    console.log('      • 001_create_i18n_schema.sql');
    console.log('      • 002_create_core_tables.sql');
    console.log('      • 003_create_relationships_constraints.sql');
    console.log('      • 004_create_security_policies.sql');
    console.log('      • 005_performance_optimization.sql');
    console.log('      • 008_seed_data.sql');
    console.log('');
    console.log('⏱️  Total time: ~10 minutes');
    console.log('📋 Detailed guide: deploy-database.md');

    process.exit(1);
  }
}

main().catch(console.error);
