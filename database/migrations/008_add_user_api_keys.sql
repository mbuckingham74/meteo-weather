-- Migration: Add user_api_keys table for user-managed AI API keys
-- Created: 2025-11-13
-- Description: Allows users to bring their own API keys for AI providers (Anthropic, OpenAI, Grok, Google, Mistral, Cohere)

-- Create user_api_keys table
CREATE TABLE IF NOT EXISTS user_api_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    provider VARCHAR(50) NOT NULL COMMENT 'AI provider: anthropic, openai, grok, google, mistral, cohere',
    key_name VARCHAR(100) NOT NULL COMMENT 'User-friendly name for the key',
    encrypted_key TEXT NOT NULL COMMENT 'AES-256-GCM encrypted API key',
    is_active BOOLEAN DEFAULT true COMMENT 'Whether this key is currently enabled',
    is_default BOOLEAN DEFAULT false COMMENT 'Default key for this provider (one per provider per user)',
    usage_limit INT DEFAULT NULL COMMENT 'Monthly token limit (NULL = unlimited)',
    tokens_used INT DEFAULT 0 COMMENT 'Tokens used this month',
    tokens_reset_at TIMESTAMP NULL COMMENT 'When token usage counter was last reset',
    last_used_at TIMESTAMP NULL COMMENT 'Last time this key was used',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_provider (user_id, provider),
    INDEX idx_active (is_active),
    INDEX idx_default (is_default),
    UNIQUE KEY unique_key_name (user_id, key_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add constraint to ensure only one default key per provider per user
-- This is handled in application logic due to MySQL limitations

-- Rollback SQL (for reference, not executed):
-- DROP TABLE IF EXISTS user_api_keys;
