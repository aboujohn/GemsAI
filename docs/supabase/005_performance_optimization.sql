-- GemsAI Performance Optimization
-- Advanced indexing, query optimization, and performance monitoring

-- ============================================================================
-- ADVANCED INDEXES FOR PERFORMANCE
-- ============================================================================

-- Full-text search indexes with Hebrew support
CREATE INDEX IF NOT EXISTS idx_story_translations_search_he
ON story_translations USING GIN(to_tsvector('hebrew', title || ' ' || COALESCE(content, '')))
WHERE language_id = 'he';

CREATE INDEX IF NOT EXISTS idx_story_translations_search_en
ON story_translations USING GIN(to_tsvector('english', title || ' ' || COALESCE(content, '')))
WHERE language_id = 'en';

CREATE INDEX IF NOT EXISTS idx_product_translations_search_he
ON product_translations USING GIN(to_tsvector('hebrew', name || ' ' || COALESCE(description, '')))
WHERE language_id = 'he';

CREATE INDEX IF NOT EXISTS idx_product_translations_search_en
ON product_translations USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')))
WHERE language_id = 'en';

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_products_jeweler_available_featured 
ON products(jeweler_id, is_available, featured) 
WHERE is_available = TRUE;

CREATE INDEX IF NOT EXISTS idx_orders_user_status_created 
ON orders(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_jeweler_status_created 
ON orders(jeweler_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sketches_story_status_created 
ON sketches(story_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_jeweler_rating_created 
ON reviews(jeweler_id, rating, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_product_rating_created 
ON reviews(product_id, rating, created_at DESC);

-- Partial indexes for specific conditions
CREATE INDEX IF NOT EXISTS idx_gifts_active_tokens 
ON gifts(share_token) 
WHERE status IN ('created', 'sent') AND expires_at > NOW();

CREATE INDEX IF NOT EXISTS idx_orders_pending_payment 
ON orders(created_at DESC) 
WHERE payment_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_jewelers_verified_rating 
ON jewelers(rating DESC, total_orders DESC) 
WHERE verification_status = 'verified';

-- Expression indexes for calculated fields
CREATE INDEX IF NOT EXISTS idx_orders_total_amount_ils 
ON orders((total_amount * CASE WHEN currency = 'USD' THEN 3.7 WHEN currency = 'EUR' THEN 4.0 ELSE 1 END))
WHERE currency IN ('ILS', 'USD', 'EUR');

-- Array indexes for tag searches
CREATE INDEX IF NOT EXISTS idx_products_emotion_tags_gin 
ON products USING GIN(emotion_tags);

CREATE INDEX IF NOT EXISTS idx_products_style_tags_gin 
ON products USING GIN(style_tags);

CREATE INDEX IF NOT EXISTS idx_products_materials_gin 
ON products USING GIN(materials);

-- Geographic indexes for location-based searches
CREATE INDEX IF NOT EXISTS idx_jewelers_location 
ON jewelers(location_country, location_city) 
WHERE verification_status = 'verified';

-- ============================================================================
-- QUERY OPTIMIZATION VIEWS
-- ============================================================================

-- Optimized view for product search with all relevant data
CREATE OR REPLACE VIEW products_search_optimized AS
SELECT 
    p.id,
    p.jeweler_id,
    p.price,
    p.currency,
    p.images,
    p.category,
    p.materials,
    p.emotion_tags,
    p.style_tags,
    p.featured,
    p.is_available,
    p.lead_time_days,
    p.created_at,
    -- Jeweler info
    j.verification_status,
    j.rating as jeweler_rating,
    j.total_orders as jeweler_total_orders,
    j.location_city,
    j.location_country,
    -- Product translations
    pt_he.name as name_he,
    pt_he.description as description_he,
    pt_he.short_description as short_description_he,
    pt_en.name as name_en,
    pt_en.description as description_en,
    pt_en.short_description as short_description_en,
    -- Aggregated metrics
    COALESCE(pp.avg_rating, 0) as avg_rating,
    COALESCE(pp.review_count, 0) as review_count,
    COALESCE(pp.order_count, 0) as order_count,
    COALESCE(pp.favorite_count, 0) as favorite_count
FROM products p
JOIN jewelers j ON p.jeweler_id = j.id
LEFT JOIN product_translations pt_he ON p.id = pt_he.product_id AND pt_he.language_id = 'he'
LEFT JOIN product_translations pt_en ON p.id = pt_en.product_id AND pt_en.language_id = 'en'
LEFT JOIN popular_products pp ON p.id = pp.id
WHERE p.is_available = TRUE 
AND j.verification_status = 'verified';

-- Optimized view for jeweler profiles with metrics
CREATE OR REPLACE VIEW jewelers_profile_optimized AS
SELECT 
    j.id,
    j.user_id,
    j.business_name,
    j.portfolio_url,
    j.verification_status,
    j.rating,
    j.total_orders,
    j.response_time_hours,
    j.location_city,
    j.location_country,
    j.specialties,
    j.years_experience,
    j.created_at,
    -- User info
    u.name as user_name,
    u.avatar_url,
    -- Jeweler translations
    jt_he.name as name_he,
    jt_he.bio as bio_he,
    jt_he.tagline as tagline_he,
    jt_en.name as name_en,
    jt_en.bio as bio_en,
    jt_en.tagline as tagline_en,
    -- Performance metrics
    COALESCE(jp.completed_orders, 0) as completed_orders,
    COALESCE(jp.avg_rating, 0) as avg_rating,
    COALESCE(jp.review_count, 0) as review_count,
    COALESCE(jp.avg_delivery_days, 0) as avg_delivery_days,
    -- Product counts
    (SELECT COUNT(*) FROM products WHERE jeweler_id = j.id AND is_available = TRUE) as active_products
FROM jewelers j
JOIN users u ON j.user_id = u.id
LEFT JOIN jeweler_translations jt_he ON j.id = jt_he.jeweler_id AND jt_he.language_id = 'he'
LEFT JOIN jeweler_translations jt_en ON j.id = jt_en.jeweler_id AND jt_en.language_id = 'en'
LEFT JOIN jeweler_performance jp ON j.id = jp.id
WHERE j.verification_status = 'verified';

-- User dashboard view with all relevant data
CREATE OR REPLACE VIEW user_dashboard_optimized AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.avatar_url,
    u.role,
    u.preferred_language,
    -- User stats
    (SELECT COUNT(*) FROM stories WHERE user_id = u.id) as total_stories,
    (SELECT COUNT(*) FROM sketches s JOIN stories st ON s.story_id = st.id WHERE st.user_id = u.id) as total_sketches,
    (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as total_orders,
    (SELECT COUNT(*) FROM reviews WHERE user_id = u.id) as total_reviews,
    (SELECT COUNT(*) FROM gifts WHERE sender_id = u.id) as gifts_sent,
    (SELECT COUNT(*) FROM gifts WHERE recipient_email = u.email) as gifts_received,
    -- Recent activity
    (SELECT MAX(created_at) FROM stories WHERE user_id = u.id) as last_story_created,
    (SELECT MAX(created_at) FROM orders WHERE user_id = u.id) as last_order_created,
    -- Preferences
    up.preferred_styles,
    up.preferred_materials,
    up.budget_range,
    up.notification_settings,
    up.privacy_settings
FROM users u
LEFT JOIN user_preferences up ON u.id = up.user_id;

-- ============================================================================
-- PERFORMANCE MONITORING FUNCTIONS
-- ============================================================================

-- Function to get slow queries
CREATE OR REPLACE FUNCTION get_slow_queries(min_duration_ms INTEGER DEFAULT 1000)
RETURNS TABLE (
    query TEXT,
    calls BIGINT,
    total_time DOUBLE PRECISION,
    mean_time DOUBLE PRECISION,
    max_time DOUBLE PRECISION,
    stddev_time DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pg_stat_statements.query,
        pg_stat_statements.calls,
        pg_stat_statements.total_exec_time,
        pg_stat_statements.mean_exec_time,
        pg_stat_statements.max_exec_time,
        pg_stat_statements.stddev_exec_time
    FROM pg_stat_statements
    WHERE pg_stat_statements.mean_exec_time > min_duration_ms
    ORDER BY pg_stat_statements.mean_exec_time DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get index usage statistics
CREATE OR REPLACE FUNCTION get_index_usage()
RETURNS TABLE (
    schemaname TEXT,
    tablename TEXT,
    indexname TEXT,
    idx_scan BIGINT,
    idx_tup_read BIGINT,
    idx_tup_fetch BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pg_stat_user_indexes.schemaname,
        pg_stat_user_indexes.relname,
        pg_stat_user_indexes.indexrelname,
        pg_stat_user_indexes.idx_scan,
        pg_stat_user_indexes.idx_tup_read,
        pg_stat_user_indexes.idx_tup_fetch
    FROM pg_stat_user_indexes
    ORDER BY pg_stat_user_indexes.idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get table size information
CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE (
    table_name TEXT,
    row_count BIGINT,
    total_size TEXT,
    index_size TEXT,
    toast_size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        n_tup_ins - n_tup_del as row_count,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
        pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as toast_size
    FROM pg_stat_user_tables
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- QUERY OPTIMIZATION FUNCTIONS
-- ============================================================================

-- Function for optimized product search
CREATE OR REPLACE FUNCTION search_products(
    search_text TEXT DEFAULT NULL,
    emotion_tags_filter TEXT[] DEFAULT NULL,
    style_tags_filter TEXT[] DEFAULT NULL,
    price_min DECIMAL DEFAULT NULL,
    price_max DECIMAL DEFAULT NULL,
    jeweler_location TEXT DEFAULT NULL,
    language_code TEXT DEFAULT 'he',
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    price DECIMAL,
    currency TEXT,
    images TEXT[],
    jeweler_name TEXT,
    jeweler_rating DECIMAL,
    avg_rating DECIMAL,
    review_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        CASE 
            WHEN language_code = 'he' THEN COALESCE(p.name_he, p.name_en)
            ELSE COALESCE(p.name_en, p.name_he)
        END as name,
        CASE 
            WHEN language_code = 'he' THEN COALESCE(p.description_he, p.description_en)
            ELSE COALESCE(p.description_en, p.description_he)
        END as description,
        p.price,
        p.currency,
        p.images,
        CASE 
            WHEN language_code = 'he' THEN COALESCE(p.name_he, p.name_en)
            ELSE COALESCE(p.name_en, p.name_he)
        END as jeweler_name,
        p.jeweler_rating,
        p.avg_rating,
        p.review_count::INTEGER
    FROM products_search_optimized p
    WHERE 
        (search_text IS NULL OR (
            CASE 
                WHEN language_code = 'he' THEN 
                    to_tsvector('hebrew', COALESCE(p.name_he, '') || ' ' || COALESCE(p.description_he, '')) 
                    @@ plainto_tsquery('hebrew', search_text)
                ELSE 
                    to_tsvector('english', COALESCE(p.name_en, '') || ' ' || COALESCE(p.description_en, '')) 
                    @@ plainto_tsquery('english', search_text)
            END
        ))
        AND (emotion_tags_filter IS NULL OR p.emotion_tags && emotion_tags_filter)
        AND (style_tags_filter IS NULL OR p.style_tags && style_tags_filter)
        AND (price_min IS NULL OR p.price >= price_min)
        AND (price_max IS NULL OR p.price <= price_max)
        AND (jeweler_location IS NULL OR p.location_city ILIKE '%' || jeweler_location || '%')
    ORDER BY 
        p.featured DESC,
        p.avg_rating DESC,
        p.review_count DESC,
        p.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Function for optimized jeweler search
CREATE OR REPLACE FUNCTION search_jewelers(
    search_text TEXT DEFAULT NULL,
    location_filter TEXT DEFAULT NULL,
    specialties_filter TEXT[] DEFAULT NULL,
    min_rating DECIMAL DEFAULT NULL,
    language_code TEXT DEFAULT 'he',
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    bio TEXT,
    rating DECIMAL,
    total_orders INTEGER,
    location_city TEXT,
    location_country TEXT,
    active_products BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        CASE 
            WHEN language_code = 'he' THEN COALESCE(j.name_he, j.name_en, j.business_name)
            ELSE COALESCE(j.name_en, j.name_he, j.business_name)
        END as name,
        CASE 
            WHEN language_code = 'he' THEN COALESCE(j.bio_he, j.bio_en)
            ELSE COALESCE(j.bio_en, j.bio_he)
        END as bio,
        j.rating,
        j.total_orders,
        j.location_city,
        j.location_country,
        j.active_products
    FROM jewelers_profile_optimized j
    WHERE 
        (search_text IS NULL OR (
            CASE 
                WHEN language_code = 'he' THEN 
                    to_tsvector('hebrew', COALESCE(j.name_he, '') || ' ' || COALESCE(j.bio_he, '')) 
                    @@ plainto_tsquery('hebrew', search_text)
                ELSE 
                    to_tsvector('english', COALESCE(j.name_en, '') || ' ' || COALESCE(j.bio_en, '')) 
                    @@ plainto_tsquery('english', search_text)
            END
        ))
        AND (location_filter IS NULL OR j.location_city ILIKE '%' || location_filter || '%')
        AND (specialties_filter IS NULL OR j.specialties && specialties_filter)
        AND (min_rating IS NULL OR j.rating >= min_rating)
    ORDER BY 
        j.rating DESC,
        j.total_orders DESC,
        j.active_products DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CACHING STRATEGIES
-- ============================================================================

-- Function to refresh materialized views on schedule
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS VOID AS $$
BEGIN
    -- Refresh popular products
    REFRESH MATERIALIZED VIEW CONCURRENTLY popular_products;
    
    -- Refresh jeweler performance
    REFRESH MATERIALIZED VIEW CONCURRENTLY jeweler_performance;
    
    -- Log the refresh
    INSERT INTO system_log (event_type, message, created_at)
    VALUES ('analytics_refresh', 'Materialized views refreshed successfully', NOW());
    
EXCEPTION WHEN OTHERS THEN
    -- Log any errors
    INSERT INTO system_log (event_type, message, error_details, created_at)
    VALUES ('analytics_refresh_error', 'Failed to refresh materialized views', SQLERRM, NOW());
    RAISE;
END;
$$ LANGUAGE plpgsql;

-- Create system log table for monitoring
CREATE TABLE IF NOT EXISTS system_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    error_details TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_log_event_type_created 
ON system_log(event_type, created_at DESC);

-- ============================================================================
-- PARTITIONING STRATEGIES
-- ============================================================================

-- Function to create monthly partitions for orders
CREATE OR REPLACE FUNCTION create_monthly_partition(table_name TEXT, start_date DATE)
RETURNS VOID AS $$
DECLARE
    partition_name TEXT;
    end_date DATE;
BEGIN
    partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
    end_date := start_date + INTERVAL '1 month';
    
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I PARTITION OF %I
        FOR VALUES FROM (%L) TO (%L)',
        partition_name, table_name, start_date, end_date
    );
    
    -- Create indexes on partition
    EXECUTE format('
        CREATE INDEX IF NOT EXISTS %I ON %I (user_id, created_at DESC)',
        'idx_' || partition_name || '_user_created', partition_name
    );
    
    EXECUTE format('
        CREATE INDEX IF NOT EXISTS %I ON %I (jeweler_id, created_at DESC)',
        'idx_' || partition_name || '_jeweler_created', partition_name
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PERFORMANCE MONITORING VIEWS
-- ============================================================================

-- View for monitoring query performance
CREATE OR REPLACE VIEW query_performance_monitor AS
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time,
    stddev_exec_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE calls > 10
ORDER BY mean_exec_time DESC;

-- View for monitoring table statistics
CREATE OR REPLACE VIEW table_performance_monitor AS
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze,
    vacuum_count,
    autovacuum_count,
    analyze_count,
    autoanalyze_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- ============================================================================
-- CLEANUP AND MAINTENANCE FUNCTIONS
-- ============================================================================

-- Function to clean up old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_log 
    WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    INSERT INTO system_log (event_type, message, metadata, created_at)
    VALUES ('audit_cleanup', 'Cleaned up old audit logs', 
            jsonb_build_object('deleted_count', deleted_count, 'days_kept', days_to_keep), 
            NOW());
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired gifts
CREATE OR REPLACE FUNCTION cleanup_expired_gifts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    UPDATE gifts 
    SET status = 'expired' 
    WHERE expires_at < NOW() 
    AND status NOT IN ('expired', 'viewed');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    INSERT INTO system_log (event_type, message, metadata, created_at)
    VALUES ('gift_cleanup', 'Marked expired gifts', 
            jsonb_build_object('expired_count', deleted_count), 
            NOW());
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON VIEW products_search_optimized IS 'Optimized view for product search with all relevant data pre-joined';
COMMENT ON VIEW jewelers_profile_optimized IS 'Optimized view for jeweler profiles with performance metrics';
COMMENT ON VIEW user_dashboard_optimized IS 'Optimized view for user dashboard with aggregated statistics';

COMMENT ON FUNCTION search_products IS 'Optimized product search function with full-text search and filtering';
COMMENT ON FUNCTION search_jewelers IS 'Optimized jeweler search function with location and specialty filtering';
COMMENT ON FUNCTION refresh_analytics_views IS 'Refreshes all materialized views for analytics';
COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Removes audit logs older than specified days';
COMMENT ON FUNCTION cleanup_expired_gifts IS 'Marks expired gifts and cleans up old data';

COMMENT ON TABLE system_log IS 'System event logging for monitoring and debugging'; 