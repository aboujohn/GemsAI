# GemsAI Database Deployment Guide

## 🗄️ Your Supabase Project

- **URL**: https://lpyyznmdheipnenrytte.supabase.co
- **Status**: Environment configured ✅

## 📋 Deployment Steps

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/lpyyznmdheipnenrytte
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

### Step 2: Enable Extensions (Run First)

Copy and paste this into SQL Editor and click **"Run"**:

```sql
-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Step 3: Deploy Schema Files (In Order)

#### 3.1 Internationalization Schema

- **File**: `docs/supabase/001_create_i18n_schema.sql`
- **Purpose**: Translation infrastructure
- **Action**: Copy entire file content → Paste in SQL Editor → Run

#### 3.2 Core Tables

- **File**: `docs/supabase/002_create_core_tables.sql`
- **Purpose**: Main business tables (users, products, orders, etc.)
- **Action**: Copy entire file content → Paste in SQL Editor → Run

#### 3.3 Relationships & Constraints

- **File**: `docs/supabase/003_create_relationships_constraints.sql`
- **Purpose**: Foreign keys and data validation
- **Action**: Copy entire file content → Paste in SQL Editor → Run

#### 3.4 Security Policies

- **File**: `docs/supabase/004_create_security_policies.sql`
- **Purpose**: Row Level Security (RLS)
- **Action**: Copy entire file content → Paste in SQL Editor → Run

#### 3.5 Performance Optimization

- **File**: `docs/supabase/005_performance_optimization.sql`
- **Purpose**: Indexes and materialized views
- **Action**: Copy entire file content → Paste in SQL Editor → Run

#### 3.6 Seed Data (Recommended)

- **File**: `docs/supabase/008_seed_data.sql`
- **Purpose**: Demo data for testing
- **Action**: Copy entire file content → Paste in SQL Editor → Run

#### 3.7 Testing Suite (Optional)

- **File**: `docs/supabase/006_testing_validation.sql`
- **Purpose**: Validation tests
- **Action**: Copy entire file content → Paste in SQL Editor → Run

### Step 4: Verify Deployment

After running all files, check if tables were created:

```sql
-- Check created tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see tables like:

- users
- stories
- sketches
- products
- jewelers
- orders
- gifts
- reviews
- And many more...

### Step 5: Enable Real-time (Optional)

In your Supabase dashboard:

1. Go to **Database** → **Replication**
2. Enable real-time for these tables:
   - orders
   - gifts
   - sketches
   - stories

## 🎯 What You'll Have After Deployment

- ✅ Complete database schema with 24+ tables
- ✅ Hebrew/English translation support
- ✅ Row Level Security policies
- ✅ Performance optimizations
- ✅ Demo data for immediate testing
- ✅ Full-text search capabilities

## 🚨 Important Notes

- **Run files in the exact order listed**
- **Wait for each file to complete before running the next**
- **Don't skip the extensions step**
- **Your .env.local file is safe and won't be modified**

## 🆘 If You Get Errors

1. **Check the error message** in SQL Editor
2. **Ensure previous files completed successfully**
3. **Verify extensions are enabled**
4. **Re-run the failing file**

## ✅ Success Indicators

After successful deployment, you should be able to:

- See all tables in your Supabase Dashboard
- View demo data in the `users`, `products`, `jewelers` tables
- Access the database from your Next.js app
