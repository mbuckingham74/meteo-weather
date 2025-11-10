-- Migration 002: Optimize API Cache Storage
-- Description: Reduce cache_key size and add cleanup automation
-- Impact: Smaller indexes, faster lookups, automatic cleanup
-- Date: 2025-11-06

START TRANSACTION;

-- Optimize cache_key size (MD5 hash is always 32 chars, not 255)
ALTER TABLE api_cache
MODIFY COLUMN cache_key CHAR(32) NOT NULL;

-- Add index for cache cleanup queries (check if exists first)
-- Note: Uncomment if index doesn't exist
-- CREATE INDEX idx_expires_source ON api_cache (expires_at, api_source);

COMMIT;

-- Create automated cleanup event
DELIMITER //

DROP EVENT IF EXISTS cleanup_expired_cache //

CREATE EVENT cleanup_expired_cache
ON SCHEDULE EVERY 1 HOUR
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    -- Delete cache entries expired more than 1 hour ago
    DELETE FROM api_cache
    WHERE expires_at < DATE_SUB(NOW(), INTERVAL 1 HOUR);
END //

DELIMITER ;

-- Enable event scheduler (if not already enabled)
SET GLOBAL event_scheduler = ON;

-- Verification
-- SELECT * FROM information_schema.events
-- WHERE event_schema = 'meteo_db'
--   AND event_name = 'cleanup_expired_cache';
-- Expected: 1 row

-- Check cache_key column size
-- SELECT column_name, character_maximum_length
-- FROM information_schema.columns
-- WHERE table_schema = 'meteo_db'
--   AND table_name = 'api_cache'
--   AND column_name = 'cache_key';
-- Expected: character_maximum_length = 32
