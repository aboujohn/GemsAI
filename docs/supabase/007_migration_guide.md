# GemsAI Database Migration Guide

This guide provides step-by-step instructions for deploying the GemsAI database schema to Supabase, including migration strategies, rollback procedures, and maintenance guidelines.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Migration Overview](#migration-overview)
3. [Step-by-Step Migration](#step-by-step-migration)
4. [Rollback Procedures](#rollback-procedures)
5. [Post-Migration Validation](#post-migration-validation)
6. [Maintenance and Updates](#maintenance-and-updates)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Access

- Supabase project with admin access
- Database connection credentials
- SQL client (Supabase SQL Editor, pgAdmin, or psql)

### Environment Setup

- Ensure you have the latest migration files
- Backup any existing data
- Verify network connectivity to Supabase

### Required Extensions

The following PostgreSQL extensions must be enabled in your Supabase project:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "unaccent";
```

## Migration Overview

The GemsAI database migration consists of 7 sequential files that must be executed in order:

1. **001_create_i18n_schema.sql** - Internationalization infrastructure
2. **002_create_core_tables.sql** - Core business tables
3. **003_create_relationships_constraints.sql** - Relationships and constraints
4. **004_create_security_policies.sql** - Row Level Security policies
5. **005_performance_optimization.sql** - Performance indexes and views
6. **006_testing_validation.sql** - Testing and validation suite
7. **007_migration_guide.md** - This documentation

### Migration Dependencies

```
001_i18n_schema
    ↓
002_core_tables
    ↓
003_relationships_constraints
    ↓
004_security_policies
    ↓
005_performance_optimization
    ↓
006_testing_validation
```

## Step-by-Step Migration

### Step 1: Pre-Migration Checklist

1. **Backup Existing Data** (if applicable)

   ```sql
   -- Create backup schema
   CREATE SCHEMA IF NOT EXISTS backup_$(date +%Y%m%d);

   -- Backup existing tables (if any)
   -- pg_dump commands or manual exports
   ```

2. **Verify Supabase Configuration**

   - Confirm project settings
   - Check available storage and compute resources
   - Verify authentication settings

3. **Enable Required Extensions**
   ```sql
   -- Run in Supabase SQL Editor
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
   CREATE EXTENSION IF NOT EXISTS "unaccent";
   ```

### Step 2: Execute Migration Files

Execute the following files in **exact order** using the Supabase SQL Editor:

#### 2.1 Internationalization Schema

```sql
-- Execute: docs/supabase/001_create_i18n_schema.sql
-- This creates the translation infrastructure
```

**Expected Results:**

- Languages table with Hebrew, English, Arabic
- Translation tables for stories, products, jewelers
- Translation metadata and helper functions
- System translations for UI elements

#### 2.2 Core Business Tables

```sql
-- Execute: docs/supabase/002_create_core_tables.sql
-- This creates all core business entities
```

**Expected Results:**

- Users, stories, sketches, jewelers tables
- Products, orders, gifts, reviews tables
- User preferences and matching tables
- Helper functions and triggers

#### 2.3 Relationships and Constraints

```sql
-- Execute: docs/supabase/003_create_relationships_constraints.sql
-- This establishes data integrity
```

**Expected Results:**

- Foreign key relationships between all tables
- Check constraints for data validation
- Junction tables for many-to-many relationships
- Business logic constraints and triggers

#### 2.4 Security Policies

```sql
-- Execute: docs/supabase/004_create_security_policies.sql
-- This implements Row Level Security
```

**Expected Results:**

- RLS enabled on all sensitive tables
- Role-based access control policies
- Security helper functions
- Audit logging system

#### 2.5 Performance Optimization

```sql
-- Execute: docs/supabase/005_performance_optimization.sql
-- This optimizes query performance
```

**Expected Results:**

- Advanced indexes for common queries
- Materialized views for analytics
- Full-text search capabilities
- Performance monitoring functions

#### 2.6 Testing and Validation

```sql
-- Execute: docs/supabase/006_testing_validation.sql
-- This validates the complete schema
```

**Expected Results:**

- Comprehensive test suite execution
- Schema validation confirmation
- Performance benchmarks
- Test report generation

### Step 3: Post-Migration Configuration

#### 3.1 Configure Supabase Auth

```sql
-- Set up auth schema integration
-- This should be done through Supabase Dashboard
```

#### 3.2 Set Up Real-time Subscriptions

```sql
-- Enable real-time for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE gifts;
ALTER PUBLICATION supabase_realtime ADD TABLE sketches;
```

#### 3.3 Configure Storage Buckets

```sql
-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES
('sketches', 'sketches', true),
('products', 'products', true),
('avatars', 'avatars', true);
```

## Rollback Procedures

### Emergency Rollback

If critical issues are discovered, follow these steps:

1. **Immediate Actions**

   ```sql
   -- Disable problematic features
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   -- Drop problematic indexes if causing issues
   -- Restore from backup if necessary
   ```

2. **Systematic Rollback**
   Execute rollback in reverse order:

   ```sql
   -- 1. Drop performance optimizations
   DROP MATERIALIZED VIEW IF EXISTS popular_products CASCADE;
   DROP MATERIALIZED VIEW IF EXISTS jeweler_performance CASCADE;

   -- 2. Disable RLS policies
   DROP POLICY IF EXISTS "Users can view own profile" ON users;
   -- Continue with all policies...

   -- 3. Drop constraints
   ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
   -- Continue with all foreign keys...

   -- 4. Drop core tables
   DROP TABLE IF EXISTS orders CASCADE;
   -- Continue with all tables...

   -- 5. Drop i18n schema
   DROP TABLE IF EXISTS story_translations CASCADE;
   -- Continue with translation tables...
   ```

### Partial Rollback

For specific issues, you can rollback individual components:

```sql
-- Rollback specific migration file
-- Example: Remove performance optimizations only
DROP MATERIALIZED VIEW IF EXISTS popular_products CASCADE;
DROP FUNCTION IF EXISTS search_products CASCADE;
-- etc.
```

## Post-Migration Validation

### Automated Validation

Run the built-in test suite:

```sql
-- Execute the test report
SELECT * FROM generate_test_report();

-- Check system logs
SELECT * FROM system_log
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

### Manual Validation Checklist

1. **Schema Integrity**

   - [ ] All tables created successfully
   - [ ] Foreign key constraints working
   - [ ] Indexes created and functional
   - [ ] RLS policies active

2. **Functional Testing**

   - [ ] User registration works
   - [ ] Story creation and sketch generation
   - [ ] Product catalog browsing
   - [ ] Order placement workflow
   - [ ] Gift sharing functionality

3. **Performance Testing**

   - [ ] Search queries execute quickly (<100ms)
   - [ ] Full-text search working in Hebrew/English
   - [ ] Materialized views refreshing
   - [ ] Index usage confirmed

4. **Security Testing**
   - [ ] Users can only access own data
   - [ ] Jewelers can only manage own products
   - [ ] Admin access working correctly
   - [ ] Audit logging functional

## Maintenance and Updates

### Regular Maintenance Tasks

#### Daily

```sql
-- Check system health
SELECT * FROM query_performance_monitor LIMIT 10;
SELECT * FROM table_performance_monitor LIMIT 10;
```

#### Weekly

```sql
-- Refresh materialized views
SELECT refresh_analytics_views();

-- Clean up expired gifts
SELECT cleanup_expired_gifts();
```

#### Monthly

```sql
-- Clean up old audit logs
SELECT cleanup_old_audit_logs(90); -- Keep 90 days

-- Analyze table statistics
ANALYZE;

-- Check for unused indexes
SELECT * FROM get_index_usage() WHERE idx_scan = 0;
```

### Schema Updates

For future schema changes, follow this process:

1. **Create Migration File**

   ```sql
   -- 008_add_new_feature.sql
   -- Always include rollback instructions
   ```

2. **Test in Development**

   - Run migration on development database
   - Execute test suite
   - Validate functionality

3. **Deploy to Production**
   - Schedule maintenance window
   - Create backup
   - Execute migration
   - Validate results

### Version Control

Track all schema changes:

```sql
-- Create schema version table
CREATE TABLE IF NOT EXISTS schema_versions (
    version VARCHAR(20) PRIMARY KEY,
    description TEXT NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied_by TEXT DEFAULT current_user
);

-- Record current version
INSERT INTO schema_versions (version, description)
VALUES ('1.0.0', 'Initial GemsAI schema deployment');
```

## Troubleshooting

### Common Issues

#### 1. Extension Not Available

**Error:** `extension "uuid-ossp" is not available`
**Solution:** Enable in Supabase Dashboard → Settings → Database → Extensions

#### 2. RLS Policy Conflicts

**Error:** `permission denied for table users`
**Solution:** Check policy definitions and user authentication

#### 3. Performance Issues

**Error:** Slow query performance
**Solution:**

```sql
-- Check index usage
SELECT * FROM get_slow_queries(1000);
-- Add missing indexes as needed
```

#### 4. Translation Issues

**Error:** Hebrew text not displaying correctly
**Solution:** Verify UTF-8 encoding and Hebrew collation

### Debug Queries

```sql
-- Check table sizes
SELECT * FROM get_table_sizes();

-- Monitor active connections
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Check constraint violations
SELECT conname, conrelid::regclass
FROM pg_constraint
WHERE NOT convalidated;
```

### Support Resources

- **Supabase Documentation:** https://supabase.com/docs
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **GemsAI Schema Reference:** See `schema-design.md`

## Migration Checklist

Use this checklist to ensure successful migration:

### Pre-Migration

- [ ] Backup existing data
- [ ] Verify Supabase access
- [ ] Enable required extensions
- [ ] Review migration files

### Migration Execution

- [ ] Execute 001_create_i18n_schema.sql
- [ ] Execute 002_create_core_tables.sql
- [ ] Execute 003_create_relationships_constraints.sql
- [ ] Execute 004_create_security_policies.sql
- [ ] Execute 005_performance_optimization.sql
- [ ] Execute 006_testing_validation.sql

### Post-Migration

- [ ] Run validation tests
- [ ] Configure Supabase Auth
- [ ] Set up real-time subscriptions
- [ ] Create storage buckets
- [ ] Test application integration
- [ ] Monitor performance
- [ ] Document any issues

### Sign-off

- [ ] Database Administrator approval
- [ ] Development Team validation
- [ ] QA Team testing complete
- [ ] Production deployment approved

---

**Migration Completed:** ****\_\_\_****  
**Validated By:** ****\_\_\_****  
**Date:** ****\_\_\_****

## Appendix

### File Checksums

Verify file integrity before migration:

```bash
# Generate checksums for verification
md5sum docs/supabase/*.sql > migration_checksums.txt
```

### Emergency Contacts

- Database Administrator: [Contact Info]
- DevOps Team: [Contact Info]
- Supabase Support: support@supabase.com

### Additional Resources

- [GemsAI Project Documentation](../README.md)
- [Database Schema Design](schema-design.md)
- [Implementation Summary](implementation-summary.md)
