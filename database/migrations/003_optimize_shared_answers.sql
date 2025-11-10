-- Migration 003: Optimize Shared AI Answers Cleanup
-- Description: Add automatic cleanup for expired AI answer shares
-- Impact: Prevents table bloat, maintains performance
-- Date: 2025-11-06

START TRANSACTION;

-- Add indexes for cleanup queries and analytics (check if exists first)
-- Uncomment if indexes don't exist:
-- CREATE INDEX idx_expires_views ON shared_ai_answers (expires_at, views);
-- CREATE INDEX idx_created_views ON shared_ai_answers (created_at, views);

COMMIT;

-- Create automated cleanup event
DELIMITER //

DROP EVENT IF EXISTS cleanup_expired_shares //

CREATE EVENT cleanup_expired_shares
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP + INTERVAL 1 HOUR
DO
BEGIN
    -- Delete shares expired more than 1 day ago
    -- Keep 1 day buffer in case of timezone issues
    DELETE FROM shared_ai_answers
    WHERE expires_at < DATE_SUB(NOW(), INTERVAL 1 DAY);

    -- Log cleanup (optional)
    -- INSERT INTO cleanup_log (table_name, rows_deleted, cleanup_date)
    -- VALUES ('shared_ai_answers', ROW_COUNT(), NOW());
END //

DELIMITER ;

-- Enable event scheduler (if not already enabled)
SET GLOBAL event_scheduler = ON;

-- Verification
-- SELECT * FROM information_schema.events
-- WHERE event_schema = 'meteo_db'
--   AND event_name = 'cleanup_expired_shares';
-- Expected: 1 row
