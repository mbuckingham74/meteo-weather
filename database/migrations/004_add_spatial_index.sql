-- Migration 004: Add Spatial Index for Coordinate Searches
-- Description: Replace slow ABS() coordinate queries with fast spatial queries
-- Impact: 10-50x faster coordinate lookups
-- Date: 2025-11-06
-- REQUIRES: MySQL 8.0+ with spatial support

START TRANSACTION;

-- Add POINT column for spatial indexing
ALTER TABLE locations
ADD COLUMN coordinates POINT;

-- Populate coordinates from existing latitude/longitude
-- IMPORTANT: POINT format is (longitude, latitude) - X, Y coordinate system
-- Using ST_SRID to set coordinate system after creation (more reliable than inline SRID)
UPDATE locations
SET coordinates = ST_SRID(
    POINT(longitude, latitude),
    4326  -- WGS 84 coordinate system (standard for GPS)
);

-- Make column NOT NULL after population
ALTER TABLE locations
MODIFY COLUMN coordinates POINT NOT NULL;

-- Add spatial index
ALTER TABLE locations
ADD SPATIAL INDEX idx_spatial_coordinates (coordinates);

COMMIT;

-- Verification
-- SELECT COUNT(*) as spatial_index_count
-- FROM information_schema.statistics
-- WHERE table_schema = 'meteo_db'
--   AND table_name = 'locations'
--   AND index_type = 'SPATIAL';
-- Expected: 1 row (idx_spatial_coordinates)

-- Check coordinates populated
-- SELECT COUNT(*) as total_locations,
--        COUNT(coordinates) as with_coordinates
-- FROM locations;
-- Expected: total_locations = with_coordinates

-- Usage in code (locationService.js):
-- OLD: WHERE ABS(latitude - ?) < ? AND ABS(longitude - ?) < ?
-- NEW: WHERE ST_Distance_Sphere(coordinates, ST_GeomFromText('POINT(lon lat)', 4326)) < meters
