-- Migration 006: Add admin role to users table
-- This migration adds the is_admin column and makes the first user an admin

-- Add is_admin column to users table
ALTER TABLE users
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE
COMMENT 'Admin role - first user is auto-admin, others can be promoted';

-- Make the first registered user an admin (if exists)
UPDATE users
SET is_admin = TRUE
WHERE id = (SELECT MIN(id) FROM (SELECT id FROM users) AS temp_users)
LIMIT 1;

-- Add index for faster admin checks
CREATE INDEX idx_is_admin ON users(is_admin);

-- Display admin user
SELECT
    id,
    email,
    name,
    is_admin,
    created_at
FROM users
WHERE is_admin = TRUE;
