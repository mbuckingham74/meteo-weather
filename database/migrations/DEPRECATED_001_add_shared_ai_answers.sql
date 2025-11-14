-- Migration: Add shared_ai_answers table
-- Purpose: Enable shareable AI weather analysis results
-- Date: 2025-01-01

CREATE TABLE IF NOT EXISTS shared_ai_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    share_id VARCHAR(10) NOT NULL UNIQUE COMMENT 'Short URL-safe ID (e.g., "abc123xyz")',
    question TEXT NOT NULL COMMENT 'Original user question',
    answer TEXT NOT NULL COMMENT 'AI generated answer',
    location VARCHAR(255) NOT NULL COMMENT 'Location the question was about',
    weather_data JSON COMMENT 'Weather data snapshot at time of query',
    visualizations JSON COMMENT 'Suggested visualizations array',
    follow_up_questions JSON COMMENT 'Follow-up questions array',
    confidence VARCHAR(20) COMMENT 'AI confidence level (high/medium/low)',
    tokens_used INT COMMENT 'Number of tokens used for this query',
    model VARCHAR(50) COMMENT 'AI model used (e.g., claude-sonnet-4-5-20250929)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the answer was created',
    expires_at TIMESTAMP NOT NULL COMMENT 'When the share link expires (7 days from creation)',
    views INT DEFAULT 0 COMMENT 'Number of times this shared answer was viewed',
    INDEX idx_share_id (share_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
