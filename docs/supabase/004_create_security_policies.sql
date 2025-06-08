-- GemsAI Row Level Security (RLS) Policies
-- Implements comprehensive security policies for data protection

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all core tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sketches ENABLE ROW LEVEL SECURITY;
ALTER TABLE jewelers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sketch_product_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Enable RLS on junction tables
ALTER TABLE user_favorite_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_jewelers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_tags ENABLE ROW LEVEL SECURITY;

-- Enable RLS on translation tables
ALTER TABLE story_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jeweler_translations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS FOR POLICIES
-- ============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is jeweler
CREATE OR REPLACE FUNCTION is_jeweler()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role = 'jeweler'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's jeweler ID
CREATE OR REPLACE FUNCTION get_user_jeweler_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT j.id FROM jewelers j
        WHERE j.user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns a jeweler profile
CREATE OR REPLACE FUNCTION owns_jeweler_profile(jeweler_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM jewelers 
        WHERE id = jeweler_id 
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can view their own profile and public info of others
CREATE POLICY "Users can view own profile and public info" ON users
    FOR SELECT USING (
        id = auth.uid() OR 
        is_admin() OR
        -- Public fields only for other users
        TRUE
    );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Only admins can insert users (handled by auth)
CREATE POLICY "Only admins can insert users" ON users
    FOR INSERT WITH CHECK (is_admin());

-- Only admins can delete users
CREATE POLICY "Only admins can delete users" ON users
    FOR DELETE USING (is_admin());

-- ============================================================================
-- STORIES TABLE POLICIES
-- ============================================================================

-- Users can view their own stories
CREATE POLICY "Users can view own stories" ON stories
    FOR SELECT USING (
        user_id = auth.uid() OR 
        is_admin()
    );

-- Users can insert their own stories
CREATE POLICY "Users can create own stories" ON stories
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own stories
CREATE POLICY "Users can update own stories" ON stories
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own stories
CREATE POLICY "Users can delete own stories" ON stories
    FOR DELETE USING (
        user_id = auth.uid() OR 
        is_admin()
    );

-- ============================================================================
-- SKETCHES TABLE POLICIES
-- ============================================================================

-- Users can view sketches from their own stories
CREATE POLICY "Users can view sketches from own stories" ON sketches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stories 
            WHERE id = sketches.story_id 
            AND user_id = auth.uid()
        ) OR 
        is_admin()
    );

-- System can insert sketches (AI generation)
CREATE POLICY "System can insert sketches" ON sketches
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM stories 
            WHERE id = story_id 
            AND user_id = auth.uid()
        ) OR 
        is_admin()
    );

-- Users can update sketches from their own stories (ratings, feedback)
CREATE POLICY "Users can update own sketches" ON sketches
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM stories 
            WHERE id = sketches.story_id 
            AND user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM stories 
            WHERE id = sketches.story_id 
            AND user_id = auth.uid()
        )
    );

-- ============================================================================
-- JEWELERS TABLE POLICIES
-- ============================================================================

-- Anyone can view verified jeweler profiles (public)
CREATE POLICY "Anyone can view verified jewelers" ON jewelers
    FOR SELECT USING (
        verification_status = 'verified' OR
        user_id = auth.uid() OR
        is_admin()
    );

-- Users can create their own jeweler profile
CREATE POLICY "Users can create own jeweler profile" ON jewelers
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Jewelers can update their own profile
CREATE POLICY "Jewelers can update own profile" ON jewelers
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Only admins can delete jeweler profiles
CREATE POLICY "Only admins can delete jewelers" ON jewelers
    FOR DELETE USING (is_admin());

-- ============================================================================
-- PRODUCTS TABLE POLICIES
-- ============================================================================

-- Anyone can view available products from verified jewelers
CREATE POLICY "Anyone can view available products" ON products
    FOR SELECT USING (
        (is_available = TRUE AND EXISTS (
            SELECT 1 FROM jewelers 
            WHERE id = products.jeweler_id 
            AND verification_status = 'verified'
        )) OR
        jeweler_id = get_user_jeweler_id() OR
        is_admin()
    );

-- Jewelers can insert their own products
CREATE POLICY "Jewelers can create own products" ON products
    FOR INSERT WITH CHECK (
        jeweler_id = get_user_jeweler_id()
    );

-- Jewelers can update their own products
CREATE POLICY "Jewelers can update own products" ON products
    FOR UPDATE USING (jeweler_id = get_user_jeweler_id())
    WITH CHECK (jeweler_id = get_user_jeweler_id());

-- Jewelers can delete their own products
CREATE POLICY "Jewelers can delete own products" ON products
    FOR DELETE USING (
        jeweler_id = get_user_jeweler_id() OR
        is_admin()
    );

-- ============================================================================
-- ORDERS TABLE POLICIES
-- ============================================================================

-- Users can view their own orders, jewelers can view orders for their products
CREATE POLICY "Users and jewelers can view relevant orders" ON orders
    FOR SELECT USING (
        user_id = auth.uid() OR
        jeweler_id = get_user_jeweler_id() OR
        is_admin()
    );

-- Users can create orders
CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own orders (limited fields), jewelers can update order status
CREATE POLICY "Users and jewelers can update relevant orders" ON orders
    FOR UPDATE USING (
        user_id = auth.uid() OR
        jeweler_id = get_user_jeweler_id() OR
        is_admin()
    ) WITH CHECK (
        user_id = auth.uid() OR
        jeweler_id = get_user_jeweler_id() OR
        is_admin()
    );

-- Only admins can delete orders
CREATE POLICY "Only admins can delete orders" ON orders
    FOR DELETE USING (is_admin());

-- ============================================================================
-- GIFTS TABLE POLICIES
-- ============================================================================

-- Users can view gifts they sent or received
CREATE POLICY "Users can view relevant gifts" ON gifts
    FOR SELECT USING (
        sender_id = auth.uid() OR
        recipient_email = (SELECT email FROM users WHERE id = auth.uid()) OR
        is_admin()
    );

-- Users can create gifts
CREATE POLICY "Users can create gifts" ON gifts
    FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Users can update gifts they sent
CREATE POLICY "Users can update own gifts" ON gifts
    FOR UPDATE USING (sender_id = auth.uid())
    WITH CHECK (sender_id = auth.uid());

-- Users can delete gifts they sent (before viewed)
CREATE POLICY "Users can delete own unviewed gifts" ON gifts
    FOR DELETE USING (
        sender_id = auth.uid() AND viewed_at IS NULL OR
        is_admin()
    );

-- ============================================================================
-- SKETCH PRODUCT MATCHES TABLE POLICIES
-- ============================================================================

-- Users can view matches for their sketches
CREATE POLICY "Users can view matches for own sketches" ON sketch_product_matches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sketches s
            JOIN stories st ON s.id = sketch_product_matches.sketch_id
            WHERE st.user_id = auth.uid()
        ) OR
        is_admin()
    );

-- System can insert matches (AI matching)
CREATE POLICY "System can insert matches" ON sketch_product_matches
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM sketches s
            JOIN stories st ON s.id = sketch_id
            WHERE st.user_id = auth.uid()
        ) OR
        is_admin()
    );

-- ============================================================================
-- USER PREFERENCES TABLE POLICIES
-- ============================================================================

-- Users can view and manage their own preferences
CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- REVIEWS TABLE POLICIES
-- ============================================================================

-- Anyone can view published reviews
CREATE POLICY "Anyone can view reviews" ON reviews
    FOR SELECT USING (TRUE);

-- Users can create reviews for their delivered orders
CREATE POLICY "Users can create reviews for own orders" ON reviews
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM orders 
            WHERE id = order_id 
            AND user_id = auth.uid() 
            AND status = 'delivered'
        )
    );

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON reviews
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON reviews
    FOR DELETE USING (
        user_id = auth.uid() OR
        is_admin()
    );

-- ============================================================================
-- JUNCTION TABLES POLICIES
-- ============================================================================

-- User favorite products
CREATE POLICY "Users can manage own favorite products" ON user_favorite_products
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- User favorite jewelers
CREATE POLICY "Users can manage own favorite jewelers" ON user_favorite_jewelers
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Product categories - anyone can view, jewelers can manage for their products
CREATE POLICY "Anyone can view product categories" ON product_categories
    FOR SELECT USING (TRUE);

CREATE POLICY "Jewelers can manage own product categories" ON product_categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM products 
            WHERE id = product_id 
            AND jeweler_id = get_user_jeweler_id()
        )
    );

CREATE POLICY "Jewelers can update own product categories" ON product_categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE id = product_id 
            AND jeweler_id = get_user_jeweler_id()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM products 
            WHERE id = product_id 
            AND jeweler_id = get_user_jeweler_id()
        )
    );

CREATE POLICY "Jewelers can delete own product categories" ON product_categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE id = product_id 
            AND jeweler_id = get_user_jeweler_id()
        ) OR
        is_admin()
    );

-- Product tags - similar to categories
CREATE POLICY "Anyone can view product tags" ON product_tags
    FOR SELECT USING (TRUE);

CREATE POLICY "Jewelers can manage own product tags" ON product_tags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM products 
            WHERE id = product_id 
            AND jeweler_id = get_user_jeweler_id()
        )
    );

CREATE POLICY "Jewelers can update own product tags" ON product_tags
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE id = product_id 
            AND jeweler_id = get_user_jeweler_id()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM products 
            WHERE id = product_id 
            AND jeweler_id = get_user_jeweler_id()
        )
    );

CREATE POLICY "Jewelers can delete own product tags" ON product_tags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE id = product_id 
            AND jeweler_id = get_user_jeweler_id()
        ) OR
        is_admin()
    );

-- Story tags - users can manage tags for their own stories
CREATE POLICY "Users can manage own story tags" ON story_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM stories 
            WHERE id = story_id 
            AND user_id = auth.uid()
        ) OR
        is_admin()
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM stories 
            WHERE id = story_id 
            AND user_id = auth.uid()
        ) OR
        is_admin()
    );

-- ============================================================================
-- TRANSLATION TABLES POLICIES
-- ============================================================================

-- Anyone can view published translations
CREATE POLICY "Anyone can view story translations" ON story_translations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM translation_metadata tm
            WHERE tm.entity_type = 'story'
            AND tm.entity_id = story_id
            AND tm.language_id = story_translations.language_id
            AND tm.translation_status = 'published'
        ) OR
        EXISTS (
            SELECT 1 FROM stories 
            WHERE id = story_id 
            AND user_id = auth.uid()
        ) OR
        is_admin()
    );

CREATE POLICY "Anyone can view product translations" ON product_translations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM translation_metadata tm
            WHERE tm.entity_type = 'product'
            AND tm.entity_id = product_id
            AND tm.language_id = product_translations.language_id
            AND tm.translation_status = 'published'
        ) OR
        EXISTS (
            SELECT 1 FROM products p
            JOIN jewelers j ON p.jeweler_id = j.id
            WHERE p.id = product_id 
            AND j.user_id = auth.uid()
        ) OR
        is_admin()
    );

CREATE POLICY "Anyone can view jeweler translations" ON jeweler_translations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM translation_metadata tm
            WHERE tm.entity_type = 'jeweler'
            AND tm.entity_id = jeweler_id
            AND tm.language_id = jeweler_translations.language_id
            AND tm.translation_status = 'published'
        ) OR
        EXISTS (
            SELECT 1 FROM jewelers 
            WHERE id = jeweler_id 
            AND user_id = auth.uid()
        ) OR
        is_admin()
    );

-- ============================================================================
-- PUBLIC TABLES (NO RLS NEEDED)
-- ============================================================================

-- These tables are public and don't need RLS:
-- - languages
-- - categories
-- - tags
-- - system_translations
-- - enum_translations

-- ============================================================================
-- SECURITY FUNCTIONS FOR APPLICATION USE
-- ============================================================================

-- Function to check if user can access order
CREATE OR REPLACE FUNCTION can_access_order(order_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM orders o
        LEFT JOIN jewelers j ON o.jeweler_id = j.id
        WHERE o.id = order_id
        AND (
            o.user_id = auth.uid() OR
            j.user_id = auth.uid() OR
            is_admin()
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access gift
CREATE OR REPLACE FUNCTION can_access_gift(gift_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM gifts g
        LEFT JOIN users u ON g.recipient_email = u.email
        WHERE g.id = gift_id
        AND (
            g.sender_id = auth.uid() OR
            u.id = auth.uid() OR
            is_admin()
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can manage product
CREATE OR REPLACE FUNCTION can_manage_product(product_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM products p
        JOIN jewelers j ON p.jeweler_id = j.id
        WHERE p.id = product_id
        AND (
            j.user_id = auth.uid() OR
            is_admin()
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUDIT LOGGING SETUP
-- ============================================================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id UUID REFERENCES users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON audit_log
    FOR SELECT USING (is_admin());

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, operation, old_data, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, operation, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, operation, new_data, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_orders AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_jewelers AFTER INSERT OR UPDATE OR DELETE ON jewelers
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION is_admin() IS 'Helper function to check if current user is admin';
COMMENT ON FUNCTION is_jeweler() IS 'Helper function to check if current user is jeweler';
COMMENT ON FUNCTION get_user_jeweler_id() IS 'Helper function to get jeweler ID for current user';
COMMENT ON FUNCTION can_access_order(UUID) IS 'Security function to check order access permissions';
COMMENT ON FUNCTION can_access_gift(UUID) IS 'Security function to check gift access permissions';
COMMENT ON FUNCTION can_manage_product(UUID) IS 'Security function to check product management permissions';
COMMENT ON TABLE audit_log IS 'Audit trail for sensitive operations';
COMMENT ON FUNCTION audit_trigger() IS 'Trigger function for audit logging'; 