# GemsAI Database Schema Design

## Overview

This document outlines the complete database schema for GemsAI, a platform that connects users with jewelers through AI-generated sketches based on emotional stories. The schema supports full internationalization with Hebrew as the primary language and English as a fallback.

## Architecture Principles

1. **Hebrew-First Internationalization**: All user-facing content supports Hebrew and English with Hebrew as the primary language
2. **Scalable Design**: Schema designed to handle growth in users, products, and content
3. **Performance Optimized**: Appropriate indexes and query optimization strategies
4. **Security First**: Row-level security policies for data protection
5. **Audit Trail**: Comprehensive tracking of changes and user actions

## Core Entity Relationships

```
Users (1) ←→ (1) Jewelers
Users (1) ←→ (∞) Stories
Stories (1) ←→ (∞) Sketches
Sketches (∞) ←→ (∞) Products (via matching)
Users (1) ←→ (∞) Orders
Jewelers (1) ←→ (∞) Products
Users (1) ←→ (∞) Gifts (as sender)
Gifts (∞) ←→ (1) Users (as recipient via email)
```

## Table Definitions

### Core Business Tables

#### 1. users

**Purpose**: Central user management with role-based access

```sql
CREATE TABLE users (
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
```

#### 2. stories

**Purpose**: User emotional stories that drive sketch generation

```sql
CREATE TABLE stories (
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
```

#### 3. sketches

**Purpose**: AI-generated sketches based on stories

```sql
CREATE TABLE sketches (
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
```

#### 4. jewelers

**Purpose**: Jeweler profiles and verification

```sql
CREATE TABLE jewelers (
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
```

#### 5. products

**Purpose**: Jeweler product catalog

```sql
CREATE TABLE products (
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
```

#### 6. orders

**Purpose**: Order management and tracking

```sql
CREATE TABLE orders (
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
```

#### 7. gifts

**Purpose**: Gift sharing and management

```sql
CREATE TABLE gifts (
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
```

### Supporting Tables

#### 8. sketch_product_matches

**Purpose**: AI-generated matches between sketches and products

```sql
CREATE TABLE sketch_product_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sketch_id UUID NOT NULL REFERENCES sketches(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    match_score DECIMAL(5,4), -- 0.0000 to 1.0000
    match_reasoning TEXT,
    ai_model VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sketch_id, product_id)
);
```

#### 9. user_preferences

**Purpose**: User preferences and personalization

```sql
CREATE TABLE user_preferences (
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
```

#### 10. reviews

**Purpose**: Product and jeweler reviews

```sql
CREATE TABLE reviews (
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
```

## Enums

```sql
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
```

## Indexes Strategy

### Performance Indexes

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Story queries
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_created_at ON stories(created_at DESC);

-- Sketch queries
CREATE INDEX idx_sketches_story_id ON sketches(story_id);
CREATE INDEX idx_sketches_status ON sketches(status);

-- Product searches
CREATE INDEX idx_products_jeweler_id ON products(jeweler_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_available ON products(is_available) WHERE is_available = TRUE;
CREATE INDEX idx_products_emotion_tags ON products USING GIN(emotion_tags);
CREATE INDEX idx_products_style_tags ON products USING GIN(style_tags);

-- Order management
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_jeweler_id ON orders(jeweler_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Gift sharing
CREATE INDEX idx_gifts_sender_id ON gifts(sender_id);
CREATE INDEX idx_gifts_share_token ON gifts(share_token);
CREATE INDEX idx_gifts_recipient_email ON gifts(recipient_email);
```

### Search Indexes

```sql
-- Full-text search for products (Hebrew support)
CREATE INDEX idx_product_translations_search_he
ON product_translations USING GIN(to_tsvector('hebrew', name || ' ' || COALESCE(description, '')));

-- Full-text search for stories (Hebrew support)
CREATE INDEX idx_story_translations_search_he
ON story_translations USING GIN(to_tsvector('hebrew', title || ' ' || content));
```

## Security Considerations

### Row Level Security (RLS)

- Users can only access their own data
- Jewelers can access their products and orders
- Admins have full access
- Public access for published products and jeweler profiles

### Data Encryption

- Sensitive fields (payment info, personal details) encrypted at rest
- API keys and secrets stored in Supabase Vault
- PII data handling compliance (GDPR)

## Scalability Considerations

### Partitioning Strategy

- Orders table partitioned by created_at (monthly partitions)
- Reviews table partitioned by created_at (quarterly partitions)
- Large tables (sketches, products) monitored for partitioning needs

### Caching Strategy

- Product catalog cached with Redis
- User preferences cached for personalization
- Translation data cached for performance

### Archive Strategy

- Old sketches archived to cold storage after 2 years
- Completed orders archived after 5 years (legal requirement)
- User data retention policies implemented

## Migration Strategy

### Phase 1: Core Tables

1. Create enums and core business tables
2. Set up basic indexes
3. Implement RLS policies

### Phase 2: Relationships and Constraints

1. Add foreign key constraints
2. Create junction tables
3. Implement check constraints

### Phase 3: Performance Optimization

1. Add performance indexes
2. Create materialized views
3. Implement search indexes

### Phase 4: Advanced Features

1. Add triggers for automation
2. Implement audit logging
3. Set up monitoring and alerts

## Monitoring and Maintenance

### Performance Monitoring

- Query performance tracking
- Index usage analysis
- Connection pool monitoring

### Data Quality

- Constraint violation monitoring
- Data consistency checks
- Orphaned record cleanup

### Backup Strategy

- Daily automated backups
- Point-in-time recovery capability
- Cross-region backup replication

## Future Considerations

### Potential Enhancements

- AI model versioning for sketches
- Advanced product recommendation engine
- Real-time collaboration features
- Mobile app specific optimizations

### Scaling Triggers

- 100K+ users: Consider read replicas
- 1M+ products: Implement search service (Elasticsearch)
- 10M+ orders: Consider microservices architecture
