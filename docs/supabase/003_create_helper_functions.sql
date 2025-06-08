-- Helper Functions and Views for GemsAI Internationalization (Supabase Optimized)

-- Function to get translation with Hebrew-first fallback
CREATE OR REPLACE FUNCTION public.get_translation(
  entity_type TEXT,
  entity_id UUID,
  field_name TEXT,
  requested_language TEXT DEFAULT 'he'
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  translation_text TEXT;
  default_language TEXT := 'he'; -- Hebrew is our default
BEGIN
  -- Validate inputs
  IF entity_type IS NULL OR entity_id IS NULL OR field_name IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Try to get requested translation
  CASE entity_type
    WHEN 'story' THEN
      EXECUTE format('SELECT %I FROM public.story_translations WHERE story_id = $1 AND language_id = $2', field_name)
      INTO translation_text USING entity_id, requested_language;
    WHEN 'product' THEN
      EXECUTE format('SELECT %I FROM public.product_translations WHERE product_id = $1 AND language_id = $2', field_name)
      INTO translation_text USING entity_id, requested_language;
    WHEN 'jeweler' THEN
      EXECUTE format('SELECT %I FROM public.jeweler_translations WHERE jeweler_id = $1 AND language_id = $2', field_name)
      INTO translation_text USING entity_id, requested_language;
    ELSE
      RETURN NULL;
  END CASE;
  
  -- Fallback to Hebrew if not found and not already Hebrew
  IF translation_text IS NULL AND requested_language != default_language THEN
    CASE entity_type
      WHEN 'story' THEN
        EXECUTE format('SELECT %I FROM public.story_translations WHERE story_id = $1 AND language_id = $2', field_name)
        INTO translation_text USING entity_id, default_language;
      WHEN 'product' THEN
        EXECUTE format('SELECT %I FROM public.product_translations WHERE product_id = $1 AND language_id = $2', field_name)
        INTO translation_text USING entity_id, default_language;
      WHEN 'jeweler' THEN
        EXECUTE format('SELECT %I FROM public.jeweler_translations WHERE jeweler_id = $1 AND language_id = $2', field_name)
        INTO translation_text USING entity_id, default_language;
    END CASE;
  END IF;
  
  RETURN translation_text;
END;
$$;

-- Function to get enum translation with fallback
CREATE OR REPLACE FUNCTION public.get_enum_translation(
  enum_type TEXT,
  enum_value TEXT,
  language_id TEXT DEFAULT 'he'
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  translation_text TEXT;
  default_language TEXT := 'he';
BEGIN
  -- Validate inputs
  IF enum_type IS NULL OR enum_value IS NULL THEN
    RETURN enum_value;
  END IF;
  
  -- Try to get requested translation
  SELECT translations->>language_id INTO translation_text
  FROM public.enum_translations
  WHERE enum_type = get_enum_translation.enum_type 
    AND enum_value = get_enum_translation.enum_value 
    AND is_active = TRUE;
  
  -- Fallback to Hebrew
  IF translation_text IS NULL AND language_id != default_language THEN
    SELECT translations->>default_language INTO translation_text
    FROM public.enum_translations
    WHERE enum_type = get_enum_translation.enum_type 
      AND enum_value = get_enum_translation.enum_value 
      AND is_active = TRUE;
  END IF;
  
  RETURN COALESCE(translation_text, enum_value);
END;
$$;

-- Function to get system translation with fallback
CREATE OR REPLACE FUNCTION public.get_system_translation(
  translation_key TEXT,
  language_id TEXT DEFAULT 'he'
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  translation_text TEXT;
  default_language TEXT := 'he';
BEGIN
  -- Validate input
  IF translation_key IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Try to get requested translation
  SELECT translations->>language_id INTO translation_text
  FROM public.system_translations
  WHERE translation_key = get_system_translation.translation_key 
    AND is_active = TRUE;
  
  -- Fallback to Hebrew
  IF translation_text IS NULL AND language_id != default_language THEN
    SELECT translations->>default_language INTO translation_text
    FROM public.system_translations
    WHERE translation_key = get_system_translation.translation_key 
      AND is_active = TRUE;
  END IF;
  
  RETURN translation_text;
END;
$$;

-- Function to check translation completeness
CREATE OR REPLACE FUNCTION public.get_translation_completeness(
  entity_type TEXT,
  entity_id UUID
) RETURNS TABLE(
  language_id TEXT,
  language_name TEXT,
  is_complete BOOLEAN,
  missing_fields TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH required_fields AS (
    SELECT CASE entity_type
      WHEN 'story' THEN ARRAY['title', 'content']
      WHEN 'product' THEN ARRAY['name', 'description']
      WHEN 'jeweler' THEN ARRAY['name', 'bio']
      ELSE ARRAY[]::TEXT[]
    END AS fields
  ),
  language_list AS (
    SELECT l.id, l.name->>'he' as name_he
    FROM public.languages l
    WHERE l.is_active = TRUE
  )
  SELECT 
    ll.id,
    ll.name_he,
    CASE 
      WHEN entity_type = 'story' THEN
        (st.title IS NOT NULL AND st.content IS NOT NULL)
      WHEN entity_type = 'product' THEN
        (pt.name IS NOT NULL AND pt.description IS NOT NULL)
      WHEN entity_type = 'jeweler' THEN
        (jt.name IS NOT NULL AND jt.bio IS NOT NULL)
      ELSE FALSE
    END as is_complete,
    CASE 
      WHEN entity_type = 'story' THEN
        ARRAY_REMOVE(ARRAY[
          CASE WHEN st.title IS NULL THEN 'title' END,
          CASE WHEN st.content IS NULL THEN 'content' END
        ], NULL)
      WHEN entity_type = 'product' THEN
        ARRAY_REMOVE(ARRAY[
          CASE WHEN pt.name IS NULL THEN 'name' END,
          CASE WHEN pt.description IS NULL THEN 'description' END
        ], NULL)
      WHEN entity_type = 'jeweler' THEN
        ARRAY_REMOVE(ARRAY[
          CASE WHEN jt.name IS NULL THEN 'name' END,
          CASE WHEN jt.bio IS NULL THEN 'bio' END
        ], NULL)
      ELSE ARRAY[]::TEXT[]
    END as missing_fields
  FROM language_list ll
  LEFT JOIN public.story_translations st ON (entity_type = 'story' AND st.story_id = entity_id AND st.language_id = ll.id)
  LEFT JOIN public.product_translations pt ON (entity_type = 'product' AND pt.product_id = entity_id AND pt.language_id = ll.id)
  LEFT JOIN public.jeweler_translations jt ON (entity_type = 'jeweler' AND jt.jeweler_id = entity_id AND jt.language_id = ll.id)
  CROSS JOIN required_fields rf;
END;
$$;

-- Create multilingual views with fallback logic
-- Stories view with automatic fallback
CREATE OR REPLACE VIEW public.stories_multilingual AS
SELECT 
  s.id,
  s.user_id,
  s.created_at,
  s.updated_at,
  COALESCE(st_requested.title, st_hebrew.title) as title,
  COALESCE(st_requested.content, st_hebrew.content) as content,
  COALESCE(st_requested.summary, st_hebrew.summary) as summary,
  COALESCE(st_requested.emotion_tags, st_hebrew.emotion_tags) as emotion_tags,
  COALESCE(st_requested.seo_title, st_hebrew.seo_title) as seo_title,
  COALESCE(st_requested.seo_description, st_hebrew.seo_description) as seo_description,
  COALESCE(st_requested.language_id, st_hebrew.language_id, 'he') as language_id,
  st_requested.language_id as requested_language,
  st_hebrew.language_id as fallback_language,
  CASE 
    WHEN st_requested.id IS NOT NULL THEN TRUE 
    ELSE FALSE 
  END as has_requested_translation
FROM public.stories s
LEFT JOIN public.story_translations st_requested ON (
  s.id = st_requested.story_id 
  AND st_requested.language_id = COALESCE(current_setting('app.current_language', true), 'he')
)
LEFT JOIN public.story_translations st_hebrew ON (
  s.id = st_hebrew.story_id 
  AND st_hebrew.language_id = 'he'
);

-- Products view with automatic fallback
CREATE OR REPLACE VIEW public.products_multilingual AS
SELECT 
  p.id,
  p.jeweler_id,
  p.price,
  p.images,
  p.created_at,
  p.updated_at,
  COALESCE(pt_requested.name, pt_hebrew.name) as name,
  COALESCE(pt_requested.description, pt_hebrew.description) as description,
  COALESCE(pt_requested.short_description, pt_hebrew.short_description) as short_description,
  COALESCE(pt_requested.materials_description, pt_hebrew.materials_description) as materials_description,
  COALESCE(pt_requested.care_instructions, pt_hebrew.care_instructions) as care_instructions,
  COALESCE(pt_requested.style_tags, pt_hebrew.style_tags) as style_tags,
  COALESCE(pt_requested.seo_title, pt_hebrew.seo_title) as seo_title,
  COALESCE(pt_requested.seo_description, pt_hebrew.seo_description) as seo_description,
  COALESCE(pt_requested.language_id, pt_hebrew.language_id, 'he') as language_id,
  pt_requested.language_id as requested_language,
  pt_hebrew.language_id as fallback_language,
  CASE 
    WHEN pt_requested.id IS NOT NULL THEN TRUE 
    ELSE FALSE 
  END as has_requested_translation
FROM public.products p
LEFT JOIN public.product_translations pt_requested ON (
  p.id = pt_requested.product_id 
  AND pt_requested.language_id = COALESCE(current_setting('app.current_language', true), 'he')
)
LEFT JOIN public.product_translations pt_hebrew ON (
  p.id = pt_hebrew.product_id 
  AND pt_hebrew.language_id = 'he'
);

-- Jewelers view with automatic fallback
CREATE OR REPLACE VIEW public.jewelers_multilingual AS
SELECT 
  j.id,
  j.user_id,
  j.portfolio_url,
  j.created_at,
  j.updated_at,
  COALESCE(jt_requested.name, jt_hebrew.name) as name,
  COALESCE(jt_requested.bio, jt_hebrew.bio) as bio,
  COALESCE(jt_requested.specialties, jt_hebrew.specialties) as specialties,
  COALESCE(jt_requested.location_description, jt_hebrew.location_description) as location_description,
  COALESCE(jt_requested.tagline, jt_hebrew.tagline) as tagline,
  COALESCE(jt_requested.seo_title, jt_hebrew.seo_title) as seo_title,
  COALESCE(jt_requested.seo_description, jt_hebrew.seo_description) as seo_description,
  COALESCE(jt_requested.language_id, jt_hebrew.language_id, 'he') as language_id,
  jt_requested.language_id as requested_language,
  jt_hebrew.language_id as fallback_language,
  CASE 
    WHEN jt_requested.id IS NOT NULL THEN TRUE 
    ELSE FALSE 
  END as has_requested_translation
FROM public.jewelers j
LEFT JOIN public.jeweler_translations jt_requested ON (
  j.id = jt_requested.jeweler_id 
  AND jt_requested.language_id = COALESCE(current_setting('app.current_language', true), 'he')
)
LEFT JOIN public.jeweler_translations jt_hebrew ON (
  j.id = jt_hebrew.jeweler_id 
  AND jt_hebrew.language_id = 'he'
);

-- Grant permissions for views
GRANT SELECT ON public.stories_multilingual TO anon, authenticated;
GRANT SELECT ON public.products_multilingual TO anon, authenticated;
GRANT SELECT ON public.jewelers_multilingual TO anon, authenticated;

-- Grant permissions for functions
GRANT EXECUTE ON FUNCTION public.get_translation TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_enum_translation TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_system_translation TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_translation_completeness TO authenticated; 