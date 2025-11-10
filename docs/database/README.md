# 💾 Database

Database optimization, migrations, and performance documentation for Meteo Weather App.

**Performance:** 20-50x faster queries | **Records:** 585,784 weather entries

## Quick Links

- **[PERFORMANCE_FIX_NOV7.md](PERFORMANCE_FIX_NOV7.md)** - Critical FULLTEXT index fix
- **[OPTIMIZATION_COMPLETE.md](OPTIMIZATION_COMPLETE.md)** - Phase 1 & 2 optimization summary
- **[OPTIMIZATION_PHASE3_COMPLETE.md](OPTIMIZATION_PHASE3_COMPLETE.md)** - Phase 3 (partitioning)
- **[OPTIMIZATION_SUMMARY.md](OPTIMIZATION_SUMMARY.md)** - Complete optimization overview
- **[OPTIMIZATION_RECOMMENDATIONS.md](OPTIMIZATION_RECOMMENDATIONS.md)** - Future improvements

## Database Schema

### Core Tables
- **users** - User accounts and authentication
- **user_preferences** - User settings (temp units, theme, etc.)
- **user_favorites** - Cloud-synced favorite locations
- **locations** - Pre-populated location database (148+ cities)
- **weather_data** - Historical weather records (585K+ entries)
- **api_cache** - API response caching layer
- **ai_shares** - AI conversation sharing system

## Performance Optimizations

### Migration 001: FULLTEXT Index (20x faster)
**Problem:** Location searches were slow (~2-3 seconds)
**Solution:** Added FULLTEXT index on `city_name`, `state`, `country`
**Impact:** Text searches 20x faster (~40-100ms)

```sql
ALTER TABLE locations
ADD FULLTEXT INDEX location_search_fulltext (city_name, state, country);
```

### Migration 002: API Cache Cleanup
**Problem:** Expired cache entries accumulating
**Solution:** Automatic cleanup of expired entries every hour
**Impact:** Database size controlled, faster cache queries

### Migration 003: AI Shares Cleanup
**Problem:** Old AI shares not being removed
**Solution:** Auto-cleanup of expired share links
**Impact:** Better data hygiene, smaller database

### Migration 004: Spatial Index (50x faster)
**Problem:** Coordinate-based lookups were slow
**Solution:** Added SPATIAL index on lat/lng coordinates
**Impact:** Geolocation queries 50x faster

```sql
ALTER TABLE locations
ADD SPATIAL INDEX location_coordinates_spatial (coordinates);
```

### Migration 005: Table Partitioning (10x faster)
**Problem:** Large weather_data table causing slow date queries
**Solution:** Partitioned by year (2015-2025)
**Impact:** Date range queries 10x faster

**Data Integrity:** 100% - All 585,784 records preserved

## Database Migrations

### Running Migrations
```bash
# Apply all pending migrations
cd database/migrations
mysql -u weather_user -p weather_db < 001_add_fulltext_index.sql
mysql -u weather_user -p weather_db < 002_api_cache_cleanup.sql
# ... etc
```

### Migration Files Location
`database/migrations/` - Sequential numbered SQL files

### Migration Status
```sql
-- Check if migration applied
SHOW INDEX FROM locations WHERE Key_name = 'location_search_fulltext';
SHOW INDEX FROM locations WHERE Key_name = 'location_coordinates_spatial';
SELECT PARTITION_NAME FROM INFORMATION_SCHEMA.PARTITIONS
WHERE TABLE_NAME = 'weather_data';
```

## Caching Strategy

### Cache TTL (Time To Live)
- **Current Weather:** 30 minutes
- **Forecasts:** 6 hours
- **Historical Data:** 7 days
- **Air Quality:** 60 minutes
- **Climate Stats:** 30 days

### Cache Performance
- **Hit Rate:** 99% reduction in API calls
- **Speed:** 282x faster (850ms → 3ms)
- **Cost Savings:** Stay within free tier limits

### Cache Management
```bash
# View cache statistics
curl http://localhost:5001/api/cache/stats

# Clear expired entries
curl -X DELETE http://localhost:5001/api/cache/expired

# Clear location-specific cache
curl -X DELETE http://localhost:5001/api/cache/location/:id
```

## Database Maintenance

### Regular Tasks

**Daily (Automated):**
- Expired cache cleanup (hourly cron)
- Expired AI shares cleanup

**Weekly:**
- Review slow query logs
- Check index usage statistics
- Monitor database size

**Monthly:**
- Optimize tables: `OPTIMIZE TABLE locations, weather_data;`
- Review partition performance
- Analyze cache hit rates

### Performance Monitoring
```sql
-- Slow queries
SELECT * FROM mysql.slow_log ORDER BY query_time DESC LIMIT 10;

-- Index usage
SELECT * FROM sys.schema_unused_indexes;

-- Table sizes
SELECT table_name,
  ROUND((data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'weather_db'
ORDER BY (data_length + index_length) DESC;
```

## Backup & Recovery

### Backup Strategy
```bash
# Full backup
mysqldump -u weather_user -p weather_db > backup_$(date +%Y%m%d).sql

# Schema only
mysqldump -u weather_user -p --no-data weather_db > schema.sql

# Specific table
mysqldump -u weather_user -p weather_db weather_data > weather_data_backup.sql
```

### Recovery
```bash
# Restore full database
mysql -u weather_user -p weather_db < backup_20251106.sql

# Restore specific table
mysql -u weather_user -p weather_db < weather_data_backup.sql
```

## Troubleshooting

### Common Issues

**Slow location searches:**
- Check FULLTEXT index exists (Migration 001)
- Use MATCH() AGAINST() syntax in queries

**Slow geolocation:**
- Check SPATIAL index exists (Migration 004)
- Use ST_Distance() with index hints

**Database growing too fast:**
- Check cache cleanup is running (Migration 002)
- Review cache TTL settings

**Date queries slow:**
- Check partitions exist (Migration 005)
- Use partition pruning in queries

---

**Related Documentation:**
- 🚀 Deployment: [../deployment/](../deployment/)
- 💻 Development: [../development/](../development/)
- ⚠️ Troubleshooting: [../troubleshooting/](../troubleshooting/)
