# Database Schema Documentation

Complete database schema for Meteo Weather App with entity-relationship diagrams, table definitions, and optimization details.

**Database:** MySQL 8.0
**Engine:** InnoDB
**Charset:** utf8mb4 (full Unicode support including emojis)
**Collation:** utf8mb4_unicode_ci

**Last Updated:** November 7, 2025

---

## 📊 Entity-Relationship Diagram (ERD)

### Full Schema Overview

```mermaid
erDiagram
    users ||--o{ user_preferences : has
    users ||--o{ user_favorites : has
    users ||--o{ refresh_tokens : has
    locations ||--o{ weather_data : contains
    locations ||--o{ climate_stats : contains
    locations ||--o{ api_cache : references
    locations ||--o{ user_favorites : references

    users {
        int id PK
        varchar email UK
        varchar password_hash
        varchar name
        timestamp created_at
        timestamp updated_at
        timestamp last_login
    }

    user_preferences {
        int id PK
        int user_id FK
        varchar temperature_unit
        int default_forecast_days
        varchar default_location
        varchar theme
        timestamp created_at
        timestamp updated_at
    }

    user_favorites {
        int id PK
        int user_id FK
        varchar location_name
        decimal latitude
        decimal longitude
        varchar address
        varchar timezone
        int display_order
        timestamp created_at
        timestamp updated_at
    }

    refresh_tokens {
        int id PK
        int user_id FK
        varchar token
        timestamp expires_at
        timestamp created_at
    }

    locations {
        int id PK
        varchar city_name
        varchar country
        char country_code
        varchar state
        decimal latitude UK
        decimal longitude UK
        varchar timezone
        int elevation
        timestamp created_at
        timestamp updated_at
    }

    weather_data {
        bigint id PK
        int location_id FK
        date observation_date UK
        time observation_time UK
        decimal temperature_high
        decimal temperature_low
        decimal temperature_avg
        decimal feels_like
        int humidity
        decimal pressure
        decimal wind_speed
        int wind_direction
        decimal precipitation
        int precipitation_probability
        int cloud_cover
        int uv_index
        decimal visibility
        varchar weather_condition
        text weather_description
        time sunrise
        time sunset
        varchar data_source
        timestamp created_at
    }

    climate_stats {
        bigint id PK
        int location_id FK
        int month
        decimal avg_temp_high
        decimal avg_temp_low
        decimal record_high
        decimal record_low
        decimal avg_precipitation
        int avg_humidity
        decimal avg_wind_speed
        int sunny_days
        int rainy_days
        int snowy_days
        int data_year_start UK
        int data_year_end UK
        timestamp created_at
        timestamp updated_at
    }

    api_cache {
        bigint id PK
        varchar cache_key UK
        int location_id FK
        varchar api_source
        json request_params
        json response_data
        timestamp expires_at
        timestamp created_at
    }

    shared_ai_answers {
        int id PK
        varchar share_id UK
        text question
        text answer
        varchar location
        json weather_data
        json visualizations
        json follow_up_questions
        varchar confidence
        int tokens_used
        varchar model
        timestamp created_at
        timestamp expires_at
        int views
    }
```

---

## 📋 Table Definitions

### 👤 users

**Purpose:** Store user accounts and authentication data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User email address (login) |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password (10 rounds) |
| name | VARCHAR(100) | NOT NULL | User's display name |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last profile update |
| last_login | TIMESTAMP | NULL | Last successful login |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE KEY (email)`
- `INDEX idx_email (email)`

**Security:**
- Passwords hashed with bcrypt (10 rounds)
- Email uniqueness enforced at database level
- No plaintext passwords ever stored

---

### ⚙️ user_preferences

**Purpose:** Store user settings and display preferences

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique preference ID |
| user_id | INT | NOT NULL, FOREIGN KEY | References users(id) |
| temperature_unit | VARCHAR(1) | DEFAULT 'C' | 'C' for Celsius, 'F' for Fahrenheit |
| default_forecast_days | INT | DEFAULT 7 | Default forecast length (3, 7, or 14) |
| default_location | VARCHAR(255) | NULL | Default search location |
| theme | VARCHAR(20) | DEFAULT 'light' | UI theme ('light', 'dark', 'auto') |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Preferences created |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last preference change |

**Indexes:**
- `PRIMARY KEY (id)`
- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
- `UNIQUE KEY unique_user_preferences (user_id)`

**Cascade Behavior:**
- ON DELETE CASCADE: Preferences deleted when user is deleted

---

### ⭐ user_favorites

**Purpose:** Store user's saved locations for quick access

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique favorite ID |
| user_id | INT | NOT NULL, FOREIGN KEY | References users(id) |
| location_name | VARCHAR(255) | NOT NULL | Display name (e.g., "Seattle, WA") |
| latitude | DECIMAL(10, 7) | NOT NULL | Latitude coordinate |
| longitude | DECIMAL(10, 7) | NOT NULL | Longitude coordinate |
| address | VARCHAR(500) | NULL | Full address string |
| timezone | VARCHAR(100) | NULL | IANA timezone (e.g., "America/Los_Angeles") |
| display_order | INT | DEFAULT 0 | Custom sort order |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Favorite added |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last modified |

**Indexes:**
- `PRIMARY KEY (id)`
- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
- `INDEX idx_user_favorites (user_id)`
- `INDEX idx_display_order (user_id, display_order)`

**Cascade Behavior:**
- ON DELETE CASCADE: Favorites deleted when user is deleted

---

### 🔑 refresh_tokens

**Purpose:** Persistent storage for JWT refresh tokens

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Token ID |
| user_id | INT | NOT NULL, FOREIGN KEY | References users(id) |
| token | VARCHAR(500) | NOT NULL | JWT refresh token |
| expires_at | TIMESTAMP | NOT NULL | Token expiration (7 days default) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Token issued |

**Indexes:**
- `PRIMARY KEY (id)`
- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
- `INDEX idx_token (token(255))` - First 255 chars for performance
- `INDEX idx_user_tokens (user_id)`

**Usage:**
- Access tokens: 24 hours (not stored in DB)
- Refresh tokens: 7 days (stored here)
- Automatic cleanup recommended (cron job)

---

### 📍 locations

**Purpose:** Geographic locations database (148+ pre-populated cities)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Location ID |
| city_name | VARCHAR(255) | NOT NULL | City name |
| country | VARCHAR(100) | NOT NULL | Country name |
| country_code | CHAR(2) | NULL | ISO 3166-1 alpha-2 code |
| state | VARCHAR(100) | NULL | State/province/region |
| latitude | DECIMAL(10, 8) | NOT NULL | Latitude (-90 to 90) |
| longitude | DECIMAL(11, 8) | NOT NULL | Longitude (-180 to 180) |
| timezone | VARCHAR(100) | NULL | IANA timezone |
| elevation | INT | NULL | Elevation in meters |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record created |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last updated |

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX idx_city_country (city_name, country)` - Fast city search
- `INDEX idx_coordinates (latitude, longitude)` - Coordinate lookup
- `UNIQUE KEY unique_location (latitude, longitude)` - Prevent duplicates
- **`FULLTEXT INDEX idx_city_fulltext (city_name, country, state)`** - Natural language search (20x faster)
- **`SPATIAL INDEX idx_coordinates_spatial (latitude, longitude)`** - Geospatial queries (50x faster)

**Optimizations (Nov 2025):**
- FULLTEXT index for text search: 20x performance improvement
- Spatial index for coordinate queries: 50x performance improvement
- See: [Database Optimization Guide](OPTIMIZATION_COMPLETE.md)

---

### 🌤️ weather_data

**Purpose:** Historical and current weather observations (585,000+ records)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Observation ID |
| location_id | INT | NOT NULL, FOREIGN KEY | References locations(id) |
| observation_date | DATE | NOT NULL | Date of observation |
| observation_time | TIME | NULL | Time of observation (if hourly) |
| temperature_high | DECIMAL(5, 2) | NULL | High temperature (°C) |
| temperature_low | DECIMAL(5, 2) | NULL | Low temperature (°C) |
| temperature_avg | DECIMAL(5, 2) | NULL | Average temperature (°C) |
| feels_like | DECIMAL(5, 2) | NULL | Apparent temperature (°C) |
| humidity | INT | NULL | Relative humidity (0-100%) |
| pressure | DECIMAL(6, 2) | NULL | Atmospheric pressure (hPa) |
| wind_speed | DECIMAL(5, 2) | NULL | Wind speed (km/h) |
| wind_direction | INT | NULL | Wind direction (0-360°) |
| precipitation | DECIMAL(6, 2) | NULL | Precipitation amount (mm) |
| precipitation_probability | INT | NULL | Chance of precipitation (0-100%) |
| cloud_cover | INT | NULL | Cloud cover percentage (0-100%) |
| uv_index | INT | NULL | UV index (0-11+) |
| visibility | DECIMAL(6, 2) | NULL | Visibility (km) |
| weather_condition | VARCHAR(100) | NULL | Weather condition summary |
| weather_description | TEXT | NULL | Detailed description |
| sunrise | TIME | NULL | Sunrise time (local) |
| sunset | TIME | NULL | Sunset time (local) |
| data_source | VARCHAR(50) | NULL | 'openweather' or 'visualcrossing' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record inserted |

**Indexes:**
- `PRIMARY KEY (id)`
- `FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE`
- `INDEX idx_location_date (location_id, observation_date)` - Query by location and date
- `INDEX idx_date (observation_date)` - Date range queries
- `INDEX idx_source (data_source)` - Filter by API source
- `UNIQUE KEY unique_observation (location_id, observation_date, observation_time)` - Prevent duplicates

**Partitioning (Nov 2025):**
- Table partitioned by observation_date (monthly partitions)
- 10x performance improvement for date range queries
- Automatic partition management

**Data Integrity:**
- All 585,784 historical records preserved during optimization
- Foreign key constraints ensure referential integrity

---

### 📊 climate_stats

**Purpose:** Monthly climate averages and records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Stat ID |
| location_id | INT | NOT NULL, FOREIGN KEY | References locations(id) |
| month | INT | NOT NULL | Month number (1-12) |
| avg_temp_high | DECIMAL(5, 2) | NULL | Average high temperature (°C) |
| avg_temp_low | DECIMAL(5, 2) | NULL | Average low temperature (°C) |
| record_high | DECIMAL(5, 2) | NULL | Record high temperature (°C) |
| record_low | DECIMAL(5, 2) | NULL | Record low temperature (°C) |
| avg_precipitation | DECIMAL(6, 2) | NULL | Average precipitation (mm) |
| avg_humidity | INT | NULL | Average humidity (%) |
| avg_wind_speed | DECIMAL(5, 2) | NULL | Average wind speed (km/h) |
| sunny_days | INT | NULL | Average sunny days per month |
| rainy_days | INT | NULL | Average rainy days per month |
| snowy_days | INT | NULL | Average snowy days per month |
| data_year_start | INT | NULL | Start year for data range |
| data_year_end | INT | NULL | End year for data range |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record created |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last updated |

**Indexes:**
- `PRIMARY KEY (id)`
- `FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE`
- `INDEX idx_location_month (location_id, month)` - Query by location and month
- `UNIQUE KEY unique_climate_stat (location_id, month, data_year_start, data_year_end)` - Prevent duplicates

**Usage:**
- Powers "Climate Comparison" feature
- Enables "This Day in History" analysis
- Supports temperature probability distribution

---

### 💾 api_cache

**Purpose:** Cache external API responses to reduce API costs

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Cache ID |
| cache_key | VARCHAR(255) | NOT NULL, UNIQUE | Unique cache identifier |
| location_id | INT | NULL, FOREIGN KEY | References locations(id) |
| api_source | VARCHAR(50) | NOT NULL | API name ('visualcrossing', 'openweather') |
| request_params | JSON | NULL | Original request parameters |
| response_data | JSON | NOT NULL | Cached API response |
| expires_at | TIMESTAMP | NOT NULL | Cache expiration time |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Cache entry created |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE KEY (cache_key)` - Ensure unique cache entries
- `FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE`
- `INDEX idx_cache_key (cache_key)` - Fast cache lookup
- `INDEX idx_expiry (expires_at)` - Efficient cleanup queries
- `INDEX idx_location_source (location_id, api_source)` - Query by location and source

**Cache TTL:**
- Current weather: 30 minutes
- Forecasts: 6 hours
- Historical data: 7 days
- Air quality: 60 minutes
- Climate stats: 30 days

**Cache Hit Rate:** 99% in production

**Auto-Cleanup (Nov 2025):**
- Automatic cleanup event for expired entries
- Runs every hour
- Prevents table bloat

---

### 🤖 shared_ai_answers

**Purpose:** Shareable AI weather analysis results

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Answer ID |
| share_id | VARCHAR(10) | NOT NULL, UNIQUE | Short URL-safe ID (e.g., "abc123xyz") |
| question | TEXT | NOT NULL | Original user question |
| answer | TEXT | NOT NULL | AI generated answer |
| location | VARCHAR(255) | NOT NULL | Location the question was about |
| weather_data | JSON | NULL | Weather data snapshot at time of query |
| visualizations | JSON | NULL | Suggested visualizations array |
| follow_up_questions | JSON | NULL | Follow-up questions array |
| confidence | VARCHAR(20) | NULL | AI confidence level ('high', 'medium', 'low') |
| tokens_used | INT | NULL | Number of tokens used for this query |
| model | VARCHAR(50) | NULL | AI model used (e.g., 'claude-sonnet-4-5-20250929') |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Answer created |
| expires_at | TIMESTAMP | NOT NULL | Share link expires (7 days from creation) |
| views | INT | DEFAULT 0 | Number of times viewed |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE KEY (share_id)` - Ensure unique share links
- `INDEX idx_share_id (share_id)` - Fast share link lookup
- `INDEX idx_expires_at (expires_at)` - Efficient cleanup
- `INDEX idx_created_at (created_at)` - Sorting by recency

**Auto-Cleanup (Nov 2025):**
- Automatic cleanup of expired shares
- Runs daily
- Removes entries older than 7 days

---

## 🔗 Relationships Summary

### One-to-Many Relationships

**users → user_preferences** (1:1)
- Each user has ONE preferences record
- Cascade delete

**users → user_favorites** (1:N)
- Each user can have MANY favorite locations
- Cascade delete

**users → refresh_tokens** (1:N)
- Each user can have MANY refresh tokens (multiple devices)
- Cascade delete

**locations → weather_data** (1:N)
- Each location has MANY weather observations
- Cascade delete

**locations → climate_stats** (1:N)
- Each location has MANY climate statistics (12 months)
- Cascade delete

**locations → api_cache** (1:N)
- Each location can have MANY cached API responses
- Cascade delete

---

## 🚀 Performance Optimizations

### Indexing Strategy

**Primary Keys:**
- Auto-incrementing integers for fast joins
- BIGINT for tables with high volume (weather_data, api_cache)

**Foreign Keys:**
- All foreign keys indexed automatically
- ON DELETE CASCADE for dependent data cleanup

**Composite Indexes:**
- `idx_location_date` (weather_data): Fast queries by location and date
- `idx_location_month` (climate_stats): Fast queries by location and month
- `idx_city_country` (locations): Fast city name search

**Specialized Indexes (Nov 2025):**
- **FULLTEXT index** on locations (city_name, country, state): 20x faster text search
- **SPATIAL index** on locations (latitude, longitude): 50x faster coordinate queries

### Caching Strategy

**MySQL Query Cache:**
- 99% cache hit rate in production
- Aggressive TTL policies reduce API costs
- Automatic cleanup prevents table bloat

**Query Performance:**
- Most cached queries: <10ms
- Uncached weather queries: 50-200ms
- Historical data queries: 100-500ms (optimized with partitioning)

### Data Integrity

**Foreign Key Constraints:**
- Enforced referential integrity
- Cascade deletes prevent orphaned records
- Transaction support for data consistency

**Unique Constraints:**
- Prevent duplicate users (email)
- Prevent duplicate locations (lat/lon)
- Prevent duplicate observations (location + date + time)
- Prevent duplicate cache entries (cache_key)

---

## 📈 Database Statistics

**Total Tables:** 9

**Pre-populated Data:**
- Locations: 148 major cities worldwide
- Weather Data: 585,784 historical observations
- Total Records: 585,932+

**Estimated Growth:**
- Weather Data: ~500 records/day (with active usage)
- API Cache: ~1,000 entries (auto-cleaned hourly)
- Users: Variable
- Total DB Size: ~50-100MB (small, optimized)

**Performance:**
- Query response time: <10ms (cached)
- Cache hit rate: 99%
- Database optimization: 20-50x improvement (Nov 2025)

---

## 🔧 Maintenance

### Recommended Tasks

**Daily:**
- ✅ Automatic cleanup of expired API cache
- ✅ Automatic cleanup of expired shared AI answers

**Weekly:**
- Monitor database size and growth
- Review slow query log
- Check index usage statistics

**Monthly:**
- Optimize tables: `OPTIMIZE TABLE weather_data, api_cache;`
- Analyze query performance
- Update climate statistics

**Quarterly:**
- Review and update indexes
- Partition management (weather_data)
- Backup verification

### Backup Strategy

**Recommended:**
- Daily full backups
- Point-in-time recovery enabled
- Test restore procedure quarterly

**Backup Script:**
```bash
mysqldump -u meteo_user -p meteo_app > backup_$(date +%Y%m%d).sql
```

**See:** [Database Backup Guide](../troubleshooting/TROUBLESHOOTING.md#database-backup)

---

## 📚 Additional Resources

- **Schema SQL:** [database/schema.sql](../../database/schema.sql)
- **Migrations:** [database/migrations/](../../database/migrations/)
- **Optimization Guide:** [OPTIMIZATION_COMPLETE.md](OPTIMIZATION_COMPLETE.md)
- **Performance Fix:** [PERFORMANCE_FIX_NOV7.md](PERFORMANCE_FIX_NOV7.md)
- **Seed Data:** [database/seed.sql](../../database/seed.sql)

---

**Last Updated:** November 7, 2025
**Database Version:** MySQL 8.0
**Schema Version:** 1.5.0
**Maintained by:** Michael Buckingham
