# GemsAI Database Internationalization Implementation Guide

## Overview

This guide explains how to implement the internationalization database schema in the GemsAI project using Supabase. The implementation supports Hebrew-first content with English fallback and includes comprehensive translation management.

## Implementation Steps

### 1. Database Migration

Execute the migration files in order:

1. **001_create_i18n_tables.sql** - Creates all internationalization tables and indexes
2. **002_create_rls_policies.sql** - Sets up Row Level Security policies  
3. **003_create_helper_functions.sql** - Creates helper functions and views
4. **004_seed_initial_data.sql** - Seeds initial data for languages and common translations

```bash
# In Supabase SQL Editor, execute in order:
# 1. docs/supabase/001_create_i18n_tables.sql
# 2. docs/supabase/002_create_rls_policies.sql  
# 3. docs/supabase/003_create_helper_functions.sql
# 4. docs/supabase/004_seed_initial_data.sql
```

### 2. TypeScript Types

Create TypeScript interfaces for the internationalization schema:

```typescript
// lib/types/i18n.ts

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

// Multilingual view types (using the _multilingual views)
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
```

### 3. Supabase Client Configuration

Configure the Supabase client to work with the internationalization system:

```typescript
// lib/supabase/i18n-client.ts

import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types'; // Generated types

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper to set current language for queries
export const setCurrentLanguage = (languageId: string) => {
  return supabase.rpc('set_config', {
    setting_name: 'app.current_language',
    new_value: languageId,
    is_local: true
  });
};

// Enhanced query helpers with automatic fallback
export class I18nQueryBuilder {
  private language: string = 'he'; // Default to Hebrew

  constructor(language: string = 'he') {
    this.language = language;
  }

  setLanguage(language: string) {
    this.language = language;
    return this;
  }

  // Get stories with automatic language fallback
  async getStories() {
    await setCurrentLanguage(this.language);
    
    const { data, error } = await supabase
      .from('stories_multilingual')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Get story by ID with fallback
  async getStory(id: string) {
    await setCurrentLanguage(this.language);
    
    const { data, error } = await supabase
      .from('stories_multilingual')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Get products with automatic language fallback
  async getProducts() {
    await setCurrentLanguage(this.language);
    
    const { data, error } = await supabase
      .from('products_multilingual')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Get jewelers with automatic language fallback
  async getJewelers() {
    await setCurrentLanguage(this.language);
    
    const { data, error } = await supabase
      .from('jewelers_multilingual')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Get system translation
  async getSystemTranslation(key: string): Promise<string | null> {
    const { data, error } = await supabase
      .rpc('get_system_translation', {
        translation_key: key,
        language_id: this.language
      });

    if (error) {
      console.error('Error fetching system translation:', error);
      return null;
    }
    
    return data;
  }

  // Get enum translation
  async getEnumTranslation(enumType: string, enumValue: string): Promise<string> {
    const { data, error } = await supabase
      .rpc('get_enum_translation', {
        enum_type: enumType,
        enum_value: enumValue,
        language_id: this.language
      });

    if (error) {
      console.error('Error fetching enum translation:', error);
      return enumValue; // Fallback to original value
    }
    
    return data || enumValue;
  }

  // Get translation completeness for an entity
  async getTranslationCompleteness(entityType: string, entityId: string) {
    const { data, error } = await supabase
      .rpc('get_translation_completeness', {
        entity_type: entityType,
        entity_id: entityId
      });

    if (error) throw error;
    return data;
  }
}

// Create a global instance
export const i18nQuery = new I18nQueryBuilder();
```

### 4. React Hooks Integration

Create React hooks that work with the database schema:

```typescript
// lib/hooks/useI18nDatabase.ts

import { useCallback, useEffect, useState } from 'react';
import { i18nQuery, I18nQueryBuilder } from '@/lib/supabase/i18n-client';
import { useLanguage } from '@/lib/hooks/useLanguage';
import type { 
  StoryMultilingual, 
  ProductMultilingual, 
  JewelerMultilingual 
} from '@/lib/types/i18n';

export function useI18nQuery() {
  const { language } = useLanguage();
  const [queryBuilder] = useState(() => new I18nQueryBuilder(language));

  useEffect(() => {
    queryBuilder.setLanguage(language);
  }, [language, queryBuilder]);

  return queryBuilder;
}

export function useStories() {
  const [stories, setStories] = useState<StoryMultilingual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryBuilder = useI18nQuery();

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await queryBuilder.getStories();
      setStories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [queryBuilder]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  return { stories, loading, error, refetch: fetchStories };
}

export function useStory(id: string) {
  const [story, setStory] = useState<StoryMultilingual | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryBuilder = useI18nQuery();

  const fetchStory = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await queryBuilder.getStory(id);
      setStory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [id, queryBuilder]);

  useEffect(() => {
    fetchStory();
  }, [fetchStory]);

  return { story, loading, error, refetch: fetchStory };
}

export function useProducts() {
  const [products, setProducts] = useState<ProductMultilingual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryBuilder = useI18nQuery();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await queryBuilder.getProducts();
      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [queryBuilder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

export function useSystemTranslation(key: string) {
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const queryBuilder = useI18nQuery();

  useEffect(() => {
    const fetchTranslation = async () => {
      try {
        setLoading(true);
        const data = await queryBuilder.getSystemTranslation(key);
        setTranslation(data);
      } catch (err) {
        console.error('Error fetching system translation:', err);
        setTranslation(null);
      } finally {
        setLoading(false);
      }
    };

    if (key) {
      fetchTranslation();
    }
  }, [key, queryBuilder]);

  return { translation, loading };
}

export function useEnumTranslation(enumType: string, enumValue: string) {
  const [translation, setTranslation] = useState<string>(enumValue);
  const [loading, setLoading] = useState(true);
  const queryBuilder = useI18nQuery();

  useEffect(() => {
    const fetchTranslation = async () => {
      try {
        setLoading(true);
        const data = await queryBuilder.getEnumTranslation(enumType, enumValue);
        setTranslation(data);
      } catch (err) {
        console.error('Error fetching enum translation:', err);
        setTranslation(enumValue);
      } finally {
        setLoading(false);
      }
    };

    if (enumType && enumValue) {
      fetchTranslation();
    }
  }, [enumType, enumValue, queryBuilder]);

  return { translation, loading };
}
```

### 5. Backend NestJS Integration

For the NestJS backend, create DTOs and services:

```typescript
// jewelry-customization-backend/src/common/dto/i18n.dto.ts

import { IsString, IsOptional, IsBoolean, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTranslationDto {
  @ApiProperty()
  @IsString()
  entity_type: 'story' | 'product' | 'jeweler';

  @ApiProperty()
  @IsString()
  entity_id: string;

  @ApiProperty()
  @IsString()
  language_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_original?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  translation_status?: 'draft' | 'pending' | 'approved' | 'published';
}

export class CreateStoryTranslationDto {
  @ApiProperty()
  @IsString()
  story_id: string;

  @ApiProperty()
  @IsString()
  language_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  emotion_tags?: string[];
}

// jewelry-customization-backend/src/story/i18n-story.service.ts

import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateStoryTranslationDto } from '../common/dto/i18n.dto';

@Injectable()
export class I18nStoryService {
  constructor(private readonly supabase: SupabaseClient) {}

  async createStoryTranslation(dto: CreateStoryTranslationDto) {
    const { data, error } = await this.supabase
      .from('story_translations')
      .insert(dto)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getStoryTranslations(storyId: string, languageId?: string) {
    let query = this.supabase
      .from('story_translations')
      .select('*')
      .eq('story_id', storyId);

    if (languageId) {
      query = query.eq('language_id', languageId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getStoryWithFallback(storyId: string, languageId: string = 'he') {
    // Set the current language for the session
    await this.supabase.rpc('set_config', {
      setting_name: 'app.current_language',
      new_value: languageId,
      is_local: true
    });

    const { data, error } = await this.supabase
      .from('stories_multilingual')
      .select('*')
      .eq('id', storyId)
      .single();

    if (error) throw error;
    return data;
  }
}
```

### 6. Environment Variables

Add the necessary environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Default Language
NEXT_PUBLIC_DEFAULT_LANGUAGE=he
```

### 7. Usage Examples

```typescript
// pages/stories/[id].tsx
import { useStory } from '@/lib/hooks/useI18nDatabase';
import { useLanguage } from '@/lib/hooks/useLanguage';

export default function StoryPage({ id }: { id: string }) {
  const { story, loading, error } = useStory(id);
  const { language } = useLanguage();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!story) return <div>Story not found</div>;

  return (
    <div dir={language === 'he' ? 'rtl' : 'ltr'}>
      <h1>{story.title}</h1>
      <p>{story.content}</p>
      {!story.has_requested_translation && (
        <div className="fallback-notice">
          {language === 'he' ? 'מוצג בעברית' : 'Displaying in Hebrew (fallback)'}
        </div>
      )}
    </div>
  );
}

// components/ui/SystemText.tsx - Component for system translations
import { useSystemTranslation } from '@/lib/hooks/useI18nDatabase';

interface SystemTextProps {
  translationKey: string;
  fallback?: string;
}

export function SystemText({ translationKey, fallback }: SystemTextProps) {
  const { translation, loading } = useSystemTranslation(translationKey);

  if (loading) return <span>...</span>;
  return <span>{translation || fallback || translationKey}</span>;
}

// Usage: <SystemText translationKey="buttons.save" fallback="Save" />
```

## Key Benefits

1. **Hebrew-First Architecture**: Default language is Hebrew with automatic English fallback
2. **Performance Optimized**: Uses views and functions for efficient queries
3. **Security Built-in**: Row Level Security policies protect multilingual content
4. **Scalable**: Easy to add new languages or translation fields
5. **Type-Safe**: Full TypeScript support throughout the stack
6. **Fallback System**: Graceful degradation when translations are missing
7. **Translation Management**: Built-in workflow for translation approval
8. **SEO Friendly**: Separate SEO fields for each language

## Next Steps

1. Implement the migration files in Supabase
2. Add the TypeScript types to your project
3. Create the Supabase client configuration
4. Implement the React hooks
5. Update your components to use the new database schema
6. Test with Hebrew and English content
7. Set up translation workflows for content creators

This implementation provides a production-ready internationalization system that scales with your application and provides excellent performance for multilingual content. 