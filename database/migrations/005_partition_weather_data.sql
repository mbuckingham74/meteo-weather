-- Migration 005: Partition weather_data Table by Year
-- Description: Partition large weather_data table for better performance
-- Impact: 5-10x faster queries on date ranges, easier data management
-- Date: 2025-11-06
-- REQUIRES: MySQL 8.0+
-- WARNING: This is a major operation, test on staging first!

-- IMPORTANT: This migration requires the table to have a PRIMARY KEY
-- that includes the partition key (observation_date)

-- Step 1: Check current primary key
-- SHOW CREATE TABLE weather_data;
-- If PK is just (id), we need to recreate it with (id, observation_date)

START TRANSACTION;

-- Step 2: Drop existing foreign keys (MySQL doesn't support FK with partitioning)
-- NOTE: This is a tradeoff - we lose FK constraint for better query performance
-- Application-level referential integrity must be maintained
ALTER TABLE weather_data DROP FOREIGN KEY weather_data_ibfk_1;
ALTER TABLE weather_data DROP FOREIGN KEY fk_weather_location;

-- Step 3: Recreate primary key to include observation_date
ALTER TABLE weather_data
DROP PRIMARY KEY,
ADD PRIMARY KEY (id, observation_date);

COMMIT;

-- Step 5: Create partitioned version
-- WARNING: This will lock the table during partitioning (30-60 seconds for 585K rows)
-- Data range: 2015-2025 (11 years)

-- Partition by year (based on actual data range: 2015-2025)
ALTER TABLE weather_data
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

-- Verification queries
-- SELECT COUNT(*) as total_rows FROM weather_data;

-- Check partition information
-- SELECT
--     table_name,
--     partition_name,
--     partition_expression,
--     partition_description,
--     table_rows
-- FROM information_schema.partitions
-- WHERE table_schema = 'meteo_db'
--   AND table_name = 'weather_data';

-- Test query performance
-- EXPLAIN PARTITIONS
-- SELECT * FROM weather_data
-- WHERE observation_date BETWEEN '2024-01-01' AND '2024-12-31';
-- Should show only p2024 partition being scanned

-- Notes:
-- 1. Run during maintenance window
-- 2. Expect table lock during partitioning (can take several minutes)
-- 3. Test on staging with production-size data first
-- 4. Monitor query performance after migration
-- 5. Add new partitions yearly
