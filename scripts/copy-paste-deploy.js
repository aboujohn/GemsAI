#!/usr/bin/env node

// GemsAI Copy-Paste Database Deployment Helper
// Generates ready-to-copy SQL blocks for easy manual deployment

const fs = require('fs');
const path = require('path');

const sqlFiles = [
  { file: 'docs/supabase/001_create_i18n_schema.sql', name: 'Internationalization Schema' },
  { file: 'docs/supabase/002_create_core_tables.sql', name: 'Core Business Tables' },
  {
    file: 'docs/supabase/003_create_relationships_constraints.sql',
    name: 'Relationships & Constraints',
  },
  { file: 'docs/supabase/004_create_security_policies.sql', name: 'Security Policies' },
  { file: 'docs/supabase/005_performance_optimization.sql', name: 'Performance Optimization' },
  { file: 'docs/supabase/008_seed_data.sql', name: 'Demo Data' },
];

function generateDeploymentBlocks() {
  console.log('🚀 GemsAI Database Deployment Helper');
  console.log('');
  console.log('📋 INSTRUCTIONS:');
  console.log('1. Open: https://supabase.com/dashboard/project/lpyyznmdheipnenrytte');
  console.log('2. Click "SQL Editor" in the sidebar');
  console.log('3. Click "New Query"');
  console.log('4. Copy each block below, paste into SQL Editor, and click "Run"');
  console.log('');
  console.log('='.repeat(80));
  console.log('');

  // First, generate extensions block
  console.log('📦 STEP 0: Enable Extensions (Copy & Run First)');
  console.log('');
  console.log('```sql');
  console.log('-- Enable required PostgreSQL extensions');
  console.log('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  console.log('CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";');
  console.log('CREATE EXTENSION IF NOT EXISTS "unaccent";');
  console.log('CREATE EXTENSION IF NOT EXISTS "pg_trgm";');
  console.log('```');
  console.log('');
  console.log('⏳ Wait for this to complete before proceeding to Step 1');
  console.log('');
  console.log('='.repeat(80));
  console.log('');

  // Generate blocks for each SQL file
  sqlFiles.forEach((sqlFile, index) => {
    const stepNum = index + 1;
    console.log(`📄 STEP ${stepNum}: ${sqlFile.name}`);
    console.log('');

    if (!fs.existsSync(sqlFile.file)) {
      console.log('❌ File not found:', sqlFile.file);
      console.log('');
      return;
    }

    const content = fs.readFileSync(sqlFile.file, 'utf8');
    const lines = content.split('\n');
    const totalLines = lines.length;

    console.log(`📊 Lines: ${totalLines} | File: ${sqlFile.file}`);
    console.log('');
    console.log('```sql');
    console.log(content);
    console.log('```');
    console.log('');
    console.log(`✅ After running Step ${stepNum}, you should see: "Success. No rows returned"`);
    console.log('');
    console.log('='.repeat(80));
    console.log('');
  });

  // Final verification block
  console.log('🔍 STEP 7: Verify Deployment (Copy & Run Last)');
  console.log('');
  console.log('```sql');
  console.log('-- Check created tables');
  console.log('SELECT table_name FROM information_schema.tables');
  console.log("WHERE table_schema = 'public'");
  console.log('ORDER BY table_name;');
  console.log('');
  console.log('-- Check sample data');
  console.log('SELECT id, name FROM languages LIMIT 5;');
  console.log('SELECT id, full_name FROM users LIMIT 5;');
  console.log('SELECT id, name FROM jewelers LIMIT 3;');
  console.log('```');
  console.log('');
  console.log('✅ Expected results:');
  console.log('   • 24+ tables listed');
  console.log('   • Hebrew/English languages');
  console.log('   • 5 demo users');
  console.log('   • 2 demo jewelers');
  console.log('');
  console.log('🎉 DEPLOYMENT COMPLETE!');
  console.log('');
  console.log('🔥 Next steps:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Visit: http://localhost:3000/database-demo');
  console.log('   3. Test user registration and data access');
  console.log('');
}

function generateQuickCopyFile() {
  const outputFile = 'DEPLOY_COPY_PASTE.txt';

  console.log(`📝 Generating copy-paste file: ${outputFile}`);

  let content = '';
  content += '# GemsAI Database Deployment - Copy & Paste Guide\n\n';
  content += 'Open this file and copy each block to Supabase SQL Editor\n';
  content += 'Dashboard: https://supabase.com/dashboard/project/lpyyznmdheipnenrytte\n\n';
  content += '='.repeat(80) + '\n\n';

  // Extensions
  content += 'STEP 0: Extensions (Run First)\n\n';
  content += 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n';
  content += 'CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";\n';
  content += 'CREATE EXTENSION IF NOT EXISTS "unaccent";\n';
  content += 'CREATE EXTENSION IF NOT EXISTS "pg_trgm";\n\n';
  content += '='.repeat(80) + '\n\n';

  // Each SQL file
  sqlFiles.forEach((sqlFile, index) => {
    if (fs.existsSync(sqlFile.file)) {
      content += `STEP ${index + 1}: ${sqlFile.name}\n\n`;
      content += fs.readFileSync(sqlFile.file, 'utf8');
      content += '\n\n' + '='.repeat(80) + '\n\n';
    }
  });

  // Verification
  content += 'STEP 7: Verification\n\n';
  content +=
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;\n";
  content += 'SELECT id, name FROM languages LIMIT 5;\n';
  content += 'SELECT id, full_name FROM users LIMIT 5;\n\n';

  fs.writeFileSync(outputFile, content);
  console.log(`✅ Created: ${outputFile}`);
  console.log('');
  console.log('📋 You can now:');
  console.log(`   1. Open ${outputFile} in a text editor`);
  console.log('   2. Copy each step and paste into Supabase SQL Editor');
  console.log('   3. Run each step in order');
  console.log('');
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--file')) {
    generateQuickCopyFile();
  } else {
    generateDeploymentBlocks();
  }

  console.log('🛠️  Having trouble? Try:');
  console.log('   node scripts/copy-paste-deploy.js --file');
  console.log('   This creates a DEPLOY_COPY_PASTE.txt file for easier copying');
}

main();
