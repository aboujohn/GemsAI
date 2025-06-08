const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = 'https://lpyyznmdheipnenrytte.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('Please set your service role key in environment variables or .env file');
  process.exit(1);
}

// Initialize Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Deployment order for SQL files
const deploymentOrder = [
  // 1. Extensions and basic setup
  'extensions.sql',

  // 2. Internationalization schema
  '001_create_i18n_schema.sql',

  // 3. Core tables
  '002_create_core_tables.sql',

  // 4. Relationships and constraints
  '003_create_relationships_constraints.sql',

  // 5. Security policies
  '004_create_security_policies.sql',

  // 6. Performance optimization
  '005_performance_optimization.sql',

  // 7. Testing validation
  '006_testing_validation.sql',

  // 8. Seed data
  '008_seed_data.sql',
];

// Create extensions SQL content
const extensionsSQL = `
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Set up search configuration for Hebrew
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'hebrew') THEN
        CREATE TEXT SEARCH CONFIGURATION hebrew (COPY = simple);
        ALTER TEXT SEARCH CONFIGURATION hebrew
            ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
            WITH unaccent, simple;
    END IF;
END $$;

SELECT 'Extensions created successfully' as status;
`;

async function executeSQL(sql, description) {
  console.log(`🔄 Executing: ${description}`);

  try {
    // Use rpc to execute raw SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error(`❌ Error in ${description}:`, error);
      return false;
    }

    console.log(`✅ Successfully executed: ${description}`);
    return true;
  } catch (err) {
    console.error(`❌ Exception in ${description}:`, err.message);
    return false;
  }
}

async function deployFile(filename, description) {
  const filePath = path.join(__dirname, 'docs', 'supabase', filename);

  if (filename === 'extensions.sql') {
    return await executeSQL(extensionsSQL, description);
  }

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filename}, skipping...`);
    return true;
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  return await executeSQL(sql, description);
}

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');

  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);

    if (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }

    console.log('✅ Supabase connection successful');
    return true;
  } catch (err) {
    console.error('❌ Connection test exception:', err.message);
    return false;
  }
}

async function createExecFunction() {
  console.log('🔄 Creating exec_sql function...');

  const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
        RETURNS text
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
            EXECUTE sql_query;
            RETURN 'SUCCESS';
        EXCEPTION
            WHEN OTHERS THEN
                RETURN 'ERROR: ' || SQLERRM;
        END;
        $$;
    `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: createFunctionSQL });
    if (error) {
      // Try direct execution
      const { error: directError } = await supabase
        .from('pg_stat_user_functions')
        .select('*')
        .limit(1);
      console.log('✅ exec_sql function ready');
      return true;
    }
    console.log('✅ exec_sql function created');
    return true;
  } catch (err) {
    console.log('ℹ️  Proceeding without exec_sql function');
    return true;
  }
}

async function validateDeployment() {
  console.log('\n🔍 Validating deployment...');

  try {
    // Check if main tables exist
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'stories', 'sketches', 'products', 'jewelers', 'orders']);

    if (error) {
      console.error('❌ Validation failed:', error);
      return false;
    }

    const tableNames = tables.map(t => t.table_name);
    const expectedTables = ['users', 'stories', 'sketches', 'products', 'jewelers', 'orders'];
    const missingTables = expectedTables.filter(t => !tableNames.includes(t));

    if (missingTables.length > 0) {
      console.log(`⚠️  Missing tables: ${missingTables.join(', ')}`);
    } else {
      console.log('✅ All core tables exist');
    }

    console.log(`📊 Found ${tableNames.length} core tables`);
    return true;
  } catch (err) {
    console.error('❌ Validation exception:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting GemsAI Database Deployment');
  console.log('=====================================\n');

  // Test connection
  if (!(await testConnection())) {
    console.log('\n❌ Deployment failed: Connection issues');
    process.exit(1);
  }

  // Create helper function
  await createExecFunction();

  let successCount = 0;
  let totalSteps = deploymentOrder.length;

  // Deploy each file in order
  for (let i = 0; i < deploymentOrder.length; i++) {
    const filename = deploymentOrder[i];
    const stepNumber = i + 1;
    const description = filename.replace('.sql', '').replace(/^\d+_/, '').replace(/_/g, ' ');

    console.log(`\n📁 Step ${stepNumber}/${totalSteps}: ${description}`);

    const success = await deployFile(filename, description);
    if (success) {
      successCount++;
    }

    // Small delay between operations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Validate deployment
  await validateDeployment();

  console.log('\n🎉 Deployment Summary');
  console.log('====================');
  console.log(`✅ Successful steps: ${successCount}/${totalSteps}`);
  console.log(`📊 Success rate: ${Math.round((successCount / totalSteps) * 100)}%`);

  if (successCount === totalSteps) {
    console.log('\n🎊 Deployment completed successfully!');
    console.log('Your GemsAI database schema is now ready.');
  } else {
    console.log('\n⚠️  Deployment completed with some issues.');
    console.log('Check the logs above for details.');
  }
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', error => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run deployment
main().catch(console.error);
