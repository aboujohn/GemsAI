-- GemsAI Seed Data
-- Initial data population for development, testing, and demonstration

-- ============================================================================
-- REFERENCE DATA (Required for system operation)
-- ============================================================================

-- Languages (Core system languages)
INSERT INTO languages (id, name, native_name, direction, is_active) VALUES
('he', 'Hebrew', 'עברית', 'rtl', true),
('en', 'English', 'English', 'ltr', true),
('ar', 'Arabic', 'العربية', 'rtl', true),
('fr', 'French', 'Français', 'ltr', false),
('es', 'Spanish', 'Español', 'ltr', false)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    native_name = EXCLUDED.native_name,
    direction = EXCLUDED.direction,
    is_active = EXCLUDED.is_active;

-- Categories (Jewelry categories)
INSERT INTO categories (id, name, description, sort_order, is_active) VALUES
(uuid_generate_v4(), 'Rings', 'Wedding rings, engagement rings, and fashion rings', 1, true),
(uuid_generate_v4(), 'Necklaces', 'Necklaces, pendants, and chains', 2, true),
(uuid_generate_v4(), 'Earrings', 'Earrings, studs, and ear accessories', 3, true),
(uuid_generate_v4(), 'Bracelets', 'Bracelets, bangles, and wrist accessories', 4, true),
(uuid_generate_v4(), 'Watches', 'Luxury watches and timepieces', 5, true),
(uuid_generate_v4(), 'Custom', 'Custom and bespoke jewelry pieces', 6, true),
(uuid_generate_v4(), 'Sets', 'Matching jewelry sets', 7, true),
(uuid_generate_v4(), 'Accessories', 'Jewelry accessories and findings', 8, true)
ON CONFLICT DO NOTHING;

-- Tags (Emotion, style, material, occasion tags)
INSERT INTO tags (id, name, type, description, color, is_active) VALUES
-- Emotion tags
(uuid_generate_v4(), 'Love', 'emotion', 'Romantic and loving pieces', '#FF69B4', true),
(uuid_generate_v4(), 'Joy', 'emotion', 'Joyful and celebratory pieces', '#FFD700', true),
(uuid_generate_v4(), 'Elegance', 'emotion', 'Sophisticated and refined pieces', '#4B0082', true),
(uuid_generate_v4(), 'Strength', 'emotion', 'Bold and powerful pieces', '#8B0000', true),
(uuid_generate_v4(), 'Peace', 'emotion', 'Calming and serene pieces', '#87CEEB', true),
(uuid_generate_v4(), 'Passion', 'emotion', 'Intense and passionate pieces', '#DC143C', true),
(uuid_generate_v4(), 'Hope', 'emotion', 'Optimistic and uplifting pieces', '#32CD32', true),
(uuid_generate_v4(), 'Memory', 'emotion', 'Nostalgic and commemorative pieces', '#DDA0DD', true),

-- Style tags
(uuid_generate_v4(), 'Modern', 'style', 'Contemporary and current design', '#00CED1', true),
(uuid_generate_v4(), 'Classic', 'style', 'Timeless and traditional design', '#2F4F4F', true),
(uuid_generate_v4(), 'Vintage', 'style', 'Retro and antique-inspired design', '#8B4513', true),
(uuid_generate_v4(), 'Minimalist', 'style', 'Simple and clean design', '#F5F5F5', true),
(uuid_generate_v4(), 'Bohemian', 'style', 'Free-spirited and artistic design', '#CD853F', true),
(uuid_generate_v4(), 'Art Deco', 'style', 'Geometric and luxurious design', '#B8860B', true),
(uuid_generate_v4(), 'Nature', 'style', 'Nature-inspired organic design', '#228B22', true),
(uuid_generate_v4(), 'Geometric', 'style', 'Angular and structured design', '#708090', true),

-- Material tags
(uuid_generate_v4(), 'Gold', 'material', '14k and 18k gold jewelry', '#FFD700', true),
(uuid_generate_v4(), 'Silver', 'material', 'Sterling silver jewelry', '#C0C0C0', true),
(uuid_generate_v4(), 'Platinum', 'material', 'Platinum jewelry', '#E5E4E2', true),
(uuid_generate_v4(), 'Diamond', 'material', 'Diamond-set jewelry', '#B9F2FF', true),
(uuid_generate_v4(), 'Pearl', 'material', 'Pearl jewelry', '#F8F8FF', true),
(uuid_generate_v4(), 'Gemstone', 'material', 'Colored gemstone jewelry', '#9370DB', true),
(uuid_generate_v4(), 'Rose Gold', 'material', 'Rose gold jewelry', '#E8B4B8', true),
(uuid_generate_v4(), 'Titanium', 'material', 'Titanium jewelry', '#878681', true),

-- Occasion tags
(uuid_generate_v4(), 'Wedding', 'occasion', 'Wedding ceremonies and celebrations', '#FFFFFF', true),
(uuid_generate_v4(), 'Engagement', 'occasion', 'Engagement and proposals', '#FFB6C1', true),
(uuid_generate_v4(), 'Anniversary', 'occasion', 'Anniversary celebrations', '#FF1493', true),
(uuid_generate_v4(), 'Birthday', 'occasion', 'Birthday celebrations', '#FF6347', true),
(uuid_generate_v4(), 'Graduation', 'occasion', 'Graduation ceremonies', '#4169E1', true),
(uuid_generate_v4(), 'Holiday', 'occasion', 'Holiday celebrations', '#228B22', true),
(uuid_generate_v4(), 'Everyday', 'occasion', 'Daily wear jewelry', '#696969', true),
(uuid_generate_v4(), 'Special Event', 'occasion', 'Special occasions and events', '#9932CC', true)
ON CONFLICT DO NOTHING;

-- System translations (UI elements)
INSERT INTO system_translations (key, language_id, value, category) VALUES
-- Navigation
('nav.home', 'he', 'בית', 'navigation'),
('nav.home', 'en', 'Home', 'navigation'),
('nav.stories', 'he', 'סיפורים', 'navigation'),
('nav.stories', 'en', 'Stories', 'navigation'),
('nav.jewelers', 'he', 'צורפים', 'navigation'),
('nav.jewelers', 'en', 'Jewelers', 'navigation'),
('nav.products', 'he', 'מוצרים', 'navigation'),
('nav.products', 'en', 'Products', 'navigation'),
('nav.gifts', 'he', 'מתנות', 'navigation'),
('nav.gifts', 'en', 'Gifts', 'navigation'),

-- Buttons
('btn.create', 'he', 'צור', 'buttons'),
('btn.create', 'en', 'Create', 'buttons'),
('btn.save', 'he', 'שמור', 'buttons'),
('btn.save', 'en', 'Save', 'buttons'),
('btn.cancel', 'he', 'בטל', 'buttons'),
('btn.cancel', 'en', 'Cancel', 'buttons'),
('btn.submit', 'he', 'שלח', 'buttons'),
('btn.submit', 'en', 'Submit', 'buttons'),
('btn.search', 'he', 'חפש', 'buttons'),
('btn.search', 'en', 'Search', 'buttons'),

-- Status labels
('status.pending', 'he', 'ממתין', 'status'),
('status.pending', 'en', 'Pending', 'status'),
('status.active', 'he', 'פעיל', 'status'),
('status.active', 'en', 'Active', 'status'),
('status.completed', 'he', 'הושלם', 'status'),
('status.completed', 'en', 'Completed', 'status'),
('status.cancelled', 'he', 'בוטל', 'status'),
('status.cancelled', 'en', 'Cancelled', 'status')
ON CONFLICT (key, language_id) DO UPDATE SET
    value = EXCLUDED.value,
    category = EXCLUDED.category;

-- Enum translations
INSERT INTO enum_translations (enum_name, enum_value, language_id, translation) VALUES
-- Budget ranges
('budget_range', 'under_500', 'he', 'מתחת ל-500 ₪'),
('budget_range', 'under_500', 'en', 'Under ₪500'),
('budget_range', '500_1000', 'he', '500-1,000 ₪'),
('budget_range', '500_1000', 'en', '₪500-1,000'),
('budget_range', '1000_2500', 'he', '1,000-2,500 ₪'),
('budget_range', '1000_2500', 'en', '₪1,000-2,500'),
('budget_range', '2500_5000', 'he', '2,500-5,000 ₪'),
('budget_range', '2500_5000', 'en', '₪2,500-5,000'),
('budget_range', '5000_10000', 'he', '5,000-10,000 ₪'),
('budget_range', '5000_10000', 'en', '₪5,000-10,000'),
('budget_range', 'over_10000', 'he', 'מעל 10,000 ₪'),
('budget_range', 'over_10000', 'en', 'Over ₪10,000'),

-- Timeline options
('timeline', 'urgent', 'he', 'דחוף'),
('timeline', 'urgent', 'en', 'Urgent'),
('timeline', '1_week', 'he', 'שבוע'),
('timeline', '1_week', 'en', '1 Week'),
('timeline', '2_weeks', 'he', 'שבועיים'),
('timeline', '2_weeks', 'en', '2 Weeks'),
('timeline', '1_month', 'he', 'חודש'),
('timeline', '1_month', 'en', '1 Month'),
('timeline', '2_months', 'he', 'חודשיים'),
('timeline', '2_months', 'en', '2 Months'),
('timeline', 'flexible', 'he', 'גמיש'),
('timeline', 'flexible', 'en', 'Flexible'),

-- Order status
('order_status', 'pending', 'he', 'ממתין'),
('order_status', 'pending', 'en', 'Pending'),
('order_status', 'confirmed', 'he', 'אושר'),
('order_status', 'confirmed', 'en', 'Confirmed'),
('order_status', 'in_production', 'he', 'בייצור'),
('order_status', 'in_production', 'en', 'In Production'),
('order_status', 'ready', 'he', 'מוכן'),
('order_status', 'ready', 'en', 'Ready'),
('order_status', 'shipped', 'he', 'נשלח'),
('order_status', 'shipped', 'en', 'Shipped'),
('order_status', 'delivered', 'he', 'נמסר'),
('order_status', 'delivered', 'en', 'Delivered'),
('order_status', 'cancelled', 'he', 'בוטל'),
('order_status', 'cancelled', 'en', 'Cancelled')
ON CONFLICT (enum_name, enum_value, language_id) DO UPDATE SET
    translation = EXCLUDED.translation;

-- ============================================================================
-- DEMO DATA (For development and demonstration)
-- ============================================================================

-- Demo users
INSERT INTO users (id, email, name, role, preferred_language, phone, marketing_consent, created_at) VALUES
(uuid_generate_v4(), 'demo.customer@gemsai.com', 'Sarah Cohen', 'customer', 'he', '+972501234567', true, NOW() - INTERVAL '30 days'),
(uuid_generate_v4(), 'demo.jeweler@gemsai.com', 'David Goldstein', 'jeweler', 'he', '+972507654321', true, NOW() - INTERVAL '25 days'),
(uuid_generate_v4(), 'demo.admin@gemsai.com', 'Admin User', 'admin', 'en', '+972509876543', false, NOW() - INTERVAL '60 days'),
(uuid_generate_v4(), 'maya.levi@gemsai.com', 'Maya Levi', 'customer', 'he', '+972502345678', true, NOW() - INTERVAL '20 days'),
(uuid_generate_v4(), 'jeweler.premium@gemsai.com', 'Premium Jewelers Ltd', 'jeweler', 'en', '+972503456789', true, NOW() - INTERVAL '45 days')
ON CONFLICT (email) DO NOTHING;

-- Demo jewelers (using the jeweler users created above)
DO $$
DECLARE
    jeweler_user_id UUID;
    premium_user_id UUID;
    jeweler_id UUID;
    premium_id UUID;
BEGIN
    -- Get jeweler user IDs
    SELECT id INTO jeweler_user_id FROM users WHERE email = 'demo.jeweler@gemsai.com';
    SELECT id INTO premium_user_id FROM users WHERE email = 'jeweler.premium@gemsai.com';
    
    IF jeweler_user_id IS NOT NULL THEN
        INSERT INTO jewelers (id, user_id, business_name, verification_status, rating, total_orders, response_time_hours, location_city, location_country, specialties, years_experience, portfolio_url, business_license, created_at)
        VALUES (uuid_generate_v4(), jeweler_user_id, 'Goldstein Fine Jewelry', 'verified', 4.8, 156, 2, 'Tel Aviv', 'Israel', ARRAY['rings', 'necklaces', 'custom'], 15, 'https://goldstein-jewelry.example.com', 'IL-BL-123456', NOW() - INTERVAL '25 days')
        RETURNING id INTO jeweler_id;
    END IF;
    
    IF premium_user_id IS NOT NULL THEN
        INSERT INTO jewelers (id, user_id, business_name, verification_status, rating, total_orders, response_time_hours, location_city, location_country, specialties, years_experience, portfolio_url, business_license, created_at)
        VALUES (uuid_generate_v4(), premium_user_id, 'Premium Jewelers Ltd', 'verified', 4.9, 89, 1, 'Jerusalem', 'Israel', ARRAY['diamonds', 'luxury', 'custom'], 25, 'https://premium-jewelers.example.com', 'IL-BL-789012', NOW() - INTERVAL '45 days')
        RETURNING id INTO premium_id;
    END IF;
END $$;

-- Demo jeweler translations
DO $$
DECLARE
    jeweler_id UUID;
    premium_id UUID;
BEGIN
    SELECT j.id INTO jeweler_id FROM jewelers j JOIN users u ON j.user_id = u.id WHERE u.email = 'demo.jeweler@gemsai.com';
    SELECT j.id INTO premium_id FROM jewelers j JOIN users u ON j.user_id = u.id WHERE u.email = 'jeweler.premium@gemsai.com';
    
    IF jeweler_id IS NOT NULL THEN
        INSERT INTO jeweler_translations (id, jeweler_id, language_id, name, bio, tagline) VALUES
        (uuid_generate_v4(), jeweler_id, 'he', 'תכשיטי גולדשטיין', 'צורף מומחה עם 15 שנות ניסיון ביצירת תכשיטים מותאמים אישית. מתמחה בטבעות נישואין וטבעות אירוסין יוקרתיות.', 'יוצרים זיכרונות לנצח'),
        (uuid_generate_v4(), jeweler_id, 'en', 'Goldstein Fine Jewelry', 'Expert jeweler with 15 years of experience creating custom jewelry pieces. Specializing in luxury wedding and engagement rings.', 'Creating memories that last forever');
        
        INSERT INTO jeweler_translations (id, jeweler_id, language_id, name, bio, tagline) VALUES
        (uuid_generate_v4(), premium_id, 'he', 'צורפים פרמיום בע"מ', 'בית צורפות יוקרתי המתמחה ביהלומים ותכשיטים מותאמים אישית. 25 שנות מצוינות בשירות ובאיכות.', 'מצוינות ללא פשרות'),
        (uuid_generate_v4(), premium_id, 'en', 'Premium Jewelers Ltd', 'Luxury jewelry house specializing in diamonds and custom pieces. 25 years of excellence in service and quality.', 'Excellence without compromise');
    END IF;
END $$;

-- Demo products
DO $$
DECLARE
    jeweler_id UUID;
    premium_id UUID;
    product_id UUID;
    category_rings UUID;
    category_necklaces UUID;
    tag_love UUID;
    tag_elegant UUID;
    tag_gold UUID;
    tag_diamond UUID;
BEGIN
    -- Get IDs
    SELECT j.id INTO jeweler_id FROM jewelers j JOIN users u ON j.user_id = u.id WHERE u.email = 'demo.jeweler@gemsai.com';
    SELECT j.id INTO premium_id FROM jewelers j JOIN users u ON j.user_id = u.id WHERE u.email = 'jeweler.premium@gemsai.com';
    SELECT id INTO category_rings FROM categories WHERE name = 'Rings' LIMIT 1;
    SELECT id INTO category_necklaces FROM categories WHERE name = 'Necklaces' LIMIT 1;
    SELECT id INTO tag_love FROM tags WHERE name = 'Love' LIMIT 1;
    SELECT id INTO tag_elegant FROM tags WHERE name = 'Elegance' LIMIT 1;
    SELECT id INTO tag_gold FROM tags WHERE name = 'Gold' LIMIT 1;
    SELECT id INTO tag_diamond FROM tags WHERE name = 'Diamond' LIMIT 1;
    
    IF jeweler_id IS NOT NULL THEN
        -- Product 1: Classic engagement ring
        INSERT INTO products (id, jeweler_id, sku, price, currency, category, materials, emotion_tags, style_tags, featured, is_available, lead_time_days, inventory_count, images, created_at)
        VALUES (uuid_generate_v4(), jeweler_id, 'GFJ-ER-001', 3500.00, 'ILS', 'rings', ARRAY['gold', 'diamond'], ARRAY['love'], ARRAY['classic'], true, true, 21, 5, ARRAY['https://example.com/ring1.jpg'], NOW() - INTERVAL '20 days')
        RETURNING id INTO product_id;
        
        -- Product translations
        INSERT INTO product_translations (id, product_id, language_id, name, description, short_description) VALUES
        (uuid_generate_v4(), product_id, 'he', 'טבעת אירוסין קלאסית', 'טבעת אירוסין מזהב לבן 18 קראט עם יהלום מרכזי 0.5 קראט. עיצוב קלאסי ונצחי המושלם לרגע המיוחד.', 'טבעת אירוסין זהב לבן עם יהלום 0.5 קראט'),
        (uuid_generate_v4(), product_id, 'en', 'Classic Engagement Ring', '18k white gold engagement ring with 0.5 carat center diamond. Classic and timeless design perfect for your special moment.', '18k white gold ring with 0.5ct diamond');
        
        -- Product categories and tags
        INSERT INTO product_categories (id, product_id, category_id) VALUES (uuid_generate_v4(), product_id, category_rings);
        INSERT INTO product_tags (id, product_id, tag_id) VALUES 
        (uuid_generate_v4(), product_id, tag_love),
        (uuid_generate_v4(), product_id, tag_gold),
        (uuid_generate_v4(), product_id, tag_diamond);
    END IF;
    
    IF premium_id IS NOT NULL THEN
        -- Product 2: Luxury necklace
        INSERT INTO products (id, jeweler_id, sku, price, currency, category, materials, emotion_tags, style_tags, featured, is_available, lead_time_days, inventory_count, images, created_at)
        VALUES (uuid_generate_v4(), premium_id, 'PJ-NK-001', 8500.00, 'ILS', 'necklaces', ARRAY['gold', 'diamond'], ARRAY['elegance'], ARRAY['modern'], true, true, 28, 2, ARRAY['https://example.com/necklace1.jpg'], NOW() - INTERVAL '15 days')
        RETURNING id INTO product_id;
        
        -- Product translations
        INSERT INTO product_translations (id, product_id, language_id, name, description, short_description) VALUES
        (uuid_generate_v4(), product_id, 'he', 'שרשרת יהלומים יוקרתית', 'שרשרת מזהב צהוב 18 קראט משובצת יהלומים. עיצוב מודרני ואלגנטי המתאים לכל אירוע מיוחד.', 'שרשרת זהב צהוב משובצת יהלומים'),
        (uuid_generate_v4(), product_id, 'en', 'Luxury Diamond Necklace', '18k yellow gold necklace set with diamonds. Modern and elegant design suitable for any special occasion.', '18k yellow gold diamond necklace');
        
        -- Product categories and tags
        INSERT INTO product_categories (id, product_id, category_id) VALUES (uuid_generate_v4(), product_id, category_necklaces);
        INSERT INTO product_tags (id, product_id, tag_id) VALUES 
        (uuid_generate_v4(), product_id, tag_elegant),
        (uuid_generate_v4(), product_id, tag_gold),
        (uuid_generate_v4(), product_id, tag_diamond);
    END IF;
END $$;

-- Demo stories
DO $$
DECLARE
    customer_id UUID;
    maya_id UUID;
    story_id UUID;
BEGIN
    SELECT id INTO customer_id FROM users WHERE email = 'demo.customer@gemsai.com';
    SELECT id INTO maya_id FROM users WHERE email = 'maya.levi@gemsai.com';
    
    IF customer_id IS NOT NULL THEN
        INSERT INTO stories (id, user_id, budget_range, timeline, status, created_at)
        VALUES (uuid_generate_v4(), customer_id, '2500_5000', '1_month', 'active', NOW() - INTERVAL '10 days')
        RETURNING id INTO story_id;
        
        -- Story translations
        INSERT INTO story_translations (id, story_id, language_id, title, content) VALUES
        (uuid_generate_v4(), story_id, 'he', 'הצעת נישואין בגן הבוטני', 'אני מתכנן להציע נישואין לחברה שלי במקום המיוחד שבו נפגשנו לראשונה - הגן הבוטני בירושלים. אני מחפש טבעת שתשקף את האהבה והטבע שמקיפים אותנו. משהו עדין ויפה כמוה.'),
        (uuid_generate_v4(), story_id, 'en', 'Proposal at the Botanical Garden', 'I am planning to propose to my girlfriend at the special place where we first met - the Botanical Garden in Jerusalem. I am looking for a ring that reflects the love and nature that surrounds us. Something delicate and beautiful like her.');
    END IF;
    
    IF maya_id IS NOT NULL THEN
        INSERT INTO stories (id, user_id, budget_range, timeline, status, created_at)
        VALUES (uuid_generate_v4(), maya_id, '1000_2500', '2_weeks', 'active', NOW() - INTERVAL '5 days')
        RETURNING id INTO story_id;
        
        -- Story translations
        INSERT INTO story_translations (id, story_id, language_id, title, content) VALUES
        (uuid_generate_v4(), story_id, 'he', 'מתנה ליום הולדת אמא', 'אמא שלי חוגגת 60 ואני רוצה לתת לה משהו מיוחד שיראה לה כמה אני אוהבת אותה. היא תמיד אהבה תכשיטים עדינים ופשוטים. משהו שהיא תוכל ללבוש כל יום ולזכור אותי.'),
        (uuid_generate_v4(), story_id, 'en', 'Gift for Mom\'s Birthday', 'My mom is turning 60 and I want to give her something special that shows how much I love her. She has always loved delicate and simple jewelry. Something she can wear every day and remember me.');
    END IF;
END $$;

-- Demo user preferences
DO $$
DECLARE
    customer_id UUID;
    maya_id UUID;
BEGIN
    SELECT id INTO customer_id FROM users WHERE email = 'demo.customer@gemsai.com';
    SELECT id INTO maya_id FROM users WHERE email = 'maya.levi@gemsai.com';
    
    IF customer_id IS NOT NULL THEN
        INSERT INTO user_preferences (id, user_id, preferred_styles, preferred_materials, budget_range, notification_settings, privacy_settings)
        VALUES (uuid_generate_v4(), customer_id, ARRAY['classic', 'elegant'], ARRAY['gold', 'diamond'], '2500_5000', 
                jsonb_build_object('email', true, 'sms', false, 'push', true),
                jsonb_build_object('profile_public', false, 'show_orders', false));
    END IF;
    
    IF maya_id IS NOT NULL THEN
        INSERT INTO user_preferences (id, user_id, preferred_styles, preferred_materials, budget_range, notification_settings, privacy_settings)
        VALUES (uuid_generate_v4(), maya_id, ARRAY['modern', 'minimalist'], ARRAY['silver', 'gold'], '1000_2500',
                jsonb_build_object('email', true, 'sms', true, 'push', true),
                jsonb_build_object('profile_public', true, 'show_orders', false));
    END IF;
END $$;

-- ============================================================================
-- DEVELOPMENT DATA (Additional test data for development)
-- ============================================================================

-- Additional test users for development
INSERT INTO users (id, email, name, role, preferred_language, created_at) VALUES
(uuid_generate_v4(), 'test1@gemsai.com', 'Test User 1', 'customer', 'he', NOW() - INTERVAL '1 day'),
(uuid_generate_v4(), 'test2@gemsai.com', 'Test User 2', 'customer', 'en', NOW() - INTERVAL '2 days'),
(uuid_generate_v4(), 'test3@gemsai.com', 'Test User 3', 'customer', 'he', NOW() - INTERVAL '3 days'),
(uuid_generate_v4(), 'jeweler.test@gemsai.com', 'Test Jeweler', 'jeweler', 'he', NOW() - INTERVAL '4 days')
ON CONFLICT (email) DO NOTHING;

-- Test jeweler
DO $$
DECLARE
    test_jeweler_user_id UUID;
BEGIN
    SELECT id INTO test_jeweler_user_id FROM users WHERE email = 'jeweler.test@gemsai.com';
    
    IF test_jeweler_user_id IS NOT NULL THEN
        INSERT INTO jewelers (id, user_id, business_name, verification_status, rating, total_orders, response_time_hours, location_city, location_country, specialties, years_experience)
        VALUES (uuid_generate_v4(), test_jeweler_user_id, 'Test Jewelry Workshop', 'pending', 0.0, 0, 24, 'Haifa', 'Israel', ARRAY['custom'], 5)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ============================================================================
-- ANALYTICS SEED DATA
-- ============================================================================

-- Refresh materialized views with initial data
SELECT refresh_materialized_views();

-- ============================================================================
-- VALIDATION AND LOGGING
-- ============================================================================

-- Log seed data completion
INSERT INTO system_log (event_type, message, metadata, created_at) VALUES
('seed_data', 'Seed data population completed successfully', 
 jsonb_build_object(
     'languages_count', (SELECT COUNT(*) FROM languages),
     'categories_count', (SELECT COUNT(*) FROM categories),
     'tags_count', (SELECT COUNT(*) FROM tags),
     'users_count', (SELECT COUNT(*) FROM users),
     'jewelers_count', (SELECT COUNT(*) FROM jewelers),
     'products_count', (SELECT COUNT(*) FROM products),
     'stories_count', (SELECT COUNT(*) FROM stories)
 ), NOW());

-- Validation queries
DO $$
DECLARE
    validation_results JSONB;
BEGIN
    -- Validate referential integrity
    SELECT jsonb_build_object(
        'orphaned_jewelers', (SELECT COUNT(*) FROM jewelers j WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = j.user_id)),
        'orphaned_products', (SELECT COUNT(*) FROM products p WHERE NOT EXISTS (SELECT 1 FROM jewelers j WHERE j.id = p.jeweler_id)),
        'orphaned_stories', (SELECT COUNT(*) FROM stories s WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = s.user_id)),
        'missing_translations', (SELECT COUNT(*) FROM products p WHERE NOT EXISTS (SELECT 1 FROM product_translations pt WHERE pt.product_id = p.id))
    ) INTO validation_results;
    
    -- Log validation results
    INSERT INTO system_log (event_type, message, metadata, created_at) VALUES
    ('seed_validation', 'Seed data validation completed', validation_results, NOW());
    
    -- Raise notice if there are issues
    IF (validation_results->>'orphaned_jewelers')::INTEGER > 0 OR 
       (validation_results->>'orphaned_products')::INTEGER > 0 OR 
       (validation_results->>'orphaned_stories')::INTEGER > 0 THEN
        RAISE NOTICE 'Warning: Found orphaned records in seed data: %', validation_results;
    ELSE
        RAISE NOTICE 'Seed data validation passed successfully';
    END IF;
END $$;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE 'GemsAI Seed Data Population Complete!';
    RAISE NOTICE 'Reference data, demo data, and test data have been successfully loaded.';
    RAISE NOTICE 'Check system_log table for detailed results.';
END $$; 