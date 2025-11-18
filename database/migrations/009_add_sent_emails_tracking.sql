-- Migration 009: Email Tracking Tables
-- Purpose: Track sent emails to prevent duplicates and provide analytics
-- Author: Claude Code
-- Date: 2025-11-17

-- ============================================
-- Sent Emails Log
-- ============================================
-- Tracks all sent emails for analytics and duplicate prevention
CREATE TABLE IF NOT EXISTS sent_emails (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  email_type ENUM('daily_report', 'weekly_summary', 'weather_alert') NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_type_date (user_id, email_type, sent_at),
  INDEX idx_sent_at (sent_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks all sent emails for analytics and duplicate prevention';

-- ============================================
-- Sent Alerts Deduplication
-- ============================================
-- Prevents duplicate weather alerts from being sent within 24 hours
CREATE TABLE IF NOT EXISTS sent_alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  alert_hash VARCHAR(255) NOT NULL COMMENT 'Unique hash: event_onset_lat_lon',
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_hash (user_id, alert_hash),
  INDEX idx_sent_at (sent_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Prevents duplicate weather alerts within 24 hours';

-- ============================================
-- Auto-Cleanup for Old Records
-- ============================================
-- Clean up sent_emails older than 90 days (keep for analytics)
CREATE EVENT IF NOT EXISTS cleanup_sent_emails
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
  DELETE FROM sent_emails
  WHERE sent_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Clean up sent_alerts older than 7 days (only need recent deduplication)
CREATE EVENT IF NOT EXISTS cleanup_sent_alerts
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
  DELETE FROM sent_alerts
  WHERE sent_at < DATE_SUB(NOW(), INTERVAL 7 DAY);

-- ============================================
-- Migration Complete
-- ============================================
-- Tables created:
--   - sent_emails: Email analytics and daily/weekly duplicate prevention
--   - sent_alerts: Weather alert deduplication within 24 hours
--
-- Events created:
--   - cleanup_sent_emails: Auto-delete records older than 90 days
--   - cleanup_sent_alerts: Auto-delete records older than 7 days
