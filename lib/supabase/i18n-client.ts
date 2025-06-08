// GemsAI Internationalization Supabase Client
// Enhanced ORM with type-safe multilingual query support and automatic fallback

import { supabase, createI18nClient, handleSupabaseResponse, setLanguageContext } from './client';
import type {
  Database,
  Language,
  SystemTranslation,
  EnumTranslation,
  StoryMultilingual,
  ProductMultilingual,
  JewelerMultilingual,
  Tables,
} from '@/lib/types/database';

// Enhanced query builder for i18n operations
export class I18nQueryBuilder {
  private client: typeof supabase;
  private languageId: string;

  constructor(languageId: string = 'he') {
    this.client = createI18nClient(languageId);
    this.languageId = languageId;
  }

  // Set language context for session
  async setLanguage(languageId: string) {
    this.languageId = languageId;
    await setLanguageContext(languageId);
  }

  // ============================================================================
  // LANGUAGE MANAGEMENT
  // ============================================================================

  async getLanguages(): Promise<Language[]> {
    return handleSupabaseResponse(
      this.client
        .from('languages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
    );
  }

  async getDefaultLanguage(): Promise<Language> {
    const languages = await handleSupabaseResponse(
      this.client
        .from('languages')
        .select('*')
        .eq('is_default', true)
        .eq('is_active', true)
        .limit(1)
    );
    return languages[0];
  }

  // ============================================================================
  // SYSTEM TRANSLATIONS
  // ============================================================================

  async getSystemTranslation(key: string, fallback?: string): Promise<string> {
    try {
      const result = await this.client.rpc('get_system_translation', {
        translation_key: key,
        language_id: this.languageId,
      });

      if (result.error) {
        console.warn(`Translation error for key "${key}":`, result.error);
        return fallback || key;
      }

      return result.data || fallback || key;
    } catch (error) {
      console.warn(`Failed to get system translation for "${key}":`, error);
      return fallback || key;
    }
  }

  async getSystemTranslations(keys: string[]): Promise<Record<string, string>> {
    if (keys.length === 0) return {};

    try {
      const translations = await handleSupabaseResponse(
        this.client
          .from('system_translations')
          .select('translation_key, translations')
          .in('translation_key', keys)
          .eq('is_active', true)
      );

      const result: Record<string, string> = {};

      for (const translation of translations) {
        const translationObj = translation.translations as Record<string, string>;
        result[translation.translation_key] =
          translationObj[this.languageId] || translationObj['he'] || translation.translation_key;
      }

      // Add fallback for missing keys
      for (const key of keys) {
        if (!result[key]) {
          result[key] = key;
        }
      }

      return result;
    } catch (error) {
      console.warn('Failed to get system translations:', error);
      // Return keys as fallback
      return keys.reduce((acc, key) => ({ ...acc, [key]: key }), {});
    }
  }

  // ============================================================================
  // ENUM TRANSLATIONS
  // ============================================================================

  async getEnumTranslation(
    enumType: string,
    enumValue: string,
    fallback?: string
  ): Promise<string> {
    try {
      const result = await this.client.rpc('get_enum_translation', {
        enum_type: enumType,
        enum_value: enumValue,
        language_id: this.languageId,
      });

      if (result.error) {
        console.warn(`Enum translation error for "${enumType}.${enumValue}":`, result.error);
        return fallback || enumValue;
      }

      return result.data || fallback || enumValue;
    } catch (error) {
      console.warn(`Failed to get enum translation for "${enumType}.${enumValue}":`, error);
      return fallback || enumValue;
    }
  }

  async getEnumTranslations(
    enumType: string,
    enumValues: string[]
  ): Promise<Record<string, string>> {
    if (enumValues.length === 0) return {};

    try {
      const translations = await handleSupabaseResponse(
        this.client
          .from('enum_translations')
          .select('enum_value, translations')
          .eq('enum_type', enumType)
          .in('enum_value', enumValues)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
      );

      const result: Record<string, string> = {};

      for (const translation of translations) {
        const translationObj = translation.translations as Record<string, string>;
        result[translation.enum_value] =
          translationObj[this.languageId] || translationObj['he'] || translation.enum_value;
      }

      // Add fallback for missing values
      for (const value of enumValues) {
        if (!result[value]) {
          result[value] = value;
        }
      }

      return result;
    } catch (error) {
      console.warn(`Failed to get enum translations for "${enumType}":`, error);
      // Return values as fallback
      return enumValues.reduce((acc, value) => ({ ...acc, [value]: value }), {});
    }
  }

  // ============================================================================
  // MULTILINGUAL CONTENT QUERIES
  // ============================================================================

  async getStories(
    options: {
      limit?: number;
      offset?: number;
      userId?: string;
      orderBy?: 'created_at' | 'updated_at';
      orderDirection?: 'asc' | 'desc';
    } = {}
  ): Promise<StoryMultilingual[]> {
    const {
      limit = 10,
      offset = 0,
      userId,
      orderBy = 'created_at',
      orderDirection = 'desc',
    } = options;

    // Set language context for the query
    await setLanguageContext(this.languageId);

    let query = this.client
      .from('stories_multilingual')
      .select('*')
      .range(offset, offset + limit - 1)
      .order(orderBy, { ascending: orderDirection === 'asc' });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    return handleSupabaseResponse(query);
  }

  async getStoryById(id: string): Promise<StoryMultilingual | null> {
    await setLanguageContext(this.languageId);

    const stories = await handleSupabaseResponse(
      this.client.from('stories_multilingual').select('*').eq('id', id).limit(1)
    );

    return stories[0] || null;
  }

  async getProducts(
    options: {
      limit?: number;
      offset?: number;
      jewelerId?: string;
      category?: string;
      availableOnly?: boolean;
      orderBy?: 'created_at' | 'updated_at' | 'price';
      orderDirection?: 'asc' | 'desc';
    } = {}
  ): Promise<ProductMultilingual[]> {
    const {
      limit = 10,
      offset = 0,
      jewelerId,
      category,
      availableOnly = true,
      orderBy = 'created_at',
      orderDirection = 'desc',
    } = options;

    await setLanguageContext(this.languageId);

    let query = this.client
      .from('products_multilingual')
      .select('*')
      .range(offset, offset + limit - 1)
      .order(orderBy, { ascending: orderDirection === 'asc' });

    if (jewelerId) {
      query = query.eq('jeweler_id', jewelerId);
    }

    if (availableOnly) {
      // Note: This would need to be added to the view or joined from the products table
      // For now, we'll assume all products in the view are available
    }

    return handleSupabaseResponse(query);
  }

  async getProductById(id: string): Promise<ProductMultilingual | null> {
    await setLanguageContext(this.languageId);

    const products = await handleSupabaseResponse(
      this.client.from('products_multilingual').select('*').eq('id', id).limit(1)
    );

    return products[0] || null;
  }

  async getJewelers(
    options: {
      limit?: number;
      offset?: number;
      verifiedOnly?: boolean;
      orderBy?: 'created_at' | 'updated_at';
      orderDirection?: 'asc' | 'desc';
    } = {}
  ): Promise<JewelerMultilingual[]> {
    const {
      limit = 10,
      offset = 0,
      verifiedOnly = true,
      orderBy = 'created_at',
      orderDirection = 'desc',
    } = options;

    await setLanguageContext(this.languageId);

    let query = this.client
      .from('jewelers_multilingual')
      .select('*')
      .range(offset, offset + limit - 1)
      .order(orderBy, { ascending: orderDirection === 'asc' });

    // Note: verification_status would need to be added to the multilingual view
    // or joined from the jewelers table

    return handleSupabaseResponse(query);
  }

  async getJewelerById(id: string): Promise<JewelerMultilingual | null> {
    await setLanguageContext(this.languageId);

    const jewelers = await handleSupabaseResponse(
      this.client.from('jewelers_multilingual').select('*').eq('id', id).limit(1)
    );

    return jewelers[0] || null;
  }

  // ============================================================================
  // SEARCH AND FILTERING
  // ============================================================================

  async searchStories(
    query: string,
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<StoryMultilingual[]> {
    const { limit = 10, offset = 0 } = options;

    await setLanguageContext(this.languageId);

    // Use full-text search with Hebrew support
    return handleSupabaseResponse(
      this.client
        .from('stories_multilingual')
        .select('*')
        .textSearch('content', query, {
          type: 'websearch',
          config: this.languageId === 'he' ? 'hebrew' : 'english',
        })
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })
    );
  }

  async searchProducts(
    query: string,
    options: {
      limit?: number;
      offset?: number;
      category?: string;
    } = {}
  ): Promise<ProductMultilingual[]> {
    const { limit = 10, offset = 0, category } = options;

    await setLanguageContext(this.languageId);

    let searchQuery = this.client
      .from('products_multilingual')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (category) {
      // Note: category would need to be included in the multilingual view
      // or this would need to be a more complex join query
    }

    return handleSupabaseResponse(searchQuery);
  }

  // ============================================================================
  // TRANSLATION MANAGEMENT
  // ============================================================================

  async getTranslationCompleteness(entityType: string, entityId: string) {
    try {
      const result = await this.client.rpc('get_translation_completeness', {
        entity_type: entityType,
        entity_id: entityId,
      });

      if (result.error) {
        console.warn(`Translation completeness error:`, result.error);
        return [];
      }

      return result.data || [];
    } catch (error) {
      console.warn('Failed to get translation completeness:', error);
      return [];
    }
  }

  // ============================================================================
  // CACHING AND PERFORMANCE
  // ============================================================================

  // Simple in-memory cache for system translations
  private static systemTranslationsCache = new Map<
    string,
    { data: Record<string, string>; timestamp: number }
  >();
  private static CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async getCachedSystemTranslations(keys: string[]): Promise<Record<string, string>> {
    const cacheKey = `${this.languageId}:${keys.sort().join(',')}`;
    const cached = I18nQueryBuilder.systemTranslationsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < I18nQueryBuilder.CACHE_TTL) {
      return cached.data;
    }

    const translations = await this.getSystemTranslations(keys);

    I18nQueryBuilder.systemTranslationsCache.set(cacheKey, {
      data: translations,
      timestamp: Date.now(),
    });

    return translations;
  }

  // Clear cache (useful for admin operations)
  static clearCache() {
    I18nQueryBuilder.systemTranslationsCache.clear();
  }
}

// Convenience function to create a query builder
export function createI18nQuery(languageId: string = 'he'): I18nQueryBuilder {
  return new I18nQueryBuilder(languageId);
}

// Default query builder instance
export const i18nQuery = new I18nQueryBuilder('he');

// Re-export the basic client for direct access when needed
export { supabase, createI18nClient, handleSupabaseResponse, setLanguageContext } from './client';
