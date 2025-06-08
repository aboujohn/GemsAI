# GemsAI Database Testing and Validation Guide

This guide provides comprehensive instructions for testing and validating the GemsAI database schema implementation.

## Overview

The GemsAI database testing framework includes:

- **15 Comprehensive Tests** covering all major functionality
- **Schema Validation** for table structure and constraints
- **Functional Testing** for business workflows
- **Performance Testing** for query optimization
- **Security Testing** for Row Level Security (RLS)
- **Translation System Testing** for internationalization
- **Automated Reporting** with success metrics

## Test Categories

### 1. Schema Validation Tests (Tests 1-4)

- **Test 1**: Core table existence verification
- **Test 2**: Foreign key constraint validation
- **Test 3**: Index presence verification
- **Test 4**: Row Level Security enablement check

### 2. Functional Tests (Tests 5-7, 14)

- **Test 5**: User creation and profile management
- **Test 6**: Story and sketch workflow
- **Test 7**: Complete order workflow
- **Test 14**: Translation system workflow

### 3. Constraint Validation Tests (Tests 8-10)

- **Test 8**: Email format validation
- **Test 9**: Rating range constraints
- **Test 10**: Unique constraint enforcement

### 4. Performance Tests (Tests 11-12)

- **Test 11**: Index usage verification
- **Test 12**: Full-text search performance

### 5. Security Tests (Test 13)

- **Test 13**: RLS policy enforcement (requires user context)

### 6. Materialized View Tests (Test 15)

- **Test 15**: Materialized view functionality

## Pre-Test Setup

### 1. Database Connection

Ensure you have a Supabase database connection with appropriate permissions:

```sql
-- Verify connection and permissions
SELECT current_user, current_database();
```

### 2. Required Extensions

Verify required PostgreSQL extensions are installed:

```sql
-- Check extensions
SELECT name, installed_version FROM pg_available_extensions
WHERE name IN ('uuid-ossp', 'pg_trgm', 'unaccent');
```

### 3. Schema Deployment

Ensure all schema files have been executed in order:

1. `001_create_i18n_schema.sql`
2. `002_create_core_tables.sql`
3. `003_create_relationships_constraints.sql`
4. `004_create_security_policies.sql`
5. `005_performance_optimization.sql`
6. `008_seed_data.sql` (optional for testing)

## Test Execution

### Method 1: Complete Test Suite

Execute the entire test suite:

```sql
\i docs/supabase/006_testing_validation.sql
```

### Method 2: Individual Test Categories

Execute specific test categories by running relevant sections from the test file.

### Method 3: Manual Test Execution

Run individual tests by copying specific test blocks from `006_testing_validation.sql`.

## Test Results Monitoring

### 1. Real-time Test Monitoring

Monitor test execution in real-time:

```sql
-- Watch test progress
SELECT event_type, message, created_at
FROM system_log
WHERE event_type IN ('schema_test', 'functional_test', 'constraint_test', 'performance_test', 'materialized_view_test')
ORDER BY created_at DESC;
```

### 2. Generate Test Report

Get a comprehensive test summary:

```sql
SELECT * FROM generate_test_report();
```

Expected output format:

```
test_category        | total_tests | passed_tests | failed_tests | success_rate
--------------------+-------------+--------------+--------------+-------------
Constraint Validation|           3 |            3 |            0 |      100.00
Functional Tests     |           4 |            4 |            0 |      100.00
Materialized Views   |           2 |            2 |            0 |      100.00
Performance Tests    |           2 |            2 |            0 |      100.00
Schema Validation    |           4 |            4 |            0 |      100.00
```

### 3. Detailed Test Logs

Review detailed test results:

```sql
-- Get detailed test information
SELECT
    event_type,
    message,
    metadata,
    created_at
FROM system_log
WHERE event_type LIKE '%_test%'
ORDER BY created_at DESC;
```

## Expected Test Results

### Successful Test Execution

All tests should pass with the following expected outcomes:

1. **Schema Tests**: All 24+ core tables exist with proper constraints
2. **Functional Tests**: User workflows complete successfully
3. **Constraint Tests**: Data validation rules enforced correctly
4. **Performance Tests**: Indexes used effectively, search performance acceptable
5. **Security Tests**: RLS policies properly configured
6. **Translation Tests**: Multi-language support functional

### Performance Benchmarks

- **Full-text search**: < 100ms for typical queries
- **Product search**: Uses indexes effectively
- **Order workflow**: Completes without constraint violations

## Troubleshooting

### Common Issues

#### 1. Missing Tables

**Error**: "Missing tables: [table_name]"
**Solution**:

- Verify schema deployment order
- Check for deployment errors in previous steps
- Re-run core table creation scripts

#### 2. Foreign Key Constraint Failures

**Error**: "Expected at least X foreign key constraints, found Y"
**Solution**:

- Run `003_create_relationships_constraints.sql`
- Verify table creation completed successfully
- Check for constraint naming conflicts

#### 3. RLS Not Enabled

**Error**: "RLS not enabled on tables: [table_names]"
**Solution**:

- Run `004_create_security_policies.sql`
- Verify RLS enablement: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`

#### 4. Index Performance Issues

**Error**: Performance tests show no index usage
**Solution**:

- Run `005_performance_optimization.sql`
- Verify index creation with: `\d+ table_name`
- Check query plans with `EXPLAIN ANALYZE`

#### 5. Translation System Failures

**Error**: Translation workflow tests fail
**Solution**:

- Verify i18n schema deployment
- Check language table population
- Ensure translation tables exist

### Manual Validation Queries

#### Verify Core Functionality

```sql
-- Check user creation
SELECT COUNT(*) FROM users;

-- Check jeweler profiles
SELECT COUNT(*) FROM jewelers;

-- Check product catalog
SELECT COUNT(*) FROM products;

-- Check translation coverage
SELECT
    language_id,
    COUNT(*) as translation_count
FROM story_translations
GROUP BY language_id;
```

#### Verify Relationships

```sql
-- Check foreign key relationships
SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

#### Verify Security

```sql
-- Check RLS status
SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('users', 'stories', 'products', 'orders')
ORDER BY tablename;
```

## Production Deployment Validation

### Pre-Production Checklist

- [ ] All 15 tests pass with 100% success rate
- [ ] Performance benchmarks meet requirements
- [ ] Security policies properly configured
- [ ] Translation system functional
- [ ] Materialized views populated
- [ ] Seed data loaded (if required)

### Post-Deployment Validation

```sql
-- Verify production readiness
SELECT
    'Tables' as component,
    COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'

UNION ALL

SELECT
    'Foreign Keys' as component,
    COUNT(*) as count
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public'

UNION ALL

SELECT
    'Indexes' as component,
    COUNT(*) as count
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname NOT LIKE '%_pkey'

UNION ALL

SELECT
    'RLS Enabled Tables' as component,
    COUNT(*) as count
FROM pg_tables
WHERE schemaname = 'public'
    AND rowsecurity = true;
```

## Continuous Testing

### Automated Testing Setup

For continuous integration, create a test script:

```bash
#!/bin/bash
# test_database.sh

echo "Starting GemsAI Database Tests..."

# Run test suite
psql $DATABASE_URL -f docs/supabase/006_testing_validation.sql

# Generate report
psql $DATABASE_URL -c "SELECT * FROM generate_test_report();"

echo "Database testing completed."
```

### Regular Maintenance Testing

Run these tests regularly:

- **Daily**: Performance tests and materialized view refresh
- **Weekly**: Complete test suite execution
- **Monthly**: Full schema validation and security audit

## Support and Documentation

For additional support:

- Review individual test implementations in `006_testing_validation.sql`
- Check system logs for detailed error messages
- Refer to migration guide for deployment issues
- Contact development team for complex troubleshooting

---

**Note**: This testing framework provides comprehensive validation of the GemsAI database schema. All tests should pass before deploying to production environments.
