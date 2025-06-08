#!/usr/bin/env node

/**
 * Comprehensive Test Execution Script for GemsAI Tasks 1-9
 * This script provides automated testing for all completed tasks
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class TaskTester {
  constructor() {
    this.results = {};
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logHeader(message) {
    this.log('\n' + '='.repeat(60), 'cyan');
    this.log(message, 'bright');
    this.log('='.repeat(60), 'cyan');
  }

  logSubHeader(message) {
    this.log('\n' + '-'.repeat(40), 'yellow');
    this.log(message, 'yellow');
    this.log('-'.repeat(40), 'yellow');
  }

  runCommand(command, description) {
    this.totalTests++;
    try {
      this.log(`Testing: ${description}`, 'blue');
      const output = execSync(command, { 
        encoding: 'utf8', 
        stdio: 'pipe',
        timeout: 30000 
      });
      this.log(`✅ PASS: ${description}`, 'green');
      this.passedTests++;
      return { success: true, output };
    } catch (error) {
      this.log(`❌ FAIL: ${description}`, 'red');
      this.log(`Error: ${error.message}`, 'red');
      this.failedTests++;
      return { success: false, error: error.message };
    }
  }

  checkFileExists(filePath, description) {
    this.totalTests++;
    if (fs.existsSync(filePath)) {
      this.log(`✅ PASS: ${description}`, 'green');
      this.passedTests++;
      return true;
    } else {
      this.log(`❌ FAIL: ${description}`, 'red');
      this.failedTests++;
      return false;
    }
  }

  checkDirectoryStructure(directories, basePath = '.') {
    this.logSubHeader('Checking Directory Structure');
    directories.forEach(dir => {
      const fullPath = path.join(basePath, dir);
      this.checkFileExists(fullPath, `Directory exists: ${dir}`);
    });
  }

  testTask1() {
    this.logHeader('TASK 1: Next.js Project Foundation Testing');

    // 1.1 Project Structure Validation
    this.logSubHeader('1.1 Project Structure Validation');
    const requiredDirs = [
      'app',
      'components',
      'lib',
      'public',
      'styles',
      '.next',
      'node_modules'
    ];
    this.checkDirectoryStructure(requiredDirs);

    // Essential files
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'next.config.ts',
      'tailwind.config.js',
      '.gitignore'
    ];
    requiredFiles.forEach(file => {
      this.checkFileExists(file, `Essential file exists: ${file}`);
    });

    // 1.2 TypeScript and Build
    this.logSubHeader('1.2 TypeScript Compilation and Build');
    this.runCommand('npm run build', 'Build project successfully');

    // 1.3 Code Quality
    this.logSubHeader('1.3 Code Quality Tools');
    this.runCommand('npm run lint', 'ESLint runs without errors');
  }

  testTask2() {
    this.logHeader('TASK 2: UI Framework Testing');

    // 2.1 Tailwind Configuration
    this.logSubHeader('2.1 Tailwind CSS Configuration');
    this.checkFileExists('tailwind.config.js', 'Tailwind config exists');
    this.checkFileExists('postcss.config.mjs', 'PostCSS config exists');

    // 2.2 Component Library
    this.logSubHeader('2.2 shadcn/ui Components');
    this.checkFileExists('components/ui', 'UI components directory exists');
    
    // Check for essential UI components
    const uiComponents = [
      'components/ui/Button.tsx',
      'components/ui/Input.tsx',
      'components/ui/Card.tsx'
    ];
    uiComponents.forEach(component => {
      this.checkFileExists(component, `UI component exists: ${path.basename(component)}`);
    });
  }

  testTask3() {
    this.logHeader('TASK 3: Supabase Database Schema Testing');

    // 3.1 Database Schema Files
    this.logSubHeader('3.1 Database Schema Files');
    const schemaFiles = [
      'docs/supabase/001_create_tables.sql',
      'docs/supabase/002_create_translation_tables.sql',
      'docs/supabase/003_create_relationships_constraints.sql',
      'docs/supabase/004_create_security_policies.sql',
      'docs/supabase/005_performance_optimization.sql',
      'docs/supabase/006_testing_validation.sql',
      'docs/supabase/007_migration_guide.md',
      'docs/supabase/008_seed_data.sql'
    ];
    
    schemaFiles.forEach(file => {
      this.checkFileExists(file, `Schema file exists: ${path.basename(file)}`);
    });

    // 3.2 Supabase Configuration
    this.logSubHeader('3.2 Supabase Configuration');
    this.checkFileExists('lib/supabase', 'Supabase client directory exists');
  }

  testTask4() {
    this.logHeader('TASK 4: Authentication System Testing');

    // 4.1 Authentication Components
    this.logSubHeader('4.1 Authentication Components');
    const authComponents = [
      'components/providers/AuthGuard.tsx',
      'lib/hooks/useAuth.ts',
      'middleware.ts',
      'app/auth'
    ];
    
    authComponents.forEach(component => {
      this.checkFileExists(component, `Auth component exists: ${path.basename(component)}`);
    });

    // 4.2 Auth Pages
    this.logSubHeader('4.2 Authentication Pages');
    const authPages = [
      'app/auth/login',
      'app/auth/signup',
      'app/dashboard'
    ];
    
    authPages.forEach(page => {
      this.checkFileExists(page, `Auth page exists: ${path.basename(page)}`);
    });
  }

  testTask5() {
    this.logHeader('TASK 5: NestJS Backend Structure Testing');

    // 5.1 Backend Structure
    this.logSubHeader('5.1 Backend Structure');
    const backendDirs = [
      'jewelry-customization-backend/src',
      'jewelry-customization-backend/src/auth',
      'jewelry-customization-backend/src/story',
      'jewelry-customization-backend/src/product'
    ];
    
    backendDirs.forEach(dir => {
      this.checkFileExists(dir, `Backend directory exists: ${path.basename(dir)}`);
    });

    // 5.2 Backend Configuration
    this.logSubHeader('5.2 Backend Configuration');
    this.checkFileExists('jewelry-customization-backend/package.json', 'Backend package.json exists');
    this.checkFileExists('jewelry-customization-backend/nest-cli.json', 'NestJS CLI config exists');
  }

  testTask6() {
    this.logHeader('TASK 6: Database Schema Testing (Same as Task 3)');
    this.log('Database schema testing covered in Task 3', 'yellow');
  }

  testTask7() {
    this.logHeader('TASK 7: Voice/Text Story Entry Testing');

    // 7.1 Story Entry Components
    this.logSubHeader('7.1 Story Entry Components');
    const storyComponents = [
      'app/story-submission-demo',
      'app/transcription-demo',
      'app/voice-demo'
    ];
    
    storyComponents.forEach(component => {
      this.checkFileExists(component, `Story component exists: ${path.basename(component)}`);
    });

    // 7.2 Voice/Text Services
    this.logSubHeader('7.2 Voice/Text Services');
    this.checkFileExists('lib/services', 'Services directory exists');
  }

  testTask8() {
    this.logHeader('TASK 8: Emotion Detection and Tagging System Testing');

    // 8.1 Emotion Services
    this.logSubHeader('8.1 Emotion Detection Services');
    const emotionServices = [
      'lib/services/openai.ts',
      'lib/services/emotion-cache.ts',
      'lib/services/emotion-analysis.ts',
      'lib/services/emotion-tags.ts'
    ];
    
    emotionServices.forEach(service => {
      this.checkFileExists(service, `Emotion service exists: ${path.basename(service)}`);
    });

    // 8.2 Emotion Components
    this.logSubHeader('8.2 Emotion UI Components');
    const emotionComponents = [
      'components/ui/emotion-tag-selector.tsx',
      'components/ui/emotion-visualization.tsx',
      'components/ui/emotion-analytics-dashboard.tsx',
      'components/ui/emotion-ai-editor.tsx'
    ];
    
    emotionComponents.forEach(component => {
      this.checkFileExists(component, `Emotion component exists: ${path.basename(component)}`);
    });

    // 8.3 Emotion Demo
    this.logSubHeader('8.3 Emotion Demo Page');
    this.checkFileExists('app/emotion-demo', 'Emotion demo page exists');

    // 8.4 API Routes
    this.logSubHeader('8.4 Emotion API Routes');
    const emotionAPIs = [
      'app/api/emotions/analyze',
      'app/api/emotions/tags'
    ];
    
    emotionAPIs.forEach(api => {
      this.checkFileExists(api, `Emotion API exists: ${path.basename(api)}`);
    });
  }

  testTask9() {
    this.logHeader('TASK 9: Persona-Guided Assistant Flow Testing');

    // 9.1 Persona Services
    this.logSubHeader('9.1 Persona Services');
    const personaServices = [
      'lib/types/assistant.ts',
      'lib/services/persona-templates.ts',
      'lib/services/conversation-state.ts',
      'lib/services/persona-assistant.ts',
      'lib/services/conversation-flow.ts',
      'lib/services/interaction-patterns.ts'
    ];
    
    personaServices.forEach(service => {
      this.checkFileExists(service, `Persona service exists: ${path.basename(service)}`);
    });

    // 9.2 Persona Components
    this.logSubHeader('9.2 Persona UI Components');
    this.checkFileExists('components/ui/persona-assistant.tsx', 'Persona assistant component exists');

    // 9.3 Persona Demo
    this.logSubHeader('9.3 Persona Demo Page');
    this.checkFileExists('app/persona-assistant-demo', 'Persona demo page exists');

    // 9.4 Persona API Routes
    this.logSubHeader('9.4 Persona API Routes');
    const personaAPIs = [
      'app/api/assistant/chat',
      'app/api/assistant/personas'
    ];
    
    personaAPIs.forEach(api => {
      this.checkFileExists(api, `Persona API exists: ${path.basename(api)}`);
    });

    // 9.5 Testing Framework
    this.logSubHeader('9.5 Testing Framework');
    this.checkFileExists('lib/services/__tests__/persona-assistant.test.ts', 'Persona testing framework exists');
  }

  runIntegrationTests() {
    this.logHeader('INTEGRATION TESTING');

    // Check for demo pages
    this.logSubHeader('Demo Pages Verification');
    const demoPages = [
      'app/emotion-demo',
      'app/persona-assistant-demo',
      'app/story-submission-demo',
      'app/transcription-demo',
      'app/voice-demo',
      'app/database-demo',
      'app/rtl-demo',
      'app/text-input-demo',
      'app/formatting-demo',
      'app/social-demo'
    ];
    
    demoPages.forEach(page => {
      this.checkFileExists(page, `Demo page exists: ${path.basename(page)}`);
    });

    // Environment and Configuration
    this.logSubHeader('Environment Configuration');
    this.checkFileExists('.env.example', 'Environment example file exists');
    this.checkFileExists('.env.development', 'Development environment file exists');
  }

  generateReport() {
    this.logHeader('TEST EXECUTION SUMMARY');
    
    const passRate = this.totalTests > 0 ? (this.passedTests / this.totalTests * 100).toFixed(1) : 0;
    
    this.log(`Total Tests: ${this.totalTests}`, 'bright');
    this.log(`Passed: ${this.passedTests}`, 'green');
    this.log(`Failed: ${this.failedTests}`, 'red');
    this.log(`Pass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'red');

    if (this.failedTests === 0) {
      this.log('\n🎉 ALL TESTS PASSED! GemsAI is ready for deployment.', 'green');
    } else {
      this.log(`\n⚠️  ${this.failedTests} test(s) failed. Please review the failures above.`, 'yellow');
    }

    // Generate detailed report
    const reportPath = 'test-results.json';
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.totalTests,
        passed: this.passedTests,
        failed: this.failedTests,
        passRate: passRate
      },
      results: this.results
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`\nDetailed report saved to: ${reportPath}`, 'cyan');
  }

  async runAllTests() {
    this.log('Starting comprehensive testing for GemsAI Tasks 1-9...', 'bright');
    
    try {
      this.testTask1();
      this.testTask2();
      this.testTask3();
      this.testTask4();
      this.testTask5();
      this.testTask6();
      this.testTask7();
      this.testTask8();
      this.testTask9();
      this.runIntegrationTests();
    } catch (error) {
      this.log(`\nFatal error during testing: ${error.message}`, 'red');
    }

    this.generateReport();
  }
}

// CLI Interface
function showHelp() {
  console.log(`
GemsAI Task Testing Script

Usage:
  node scripts/test-all-tasks.js [options]

Options:
  --help, -h        Show this help message
  --task <number>   Run tests for specific task (1-9)
  --integration     Run only integration tests
  --summary         Show only summary (no detailed output)

Examples:
  node scripts/test-all-tasks.js                 # Run all tests
  node scripts/test-all-tasks.js --task 8        # Test only Task 8
  node scripts/test-all-tasks.js --integration   # Run integration tests only
`);
}

async function main() {
  const args = process.argv.slice(2);
  const tester = new TaskTester();

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  const taskIndex = args.indexOf('--task');
  if (taskIndex !== -1 && args[taskIndex + 1]) {
    const taskNumber = parseInt(args[taskIndex + 1]);
    if (taskNumber >= 1 && taskNumber <= 9) {
      tester.log(`Running tests for Task ${taskNumber} only...`, 'bright');
      tester[`testTask${taskNumber}`]();
      tester.generateReport();
      return;
    } else {
      tester.log('Invalid task number. Please specify 1-9.', 'red');
      return;
    }
  }

  if (args.includes('--integration')) {
    tester.log('Running integration tests only...', 'bright');
    tester.runIntegrationTests();
    tester.generateReport();
    return;
  }

  // Run all tests
  await tester.runAllTests();
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(`${colors.red}Uncaught Exception: ${error.message}${colors.reset}`);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error(`${colors.red}Script failed: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = TaskTester; 