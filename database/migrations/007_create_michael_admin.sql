-- Migration 007: Create admin user for Michael
-- Email: michael@example.com
-- Password: jag97Dorp (hashed with bcrypt)

-- First, run the migration to add is_admin column if not already done
-- (This is idempotent - safe to run multiple times)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Delete existing user if exists (in case of re-running)
DELETE FROM users WHERE email = 'michael@example.com';

-- Create admin user
INSERT INTO users (email, password_hash, name, is_admin, created_at)
VALUES (
    'michael@example.com',
    '$2b$10$pMO52jk0TvB3tLvv8aN.xueu/2HTI.KvIZ0JGjUyzZyCUS040F7Xy',
    'Michael',
    TRUE,
    NOW()
);

-- Create default preferences for Michael
INSERT INTO user_preferences (user_id, temperature_unit, theme)
SELECT id, 'F', 'auto'
FROM users
WHERE email = 'michael@example.com';

-- Display created user
SELECT
    id,
    email,
    name,
    is_admin,
    created_at
FROM users
WHERE email = 'michael@example.com';

-- Show admin count
SELECT COUNT(*) as admin_count FROM users WHERE is_admin = TRUE;
