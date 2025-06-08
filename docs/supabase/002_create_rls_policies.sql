-- Row Level Security Policies for GemsAI Internationalization Tables
-- These policies ensure proper access control for multilingual content

-- Enable RLS on all translation tables
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jeweler_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enum_translations ENABLE ROW LEVEL SECURITY;

-- Languages table policies
-- Everyone can read active languages
CREATE POLICY "Public read access for active languages" ON public.languages
  FOR SELECT USING (is_active = TRUE);

-- Only authenticated users can see all languages (including inactive)
CREATE POLICY "Authenticated users can read all languages" ON public.languages
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role can modify languages
CREATE POLICY "Service role can manage languages" ON public.languages
  FOR ALL USING (auth.role() = 'service_role');

-- Translation metadata policies
-- Users can read metadata for published translations
CREATE POLICY "Public read access for published metadata" ON public.translation_metadata
  FOR SELECT USING (translation_status = 'published');

-- Authenticated users can read all metadata
CREATE POLICY "Authenticated users can read all metadata" ON public.translation_metadata
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can create metadata for their own content
CREATE POLICY "Users can create translation metadata" ON public.translation_metadata
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update metadata they created or are assigned as translator
CREATE POLICY "Users can update their translation metadata" ON public.translation_metadata
  FOR UPDATE USING (
    translator_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM auth.users u 
      WHERE u.id = auth.uid() 
      AND u.raw_user_meta_data->>'role' IN ('admin', 'translator')
    )
  );

-- Story translations policies
-- Public can read published story translations
CREATE POLICY "Public read access for published stories" ON public.story_translations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.translation_metadata tm 
      WHERE tm.entity_type = 'story' 
      AND tm.entity_id = story_id 
      AND tm.language_id = story_translations.language_id
      AND tm.translation_status = 'published'
    )
  );

-- Authenticated users can read all story translations
CREATE POLICY "Authenticated users can read all story translations" ON public.story_translations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can manage translations for their own stories
CREATE POLICY "Users can manage their story translations" ON public.story_translations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.stories s 
      WHERE s.id = story_id 
      AND s.user_id = auth.uid()
    )
  );

-- Translators can manage assigned story translations
CREATE POLICY "Translators can manage assigned story translations" ON public.story_translations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.translation_metadata tm 
      WHERE tm.entity_type = 'story' 
      AND tm.entity_id = story_id 
      AND tm.language_id = story_translations.language_id
      AND tm.translator_id = auth.uid()
    )
  );

-- Product translations policies
-- Public can read published product translations
CREATE POLICY "Public read access for published products" ON public.product_translations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.translation_metadata tm 
      WHERE tm.entity_type = 'product' 
      AND tm.entity_id = product_id 
      AND tm.language_id = product_translations.language_id
      AND tm.translation_status = 'published'
    )
  );

-- Authenticated users can read all product translations
CREATE POLICY "Authenticated users can read all product translations" ON public.product_translations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Jewelers can manage their own product translations
CREATE POLICY "Jewelers can manage their product translations" ON public.product_translations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.products p 
      JOIN public.jewelers j ON p.jeweler_id = j.id 
      WHERE p.id = product_id 
      AND j.user_id = auth.uid()
    )
  );

-- Translators can manage assigned product translations
CREATE POLICY "Translators can manage assigned product translations" ON public.product_translations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.translation_metadata tm 
      WHERE tm.entity_type = 'product' 
      AND tm.entity_id = product_id 
      AND tm.language_id = product_translations.language_id
      AND tm.translator_id = auth.uid()
    )
  );

-- Jeweler translations policies
-- Public can read published jeweler translations
CREATE POLICY "Public read access for published jewelers" ON public.jeweler_translations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.translation_metadata tm 
      WHERE tm.entity_type = 'jeweler' 
      AND tm.entity_id = jeweler_id 
      AND tm.language_id = jeweler_translations.language_id
      AND tm.translation_status = 'published'
    )
  );

-- Authenticated users can read all jeweler translations
CREATE POLICY "Authenticated users can read all jeweler translations" ON public.jeweler_translations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Jewelers can manage their own translations
CREATE POLICY "Jewelers can manage their own translations" ON public.jeweler_translations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.jewelers j 
      WHERE j.id = jeweler_id 
      AND j.user_id = auth.uid()
    )
  );

-- Translators can manage assigned jeweler translations
CREATE POLICY "Translators can manage assigned jeweler translations" ON public.jeweler_translations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.translation_metadata tm 
      WHERE tm.entity_type = 'jeweler' 
      AND tm.entity_id = jeweler_id 
      AND tm.language_id = jeweler_translations.language_id
      AND tm.translator_id = auth.uid()
    )
  );

-- System translations policies
-- Public can read active system translations
CREATE POLICY "Public read access for active system translations" ON public.system_translations
  FOR SELECT USING (is_active = TRUE);

-- Only admins can manage system translations
CREATE POLICY "Admins can manage system translations" ON public.system_translations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users u 
      WHERE u.id = auth.uid() 
      AND u.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Enum translations policies
-- Public can read active enum translations
CREATE POLICY "Public read access for active enum translations" ON public.enum_translations
  FOR SELECT USING (is_active = TRUE);

-- Only admins can manage enum translations
CREATE POLICY "Admins can manage enum translations" ON public.enum_translations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users u 
      WHERE u.id = auth.uid() 
      AND u.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions
GRANT SELECT ON public.languages TO anon, authenticated;
GRANT SELECT ON public.system_translations TO anon, authenticated;
GRANT SELECT ON public.enum_translations TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.translation_metadata TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.story_translations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_translations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jeweler_translations TO authenticated; 