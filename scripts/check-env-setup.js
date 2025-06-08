#!/usr/bin/env node

/**
 * This script checks the environment setup and provides feedback
 * to help developers set up their environment correctly.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Check if chalk is installed, if not, use simple string coloring
let log = {
  error: (msg) => console.error(`ERROR: ${msg}`),
  warn: (msg) => console.warn(`WARNING: ${msg}`),
  info: (msg) => console.info(`INFO: ${msg}`),
  success: (msg) => console.log(`SUCCESS: ${msg}`),
  title: (msg) => console.log(`\n=== ${msg} ===\n`),
};

try {
  // Only try to use chalk if it's installed
  if (chalk) {
    log = {
      error: (msg) => console.error(chalk.red(`ERROR: ${msg}`)),
      warn: (msg) => console.warn(chalk.yellow(`WARNING: ${msg}`)),
      info: (msg) => console.info(chalk.blue(`INFO: ${msg}`)),
      success: (msg) => console.log(chalk.green(`SUCCESS: ${msg}`)),
      title: (msg) => console.log(chalk.bold.cyan(`\n=== ${msg} ===\n`)),
    };
  }
} catch (e) {
  // Chalk not installed, use default logging
}

log.title('GemsAI Environment Setup Check');

// Check for .env files
const envFiles = [
  { name: '.env.local', required: true, description: 'Local development environment' },
  { name: '.env.development', required: false, description: 'Development environment' },
  { name: '.env.production', required: false, description: 'Production environment' },
];

log.title('Environment Files');
let hasErrors = false;

envFiles.forEach((envFile) => {
  const filePath = path.join(process.cwd(), envFile.name);
  const exists = fs.existsSync(filePath);

  if (exists) {
    log.success(`${envFile.name} exists (${envFile.description})`);
  } else if (envFile.required) {
    log.error(`${envFile.name} does not exist but is required (${envFile.description})`);
    log.info(`Create it by copying env-template.txt to ${envFile.name} and filling in the values`);
    hasErrors = true;
  } else {
    log.warn(`${envFile.name} does not exist (${envFile.description})`);
    log.info(`Consider creating it by copying env-template.txt to ${envFile.name} if needed`);
  }
});

// Check for required dependencies
const requiredDependencies = [
  { name: 'zod', package: 'zod', dev: false },
];

log.title('Dependencies');
requiredDependencies.forEach((dep) => {
  try {
    require.resolve(dep.package);
    log.success(`${dep.name} is installed`);
  } catch (e) {
    log.error(`${dep.name} is not installed`);
    log.info(`Run: npm install ${dep.dev ? '--save-dev' : '--save'} ${dep.package}`);
    hasErrors = true;
  }
});

// Final summary
log.title('Summary');
if (hasErrors) {
  log.error('Please fix the issues above to ensure proper environment setup.');
  log.info('Refer to ENV_SETUP.md for more information.');
  process.exit(1);
} else {
  log.success('Environment setup looks good!');
  log.info('You can now run the application.');
  process.exit(0);
} 