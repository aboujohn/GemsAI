# GemsAI Internationalization Database Design

## Overview

The GemsAI internationalization database schema is designed with a **Hebrew-first approach**, providing comprehensive multilingual support for all content types while maintaining optimal performance and data integrity.

## Design Principles

### 1. Hebrew-First Architecture
- Hebrew (`he`) is the primary language and serves as the fallback for all content
- English (`en`) is the secondary language
- All queries automatically fall back to Hebrew when requested translations are unavailable

### 2. Separation of Concerns
- **Content Tables**: Store language-agnostic data (IDs, relationships, metadata)
- **Translation Tables**: Store language-specific content
- **System/Enum Tables**: Store UI element and status translations

### 3. Performance Optimization
- Materialized views for common query patterns
- Strategic indexing including full-text search
- JSONB for efficient key-value translations
- Database functions for complex translation logic

## Database Schema Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Core Tables   │    │ Translation Mgmt │    │ UI Translations │
│                 │    │                  │    │                 │
│ • stories       │    │ • languages      │    │ • system_trans  │
│ • products      │────│ • translation    │────│ • enum_trans    │
│ • jewelers      │    │   _metadata      │    │                 │
│ • users         │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│Content Translations│    │  Helper Functions │    │ Multilingual Views │
│                 │    │                  │    │                 │
│ • story_trans   │    │ • get_system_    │    │ • stories_multi │
│ • product_trans │    │   translation    │    │ • products_multi│
│ • jeweler_trans │    │ • get_enum_      │    │ • jewelers_multi│
│                 │    │   translation    │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Core Tables

### 1. Languages Table
Defines supported languages and their properties.

```sql
CREATE TABLE languages (
    id VARCHAR(5) PRIMARY KEY,           -- 'he', 'en'
    name JSONB NOT NULL,                 -- {"he": "עברית", "en": "Hebrew"}
    direction VARCHAR(3) NOT NULL,       -- 'rtl', 'ltr'
    is_default BOOLEAN NOT NULL,         -- Only Hebrew is TRUE
    is_active BOOLEAN NOT NULL,          -- Controls availability
    sort_order INTEGER NOT NULL         -- Display priority
);
```

**Key Features:**
- JSONB name field supports self-referential translations
- Unique constraint ensures only one default language
- Direction field supports RTL/LTR switching

### 2. Translation Metadata
Tracks translation status and quality for all multilingual entities.

```sql
CREATE TABLE translation_metadata (
    entity_type VARCHAR(50) NOT NULL,    -- 'story', 'product', 'jeweler'
    entity_id UUID NOT NULL,
    language_id VARCHAR(5) NOT NULL,
    translation_status VARCHAR(20),      -- 'draft', 'approved', 'published'
    translation_quality_score INTEGER    -- 1-100 quality score
);
```

**Usage:**
- Monitor translation completeness across the platform
- Track translation workflow status
- Quality assurance for professional translations

## Content Translation Architecture

### Translation Tables Pattern
Each content type has a corresponding translation table:

```sql
-- Example: Story Translations
CREATE TABLE story_translations (
    story_id UUID NOT NULL,              -- FK to stories.id
    language_id VARCHAR(5) NOT NULL,     -- FK to languages.id
    title TEXT,                          -- Translated title
    content TEXT NOT NULL,               -- Translated content
    summary TEXT,                        -- Translated summary
    emotion_tags TEXT[],                 -- Localized emotion tags
    seo_title VARCHAR(100),              -- SEO metadata
    seo_description VARCHAR(300),
    UNIQUE(story_id, language_id)        -- One translation per language
);
```

**Benefits:**
- Clean separation of translatable vs. non-translatable data
- Efficient storage with minimal duplication
- Support for partial translations
- SEO optimization per language

### Multilingual Views
Automated language fallback through database views:

```sql
CREATE VIEW stories_multilingual AS
SELECT 
    s.id,
    s.user_id,
    COALESCE(st.title, st_fallback.title) as title,
    COALESCE(st.content, st_fallback.content) as content,
    -- Automatic Hebrew fallback for missing translations
    COALESCE(st.language_id, st_fallback.language_id, 'he') as language_id,
    -- Metadata about translation availability
    (st.language_id = current_setting('app.current_language', true)) as has_requested_translation
FROM stories s
LEFT JOIN story_translations st ON s.id = st.story_id 
    AND st.language_id = current_setting('app.current_language', true)
LEFT JOIN story_translations st_fallback ON s.id = st_fallback.story_id 
    AND st_fallback.language_id = 'he';
```

**Key Features:**
- Automatic fallback to Hebrew when requested language unavailable
- Metadata indicating translation status
- Session-based language context via `current_setting`

## System & Enum Translations

### System Translations
UI elements and static text stored as JSONB for performance:

```sql
CREATE TABLE system_translations (
    translation_key VARCHAR(200) UNIQUE, -- 'navigation.home'
    translations JSONB NOT NULL,         -- {"he": "בית", "en": "Home"}
    context VARCHAR(500),                -- Usage description
    description TEXT                     -- Developer notes
);
```

### Enum Translations
Status values and dropdown options:

```sql
CREATE TABLE enum_translations (
    enum_type VARCHAR(100) NOT NULL,     -- 'order_status'
    enum_value VARCHAR(100) NOT NULL,    -- 'pending'
    translations JSONB NOT NULL,         -- {"he": "ממתין", "en": "Pending"}
    sort_order INTEGER,                  -- Display order
    UNIQUE(enum_type, enum_value)
);
```

## Database Functions

### Translation Helper Functions

#### `get_system_translation(key, language)`
Retrieves system translations with automatic Hebrew fallback:

```sql
SELECT get_system_translation('navigation.home', 'en'); 
-- Returns: "Home" or falls back to "בית"
```

#### `get_enum_translation(type, value, language)`
Retrieves enum translations with fallback:

```sql
SELECT get_enum_translation('order_status', 'pending', 'en');
-- Returns: "Pending" or falls back to "ממתין"
```

#### `get_translation_completeness(entity_type, entity_id)`
Analyzes translation status across all languages:

```sql
SELECT * FROM get_translation_completeness('story', 'uuid-here');
-- Returns: language_id, language_name, is_complete, missing_fields[]
```

## Performance Optimizations

### Indexing Strategy

1. **Primary Indexes**: All foreign keys and unique constraints
2. **Full-Text Search**: Hebrew-optimized GIN indexes
3. **JSONB Indexes**: Language-specific extraction indexes
4. **Composite Indexes**: Common query patterns

```sql
-- Full-text search for Hebrew content
CREATE INDEX idx_story_translations_content_search 
ON story_translations USING GIN (to_tsvector('hebrew', content));

-- Fast JSONB lookups
CREATE INDEX idx_system_translations_jsonb_he 
ON system_translations USING GIN ((translations->>'he'));
```

### Query Optimization

1. **Session Variables**: `current_setting('app.current_language')` for context
2. **Materialized Views**: Pre-computed multilingual joins
3. **Function Optimization**: PL/pgSQL for complex fallback logic

## Usage Patterns

### Setting Language Context
```sql
-- Set session language (typically done by application)
SELECT set_config('app.current_language', 'en', false);
```

### Querying Multilingual Content
```sql
-- Stories with automatic fallback
SELECT title, content, has_requested_translation 
FROM stories_multilingual 
WHERE id = 'story-uuid';

-- System translations
SELECT get_system_translation('buttons.save', 'en');

-- Enum translations
SELECT get_enum_translation('order_status', 'pending', 'he');
```

### Translation Management
```sql
-- Insert new translation
INSERT INTO story_translations (story_id, language_id, title, content)
VALUES ('uuid', 'en', 'English Title', 'English content...');

-- Check translation completeness
SELECT * FROM get_translation_completeness('story', 'uuid');
```

## Security & Access Control

### Row Level Security (RLS)
- Enabled on all translation tables
- Read access for authenticated users
- Write access controlled by application logic

### Data Validation
- Check constraints on enum values
- Foreign key constraints maintain data integrity
- UNIQUE constraints prevent duplicate translations

## Migration Strategy

### Initial Setup
1. Run `001_create_i18n_schema.sql` to create all tables and functions
2. Insert default Hebrew and English languages
3. Populate system and enum translations

### Content Migration
1. Identify existing Hebrew content as original language
2. Create translation entries for all content
3. Update application to use multilingual views

### Adding New Languages
1. Insert new language in `languages` table
2. Update application language selector
3. Begin translation workflow for priority content

## Best Practices

### For Developers

1. **Always use multilingual views** for content queries
2. **Set language context** at the application session level
3. **Use helper functions** for system/enum translations
4. **Monitor translation completeness** with provided functions

### For Content Management

1. **Hebrew-first approach**: Always create Hebrew content first
2. **Use translation metadata** to track workflow status
3. **Leverage quality scores** for translation management
4. **Regular completeness audits** across all content types

### For Performance

1. **Index optimization**: Add indexes for new query patterns
2. **View updates**: Refresh materialized views as needed
3. **Query planning**: Use EXPLAIN for complex multilingual queries
4. **Connection pooling**: Maintain session state efficiently

## Future Enhancements

### Planned Features
1. **Translation automation**: AI-powered translation suggestions
2. **Version control**: Track translation changes over time
3. **Workflow management**: Advanced approval processes
4. **Analytics**: Translation usage and performance metrics

### Extensibility
- **New content types**: Follow the established translation table pattern
- **Additional languages**: Easy addition with minimal schema changes
- **Custom translation logic**: Extend helper functions as needed
- **Integration APIs**: RESTful endpoints for external translation services

This database design provides a robust, scalable foundation for GemsAI's multilingual requirements while maintaining optimal performance and data integrity. 