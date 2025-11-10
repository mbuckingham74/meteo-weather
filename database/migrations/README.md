# Database Migrations

**Safe, incremental database schema changes for Meteo Weather App**

---

## 📚 Available Migrations

### Quick Wins (Run First)
1. **001_optimize_location_search.sql** - Add FULLTEXT index for fast location searches (10-100x faster)
2. **002_optimize_api_cache.sql** - Optimize cache storage and add auto-cleanup
3. **003_optimize_shared_answers.sql** - Add auto-cleanup for expired AI shares

### Performance Improvements
4. **004_add_spatial_index.sql** - Add spatial index for coordinate searches (10-50x faster)

### Advanced (Test on Staging First)
5. **005_partition_weather_data.sql** - Partition large weather_data table by year (5-10x faster)

---

## 🚀 How to Run Migrations

### Prerequisites

1. **Backup database first** (ALWAYS!)
   ```bash
   mysqldump -u root -p meteo_db > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Test on staging/local environment first**
   ```bash
   mysql -u root -p meteo_db_staging < migrations/001_optimize_location_search.sql
   ```

3. **Run during low-traffic period** (if possible)

---

### Running Migrations

#### Option 1: Manual (Recommended for Production)

```bash
# 1. Backup
mysqldump -u root -p meteo_db > backup_before_001.sql

# 2. Run migration
mysql -u root -p meteo_db < database/migrations/001_optimize_location_search.sql

# 3. Verify
mysql -u root -p meteo_db -e "SHOW INDEX FROM locations WHERE Key_name = 'idx_fulltext_search';"

# 4. Monitor query performance
mysql -u root -p meteo_db -e "SHOW PROCESSLIST;"
```

#### Option 2: Using npm Scripts

```bash
# Run specific migration
npm run db:migrate -- database/migrations/001_optimize_location_search.sql

# Run all quick wins
npm run db:migrate:quick-wins
```

---

## 📋 Migration Order (Recommended)

### Phase 1: Quick Wins (1-2 hours total)
Run in this order:

```bash
# 1. Location search optimization (~5 min)
mysql -u root -p meteo_db < database/migrations/001_optimize_location_search.sql

# 2. API cache optimization (~5 min)
mysql -u root -p meteo_db < database/migrations/002_optimize_api_cache.sql

# 3. Shared answers cleanup (~5 min)
mysql -u root -p meteo_db < database/migrations/003_optimize_shared_answers.sql
```

**Total downtime:** ~0 minutes (these are non-blocking additions)

**Impact:** Immediate performance improvements, auto-cleanup enabled

---

### Phase 2: Performance Boost (Test on Staging First)

```bash
# 4. Spatial index (~10-30 min depending on table size)
mysql -u root -p meteo_db < database/migrations/004_add_spatial_index.sql
```

**Downtime:** ~0-5 minutes (locks table briefly)

**Impact:** 10-50x faster coordinate lookups

---

### Phase 3: Advanced (Staging + Maintenance Window)

```bash
# 5. Partition weather_data (30-60 min for 585K records)
# WARNING: Test thoroughly on staging first!
mysql -u root -p meteo_db < database/migrations/005_partition_weather_data.sql
```

**Downtime:** 10-60 minutes (table lock during partitioning)

**Impact:** 5-10x faster date-range queries, easier data management

---

## ✅ Verification After Each Migration

### 1. Location Search (001)
```sql
-- Check FULLTEXT index exists
SHOW INDEX FROM locations WHERE Key_name = 'idx_fulltext_search';

-- Test search speed
SELECT * FROM locations
WHERE MATCH(city_name, country, state) AGAINST('seattle' IN NATURAL LANGUAGE MODE)
LIMIT 10;
```

### 2. API Cache (002)
```sql
-- Check cache_key size
SELECT character_maximum_length
FROM information_schema.columns
WHERE table_name = 'api_cache' AND column_name = 'cache_key';
-- Expected: 32

-- Check cleanup event
SELECT * FROM information_schema.events
WHERE event_name = 'cleanup_expired_cache';
-- Expected: 1 row
```

### 3. Shared Answers (003)
```sql
-- Check cleanup event
SELECT * FROM information_schema.events
WHERE event_name = 'cleanup_expired_shares';
-- Expected: 1 row
```

### 4. Spatial Index (004)
```sql
-- Check spatial index exists
SHOW INDEX FROM locations WHERE Index_type = 'SPATIAL';

-- Check coordinates populated
SELECT COUNT(*) as total, COUNT(coordinates) as with_coords FROM locations;
-- Expected: total = with_coords
```

### 5. Partitioning (005)
```sql
-- Check partitions created
SELECT partition_name, table_rows
FROM information_schema.partitions
WHERE table_name = 'weather_data';
-- Expected: Multiple partitions (p2020, p2021, etc.)

-- Test partition pruning
EXPLAIN PARTITIONS
SELECT * FROM weather_data
WHERE observation_date BETWEEN '2024-01-01' AND '2024-12-31';
-- Expected: Only p2024 partition scanned
```

---

## 🔄 Rollback Instructions

### If Migration Fails

1. **Restore from backup**
   ```bash
   mysql -u root -p meteo_db < backup_before_001.sql
   ```

2. **Verify data integrity**
   ```bash
   mysql -u root -p meteo_db -e "SELECT COUNT(*) FROM locations;"
   mysql -u root -p meteo_db -e "SELECT COUNT(*) FROM weather_data;"
   ```

### Manual Rollback for Specific Migrations

#### 001: Remove FULLTEXT Index
```sql
ALTER TABLE locations DROP INDEX idx_fulltext_search;
ALTER TABLE locations DROP INDEX idx_city_country_exact;
```

#### 002: Revert API Cache Changes
```sql
ALTER TABLE api_cache MODIFY COLUMN cache_key VARCHAR(255) NOT NULL;
ALTER TABLE api_cache DROP INDEX idx_expires_source;
DROP EVENT IF EXISTS cleanup_expired_cache;
```

#### 003: Remove Cleanup Event
```sql
DROP EVENT IF EXISTS cleanup_expired_shares;
ALTER TABLE shared_ai_answers DROP INDEX idx_expires_views;
ALTER TABLE shared_ai_answers DROP INDEX idx_created_views;
```

#### 004: Remove Spatial Index
```sql
ALTER TABLE locations DROP INDEX idx_spatial_coordinates;
ALTER TABLE locations DROP COLUMN coordinates;
```

#### 005: Remove Partitioning (RISKY - backup first!)
```sql
ALTER TABLE weather_data REMOVE PARTITIONING;
```

---

## 📊 Expected Performance Improvements

| Migration | Query Type | Before | After | Improvement |
|-----------|-----------|--------|-------|-------------|
| 001 | Location search | 50-200ms | 5-10ms | **10-20x** |
| 002 | Cache lookup | 5-10ms | 2-5ms | **2x** |
| 003 | N/A | N/A | Auto-cleanup | Prevents bloat |
| 004 | Coordinate search | 50-100ms | 1-5ms | **50x** |
| 005 | Date-range queries | 100-500ms | 10-50ms | **10x** |

---

## 🚨 Important Notes

### Before Running

- ✅ **ALWAYS backup database first**
- ✅ **Test on staging environment**
- ✅ **Run during low-traffic period** (if possible)
- ✅ **Have rollback plan ready**
- ✅ **Inform team of maintenance window**

### During Migration

- 📊 **Monitor query performance**
  ```bash
  watch -n 1 'mysql -u root -p -e "SHOW PROCESSLIST;"'
  ```

- 💾 **Check disk space**
  ```bash
  df -h
  ```

- 🔍 **Monitor table locks**
  ```bash
  mysql -u root -p -e "SHOW OPEN TABLES WHERE In_use > 0;"
  ```

### After Migration

- ✅ **Verify indexes created**
- ✅ **Test application functionality**
- ✅ **Monitor query performance**
- ✅ **Check error logs**

---

## 🎯 Quick Start (Safe for Production)

Run Phase 1 migrations (no downtime):

```bash
# Backup
mysqldump -u root -p meteo_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Run quick wins
for migration in 001 002 003; do
    echo "Running migration ${migration}..."
    mysql -u root -p meteo_db < database/migrations/${migration}_*.sql
    echo "Migration ${migration} complete!"
done

# Verify
mysql -u root -p meteo_db -e "
    SELECT 'FULLTEXT indexes' as type, COUNT(*) as count
    FROM information_schema.statistics
    WHERE table_schema = 'meteo_db' AND index_type = 'FULLTEXT'
    UNION ALL
    SELECT 'Cleanup events', COUNT(*)
    FROM information_schema.events
    WHERE event_schema = 'meteo_db';
"
```

---

## 📞 Getting Help

- **Documentation:** [docs/DATABASE_OPTIMIZATION_RECOMMENDATIONS.md](../docs/DATABASE_OPTIMIZATION_RECOMMENDATIONS.md)
- **GitHub Issues:** [Report migration issues](https://github.com/mbuckingham74/meteo-weather/issues)
- **MySQL Docs:** https://dev.mysql.com/doc/refman/8.0/en/

---

## 📝 Adding New Migrations

### Migration Naming Convention

```
XXX_descriptive_name.sql

XXX = Sequential number (001, 002, etc.)
descriptive_name = What the migration does
```

### Migration Template

```sql
-- Migration XXX: Title
-- Description: What this migration does
-- Impact: Performance/feature impact
-- Date: YYYY-MM-DD
-- REQUIRES: MySQL version, dependencies

START TRANSACTION;

-- Migration code here

COMMIT;

-- Verification queries
-- Rollback instructions (as comments)
```

---

**Last Updated:** November 6, 2025
