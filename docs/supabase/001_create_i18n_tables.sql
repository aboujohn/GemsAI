-- GemsAI Internationalization Schema Migration for Supabase
-- This migration creates the core internationalization infrastructure

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create languages table
CREATE TABLE IF NOT EXISTS public.languages (
  id VARCHAR(10) PRIMARY KEY,
  name JSONB NOT NULL,
  direction TEXT NOT NULL DEFAULT 'ltr' CHECK (direction IN ('ltr', 'rtl')),
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure only one default language
CREATE UNIQUE INDEX IF NOT EXISTS idx_languages_single_default 
  ON public.languages(is_default) WHERE is_default = TRUE;

-- Create other indexes for languages
CREATE INDEX IF NOT EXISTS idx_languages_active 
  ON public.languages(is_active) WHERE is_active = TRUE;

-- Create translation metadata table
CREATE TABLE IF NOT EXISTS public.translation_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  language_id VARCHAR(10) NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  is_original BOOLEAN DEFAULT FALSE,
  translation_status TEXT DEFAULT 'draft' CHECK (translation_status IN ('draft', 'pending', 'approved', 'published')),
  translator_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(entity_type, entity_id, language_id)
);

-- Indexes for translation metadata
CREATE INDEX IF NOT EXISTS idx_translation_metadata_entity 
  ON public.translation_metadata(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_translation_metadata_language 
  ON public.translation_metadata(language_id);
CREATE INDEX IF NOT EXISTS idx_translation_metadata_status 
  ON public.translation_metadata(translation_status);

-- Create story translations table
CREATE TABLE IF NOT EXISTS public.story_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL,
  language_id VARCHAR(10) NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  summary TEXT,
  emotion_tags TEXT[],
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(story_id, language_id)
);

-- Indexes for story translations
CREATE INDEX IF NOT EXISTS idx_story_translations_story 
  ON public.story_translations(story_id);
CREATE INDEX IF NOT EXISTS idx_story_translations_language 
  ON public.story_translations(language_id);
CREATE INDEX IF NOT EXISTS idx_story_translations_emotion_tags 
  ON public.story_translations USING GIN(emotion_tags);
CREATE INDEX IF NOT EXISTS idx_story_translations_content_search 
  ON public.story_translations USING GIN(to_tsvector('simple', content));

-- Create product translations table
CREATE TABLE IF NOT EXISTS public.product_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL,
  language_id VARCHAR(10) NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  materials_description TEXT,
  care_instructions TEXT,
  style_tags TEXT[],
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(product_id, language_id)
);

-- Indexes for product translations
CREATE INDEX IF NOT EXISTS idx_product_translations_product 
  ON public.product_translations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_translations_language 
  ON public.product_translations(language_id);
CREATE INDEX IF NOT EXISTS idx_product_translations_style_tags 
  ON public.product_translations USING GIN(style_tags);
CREATE INDEX IF NOT EXISTS idx_product_translations_name_search 
  ON public.product_translations USING GIN(to_tsvector('simple', name));

-- Create jeweler translations table
CREATE TABLE IF NOT EXISTS public.jeweler_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jeweler_id UUID NOT NULL,
  language_id VARCHAR(10) NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT,
  specialties TEXT[],
  location_description TEXT,
  tagline TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(jeweler_id, language_id)
);

-- Indexes for jeweler translations
CREATE INDEX IF NOT EXISTS idx_jeweler_translations_jeweler 
  ON public.jeweler_translations(jeweler_id);
CREATE INDEX IF NOT EXISTS idx_jeweler_translations_language 
  ON public.jeweler_translations(language_id);
CREATE INDEX IF NOT EXISTS idx_jeweler_translations_specialties 
  ON public.jeweler_translations USING GIN(specialties);

-- Create system translations table
CREATE TABLE IF NOT EXISTS public.system_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  translation_key TEXT NOT NULL UNIQUE,
  translations JSONB NOT NULL,
  context TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for system translations
CREATE INDEX IF NOT EXISTS idx_system_translations_key 
  ON public.system_translations(translation_key);
CREATE INDEX IF NOT EXISTS idx_system_translations_context 
  ON public.system_translations(context);
CREATE INDEX IF NOT EXISTS idx_system_translations_content 
  ON public.system_translations USING GIN(translations);

-- Create enum translations table
CREATE TABLE IF NOT EXISTS public.enum_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enum_type TEXT NOT NULL,
  enum_value TEXT NOT NULL,
  translations JSONB NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(enum_type, enum_value)
);

-- Indexes for enum translations
CREATE INDEX IF NOT EXISTS idx_enum_translations_type 
  ON public.enum_translations(enum_type);
CREATE INDEX IF NOT EXISTS idx_enum_translations_value 
  ON public.enum_translations(enum_value);
CREATE INDEX IF NOT EXISTS idx_enum_translations_content 
  ON public.enum_translations USING GIN(translations);

-- Create updated_at trigger function (Supabase standard)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER set_updated_at_languages
  BEFORE UPDATE ON public.languages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_translation_metadata
  BEFORE UPDATE ON public.translation_metadata
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_story_translations
  BEFORE UPDATE ON public.story_translations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_product_translations
  BEFORE UPDATE ON public.product_translations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_jeweler_translations
  BEFORE UPDATE ON public.jeweler_translations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_system_translations
  BEFORE UPDATE ON public.system_translations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_enum_translations
  BEFORE UPDATE ON public.enum_translations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at(); 