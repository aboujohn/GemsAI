// GemsAI Internationalization Database Types
// These interfaces match the Supabase database schema for multilingual content

export interface Language {
  id: string; // 'he', 'en'
  name: Record<string, string>; // { "he": "עברית", "en": "Hebrew" }
  direction: 'ltr' | 'rtl';
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TranslationMetadata {
  id: string;
  entity_type: 'story' | 'product' | 'jeweler';
  entity_id: string;
  language_id: string;
  is_original: boolean;
  translation_status: 'draft' | 'pending' | 'approved' | 'published';
  translator_id?: string;
  created_at: string;
  updated_at: string;
}

export interface StoryTranslation {
  id: string;
  story_id: string;
  language_id: string;
  title?: string;
  content: string;
  summary?: string;
  emotion_tags?: string[];
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductTranslation {
  id: string;
  product_id: string;
  language_id: string;
  name: string;
  description?: string;
  short_description?: string;
  materials_description?: string;
  care_instructions?: string;
  style_tags?: string[];
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export interface JewelerTranslation {
  id: string;
  jeweler_id: string;
  language_id: string;
  name: string;
  bio?: string;
  specialties?: string[];
  location_description?: string;
  tagline?: string;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemTranslation {
  id: string;
  translation_key: string;
  translations: Record<string, string>; // { "he": "Hebrew text", "en": "English text" }
  context?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EnumTranslation {
  id: string;
  enum_type: string;
  enum_value: string;
  translations: Record<string, string>;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Multilingual view types (using the _multilingual views from the database)
export interface StoryMultilingual {
  id: string;
  user_id: string;
  title: string;
  content: string;
  summary?: string;
  emotion_tags?: string[];
  seo_title?: string;
  seo_description?: string;
  language_id: string;
  requested_language?: string;
  fallback_language?: string;
  has_requested_translation: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductMultilingual {
  id: string;
  jeweler_id: string;
  price?: number;
  images?: string[];
  name: string;
  description?: string;
  short_description?: string;
  materials_description?: string;
  care_instructions?: string;
  style_tags?: string[];
  seo_title?: string;
  seo_description?: string;
  language_id: string;
  requested_language?: string;
  fallback_language?: string;
  has_requested_translation: boolean;
  created_at: string;
  updated_at: string;
}

export interface JewelerMultilingual {
  id: string;
  user_id: string;
  portfolio_url?: string;
  name: string;
  bio?: string;
  specialties?: string[];
  location_description?: string;
  tagline?: string;
  seo_title?: string;
  seo_description?: string;
  language_id: string;
  requested_language?: string;
  fallback_language?: string;
  has_requested_translation: boolean;
  created_at: string;
  updated_at: string;
}

// Translation completeness result type
export interface TranslationCompleteness {
  language_id: string;
  language_name: string;
  is_complete: boolean;
  missing_fields: string[];
}

// Query builder options
export interface I18nQueryOptions {
  language?: string;
  fallbackLanguage?: string;
  includeMetadata?: boolean;
}

// Translation creation payload
export interface CreateTranslationPayload {
  entity_type: 'story' | 'product' | 'jeweler';
  entity_id: string;
  language_id: string;
  translation_data: Record<string, any>;
  is_original?: boolean;
  translation_status?: 'draft' | 'pending' | 'approved' | 'published';
}

// Bulk translation result
export interface BulkTranslationResult {
  success: number;
  failed: number;
  errors: Array<{
    entity_id: string;
    error: string;
  }>;
}
