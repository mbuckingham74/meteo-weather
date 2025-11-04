-- Migration: Add email notification preferences to user_preferences table
-- Created: November 4, 2025
-- Description: Add columns for canned weather reports and email notification settings

-- Note: This migration will fail if columns already exist. That's expected behavior.
-- Run this ONLY if the columns don't exist yet.

ALTER TABLE user_preferences
ADD COLUMN language VARCHAR(10) DEFAULT 'en' AFTER theme,
ADD COLUMN email_notifications BOOLEAN DEFAULT FALSE AFTER language,
ADD COLUMN daily_weather_report BOOLEAN DEFAULT FALSE AFTER email_notifications,
ADD COLUMN weather_alert_notifications BOOLEAN DEFAULT TRUE AFTER daily_weather_report,
ADD COLUMN weekly_summary BOOLEAN DEFAULT FALSE AFTER weather_alert_notifications,
ADD COLUMN report_time TIME DEFAULT '08:00:00' AFTER weekly_summary,
ADD COLUMN report_locations JSON COMMENT 'Array of location IDs for weather reports' AFTER report_time;

-- Add index for users with email notifications enabled (for batch processing)
CREATE INDEX idx_email_notifications ON user_preferences(email_notifications, daily_weather_report, weekly_summary);

-- Example of report_locations JSON structure:
-- [
--   {"id": 1, "name": "Seattle, WA", "latitude": 47.6062, "longitude": -122.3321},
--   {"id": 2, "name": "Portland, OR", "latitude": 45.5152, "longitude": -122.6784}
-- ]
