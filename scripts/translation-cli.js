#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class TranslationCLI {
  constructor() {
    this.localesPath = path.join(process.cwd(), 'public', 'locales');
    this.supportedLocales = ['he', 'en'];
    this.supportedNamespaces = ['common', 'auth', 'dashboard', 'stories', 'jewelry', 'validation'];
  }

  /**
   * Load translations for a locale
   */
  loadTranslations(locale) {
    const translations = {};
    
    for (const namespace of this.supportedNamespaces) {
      const filePath = path.join(this.localesPath, locale, `${namespace}.json`);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          translations[namespace] = JSON.parse(content);
        } catch (error) {
          console.warn(`⚠️  Failed to load ${namespace} for ${locale}:`, error.message);
        }
      }
    }
    
    return translations;
  }

  /**
   * Flatten nested object keys
   */
  flattenKeys(obj, prefix = '') {
    const keys = [];
    
    for (const [key, value] of Object.entries(obj || {})) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...this.flattenKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    
    return keys;
  }

  /**
   * Check if translation exists
   */
  hasTranslation(key, namespace, translations) {
    const namespaceTranslations = translations[namespace];
    if (!namespaceTranslations) return false;
    
    const keyParts = key.split('.');
    let current = namespaceTranslations;
    
    for (const part of keyParts) {
      if (typeof current !== 'object' || current === null || !(part in current)) {
        return false;
      }
      current = current[part];
    }
    
    return current !== undefined && current !== null;
  }

  /**
   * Find missing translations
   */
  findMissing() {
    console.log('🔍 Checking for missing translations...\n');
    
    const allTranslations = {};
    
    // Load all translations
    for (const locale of this.supportedLocales) {
      allTranslations[locale] = this.loadTranslations(locale);
    }
    
    const missing = [];
    
    // Compare translations
    for (const namespace of this.supportedNamespaces) {
      const allKeys = new Set();
      
      // Collect all possible keys
      for (const locale of this.supportedLocales) {
        const keys = this.flattenKeys(allTranslations[locale][namespace] || {});
        keys.forEach(key => allKeys.add(key));
      }
      
      // Check for missing keys in each locale
      for (const key of allKeys) {
        const missingLocales = [];
        
        for (const locale of this.supportedLocales) {
          if (!this.hasTranslation(key, namespace, allTranslations[locale])) {
            missingLocales.push(locale);
          }
        }
        
        if (missingLocales.length > 0) {
          missing.push({
            key,
            namespace,
            missingLocales
          });
        }
      }
    }
    
    if (missing.length === 0) {
      console.log('✅ No missing translations found!');
      return;
    }
    
    console.log(`❌ Found ${missing.length} missing translations:\n`);
    
    // Group by namespace
    const byNamespace = {};
    missing.forEach(item => {
      if (!byNamespace[item.namespace]) byNamespace[item.namespace] = [];
      byNamespace[item.namespace].push(item);
    });
    
    for (const [namespace, items] of Object.entries(byNamespace)) {
      console.log(`📂 ${namespace}:`);
      items.forEach(item => {
        const locales = item.missingLocales.join(', ');
        console.log(`   ${item.key} (missing in: ${locales})`);
      });
      console.log('');
    }
  }

  /**
   * Validate translation files
   */
  validate() {
    console.log('🔍 Validating translation files...\n');
    
    let hasErrors = false;
    
    for (const locale of this.supportedLocales) {
      for (const namespace of this.supportedNamespaces) {
        const filePath = path.join(this.localesPath, locale, `${namespace}.json`);
        
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️  Missing: ${locale}/${namespace}.json`);
          continue;
        }
        
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          JSON.parse(content);
          console.log(`✅ Valid: ${locale}/${namespace}.json`);
        } catch (error) {
          console.log(`❌ Invalid JSON in ${locale}/${namespace}.json: ${error.message}`);
          hasErrors = true;
        }
      }
    }
    
    if (hasErrors) {
      console.log('\n❌ Translation validation failed!');
      process.exit(1);
    } else {
      console.log('\n✅ All translation files are valid!');
    }
  }

  /**
   * Generate translation stats
   */
  stats() {
    console.log('📊 Translation Statistics\n');
    
    const allTranslations = {};
    
    // Load all translations
    for (const locale of this.supportedLocales) {
      allTranslations[locale] = this.loadTranslations(locale);
    }
    
    // Count total unique keys
    const allKeys = new Set();
    for (const locale of this.supportedLocales) {
      for (const namespace of this.supportedNamespaces) {
        const keys = this.flattenKeys(allTranslations[locale][namespace] || {});
        keys.forEach(key => allKeys.add(`${namespace}:${key}`));
      }
    }
    
    const totalKeys = allKeys.size;
    console.log(`Total unique keys: ${totalKeys}\n`);
    
    // Calculate completion by locale
    for (const locale of this.supportedLocales) {
      let translatedKeys = 0;
      for (const key of allKeys) {
        const [namespace, ...keyParts] = key.split(':');
        const fullKey = keyParts.join(':');
        if (this.hasTranslation(fullKey, namespace, allTranslations[locale])) {
          translatedKeys++;
        }
      }
      const completion = totalKeys > 0 ? ((translatedKeys / totalKeys) * 100).toFixed(1) : 100;
      console.log(`${locale.toUpperCase()}: ${translatedKeys}/${totalKeys} (${completion}%)`);
    }
    
    console.log('\n📂 Keys by namespace:');
    for (const namespace of this.supportedNamespaces) {
      const namespaceKeys = new Set();
      for (const locale of this.supportedLocales) {
        const keys = this.flattenKeys(allTranslations[locale][namespace] || {});
        keys.forEach(key => namespaceKeys.add(key));
      }
      console.log(`   ${namespace}: ${namespaceKeys.size} keys`);
    }
  }

  /**
   * Create missing translation files
   */
  scaffold() {
    console.log('🏗️  Creating missing translation files...\n');
    
    for (const locale of this.supportedLocales) {
      const localePath = path.join(this.localesPath, locale);
      
      // Ensure locale directory exists
      if (!fs.existsSync(localePath)) {
        fs.mkdirSync(localePath, { recursive: true });
        console.log(`✅ Created directory: ${locale}/`);
      }
      
      for (const namespace of this.supportedNamespaces) {
        const filePath = path.join(localePath, `${namespace}.json`);
        
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, '{}', 'utf-8');
          console.log(`✅ Created file: ${locale}/${namespace}.json`);
        }
      }
    }
    
    console.log('\n✅ Scaffolding complete!');
  }

  /**
   * Show help
   */
  help() {
    console.log(`
🌍 Translation Management CLI

Usage: node scripts/translation-cli.js [command]

Commands:
  missing     Find missing translations across locales
  validate    Validate all translation files for syntax errors
  stats       Show translation statistics and completion rates
  scaffold    Create missing translation files and directories
  help        Show this help message

Examples:
  node scripts/translation-cli.js missing
  node scripts/translation-cli.js validate
  node scripts/translation-cli.js stats
`);
  }

  /**
   * Run CLI
   */
  run() {
    const command = process.argv[2];
    
    switch (command) {
      case 'missing':
        this.findMissing();
        break;
      case 'validate':
        this.validate();
        break;
      case 'stats':
        this.stats();
        break;
      case 'scaffold':
        this.scaffold();
        break;
      case 'help':
      case '--help':
      case '-h':
        this.help();
        break;
      default:
        console.log('❌ Unknown command. Use "help" for available commands.');
        process.exit(1);
    }
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  const cli = new TranslationCLI();
  cli.run();
}

module.exports = TranslationCLI; 