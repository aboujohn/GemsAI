-- GemsAI Gift System Enhancement Migration
-- Enhances the existing gift system with comprehensive functionality
-- including animations, wishlists, reactions, and notifications

-- ============================================================================
-- ENHANCED ENUMS FOR GIFT SYSTEM
-- ============================================================================

-- Gift types
CREATE TYPE gift_type AS ENUM (
    'jewelry_story',      -- Story + AI sketch + product recommendations
    'jewelry_piece',      -- Specific jewelry product
    'wish_story',         -- Story for someone else to fulfill
    'custom_message',     -- Pure message with animation
    'wishlist_share'      -- Shared wishlist
);

-- Privacy levels
CREATE TYPE privacy_level AS ENUM (
    'public',             -- Anyone can view
    'unlisted',          -- Only people with link can view
    'private',           -- Only sender and recipient
    'family',            -- Family members only
    'friends'            -- Friends only
);

-- Enhanced gift status
CREATE TYPE enhanced_gift_status AS ENUM (
    'draft',             -- Being created
    'scheduled',         -- Scheduled for future delivery
    'sent',              -- Active and viewable
    'viewed',            -- Recipient has viewed
    'expired',           -- Past expiration date
    'archived',          -- Archived by sender
    'blocked'            -- Blocked for policy violation
);

-- Animation categories
CREATE TYPE animation_category AS ENUM (
    'romantic',          -- Love, romance, Valentine's
    'celebration',       -- Birthday, anniversary, achievement
    'holiday',           -- Christmas, Hanukkah, New Year
    'family',            -- Mother's Day, Father's Day, family occasions
    'friendship',        -- Friendship, gratitude, support
    'seasonal',          -- Spring, summer, fall, winter themes
    'elegant',           -- Sophisticated, luxury animations
    'playful',           -- Fun, colorful, energetic
    'spiritual',         -- Religious, spiritual themes
    'minimalist'         -- Simple, clean animations
);

-- Animation styles
CREATE TYPE animation_style AS ENUM (
    'particles',         -- Particle effects
    'floral',           -- Flower and nature themes
    'geometric',        -- Geometric patterns
    'watercolor',       -- Artistic watercolor effects
    'sparkles',         -- Glitter and sparkle effects
    'ribbon',           -- Ribbon and bow animations
    'heart',            -- Heart-themed animations
    'star',             -- Star and celestial themes
    'wave',             -- Wave and fluid animations
    'confetti'          -- Confetti and celebration effects
);

-- Reaction types
CREATE TYPE reaction_type AS ENUM (
    'love',             -- ❤️
    'wow',              -- 😮
    'laugh',            -- 😂
    'cry',              -- 😢
    'angry',            -- 😠
    'grateful',         -- 🙏
    'excited',          -- 🎉
    'surprised'         -- 😲
);

-- Wishlist priority
CREATE TYPE wishlist_priority AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);

-- Notification types
CREATE TYPE notification_type AS ENUM (
    'gift_received',     -- Someone sent you a gift
    'gift_viewed',       -- Your gift was viewed
    'gift_reaction',     -- Someone reacted to your gift
    'wishlist_update',   -- Someone added to your wishlist
    'gift_reminder',     -- Reminder for scheduled gift
    'gift_expiring',     -- Gift expiring soon
    'system_update'      -- System notifications
);

-- ============================================================================
-- ENHANCED GIFT TABLES
-- ============================================================================

-- Drop and recreate gifts table with enhanced structure
DROP TABLE IF EXISTS gifts CASCADE;

CREATE TABLE gifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User relationships
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_name VARCHAR(255),
    sender_email VARCHAR(255),
    recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recipient_name VARCHAR(255),
    recipient_email VARCHAR(255),
    
    -- Gift content
    title VARCHAR(255) NOT NULL,
    message TEXT,
    description TEXT,
    voice_message_url TEXT,
    animation_id UUID,  -- Will reference gift_animations table
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    sketch_id UUID REFERENCES sketches(id) ON DELETE SET NULL,
    
    -- Gift configuration
    gift_type gift_type NOT NULL DEFAULT 'custom_message',
    privacy_level privacy_level NOT NULL DEFAULT 'private',
    
    -- Sharing and access
    share_token VARCHAR(100) UNIQUE NOT NULL DEFAULT generate_share_token(),
    share_url TEXT,
    is_public BOOLEAN GENERATED ALWAYS AS (privacy_level = 'public') STORED,
    view_count INTEGER DEFAULT 0,
    reaction_count INTEGER DEFAULT 0,
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_delivery TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Status and favorites
    status enhanced_gift_status DEFAULT 'draft',
    is_favorite BOOLEAN DEFAULT FALSE
);

-- Gift animations library
CREATE TABLE gift_animations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    preview_url TEXT,
    
    -- Categories and classification
    category animation_category NOT NULL,
    style animation_style NOT NULL,
    tags TEXT[] DEFAULT '{}',
    
    -- Metadata
    duration_ms INTEGER NOT NULL DEFAULT 3000,
    file_size_bytes INTEGER,
    is_premium BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Usage and ratings
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    
    -- Localization
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift reactions
CREATE TABLE gift_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gift_id UUID NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,
    
    -- User information (optional for anonymous reactions)
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    
    -- Reaction data
    reaction_type reaction_type NOT NULL,
    message TEXT,
    emoji VARCHAR(10),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    
    -- Prevent duplicate reactions from same user/email
    UNIQUE(gift_id, user_id),
    UNIQUE(gift_id, user_email) DEFERRABLE INITIALLY DEFERRED
);

-- User wishlists
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only one default wishlist per user
    UNIQUE(user_id, is_default) DEFERRABLE INITIALLY DEFERRED
);

-- Wishlist items
CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    
    -- Item references (one of these should be set)
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sketch_id UUID REFERENCES sketches(id) ON DELETE CASCADE,
    gift_id UUID REFERENCES gifts(id) ON DELETE CASCADE,
    
    -- Item details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    notes TEXT,
    priority wishlist_priority DEFAULT 'medium',
    
    -- Custom preferences
    price_range_min DECIMAL(10,2),
    price_range_max DECIMAL(10,2),
    preferred_materials TEXT[],
    preferred_styles TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure at least one reference is set
    CHECK (
        (product_id IS NOT NULL)::INTEGER +
        (sketch_id IS NOT NULL)::INTEGER +
        (gift_id IS NOT NULL)::INTEGER = 1
    )
);

-- User favorites for gifts
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gift_id UUID NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, gift_id)
);

-- Gift notifications
CREATE TABLE gift_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gift_id UUID REFERENCES gifts(id) ON DELETE CASCADE,
    
    -- Notification content
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    
    -- Status tracking
    is_read BOOLEAN DEFAULT FALSE,
    is_email_sent BOOLEAN DEFAULT FALSE,
    is_push_sent BOOLEAN DEFAULT FALSE,
    
    -- Action and metadata
    action_url TEXT,
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Enhanced gifts table indexes
CREATE INDEX idx_gifts_sender_id ON gifts(sender_id);
CREATE INDEX idx_gifts_recipient_id ON gifts(recipient_id) WHERE recipient_id IS NOT NULL;
CREATE INDEX idx_gifts_recipient_email ON gifts(recipient_email) WHERE recipient_email IS NOT NULL;
CREATE INDEX idx_gifts_share_token ON gifts(share_token);
CREATE INDEX idx_gifts_status ON gifts(status);
CREATE INDEX idx_gifts_gift_type ON gifts(gift_type);
CREATE INDEX idx_gifts_privacy_level ON gifts(privacy_level);
CREATE INDEX idx_gifts_created_at ON gifts(created_at DESC);
CREATE INDEX idx_gifts_view_count ON gifts(view_count DESC);
CREATE INDEX idx_gifts_public ON gifts(is_public) WHERE is_public = TRUE;

-- Gift animations indexes
CREATE INDEX idx_gift_animations_category ON gift_animations(category);
CREATE INDEX idx_gift_animations_style ON gift_animations(style);
CREATE INDEX idx_gift_animations_featured ON gift_animations(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_gift_animations_premium ON gift_animations(is_premium);
CREATE INDEX idx_gift_animations_usage ON gift_animations(usage_count DESC);
CREATE INDEX idx_gift_animations_rating ON gift_animations(rating DESC);
CREATE INDEX idx_gift_animations_tags ON gift_animations USING GIN(tags);

-- Gift reactions indexes
CREATE INDEX idx_gift_reactions_gift_id ON gift_reactions(gift_id);
CREATE INDEX idx_gift_reactions_user_id ON gift_reactions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_gift_reactions_type ON gift_reactions(reaction_type);
CREATE INDEX idx_gift_reactions_created_at ON gift_reactions(created_at DESC);

-- Wishlist indexes
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_public ON wishlists(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_wishlists_default ON wishlists(user_id, is_default) WHERE is_default = TRUE;

-- Wishlist items indexes
CREATE INDEX idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
CREATE INDEX idx_wishlist_items_product_id ON wishlist_items(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX idx_wishlist_items_sketch_id ON wishlist_items(sketch_id) WHERE sketch_id IS NOT NULL;
CREATE INDEX idx_wishlist_items_gift_id ON wishlist_items(gift_id) WHERE gift_id IS NOT NULL;
CREATE INDEX idx_wishlist_items_priority ON wishlist_items(priority);

-- User favorites indexes
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_gift_id ON user_favorites(gift_id);

-- Gift notifications indexes
CREATE INDEX idx_gift_notifications_user_id ON gift_notifications(user_id);
CREATE INDEX idx_gift_notifications_gift_id ON gift_notifications(gift_id) WHERE gift_id IS NOT NULL;
CREATE INDEX idx_gift_notifications_type ON gift_notifications(type);
CREATE INDEX idx_gift_notifications_unread ON gift_notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_gift_notifications_created_at ON gift_notifications(created_at DESC);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update gift reaction count
CREATE OR REPLACE FUNCTION update_gift_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE gifts 
        SET reaction_count = reaction_count + 1 
        WHERE id = NEW.gift_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE gifts 
        SET reaction_count = reaction_count - 1 
        WHERE id = OLD.gift_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update gift view count
CREATE OR REPLACE FUNCTION increment_gift_view_count()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.viewed_at IS NULL AND NEW.viewed_at IS NOT NULL THEN
        NEW.view_count = OLD.view_count + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update animation usage count
CREATE OR REPLACE FUNCTION update_animation_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.animation_id IS NOT NULL AND (OLD.animation_id IS NULL OR OLD.animation_id != NEW.animation_id) THEN
        UPDATE gift_animations 
        SET usage_count = usage_count + 1 
        WHERE id = NEW.animation_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate share URLs
CREATE OR REPLACE FUNCTION update_share_url()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate share URL based on environment
    NEW.share_url = COALESCE(
        current_setting('app.base_url', true), 
        'https://gemsai.vercel.app'
    ) || '/gift/' || NEW.share_token;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to ensure only one default wishlist per user
CREATE OR REPLACE FUNCTION ensure_single_default_wishlist()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        -- Update other wishlists for this user to not be default
        UPDATE wishlists 
        SET is_default = FALSE 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger for gift reaction count updates
CREATE TRIGGER trigger_update_gift_reaction_count
    AFTER INSERT OR DELETE ON gift_reactions
    FOR EACH ROW EXECUTE FUNCTION update_gift_reaction_count();

-- Trigger for gift view count updates
CREATE TRIGGER trigger_increment_gift_view_count
    BEFORE UPDATE OF viewed_at ON gifts
    FOR EACH ROW EXECUTE FUNCTION increment_gift_view_count();

-- Trigger for animation usage count updates
CREATE TRIGGER trigger_update_animation_usage_count
    AFTER INSERT OR UPDATE OF animation_id ON gifts
    FOR EACH ROW EXECUTE FUNCTION update_animation_usage_count();

-- Trigger for share URL generation
CREATE TRIGGER trigger_update_share_url
    BEFORE INSERT OR UPDATE OF share_token ON gifts
    FOR EACH ROW EXECUTE FUNCTION update_share_url();

-- Trigger for default wishlist management
CREATE TRIGGER trigger_ensure_single_default_wishlist
    AFTER INSERT OR UPDATE OF is_default ON wishlists
    FOR EACH ROW EXECUTE FUNCTION ensure_single_default_wishlist();

-- Add updated_at triggers for all new tables
CREATE TRIGGER set_updated_at_gifts
    BEFORE UPDATE ON gifts
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_gift_animations
    BEFORE UPDATE ON gift_animations
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_wishlists
    BEFORE UPDATE ON wishlists
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_wishlist_items
    BEFORE UPDATE ON wishlist_items
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Sample gift animations
INSERT INTO gift_animations (name, description, file_path, thumbnail_url, category, style, duration_ms, is_featured) VALUES
('Romantic Hearts', 'Floating hearts with sparkle effects', '/animations/romantic-hearts.json', '/thumbnails/romantic-hearts.jpg', 'romantic', 'heart', 5000, true),
('Birthday Confetti', 'Colorful confetti celebration', '/animations/birthday-confetti.json', '/thumbnails/birthday-confetti.jpg', 'celebration', 'confetti', 4000, true),
('Holiday Snow', 'Gentle snowfall animation', '/animations/holiday-snow.json', '/thumbnails/holiday-snow.jpg', 'holiday', 'particles', 6000, false),
('Elegant Ribbons', 'Sophisticated ribbon animation', '/animations/elegant-ribbons.json', '/thumbnails/elegant-ribbons.jpg', 'elegant', 'ribbon', 4500, true),
('Floral Garden', 'Blooming flowers and petals', '/animations/floral-garden.json', '/thumbnails/floral-garden.jpg', 'seasonal', 'floral', 7000, false),
('Minimalist Waves', 'Simple wave patterns', '/animations/minimalist-waves.json', '/thumbnails/minimalist-waves.jpg', 'minimalist', 'wave', 3000, false);

-- Update foreign key reference for gifts table
ALTER TABLE gifts ADD CONSTRAINT fk_gifts_animation_id 
    FOREIGN KEY (animation_id) REFERENCES gift_animations(id) ON DELETE SET NULL;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all gift tables
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_animations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_notifications ENABLE ROW LEVEL SECURITY;

-- Gifts policies
CREATE POLICY "Users can view their own gifts" ON gifts
    FOR SELECT USING (
        sender_id = auth.uid() OR 
        recipient_id = auth.uid() OR
        recipient_email = auth.email()
    );

CREATE POLICY "Users can create gifts" ON gifts
    FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own gifts" ON gifts
    FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own gifts" ON gifts
    FOR DELETE USING (sender_id = auth.uid());

-- Public gifts can be viewed by anyone
CREATE POLICY "Public gifts are viewable by all" ON gifts
    FOR SELECT USING (privacy_level = 'public');

-- Gift animations are publicly viewable
CREATE POLICY "Gift animations are publicly viewable" ON gift_animations
    FOR SELECT TO authenticated, anon USING (true);

-- Reactions policies
CREATE POLICY "Users can view reactions" ON gift_reactions
    FOR SELECT USING (true);

CREATE POLICY "Users can create reactions" ON gift_reactions
    FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update their own reactions" ON gift_reactions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reactions" ON gift_reactions
    FOR DELETE USING (user_id = auth.uid());

-- Wishlist policies
CREATE POLICY "Users can manage their own wishlists" ON wishlists
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Public wishlists are viewable" ON wishlists
    FOR SELECT USING (is_public = true);

-- Wishlist items policies
CREATE POLICY "Users can manage wishlist items" ON wishlist_items
    FOR ALL USING (
        wishlist_id IN (
            SELECT id FROM wishlists WHERE user_id = auth.uid()
        )
    );

-- User favorites policies
CREATE POLICY "Users can manage their own favorites" ON user_favorites
    FOR ALL USING (user_id = auth.uid());

-- Notification policies
CREATE POLICY "Users can view their own notifications" ON gift_notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON gift_notifications
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE gifts IS 'Enhanced gift system with comprehensive sharing, privacy, and interaction features';
COMMENT ON TABLE gift_animations IS 'Library of animations for gift presentation with categorization and usage tracking';
COMMENT ON TABLE gift_reactions IS 'User reactions to gifts with support for anonymous reactions';
COMMENT ON TABLE wishlists IS 'User wish lists for organizing desired items and gifts';
COMMENT ON TABLE wishlist_items IS 'Individual items in user wishlists with preferences and notes';
COMMENT ON TABLE user_favorites IS 'User favorites for saving and organizing received gifts';
COMMENT ON TABLE gift_notifications IS 'Notification system for gift-related events and updates';

-- Key column comments
COMMENT ON COLUMN gifts.share_token IS 'Secure token for sharing gifts via URL';
COMMENT ON COLUMN gifts.privacy_level IS 'Controls who can view the gift';
COMMENT ON COLUMN gifts.gift_type IS 'Type of gift content and functionality';
COMMENT ON COLUMN gift_animations.category IS 'Thematic category for animation organization';
COMMENT ON COLUMN gift_animations.style IS 'Visual style classification for filtering';
COMMENT ON COLUMN gift_reactions.reaction_type IS 'Predefined emotional reaction types';
COMMENT ON COLUMN wishlists.is_default IS 'Primary wishlist for the user';
COMMENT ON COLUMN gift_notifications.type IS 'Categorization for notification handling';