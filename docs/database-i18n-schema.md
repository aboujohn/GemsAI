# GemsAI Database Internationalization Schema

## Overview

This document outlines the database schema design for supporting internationalization (i18n) in the GemsAI platform. The schema supports Hebrew-first content with English fallback, enabling multilingual content storage and retrieval.

## Design Principles

1. **Hebrew-First Approach**: Hebrew is the primary language with English as fallback
2. **Efficient Storage**: Minimize data duplication while ensuring performance
3. **Scalable Architecture**: Easy to add new languages in the future
4. **Query Performance**: Optimized for fast multilingual content retrieval
5. **Data Integrity**: Foreign key constraints and validation rules

## Schema Approach

We use a **hybrid approach** combining separate translation tables for content-heavy entities and JSON columns for simple key-value translations.

### Approach 1: Translation Tables (Content-Heavy Entities)
For entities with substantial multilingual content (stories, products, jeweler profiles):
- Separate translation tables with foreign keys
- One row per language per entity
- Better for complex content with multiple translatable fields

### Approach 2: JSON Columns (Simple Translations)
For entities with minimal multilingual content (categories, tags, enums):
- JSON columns storing translations as key-value pairs
- Easier to manage for simple strings
- More efficient for entities with few translatable fields

## Core Internationalization Tables

### 1. Languages Table
```sql
CREATE TABLE languages (
  id VARCHAR(10) PRIMARY KEY,           -- 'he', 'en', 'ar', 'fr'
  name JSONB NOT NULL,                  -- {"he": "עברית", "en": "Hebrew"}
  direction TEXT NOT NULL DEFAULT 'ltr', -- 'ltr' or 'rtl'
  is_default BOOLEAN DEFAULT FALSE,     -- Only one can be true
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_languages_default ON languages(is_default) WHERE is_default = TRUE;
CREATE INDEX idx_languages_active ON languages(is_active) WHERE is_active = TRUE;
```

### 2. Translation Metadata Table
```sql
CREATE TABLE translation_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,            -- 'story', 'product', 'jeweler'
  entity_id UUID NOT NULL,              -- Foreign key to actual entity
  language_id VARCHAR(10) NOT NULL REFERENCES languages(id),
  is_original BOOLEAN DEFAULT FALSE,    -- True for the original language version
  translation_status TEXT DEFAULT 'draft', -- 'draft', 'pending', 'approved', 'published'
  translator_id UUID,                   -- Optional: user who translated
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(entity_type, entity_id, language_id)
);

-- Indexes
CREATE INDEX idx_translation_metadata_entity ON translation_metadata(entity_type, entity_id);
CREATE INDEX idx_translation_metadata_language ON translation_metadata(language_id);
CREATE INDEX idx_translation_metadata_status ON translation_metadata(translation_status);
```

## Entity-Specific Translation Tables

### 3. Story Translations
```sql
CREATE TABLE story_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL,               -- References stories.id
  language_id VARCHAR(10) NOT NULL REFERENCES languages(id),
  title TEXT,
  content TEXT NOT NULL,
  summary TEXT,                         -- Brief summary for listings
  emotion_tags TEXT[],                  -- Translated emotion tags
  seo_title TEXT,                       -- SEO-optimized title
  seo_description TEXT,                 -- SEO meta description
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(story_id, language_id),
  FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_story_translations_story ON story_translations(story_id);
CREATE INDEX idx_story_translations_language ON story_translations(language_id);
CREATE INDEX idx_story_translations_emotion_tags ON story_translations USING GIN(emotion_tags);
CREATE INDEX idx_story_translations_content_search ON story_translations USING GIN(to_tsvector('simple', content));
```

### 4. Product Translations
```sql
CREATE TABLE product_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,             -- References products.id
  language_id VARCHAR(10) NOT NULL REFERENCES languages(id),
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,               -- Brief description for cards
  materials_description TEXT,           -- Detailed materials info
  care_instructions TEXT,               -- Product care instructions
  style_tags TEXT[],                    -- Translated style tags
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(product_id, language_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_product_translations_product ON product_translations(product_id);
CREATE INDEX idx_product_translations_language ON product_translations(language_id);
CREATE INDEX idx_product_translations_style_tags ON product_translations USING GIN(style_tags);
CREATE INDEX idx_product_translations_name_search ON product_translations USING GIN(to_tsvector('simple', name));
```

### 5. Jeweler Translations
```sql
CREATE TABLE jeweler_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jeweler_id UUID NOT NULL,             -- References jewelers.id
  language_id VARCHAR(10) NOT NULL REFERENCES languages(id),
  name TEXT NOT NULL,
  bio TEXT,
  specialties TEXT[],                   -- Translated specialties
  location_description TEXT,            -- "Based in Tel Aviv, Israel"
  tagline TEXT,                         -- Short marketing tagline
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(jeweler_id, language_id),
  FOREIGN KEY (jeweler_id) REFERENCES jewelers(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_jeweler_translations_jeweler ON jeweler_translations(jeweler_id);
CREATE INDEX idx_jeweler_translations_language ON jeweler_translations(language_id);
CREATE INDEX idx_jeweler_translations_specialties ON jeweler_translations USING GIN(specialties);
```

## Entities Using JSON Approach

### 6. System Translations (UI Elements)
```sql
CREATE TABLE system_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  translation_key TEXT NOT NULL UNIQUE, -- 'buttons.save', 'messages.error.invalid_email'
  translations JSONB NOT NULL,          -- {"he": "שמור", "en": "Save"}
  context TEXT,                         -- 'ui', 'error', 'validation'
  description TEXT,                     -- Human-readable description
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_system_translations_key ON system_translations(translation_key);
CREATE INDEX idx_system_translations_context ON system_translations(context);
CREATE INDEX idx_system_translations_content ON system_translations USING GIN(translations);
```

### 7. Enum Translations (Categories, Status Values)
```sql
CREATE TABLE enum_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enum_type TEXT NOT NULL,              -- 'order_status', 'product_category'
  enum_value TEXT NOT NULL,             -- 'pending', 'completed'
  translations JSONB NOT NULL,          -- {"he": "ממתין", "en": "Pending"}
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(enum_type, enum_value)
);

-- Indexes
CREATE INDEX idx_enum_translations_type ON enum_translations(enum_type);
CREATE INDEX idx_enum_translations_value ON enum_translations(enum_value);
CREATE INDEX idx_enum_translations_content ON enum_translations USING GIN(translations);
```

## Utility Views for Easy Querying

### 8. Multilingual Content Views
```sql
-- View for stories with fallback logic
CREATE VIEW stories_multilingual AS
SELECT 
  s.id,
  s.user_id,
  s.created_at,
  s.updated_at,
  COALESCE(st_requested.title, st_default.title) as title,
  COALESCE(st_requested.content, st_default.content) as content,
  COALESCE(st_requested.summary, st_default.summary) as summary,
  COALESCE(st_requested.emotion_tags, st_default.emotion_tags) as emotion_tags,
  COALESCE(st_requested.language_id, st_default.language_id) as language_id,
  st_requested.language_id as requested_language,
  st_default.language_id as fallback_language
FROM stories s
LEFT JOIN story_translations st_requested ON s.id = st_requested.story_id AND st_requested.language_id = current_setting('app.current_language', true)
LEFT JOIN story_translations st_default ON s.id = st_default.story_id AND st_default.language_id = (SELECT id FROM languages WHERE is_default = TRUE);

-- Similar views for products and jewelers...
```

## Row Level Security (RLS) Policies

### 9. Translation Access Policies
```sql
-- Enable RLS on translation tables
ALTER TABLE story_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jeweler_translations ENABLE ROW LEVEL SECURITY;

-- Users can read all published translations
CREATE POLICY "Public can read published translations" ON story_translations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM translation_metadata tm 
      WHERE tm.entity_type = 'story' 
      AND tm.entity_id = story_id 
      AND tm.language_id = story_translations.language_id
      AND tm.translation_status = 'published'
    )
  );

-- Jewelers can manage their own content translations
CREATE POLICY "Jewelers can manage own translations" ON product_translations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM products p 
      JOIN jewelers j ON p.jeweler_id = j.id 
      WHERE p.id = product_id 
      AND j.user_id = auth.uid()
    )
  );
```

## Helper Functions

### 10. Translation Helper Functions
```sql
-- Function to get translation with fallback
CREATE OR REPLACE FUNCTION get_translation(
  entity_type TEXT,
  entity_id UUID,
  field_name TEXT,
  requested_language TEXT DEFAULT 'he'
) RETURNS TEXT AS $$
DECLARE
  translation_text TEXT;
  default_language TEXT;
BEGIN
  -- Get default language
  SELECT id INTO default_language FROM languages WHERE is_default = TRUE;
  
  -- Try to get requested translation
  CASE entity_type
    WHEN 'story' THEN
      EXECUTE format('SELECT %I FROM story_translations WHERE story_id = $1 AND language_id = $2', field_name)
      INTO translation_text USING entity_id, requested_language;
    WHEN 'product' THEN
      EXECUTE format('SELECT %I FROM product_translations WHERE product_id = $1 AND language_id = $2', field_name)
      INTO translation_text USING entity_id, requested_language;
    WHEN 'jeweler' THEN
      EXECUTE format('SELECT %I FROM jeweler_translations WHERE jeweler_id = $1 AND language_id = $2', field_name)
      INTO translation_text USING entity_id, requested_language;
  END CASE;
  
  -- Fallback to default language if not found
  IF translation_text IS NULL AND requested_language != default_language THEN
    CASE entity_type
      WHEN 'story' THEN
        EXECUTE format('SELECT %I FROM story_translations WHERE story_id = $1 AND language_id = $2', field_name)
        INTO translation_text USING entity_id, default_language;
      WHEN 'product' THEN
        EXECUTE format('SELECT %I FROM product_translations WHERE product_id = $1 AND language_id = $2', field_name)
        INTO translation_text USING entity_id, default_language;
      WHEN 'jeweler' THEN
        EXECUTE format('SELECT %I FROM jeweler_translations WHERE jeweler_id = $1 AND language_id = $2', field_name)
        INTO translation_text USING entity_id, default_language;
    END CASE;
  END IF;
  
  RETURN translation_text;
END;
$$ LANGUAGE plpgsql;

-- Function to get enum translation
CREATE OR REPLACE FUNCTION get_enum_translation(
  enum_type TEXT,
  enum_value TEXT,
  language_id TEXT DEFAULT 'he'
) RETURNS TEXT AS $$
DECLARE
  translation_text TEXT;
  default_language TEXT;
BEGIN
  -- Get default language
  SELECT id INTO default_language FROM languages WHERE is_default = TRUE;
  
  -- Try to get requested translation
  SELECT translations->language_id INTO translation_text
  FROM enum_translations
  WHERE enum_type = enum_type AND enum_value = enum_value AND is_active = TRUE;
  
  -- Fallback to default language
  IF translation_text IS NULL AND language_id != default_language THEN
    SELECT translations->default_language INTO translation_text
    FROM enum_translations
    WHERE enum_type = enum_type AND enum_value = enum_value AND is_active = TRUE;
  END IF;
  
  RETURN COALESCE(translation_text, enum_value);
END;
$$ LANGUAGE plpgsql;
```

## Performance Optimizations

### 11. Indexing Strategy
- **GIN indexes** on JSONB columns for translation search
- **Partial indexes** on active/default records
- **Composite indexes** on entity_id + language_id combinations
- **Full-text search indexes** on content fields

### 12. Caching Strategy
- **Application-level caching** for system translations (Redis)
- **Database-level caching** for frequently accessed content
- **CDN caching** for static translation content

## Migration Strategy

### 13. Initial Data Population
```sql
-- Insert supported languages
INSERT INTO languages (id, name, direction, is_default, is_active) VALUES
('he', '{"he": "עברית", "en": "Hebrew"}', 'rtl', TRUE, TRUE),
('en', '{"he": "אנגלית", "en": "English"}', 'ltr', FALSE, TRUE);

-- Insert common system translations
INSERT INTO system_translations (translation_key, translations, context) VALUES
('buttons.save', '{"he": "שמור", "en": "Save"}', 'ui'),
('buttons.cancel', '{"he": "ביטול", "en": "Cancel"}', 'ui'),
('buttons.edit', '{"he": "ערוך", "en": "Edit"}', 'ui'),
('messages.loading', '{"he": "טוען...", "en": "Loading..."}', 'ui');

-- Insert enum translations
INSERT INTO enum_translations (enum_type, enum_value, translations) VALUES
('order_status', 'pending', '{"he": "ממתין", "en": "Pending"}'),
('order_status', 'confirmed', '{"he": "מאושר", "en": "Confirmed"}'),
('order_status', 'completed', '{"he": "הושלם", "en": "Completed"}');
```

## Best Practices

1. **Always provide fallback translations** for critical content
2. **Use consistent translation keys** across the application
3. **Implement proper validation** for required translations
4. **Monitor translation completeness** across languages
5. **Cache frequently accessed translations** for performance
6. **Use database transactions** when updating multiple translation records
7. **Implement audit logging** for translation changes
8. **Consider translation workflow states** (draft, review, published)

## Next Steps

This schema design provides the foundation for multilingual content in GemsAI. The next phase (Task 3.6) will involve:

1. Implementing ORM entities and relationships
2. Creating migration scripts
3. Setting up query optimization
4. Implementing caching strategies
5. Creating data seeding mechanisms 