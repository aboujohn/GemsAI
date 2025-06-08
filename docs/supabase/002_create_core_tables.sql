-- GemsAI Core Business Tables Migration
-- Creates the main business entities for the GemsAI platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User roles
CREATE TYPE user_role AS ENUM ('user', 'jeweler', 'admin');

-- Story statuses
CREATE TYPE story_status AS ENUM ('draft', 'submitted', 'processing', 'completed');

-- Sketch statuses
CREATE TYPE sketch_status AS ENUM ('generating', 'completed', 'failed', 'archived');

-- Verification statuses
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected', 'suspended');

-- Order statuses
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'shipped', 'delivered', 'cancelled');

-- Payment statuses
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

-- Gift statuses
CREATE TYPE gift_status AS ENUM ('created', 'sent', 'viewed', 'expired');

-- ============================================================================
-- CORE BUSINESS TABLES
-- ============================================================================

-- Users table - Central user management
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'user',
    phone VARCHAR(20),
    date_of_birth DATE,
    preferred_language VARCHAR(10) DEFAULT 'he' REFERENCES languages(id),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    marketing_consent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stories table - User emotional stories
CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emotion VARCHAR(100),
    jewelry_style VARCHAR(100),
    material_preference VARCHAR(100),
    budget_range VARCHAR(50),
    timeline VARCHAR(50),
    special_requests TEXT,
    image_urls TEXT[],
    status story_status DEFAULT 'draft',
    ai_analysis JSONB, -- Store AI emotion analysis results
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sketches table - AI-generated sketches
CREATE TABLE IF NOT EXISTS sketches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    prompt TEXT NOT NULL, -- The AI prompt used for generation
    ai_model VARCHAR(50), -- 'dall-e-3', 'sdxl', etc.
    generation_params JSONB, -- Store generation parameters
    variants TEXT[], -- URLs of style variants
    status sketch_status DEFAULT 'generating',
    generation_cost DECIMAL(10,4), -- Track AI generation costs
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    user_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jewelers table - Jeweler profiles and verification
CREATE TABLE IF NOT EXISTS jewelers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255),
    business_license VARCHAR(100),
    portfolio_url TEXT,
    verification_status verification_status DEFAULT 'pending',
    verification_documents TEXT[], -- URLs to verification docs
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    response_time_hours INTEGER DEFAULT 24,
    location_city VARCHAR(100),
    location_country VARCHAR(100),
    specialties TEXT[], -- Array of specialization tags
    years_experience INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table - Jeweler product catalog
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jeweler_id UUID NOT NULL REFERENCES jewelers(id) ON DELETE CASCADE,
    sku VARCHAR(100),
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'ILS',
    images TEXT[] NOT NULL,
    category VARCHAR(100),
    materials TEXT[],
    dimensions JSONB, -- Store width, height, depth, weight
    customizable BOOLEAN DEFAULT FALSE,
    lead_time_days INTEGER DEFAULT 7,
    is_available BOOLEAN DEFAULT TRUE,
    inventory_count INTEGER,
    emotion_tags TEXT[], -- Tags for emotion-based matching
    style_tags TEXT[], -- Style-based tags
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table - Order management and tracking
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL, -- Human-readable order number
    user_id UUID NOT NULL REFERENCES users(id),
    jeweler_id UUID NOT NULL REFERENCES jewelers(id),
    story_id UUID REFERENCES stories(id),
    product_id UUID REFERENCES products(id),
    status order_status DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ILS',
    payment_id VARCHAR(255), -- External payment provider ID
    payment_status payment_status DEFAULT 'pending',
    shipping_address JSONB,
    billing_address JSONB,
    tracking_number VARCHAR(100),
    estimated_delivery DATE,
    actual_delivery DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gifts table - Gift sharing and management
CREATE TABLE IF NOT EXISTS gifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    story_id UUID REFERENCES stories(id),
    sketch_id UUID REFERENCES sketches(id),
    product_id UUID REFERENCES products(id),
    message TEXT,
    share_token VARCHAR(100) UNIQUE NOT NULL, -- For secure sharing
    animation_type VARCHAR(50), -- Gift wrap animation
    voice_message_url TEXT, -- ElevenLabs TTS URL
    status gift_status DEFAULT 'created',
    viewed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SUPPORTING TABLES
-- ============================================================================

-- Sketch-Product matches table - AI-generated matches
CREATE TABLE IF NOT EXISTS sketch_product_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sketch_id UUID NOT NULL REFERENCES sketches(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    match_score DECIMAL(5,4), -- 0.0000 to 1.0000
    match_reasoning TEXT,
    ai_model VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sketch_id, product_id)
);

-- User preferences table - User preferences and personalization
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferred_styles TEXT[],
    preferred_materials TEXT[],
    budget_range VARCHAR(50),
    notification_settings JSONB,
    privacy_settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table - Product and jeweler reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    order_id UUID NOT NULL REFERENCES orders(id),
    jeweler_id UUID NOT NULL REFERENCES jewelers(id),
    product_id UUID REFERENCES products(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    content TEXT,
    images TEXT[],
    helpful_votes INTEGER DEFAULT 0,
    verified_purchase BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BASIC INDEXES
-- ============================================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_preferred_language ON users(preferred_language);

-- Story indexes
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);

-- Sketch indexes
CREATE INDEX IF NOT EXISTS idx_sketches_story_id ON sketches(story_id);
CREATE INDEX IF NOT EXISTS idx_sketches_status ON sketches(status);
CREATE INDEX IF NOT EXISTS idx_sketches_ai_model ON sketches(ai_model);

-- Jeweler indexes
CREATE INDEX IF NOT EXISTS idx_jewelers_user_id ON jewelers(user_id);
CREATE INDEX IF NOT EXISTS idx_jewelers_verification_status ON jewelers(verification_status);
CREATE INDEX IF NOT EXISTS idx_jewelers_location ON jewelers(location_city, location_country);

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_jeweler_id ON products(jeweler_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available) WHERE is_available = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_emotion_tags ON products USING GIN(emotion_tags);
CREATE INDEX IF NOT EXISTS idx_products_style_tags ON products USING GIN(style_tags);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_jeweler_id ON orders(jeweler_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Gift indexes
CREATE INDEX IF NOT EXISTS idx_gifts_sender_id ON gifts(sender_id);
CREATE INDEX IF NOT EXISTS idx_gifts_share_token ON gifts(share_token);
CREATE INDEX IF NOT EXISTS idx_gifts_recipient_email ON gifts(recipient_email);
CREATE INDEX IF NOT EXISTS idx_gifts_status ON gifts(status);

-- Supporting table indexes
CREATE INDEX IF NOT EXISTS idx_sketch_product_matches_sketch ON sketch_product_matches(sketch_id);
CREATE INDEX IF NOT EXISTS idx_sketch_product_matches_product ON sketch_product_matches(product_id);
CREATE INDEX IF NOT EXISTS idx_sketch_product_matches_score ON sketch_product_matches(match_score DESC);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_jeweler_id ON reviews(jeweler_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Add updated_at triggers to all tables
CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_stories
    BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_sketches
    BEFORE UPDATE ON sketches
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_jewelers
    BEFORE UPDATE ON jewelers
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_products
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_orders
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_gifts
    BEFORE UPDATE ON gifts
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_sketch_product_matches
    BEFORE UPDATE ON sketch_product_matches
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_user_preferences
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_reviews
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    new_number TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        -- Generate order number: GEM-YYYYMMDD-XXXX
        new_number := 'GEM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                     LPAD((EXTRACT(EPOCH FROM NOW())::INTEGER % 10000)::TEXT, 4, '0');
        
        -- Check if this number already exists
        IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        -- Safety counter to prevent infinite loops
        counter := counter + 1;
        IF counter > 100 THEN
            -- Fallback to UUID-based number
            new_number := 'GEM-' || REPLACE(uuid_generate_v4()::TEXT, '-', '')::TEXT;
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_number;
END;
$$;

-- Function to generate secure share tokens for gifts
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    new_token TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        -- Generate a secure random token
        new_token := encode(gen_random_bytes(32), 'base64');
        -- Remove URL-unsafe characters
        new_token := REPLACE(REPLACE(REPLACE(new_token, '+', ''), '/', ''), '=', '');
        -- Take first 32 characters
        new_token := SUBSTRING(new_token, 1, 32);
        
        -- Check if this token already exists
        IF NOT EXISTS (SELECT 1 FROM gifts WHERE share_token = new_token) THEN
            RETURN new_token;
        END IF;
        
        -- Safety counter
        counter := counter + 1;
        IF counter > 100 THEN
            -- Fallback to UUID
            new_token := REPLACE(uuid_generate_v4()::TEXT, '-', '');
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_token;
END;
$$;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE users IS 'Central user management with role-based access control';
COMMENT ON TABLE stories IS 'User emotional stories that drive AI sketch generation';
COMMENT ON TABLE sketches IS 'AI-generated sketches based on user stories';
COMMENT ON TABLE jewelers IS 'Jeweler profiles with verification and business information';
COMMENT ON TABLE products IS 'Jeweler product catalog with emotion and style tagging';
COMMENT ON TABLE orders IS 'Order management and tracking with payment integration';
COMMENT ON TABLE gifts IS 'Gift sharing system with secure tokens and animations';
COMMENT ON TABLE sketch_product_matches IS 'AI-generated matches between sketches and products';
COMMENT ON TABLE user_preferences IS 'User preferences for personalization';
COMMENT ON TABLE reviews IS 'Product and jeweler reviews with verification';

-- Column comments for key fields
COMMENT ON COLUMN users.preferred_language IS 'References languages.id for i18n support';
COMMENT ON COLUMN stories.ai_analysis IS 'JSON storage for AI emotion analysis results';
COMMENT ON COLUMN sketches.generation_params IS 'JSON storage for AI generation parameters';
COMMENT ON COLUMN products.emotion_tags IS 'Array of emotion tags for AI matching';
COMMENT ON COLUMN orders.order_number IS 'Human-readable order identifier';
COMMENT ON COLUMN gifts.share_token IS 'Secure token for gift sharing URLs'; 