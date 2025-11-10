-- Migration 001: Optimize Location Search Performance
-- Description: Add FULLTEXT index for fast location searches
-- Impact: 10-100x faster location searches
-- Date: 2025-11-06

-- Safety: Create backup before running
-- mysqldump -u root -p meteo_db > backup_$(date +%Y%m%d).sql

START TRANSACTION;

-- Add FULLTEXT index for location searches
-- This replaces slow LIKE '%term%' queries with fast FULLTEXT MATCH queries
ALTER TABLE locations
ADD FULLTEXT INDEX idx_fulltext_search (city_name, country, state);

-- Add index for exact city+country lookups (used frequently)
-- Note: MySQL requires checking existence before creating index
-- CREATE INDEX idx_city_country_exact ON locations (city_name(100), country(50));

COMMIT;

-- Verification query
-- SELECT COUNT(*) as index_count
-- FROM information_schema.statistics
-- WHERE table_schema = 'meteo_db'
--   AND table_name = 'locations'
--   AND index_type = 'FULLTEXT';
-- Expected: 1 row (idx_fulltext_search)

-- Usage in code (locationService.js):
-- OLD: WHERE city_name LIKE '%seattle%' OR country LIKE '%seattle%'
-- NEW: WHERE MATCH(city_name, country, state) AGAINST('seattle' IN NATURAL LANGUAGE MODE)
