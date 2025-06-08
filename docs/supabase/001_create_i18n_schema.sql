-- GemsAI Internationalization Database Schema
-- Comprehensive multilingual support with Hebrew-first approach

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE LANGUAGE MANAGEMENT
-- ============================================================================

-- Languages table - Defines supported languages
CREATE TABLE IF NOT EXISTS languages (
    id VARCHAR(5) PRIMARY KEY, -- 'he', 'en', etc.
    name JSONB NOT NULL, -- {"he": "עברית", "en": "Hebrew"}
    direction VARCHAR(3) NOT NULL CHECK (direction IN ('ltr', 'rtl')),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint for default language
CREATE UNIQUE INDEX IF NOT EXISTS languages_default_unique 
ON languages (is_default) WHERE is_default = TRUE;

-- Insert default languages
INSERT INTO languages (id, name, direction, is_default, is_active, sort_order) VALUES
('he', '{"he": "עברית", "en": "Hebrew"}', 'rtl', TRUE, TRUE, 1),
('en', '{"he": "אנגלית", "en": "English"}', 'ltr', FALSE, TRUE, 2)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TRANSLATION METADATA MANAGEMENT
-- ============================================================================

-- Translation metadata - Tracks translation status for entities
CREATE TABLE IF NOT EXISTS translation_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- 'story', 'product', 'jeweler'
    entity_id UUID NOT NULL,
    language_id VARCHAR(5) NOT NULL REFERENCES languages(id),
    is_original BOOLEAN NOT NULL DEFAULT FALSE,
    translation_status VARCHAR(20) NOT NULL DEFAULT 'draft' 
        CHECK (translation_status IN ('draft', 'pending', 'approved', 'published')),
    translator_id UUID, -- Reference to users table if needed
    translation_quality_score INTEGER CHECK (translation_quality_score BETWEEN 1 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(entity_type, entity_id, language_id)
);

-- Indexes for translation metadata
CREATE INDEX IF NOT EXISTS idx_translation_metadata_entity ON translation_metadata(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_translation_metadata_language ON translation_metadata(language_id);
CREATE INDEX IF NOT EXISTS idx_translation_metadata_status ON translation_metadata(translation_status);

-- ============================================================================
-- CONTENT TRANSLATION TABLES
-- ============================================================================

-- Story translations
CREATE TABLE IF NOT EXISTS story_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL, -- References stories.id
    language_id VARCHAR(5) NOT NULL REFERENCES languages(id),
    title TEXT,
    content TEXT NOT NULL,
    summary TEXT,
    emotion_tags TEXT[],
    seo_title VARCHAR(100),
    seo_description VARCHAR(300),
    slug VARCHAR(200),
    reading_time_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, language_id)
);

-- Product translations
CREATE TABLE IF NOT EXISTS product_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL, -- References products.id
    language_id VARCHAR(5) NOT NULL REFERENCES languages(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    materials_description TEXT,
    care_instructions TEXT,
    style_tags TEXT[],
    seo_title VARCHAR(100),
    seo_description VARCHAR(300),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, language_id)
);

-- Jeweler translations
CREATE TABLE IF NOT EXISTS jeweler_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jeweler_id UUID NOT NULL, -- References jewelers.id
    language_id VARCHAR(5) NOT NULL REFERENCES languages(id),
    name VARCHAR(200) NOT NULL,
    bio TEXT,
    specialties TEXT[],
    location_description TEXT,
    tagline VARCHAR(200),
    seo_title VARCHAR(100),
    seo_description VARCHAR(300),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(jeweler_id, language_id)
);

-- Indexes for content translations
CREATE INDEX IF NOT EXISTS idx_story_translations_story ON story_translations(story_id);
CREATE INDEX IF NOT EXISTS idx_story_translations_language ON story_translations(language_id);
CREATE INDEX IF NOT EXISTS idx_product_translations_product ON product_translations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_translations_language ON product_translations(language_id);
CREATE INDEX IF NOT EXISTS idx_jeweler_translations_jeweler ON jeweler_translations(jeweler_id);
CREATE INDEX IF NOT EXISTS idx_jeweler_translations_language ON jeweler_translations(language_id);

-- Full-text search indexes for translations
CREATE INDEX IF NOT EXISTS idx_story_translations_content_search 
ON story_translations USING GIN (to_tsvector('hebrew', content));
CREATE INDEX IF NOT EXISTS idx_story_translations_title_search 
ON story_translations USING GIN (to_tsvector('hebrew', title));
CREATE INDEX IF NOT EXISTS idx_product_translations_search 
ON product_translations USING GIN (to_tsvector('hebrew', name || ' ' || COALESCE(description, '')));

-- ============================================================================
-- SYSTEM TRANSLATIONS
-- ============================================================================

-- System translations for UI elements
CREATE TABLE IF NOT EXISTS system_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    translation_key VARCHAR(200) NOT NULL UNIQUE,
    translations JSONB NOT NULL, -- {"he": "Hebrew text", "en": "English text"}
    context VARCHAR(500), -- Description of where this is used
    description TEXT, -- Developer notes
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for system translations
CREATE INDEX IF NOT EXISTS idx_system_translations_key ON system_translations(translation_key);
CREATE INDEX IF NOT EXISTS idx_system_translations_active ON system_translations(is_active);

-- Enum value translations
CREATE TABLE IF NOT EXISTS enum_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enum_type VARCHAR(100) NOT NULL, -- 'order_status', 'user_role', etc.
    enum_value VARCHAR(100) NOT NULL,
    translations JSONB NOT NULL, -- {"he": "Hebrew text", "en": "English text"}
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(enum_type, enum_value)
);

-- Index for enum translations
CREATE INDEX IF NOT EXISTS idx_enum_translations_type ON enum_translations(enum_type);
CREATE INDEX IF NOT EXISTS idx_enum_translations_active ON enum_translations(is_active);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get system translation with fallback
CREATE OR REPLACE FUNCTION get_system_translation(
    translation_key TEXT,
    language_id TEXT DEFAULT 'he'
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    result TEXT;
BEGIN
    SELECT 
        COALESCE(
            translations->>language_id,
            translations->>'he',
            translation_key
        )
    INTO result
    FROM system_translations
    WHERE system_translations.translation_key = get_system_translation.translation_key
    AND is_active = TRUE;
    
    RETURN COALESCE(result, translation_key);
END;
$$;

-- Function to get enum translation with fallback
CREATE OR REPLACE FUNCTION get_enum_translation(
    enum_type TEXT,
    enum_value TEXT,
    language_id TEXT DEFAULT 'he'
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    result TEXT;
BEGIN
    SELECT 
        COALESCE(
            translations->>language_id,
            translations->>'he',
            enum_value
        )
    INTO result
    FROM enum_translations
    WHERE enum_translations.enum_type = get_enum_translation.enum_type
    AND enum_translations.enum_value = get_enum_translation.enum_value
    AND is_active = TRUE;
    
    RETURN COALESCE(result, enum_value);
END;
$$;

-- Function to check translation completeness
CREATE OR REPLACE FUNCTION get_translation_completeness(
    entity_type TEXT,
    entity_id UUID
)
RETURNS TABLE(
    language_id TEXT,
    language_name TEXT,
    is_complete BOOLEAN,
    missing_fields TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id as language_id,
        l.name->>'he' as language_name,
        CASE 
            WHEN entity_type = 'story' THEN
                EXISTS(SELECT 1 FROM story_translations st WHERE st.story_id = entity_id AND st.language_id = l.id)
            WHEN entity_type = 'product' THEN
                EXISTS(SELECT 1 FROM product_translations pt WHERE pt.product_id = entity_id AND pt.language_id = l.id)
            WHEN entity_type = 'jeweler' THEN
                EXISTS(SELECT 1 FROM jeweler_translations jt WHERE jt.jeweler_id = entity_id AND jt.language_id = l.id)
            ELSE FALSE
        END as is_complete,
        CASE 
            WHEN entity_type = 'story' AND NOT EXISTS(SELECT 1 FROM story_translations st WHERE st.story_id = entity_id AND st.language_id = l.id)
                THEN ARRAY['title', 'content']
            WHEN entity_type = 'product' AND NOT EXISTS(SELECT 1 FROM product_translations pt WHERE pt.product_id = entity_id AND pt.language_id = l.id)
                THEN ARRAY['name', 'description']
            WHEN entity_type = 'jeweler' AND NOT EXISTS(SELECT 1 FROM jeweler_translations jt WHERE jt.jeweler_id = entity_id AND jt.language_id = l.id)
                THEN ARRAY['name', 'bio']
            ELSE ARRAY[]::TEXT[]
        END as missing_fields
    FROM languages l
    WHERE l.is_active = TRUE
    ORDER BY l.sort_order;
END;
$$;

-- ============================================================================
-- MULTILINGUAL VIEWS
-- ============================================================================

-- Stories multilingual view
CREATE OR REPLACE VIEW stories_multilingual AS
SELECT 
    s.id,
    s.user_id,
    COALESCE(st.title, st_fallback.title) as title,
    COALESCE(st.content, st_fallback.content) as content,
    COALESCE(st.summary, st_fallback.summary) as summary,
    COALESCE(st.emotion_tags, st_fallback.emotion_tags) as emotion_tags,
    COALESCE(st.seo_title, st_fallback.seo_title) as seo_title,
    COALESCE(st.seo_description, st_fallback.seo_description) as seo_description,
    COALESCE(st.language_id, st_fallback.language_id, 'he') as language_id,
    current_setting('app.current_language', true) as requested_language,
    'he' as fallback_language,
    (st.language_id = current_setting('app.current_language', true)) as has_requested_translation,
    s.created_at,
    s.updated_at
FROM stories s
LEFT JOIN story_translations st ON s.id = st.story_id 
    AND st.language_id = current_setting('app.current_language', true)
LEFT JOIN story_translations st_fallback ON s.id = st_fallback.story_id 
    AND st_fallback.language_id = 'he';

-- Products multilingual view  
CREATE OR REPLACE VIEW products_multilingual AS
SELECT 
    p.id,
    p.jeweler_id,
    p.price,
    p.images,
    COALESCE(pt.name, pt_fallback.name) as name,
    COALESCE(pt.description, pt_fallback.description) as description,
    COALESCE(pt.short_description, pt_fallback.short_description) as short_description,
    COALESCE(pt.materials_description, pt_fallback.materials_description) as materials_description,
    COALESCE(pt.care_instructions, pt_fallback.care_instructions) as care_instructions,
    COALESCE(pt.style_tags, pt_fallback.style_tags) as style_tags,
    COALESCE(pt.seo_title, pt_fallback.seo_title) as seo_title,
    COALESCE(pt.seo_description, pt_fallback.seo_description) as seo_description,
    COALESCE(pt.language_id, pt_fallback.language_id, 'he') as language_id,
    current_setting('app.current_language', true) as requested_language,
    'he' as fallback_language,
    (pt.language_id = current_setting('app.current_language', true)) as has_requested_translation,
    p.created_at,
    p.updated_at
FROM products p
LEFT JOIN product_translations pt ON p.id = pt.product_id 
    AND pt.language_id = current_setting('app.current_language', true)
LEFT JOIN product_translations pt_fallback ON p.id = pt_fallback.product_id 
    AND pt_fallback.language_id = 'he';

-- Jewelers multilingual view
CREATE OR REPLACE VIEW jewelers_multilingual AS
SELECT 
    j.id,
    j.user_id,
    j.portfolio_url,
    COALESCE(jt.name, jt_fallback.name) as name,
    COALESCE(jt.bio, jt_fallback.bio) as bio,
    COALESCE(jt.specialties, jt_fallback.specialties) as specialties,
    COALESCE(jt.location_description, jt_fallback.location_description) as location_description,
    COALESCE(jt.tagline, jt_fallback.tagline) as tagline,
    COALESCE(jt.seo_title, jt_fallback.seo_title) as seo_title,
    COALESCE(jt.seo_description, jt_fallback.seo_description) as seo_description,
    COALESCE(jt.language_id, jt_fallback.language_id, 'he') as language_id,
    current_setting('app.current_language', true) as requested_language,
    'he' as fallback_language,
    (jt.language_id = current_setting('app.current_language', true)) as has_requested_translation,
    j.created_at,
    j.updated_at
FROM jewelers j
LEFT JOIN jeweler_translations jt ON j.id = jt.jeweler_id 
    AND jt.language_id = current_setting('app.current_language', true)
LEFT JOIN jeweler_translations jt_fallback ON j.id = jt_fallback.jeweler_id 
    AND jt_fallback.language_id = 'he';

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language plpgsql;

-- Add triggers for timestamp updates
CREATE TRIGGER update_languages_updated_at 
    BEFORE UPDATE ON languages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translation_metadata_updated_at 
    BEFORE UPDATE ON translation_metadata 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_story_translations_updated_at 
    BEFORE UPDATE ON story_translations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_translations_updated_at 
    BEFORE UPDATE ON product_translations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jeweler_translations_updated_at 
    BEFORE UPDATE ON jeweler_translations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_translations_updated_at 
    BEFORE UPDATE ON system_translations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enum_translations_updated_at 
    BEFORE UPDATE ON enum_translations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA INSERTION
-- ============================================================================

-- Insert sample system translations
INSERT INTO system_translations (translation_key, translations, context, description) VALUES
('navigation.home', '{"he": "בית", "en": "Home"}', 'Main navigation', 'Homepage link'),
('navigation.stories', '{"he": "סיפורים", "en": "Stories"}', 'Main navigation', 'Stories section link'),
('navigation.products', '{"he": "מוצרים", "en": "Products"}', 'Main navigation', 'Products section link'),
('navigation.jewelers', '{"he": "צורפים", "en": "Jewelers"}', 'Main navigation', 'Jewelers section link'),
('buttons.save', '{"he": "שמור", "en": "Save"}', 'Form buttons', 'Save action button'),
('buttons.cancel', '{"he": "בטל", "en": "Cancel"}', 'Form buttons', 'Cancel action button'),
('buttons.edit', '{"he": "ערוך", "en": "Edit"}', 'Form buttons', 'Edit action button'),
('buttons.search', '{"he": "חפש", "en": "Search"}', 'Form buttons', 'Search action button'),
('messages.loading', '{"he": "טוען...", "en": "Loading..."}', 'Status messages', 'Loading state indicator'),
('messages.success', '{"he": "פעולה בוצעה בהצלחה", "en": "Operation completed successfully"}', 'Status messages', 'Success notification'),
('messages.no_results', '{"he": "לא נמצאו תוצאות", "en": "No results found"}', 'Status messages', 'Empty state message')
ON CONFLICT (translation_key) DO NOTHING;

-- Insert sample enum translations
INSERT INTO enum_translations (enum_type, enum_value, translations, sort_order) VALUES
('order_status', 'pending', '{"he": "ממתין", "en": "Pending"}', 1),
('order_status', 'confirmed', '{"he": "אושר", "en": "Confirmed"}', 2),
('order_status', 'in_progress', '{"he": "בתהליך", "en": "In Progress"}', 3),
('order_status', 'completed', '{"he": "הושלם", "en": "Completed"}', 4),
('order_status', 'shipped', '{"he": "נשלח", "en": "Shipped"}', 5),
('product_category', 'rings', '{"he": "טבעות", "en": "Rings"}', 1),
('product_category', 'necklaces', '{"he": "שרשראות", "en": "Necklaces"}', 2),
('product_category', 'earrings', '{"he": "עגילים", "en": "Earrings"}', 3),
('product_category', 'bracelets', '{"he": "צמידים", "en": "Bracelets"}', 4),
('material', 'gold', '{"he": "זהב", "en": "Gold"}', 1),
('material', 'silver', '{"he": "כסף", "en": "Silver"}', 2),
('material', 'diamond', '{"he": "יהלום", "en": "Diamond"}', 3),
('material', 'pearl', '{"he": "פנינה", "en": "Pearl"}', 4)
ON CONFLICT (enum_type, enum_value) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jeweler_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE enum_translations ENABLE ROW LEVEL SECURITY;

-- Create policies for read access (all authenticated users can read)
CREATE POLICY "Allow read access to languages" ON languages FOR SELECT USING (TRUE);
CREATE POLICY "Allow read access to system translations" ON system_translations FOR SELECT USING (TRUE);
CREATE POLICY "Allow read access to enum translations" ON enum_translations FOR SELECT USING (TRUE);

-- More restrictive policies can be added based on your authentication system

-- ============================================================================
-- PERFORMANCE OPTIMIZATIONS
-- ============================================================================

-- Analyze tables for query optimization
ANALYZE languages;
ANALYZE translation_metadata;
ANALYZE story_translations;
ANALYZE product_translations;
ANALYZE jeweler_translations;
ANALYZE system_translations;
ANALYZE enum_translations;

-- Create additional indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_system_translations_jsonb_he ON system_translations USING GIN ((translations->>'he'));
CREATE INDEX IF NOT EXISTS idx_system_translations_jsonb_en ON system_translations USING GIN ((translations->>'en'));
CREATE INDEX IF NOT EXISTS idx_enum_translations_jsonb_he ON enum_translations USING GIN ((translations->>'he'));
CREATE INDEX IF NOT EXISTS idx_enum_translations_jsonb_en ON enum_translations USING GIN ((translations->>'en'));

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE languages IS 'Supported languages with metadata including direction and default status';
COMMENT ON TABLE translation_metadata IS 'Tracks translation status and metadata for multilingual entities';
COMMENT ON TABLE story_translations IS 'Story content translations for all supported languages';
COMMENT ON TABLE product_translations IS 'Product information translations for all supported languages';
COMMENT ON TABLE jeweler_translations IS 'Jeweler profile translations for all supported languages';
COMMENT ON TABLE system_translations IS 'UI element translations stored as JSON for efficient access';
COMMENT ON TABLE enum_translations IS 'Enum value translations for dropdown lists and status indicators';
COMMENT ON VIEW stories_multilingual IS 'Automatic language fallback view for story content';
COMMENT ON VIEW products_multilingual IS 'Automatic language fallback view for product content';
COMMENT ON VIEW jewelers_multilingual IS 'Automatic language fallback view for jeweler content';
COMMENT ON FUNCTION get_system_translation(TEXT, TEXT) IS 'Retrieves system translation with Hebrew fallback';
COMMENT ON FUNCTION get_enum_translation(TEXT, TEXT, TEXT) IS 'Retrieves enum translation with Hebrew fallback';
COMMENT ON FUNCTION get_translation_completeness(TEXT, UUID) IS 'Analyzes translation completeness for entities'; 