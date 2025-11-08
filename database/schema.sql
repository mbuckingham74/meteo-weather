-- Meteo App Database Schema
-- Weather Spark Clone - Database Structure

-- Shared AI Answers table: stores shareable AI weather analysis results
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

-- Locations table: stores cities and geographic data
CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city_name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    country_code CHAR(2),
    state VARCHAR(100),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    coordinates POINT NOT NULL SRID 4326 COMMENT 'Spatial point for fast geo lookups',
    timezone VARCHAR(100),
    elevation INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_city_country (city_name, country),
    INDEX idx_coordinates (latitude, longitude),
    UNIQUE KEY unique_location (latitude, longitude),
    SPATIAL INDEX idx_spatial_coordinates (coordinates)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Weather data table: stores historical and current weather observations
CREATE TABLE IF NOT EXISTS weather_data (
    id BIGINT AUTO_INCREMENT,
    location_id INT NOT NULL,
    observation_date DATE NOT NULL,
    observation_time TIME,
    temperature_high DECIMAL(5, 2),
    temperature_low DECIMAL(5, 2),
    temperature_avg DECIMAL(5, 2),
    feels_like DECIMAL(5, 2),
    humidity INT,
    pressure DECIMAL(6, 2),
    wind_speed DECIMAL(5, 2),
    wind_direction INT,
    precipitation DECIMAL(6, 2),
    precipitation_probability INT,
    cloud_cover INT,
    uv_index INT,
    visibility DECIMAL(6, 2),
    weather_condition VARCHAR(100),
    weather_description TEXT,
    sunrise TIME,
    sunset TIME,
    data_source VARCHAR(50) COMMENT 'openweather or visualcrossing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, observation_date),
    INDEX idx_location_date (location_id, observation_date),
    INDEX idx_date (observation_date),
    INDEX idx_source (data_source),
    UNIQUE KEY unique_observation (location_id, observation_date, observation_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY RANGE (YEAR(observation_date)) (
    PARTITION p2015 VALUES LESS THAN (2016),
    PARTITION p2016 VALUES LESS THAN (2017),
    PARTITION p2017 VALUES LESS THAN (2018),
    PARTITION p2018 VALUES LESS THAN (2019),
    PARTITION p2019 VALUES LESS THAN (2020),
    PARTITION p2020 VALUES LESS THAN (2021),
    PARTITION p2021 VALUES LESS THAN (2022),
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Climate statistics table: stores monthly/yearly averages
CREATE TABLE IF NOT EXISTS climate_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    location_id INT NOT NULL,
    month INT NOT NULL COMMENT '1-12',
    avg_temp_high DECIMAL(5, 2),
    avg_temp_low DECIMAL(5, 2),
    record_high DECIMAL(5, 2),
    record_low DECIMAL(5, 2),
    avg_precipitation DECIMAL(6, 2),
    avg_humidity INT,
    avg_wind_speed DECIMAL(5, 2),
    sunny_days INT,
    rainy_days INT,
    snowy_days INT,
    data_year_start INT,
    data_year_end INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    INDEX idx_location_month (location_id, month),
    UNIQUE KEY unique_climate_stat (location_id, month, data_year_start, data_year_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_is_admin (is_admin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    temperature_unit VARCHAR(1) DEFAULT 'C',
    default_forecast_days INT DEFAULT 7,
    default_location VARCHAR(255),
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    email_notifications BOOLEAN DEFAULT FALSE,
    daily_weather_report BOOLEAN DEFAULT FALSE,
    weather_alert_notifications BOOLEAN DEFAULT TRUE,
    weekly_summary BOOLEAN DEFAULT FALSE,
    report_time TIME DEFAULT '08:00:00',
    report_locations JSON COMMENT 'Array of location IDs for weather reports',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preferences (user_id),
    INDEX idx_email_notifications (email_notifications, daily_weather_report, weekly_summary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User favorite locations table
CREATE TABLE IF NOT EXISTS user_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    address VARCHAR(500),
    timezone VARCHAR(100),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_favorites (user_id),
    INDEX idx_display_order (user_id, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refresh tokens table (optional support for persisted refresh tokens)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token(255)),
    INDEX idx_user_tokens (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API cache table: cache API responses to reduce API calls
CREATE TABLE IF NOT EXISTS api_cache (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cache_key CHAR(32) NOT NULL UNIQUE,
    location_id INT,
    api_source VARCHAR(50) NOT NULL,
    request_params JSON,
    response_data JSON NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cache_key (cache_key),
    INDEX idx_expiry (expires_at),
    INDEX idx_location_source (location_id, api_source)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
