-- GemsAI Relationships and Constraints Migration
-- Establishes foreign key relationships, constraints, and junction tables

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Users table constraints
ALTER TABLE users 
ADD CONSTRAINT users_preferred_language_fkey 
FOREIGN KEY (preferred_language) REFERENCES languages(id);

-- Stories table constraints
ALTER TABLE stories 
ADD CONSTRAINT stories_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Sketches table constraints
ALTER TABLE sketches 
ADD CONSTRAINT sketches_story_id_fkey 
FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE;

-- Jewelers table constraints
ALTER TABLE jewelers 
ADD CONSTRAINT jewelers_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Products table constraints
ALTER TABLE products 
ADD CONSTRAINT products_jeweler_id_fkey 
FOREIGN KEY (jeweler_id) REFERENCES jewelers(id) ON DELETE CASCADE;

-- Orders table constraints
ALTER TABLE orders 
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id),
ADD CONSTRAINT orders_jeweler_id_fkey 
FOREIGN KEY (jeweler_id) REFERENCES jewelers(id),
ADD CONSTRAINT orders_story_id_fkey 
FOREIGN KEY (story_id) REFERENCES stories(id),
ADD CONSTRAINT orders_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id);

-- Gifts table constraints
ALTER TABLE gifts 
ADD CONSTRAINT gifts_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES users(id),
ADD CONSTRAINT gifts_story_id_fkey 
FOREIGN KEY (story_id) REFERENCES stories(id),
ADD CONSTRAINT gifts_sketch_id_fkey 
FOREIGN KEY (sketch_id) REFERENCES sketches(id),
ADD CONSTRAINT gifts_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id);

-- Supporting tables constraints
ALTER TABLE sketch_product_matches 
ADD CONSTRAINT sketch_product_matches_sketch_id_fkey 
FOREIGN KEY (sketch_id) REFERENCES sketches(id) ON DELETE CASCADE,
ADD CONSTRAINT sketch_product_matches_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE user_preferences 
ADD CONSTRAINT user_preferences_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE reviews 
ADD CONSTRAINT reviews_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id),
ADD CONSTRAINT reviews_order_id_fkey 
FOREIGN KEY (order_id) REFERENCES orders(id),
ADD CONSTRAINT reviews_jeweler_id_fkey 
FOREIGN KEY (jeweler_id) REFERENCES jewelers(id),
ADD CONSTRAINT reviews_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id);

-- ============================================================================
-- CHECK CONSTRAINTS
-- ============================================================================

-- User constraints
ALTER TABLE users 
ADD CONSTRAINT users_email_format_check 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
ADD CONSTRAINT users_phone_format_check 
CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$');

-- Story constraints
ALTER TABLE stories 
ADD CONSTRAINT stories_budget_range_check 
CHECK (budget_range IS NULL OR budget_range IN ('under_500', '500_1000', '1000_2500', '2500_5000', '5000_10000', 'over_10000')),
ADD CONSTRAINT stories_timeline_check 
CHECK (timeline IS NULL OR timeline IN ('urgent', '1_week', '2_weeks', '1_month', '2_months', 'flexible'));

-- Sketch constraints
ALTER TABLE sketches 
ADD CONSTRAINT sketches_user_rating_check 
CHECK (user_rating IS NULL OR (user_rating >= 1 AND user_rating <= 5)),
ADD CONSTRAINT sketches_generation_cost_check 
CHECK (generation_cost IS NULL OR generation_cost >= 0);

-- Jeweler constraints
ALTER TABLE jewelers 
ADD CONSTRAINT jewelers_rating_check 
CHECK (rating >= 0 AND rating <= 5),
ADD CONSTRAINT jewelers_total_orders_check 
CHECK (total_orders >= 0),
ADD CONSTRAINT jewelers_response_time_check 
CHECK (response_time_hours > 0),
ADD CONSTRAINT jewelers_years_experience_check 
CHECK (years_experience IS NULL OR years_experience >= 0);

-- Product constraints
ALTER TABLE products 
ADD CONSTRAINT products_price_check 
CHECK (price IS NULL OR price >= 0),
ADD CONSTRAINT products_currency_check 
CHECK (currency IN ('ILS', 'USD', 'EUR', 'GBP')),
ADD CONSTRAINT products_lead_time_check 
CHECK (lead_time_days >= 0),
ADD CONSTRAINT products_inventory_check 
CHECK (inventory_count IS NULL OR inventory_count >= 0);

-- Order constraints
ALTER TABLE orders 
ADD CONSTRAINT orders_total_amount_check 
CHECK (total_amount >= 0),
ADD CONSTRAINT orders_currency_check 
CHECK (currency IN ('ILS', 'USD', 'EUR', 'GBP')),
ADD CONSTRAINT orders_delivery_dates_check 
CHECK (estimated_delivery IS NULL OR actual_delivery IS NULL OR actual_delivery >= estimated_delivery);

-- Gift constraints
ALTER TABLE gifts 
ADD CONSTRAINT gifts_expires_after_created_check 
CHECK (expires_at IS NULL OR expires_at > created_at),
ADD CONSTRAINT gifts_viewed_after_created_check 
CHECK (viewed_at IS NULL OR viewed_at >= created_at);

-- Review constraints
ALTER TABLE reviews 
ADD CONSTRAINT reviews_rating_check 
CHECK (rating >= 1 AND rating <= 5),
ADD CONSTRAINT reviews_helpful_votes_check 
CHECK (helpful_votes >= 0);

-- Sketch-Product match constraints
ALTER TABLE sketch_product_matches 
ADD CONSTRAINT sketch_product_matches_score_check 
CHECK (match_score IS NULL OR (match_score >= 0 AND match_score <= 1));

-- ============================================================================
-- UNIQUE CONSTRAINTS
-- ============================================================================

-- Ensure unique business constraints
ALTER TABLE users 
ADD CONSTRAINT users_email_unique UNIQUE (email);

ALTER TABLE jewelers 
ADD CONSTRAINT jewelers_user_id_unique UNIQUE (user_id),
ADD CONSTRAINT jewelers_business_license_unique UNIQUE (business_license) 
WHERE business_license IS NOT NULL;

ALTER TABLE products 
ADD CONSTRAINT products_jeweler_sku_unique UNIQUE (jeweler_id, sku) 
WHERE sku IS NOT NULL;

ALTER TABLE orders 
ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);

ALTER TABLE gifts 
ADD CONSTRAINT gifts_share_token_unique UNIQUE (share_token);

ALTER TABLE user_preferences 
ADD CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id);

ALTER TABLE sketch_product_matches 
ADD CONSTRAINT sketch_product_matches_unique UNIQUE (sketch_id, product_id);

-- ============================================================================
-- JUNCTION TABLES FOR MANY-TO-MANY RELATIONSHIPS
-- ============================================================================

-- User favorite products (many-to-many)
CREATE TABLE IF NOT EXISTS user_favorite_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- User favorite jewelers (many-to-many)
CREATE TABLE IF NOT EXISTS user_favorite_jewelers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    jeweler_id UUID NOT NULL REFERENCES jewelers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, jeweler_id)
);

-- Product categories (many-to-many with category management)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, category_id)
);

-- Product tags (many-to-many with tag management)
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('emotion', 'style', 'material', 'occasion')),
    description TEXT,
    color VARCHAR(7), -- Hex color for UI
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, tag_id)
);

-- Story tags (many-to-many)
CREATE TABLE IF NOT EXISTS story_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, tag_id)
);

-- ============================================================================
-- INDEXES FOR JUNCTION TABLES
-- ============================================================================

-- User favorites indexes
CREATE INDEX IF NOT EXISTS idx_user_favorite_products_user_id ON user_favorite_products(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_products_product_id ON user_favorite_products(product_id);

CREATE INDEX IF NOT EXISTS idx_user_favorite_jewelers_user_id ON user_favorite_jewelers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_jewelers_jeweler_id ON user_favorite_jewelers(jeweler_id);

-- Category indexes
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);

-- Tag indexes
CREATE INDEX IF NOT EXISTS idx_tags_type ON tags(type);
CREATE INDEX IF NOT EXISTS idx_tags_active ON tags(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_product_tags_product_id ON product_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_tag_id ON product_tags(tag_id);

CREATE INDEX IF NOT EXISTS idx_story_tags_story_id ON story_tags(story_id);
CREATE INDEX IF NOT EXISTS idx_story_tags_tag_id ON story_tags(tag_id);

-- ============================================================================
-- TRIGGERS FOR JUNCTION TABLES
-- ============================================================================

-- Add updated_at triggers for new tables
CREATE TRIGGER set_updated_at_categories
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_tags
    BEFORE UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================================
-- BUSINESS LOGIC CONSTRAINTS
-- ============================================================================

-- Ensure jewelers can only review orders they fulfilled
CREATE OR REPLACE FUNCTION check_jeweler_order_access()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM orders 
        WHERE id = NEW.order_id 
        AND jeweler_id = (
            SELECT id FROM jewelers WHERE user_id = auth.uid()
        )
    ) THEN
        RAISE EXCEPTION 'Jewelers can only access their own orders';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure users can only review orders they placed
CREATE OR REPLACE FUNCTION check_user_review_access()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM orders 
        WHERE id = NEW.order_id 
        AND user_id = NEW.user_id
        AND status = 'delivered'
    ) THEN
        RAISE EXCEPTION 'Users can only review delivered orders they placed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply business logic triggers
CREATE TRIGGER check_user_review_access_trigger
    BEFORE INSERT ON reviews
    FOR EACH ROW EXECUTE FUNCTION check_user_review_access();

-- ============================================================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- ============================================================================

-- Popular products view
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_products AS
SELECT 
    p.id,
    p.jeweler_id,
    COUNT(o.id) as order_count,
    AVG(r.rating) as avg_rating,
    COUNT(r.id) as review_count,
    COUNT(ufp.id) as favorite_count
FROM products p
LEFT JOIN orders o ON p.id = o.product_id AND o.status = 'delivered'
LEFT JOIN reviews r ON p.id = r.product_id
LEFT JOIN user_favorite_products ufp ON p.id = ufp.product_id
WHERE p.is_available = TRUE
GROUP BY p.id, p.jeweler_id;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_popular_products_id ON popular_products(id);
CREATE INDEX IF NOT EXISTS idx_popular_products_order_count ON popular_products(order_count DESC);
CREATE INDEX IF NOT EXISTS idx_popular_products_rating ON popular_products(avg_rating DESC);

-- Jeweler performance view
CREATE MATERIALIZED VIEW IF NOT EXISTS jeweler_performance AS
SELECT 
    j.id,
    j.user_id,
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'delivered') as completed_orders,
    AVG(r.rating) as avg_rating,
    COUNT(r.id) as review_count,
    AVG(EXTRACT(EPOCH FROM (o.actual_delivery - o.created_at))/86400) as avg_delivery_days
FROM jewelers j
LEFT JOIN orders o ON j.id = o.jeweler_id
LEFT JOIN reviews r ON j.id = r.jeweler_id
GROUP BY j.id, j.user_id;

-- Create index on jeweler performance view
CREATE UNIQUE INDEX IF NOT EXISTS idx_jeweler_performance_id ON jeweler_performance(id);
CREATE INDEX IF NOT EXISTS idx_jeweler_performance_rating ON jeweler_performance(avg_rating DESC);

-- ============================================================================
-- REFRESH FUNCTIONS FOR MATERIALIZED VIEWS
-- ============================================================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY popular_products;
    REFRESH MATERIALIZED VIEW CONCURRENTLY jeweler_performance;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE user_favorite_products IS 'Junction table for user favorite products (many-to-many)';
COMMENT ON TABLE user_favorite_jewelers IS 'Junction table for user favorite jewelers (many-to-many)';
COMMENT ON TABLE categories IS 'Hierarchical product categories with parent-child relationships';
COMMENT ON TABLE product_categories IS 'Junction table linking products to categories (many-to-many)';
COMMENT ON TABLE tags IS 'Reusable tags for products and stories (emotion, style, material, occasion)';
COMMENT ON TABLE product_tags IS 'Junction table linking products to tags (many-to-many)';
COMMENT ON TABLE story_tags IS 'Junction table linking stories to tags (many-to-many)';

COMMENT ON MATERIALIZED VIEW popular_products IS 'Aggregated product popularity metrics for performance';
COMMENT ON MATERIALIZED VIEW jeweler_performance IS 'Aggregated jeweler performance metrics for rankings';

COMMENT ON FUNCTION refresh_materialized_views() IS 'Refreshes all materialized views for updated analytics'; 