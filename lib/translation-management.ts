import fs from 'fs';
import path from 'path';

export type SupportedLocale = 'he' | 'en';
export type TranslationNamespace =
  | 'common'
  | 'auth'
  | 'dashboard'
  | 'stories'
  | 'jewelry'
  | 'validation';

export interface TranslationKey {
  key: string;
  namespace: TranslationNamespace;
  description?: string;
  context?: string;
  pluralization?: boolean;
}

export interface TranslationEntry {
  key: string;
  value: string | Record<string, any>;
  namespace: TranslationNamespace;
  locale: SupportedLocale;
}

export interface MissingTranslation {
  key: string;
  namespace: TranslationNamespace;
  missingLocales: SupportedLocale[];
}

/**
 * Translation Management System
 * Provides utilities for managing, validating, and organizing translation files
 */
export class TranslationManager {
  private readonly localesPath: string;
  private readonly supportedLocales: SupportedLocale[] = ['he', 'en'];
  private readonly supportedNamespaces: TranslationNamespace[] = [
    'common',
    'auth',
    'dashboard',
    'stories',
    'jewelry',
    'validation',
  ];

  constructor(localesPath: string = './public/locales') {
    this.localesPath = localesPath;
  }

  /**
   * Load all translation files for a given locale
   */
  async loadTranslations(locale: SupportedLocale): Promise<Record<string, any>> {
    const translations: Record<string, any> = {};

    for (const namespace of this.supportedNamespaces) {
      try {
        const filePath = path.join(this.localesPath, locale, `${namespace}.json`);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          translations[namespace] = JSON.parse(content);
        }
      } catch (error) {
        console.warn(`Failed to load ${namespace} translations for ${locale}:`, error);
      }
    }

    return translations;
  }

  /**
   * Save translations to file
   */
  async saveTranslations(
    locale: SupportedLocale,
    namespace: TranslationNamespace,
    translations: Record<string, any>
  ): Promise<void> {
    const dirPath = path.join(this.localesPath, locale);
    const filePath = path.join(dirPath, `${namespace}.json`);

    // Ensure directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Write formatted JSON
    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf-8');
  }

  /**
   * Find missing translations across locales
   */
  async findMissingTranslations(): Promise<MissingTranslation[]> {
    const missing: MissingTranslation[] = [];
    const allTranslations: Record<SupportedLocale, Record<string, any>> = {};

    // Load all translations
    for (const locale of this.supportedLocales) {
      allTranslations[locale] = await this.loadTranslations(locale);
    }

    // Compare translations
    for (const namespace of this.supportedNamespaces) {
      const allKeys = new Set<string>();

      // Collect all possible keys
      for (const locale of this.supportedLocales) {
        const keys = this.flattenKeys(allTranslations[locale][namespace] || {}, namespace);
        keys.forEach(key => allKeys.add(key));
      }

      // Check for missing keys in each locale
      for (const key of allKeys) {
        const missingLocales: SupportedLocale[] = [];

        for (const locale of this.supportedLocales) {
          if (!this.hasTranslation(key, namespace, allTranslations[locale])) {
            missingLocales.push(locale);
          }
        }

        if (missingLocales.length > 0) {
          missing.push({
            key,
            namespace: namespace as TranslationNamespace,
            missingLocales,
          });
        }
      }
    }

    return missing;
  }

  /**
   * Flatten nested translation keys
   */
  private flattenKeys(obj: any, namespace: string, prefix: string = ''): string[] {
    const keys: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...this.flattenKeys(value, namespace, fullKey));
      } else {
        keys.push(fullKey);
      }
    }

    return keys;
  }

  /**
   * Check if a translation exists
   */
  private hasTranslation(
    key: string,
    namespace: string,
    translations: Record<string, any>
  ): boolean {
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
   * Add a new translation key to all locales
   */
  async addTranslationKey(
    key: string,
    namespace: TranslationNamespace,
    translations: Record<SupportedLocale, string>,
    description?: string
  ): Promise<void> {
    for (const locale of this.supportedLocales) {
      const currentTranslations = await this.loadTranslations(locale);
      const namespaceTranslations = currentTranslations[namespace] || {};

      this.setNestedValue(namespaceTranslations, key, translations[locale] || '');

      await this.saveTranslations(locale, namespace, namespaceTranslations);
    }
  }

  /**
   * Set nested value in translation object
   */
  private setNestedValue(obj: any, key: string, value: any): void {
    const keyParts = key.split('.');
    let current = obj;

    for (let i = 0; i < keyParts.length - 1; i++) {
      const part = keyParts[i];
      if (!(part in current) || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }

    current[keyParts[keyParts.length - 1]] = value;
  }

  /**
   * Validate translation file structure
   */
  async validateTranslations(): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const locale of this.supportedLocales) {
      for (const namespace of this.supportedNamespaces) {
        const filePath = path.join(this.localesPath, locale, `${namespace}.json`);

        if (!fs.existsSync(filePath)) {
          warnings.push(`Missing translation file: ${locale}/${namespace}.json`);
          continue;
        }

        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          JSON.parse(content);
        } catch (error) {
          errors.push(`Invalid JSON in ${locale}/${namespace}.json: ${error}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generate translation statistics
   */
  async getTranslationStats(): Promise<{
    totalKeys: number;
    completionByLocale: Record<SupportedLocale, number>;
    missingTranslations: MissingTranslation[];
  }> {
    const missing = await findMissingTranslations();
    const allTranslations: Record<SupportedLocale, Record<string, any>> = {};

    for (const locale of this.supportedLocales) {
      allTranslations[locale] = await this.loadTranslations(locale);
    }

    // Count total unique keys
    const allKeys = new Set<string>();
    for (const locale of this.supportedLocales) {
      for (const namespace of this.supportedNamespaces) {
        const keys = this.flattenKeys(allTranslations[locale][namespace] || {}, namespace);
        keys.forEach(key => allKeys.add(`${namespace}:${key}`));
      }
    }

    const totalKeys = allKeys.size;
    const completionByLocale: Record<SupportedLocale, number> = {} as any;

    for (const locale of this.supportedLocales) {
      let translatedKeys = 0;
      for (const key of allKeys) {
        const [namespace, ...keyParts] = key.split(':');
        const fullKey = keyParts.join(':');
        if (this.hasTranslation(fullKey, namespace, allTranslations[locale])) {
          translatedKeys++;
        }
      }
      completionByLocale[locale] = totalKeys > 0 ? (translatedKeys / totalKeys) * 100 : 100;
    }

    return {
      totalKeys,
      completionByLocale,
      missingTranslations: missing,
    };
  }
}

/**
 * Default translation manager instance
 */
export const translationManager = new TranslationManager();

/**
 * Utility function to find missing translations
 */
export const findMissingTranslations = async (): Promise<MissingTranslation[]> => {
  return translationManager.findMissingTranslations();
};
