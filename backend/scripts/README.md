# Bulk Data Import Scripts

These scripts leverage your Visual Crossing API premium subscription to pre-populate the database with historical weather data, drastically reducing future API costs.

## Overview

**Philosophy:** Storage is cheaper than API calls. Fetch historical data ONCE and store it forever.

**Your situation:**
- ✅ 9,997,560 Visual Crossing API calls remaining this month
- ✅ No new users until December
- ✅ Perfect opportunity to pre-populate database with 10 years of data

## Scripts

### 1. `bulkHistoricalImport.js` - Historical Weather Data Import

Fetches 10 years of daily historical weather data for major cities.

**What it does:**
- Fetches daily weather data from Visual Crossing API
- Stores in `weather_data` table
- Inserts location data into `locations` table
- Handles duplicates gracefully (upserts)
- Rate-limited to be respectful (200ms between calls)

**Usage:**

```bash
# Test with 5 US cities first (dry run)
node backend/scripts/bulkHistoricalImport.js --cities=US --limit=5 --dry-run

# Import top 5 US cities (real run)
node backend/scripts/bulkHistoricalImport.js --cities=US --limit=5

# Import all 100 top US cities
node backend/scripts/bulkHistoricalImport.js --cities=US

# Import top 50 global cities
node backend/scripts/bulkHistoricalImport.js --cities=GLOBAL

# Import ALL cities (US + Global)
node backend/scripts/bulkHistoricalImport.js --cities=ALL

# Custom date range
node backend/scripts/bulkHistoricalImport.js --cities=US --start-year=2020 --end-year=2025
```

**Options:**
- `--cities=US|GLOBAL|ALL` - Which city set to import (default: US)
- `--limit=N` - Limit to first N cities (for testing)
- `--start-year=YYYY` - Start year (default: 2015)
- `--end-year=YYYY` - End year (default: 2025)
- `--dry-run` - Preview without making API calls

**API Cost Estimate:**

Each city requires ~11 API calls (one per year from 2015-2025).

- **Top 100 US cities:** ~1,100 API calls
- **Top 50 global cities:** ~550 API calls
- **All (150 cities):** ~1,650 API calls
- **Remaining after ALL:** 9,995,910 calls

**Storage Estimate:**

Each city × 10 years × 365 days = ~3,650 records per city

- **100 US cities:** ~365,000 records
- **50 global cities:** ~182,500 records
- **All:** ~547,500 records
- **Database size:** ~100-200 MB

### 2. `calculateClimateStats.js` - Climate Statistics Calculator

Calculates monthly climate normals from historical data already in database.

**What it does:**
- Calculates 30-year climate averages by month
- Computes record highs/lows
- Counts sunny/rainy/snowy days
- Stores in `climate_stats` table
- **NO API CALLS** - pure database calculations

**Usage:**

```bash
# Calculate climate stats for all locations
node backend/scripts/calculateClimateStats.js

# Recalculate even if stats exist
node backend/scripts/calculateClimateStats.js --recalculate

# Use custom date range
node backend/scripts/calculateClimateStats.js --start-year=2020 --end-year=2025
```

**Options:**
- `--start-year=YYYY` - Start year for statistics (default: 2015)
- `--end-year=YYYY` - End year for statistics (default: 2025)
- `--recalculate` - Recalculate even if stats already exist

**Cost:** FREE (no API calls, pure SQL)

## Recommended Workflow

### Phase 1: Test (5-10 cities)

```bash
# 1. Dry run to preview
node backend/scripts/bulkHistoricalImport.js --cities=US --limit=5 --dry-run

# 2. Real import for 5 cities (~55 API calls)
node backend/scripts/bulkHistoricalImport.js --cities=US --limit=5

# 3. Calculate climate stats (free)
node backend/scripts/calculateClimateStats.js

# 4. Verify in database
```

**Verify data:**
```sql
-- Check imported locations
SELECT * FROM locations ORDER BY created_at DESC LIMIT 10;

-- Check weather data
SELECT COUNT(*) as total_records FROM weather_data;
SELECT location_id, COUNT(*) as days FROM weather_data GROUP BY location_id;

-- Check climate stats
SELECT * FROM climate_stats ORDER BY location_id, month LIMIT 12;
```

### Phase 2: Full Import (All Cities)

```bash
# Import all 150 cities (~1,650 API calls)
node backend/scripts/bulkHistoricalImport.js --cities=ALL

# Calculate climate stats for all (free)
node backend/scripts/calculateClimateStats.js
```

**Expected results:**
- ~150 cities in `locations`
- ~547,500 records in `weather_data`
- ~1,800 records in `climate_stats` (150 cities × 12 months)
- ~1,650 API calls used
- ~9,995,910 API calls remaining

### Phase 3: Ongoing Maintenance

**Historical data never changes** - no need to re-fetch!

Only fetch:
- ✅ Current weather (cached 30 min)
- ✅ Forecasts (cached 6 hours)
- ✅ New cities users search for

## Database Impact

### Before Pre-Population
- Every historical query = API call
- Location comparison = Multiple API calls
- Climate charts = Repeated API calls

### After Pre-Population
- Historical data = Database query (instant, free)
- Location comparison = Database query (instant, free)
- Climate charts = Database query (instant, free)

**API cost reduction:** ~95% for historical queries

## Monitoring

Track your API usage:

```bash
# Check total API calls made
# (logged in script output)

# Check database storage
SELECT
  COUNT(*) as total_records,
  MIN(observation_date) as earliest_date,
  MAX(observation_date) as latest_date
FROM weather_data;

# Check coverage by city
SELECT
  l.city_name,
  l.state,
  l.country,
  COUNT(*) as days,
  MIN(wd.observation_date) as first_date,
  MAX(wd.observation_date) as last_date
FROM locations l
LEFT JOIN weather_data wd ON l.id = wd.location_id
GROUP BY l.id
ORDER BY days DESC;
```

## Troubleshooting

### "API call failed: 429"
Rate limited. The script has 200ms delays, but if you hit limits:
- Increase delay in `bulkHistoricalImport.js` (line ~420)
- Visual Crossing allows 1000 calls/minute normally

### "No data returned for city"
Visual Crossing may not have data for that location:
- Skip it (script continues automatically)
- Try nearby city instead

### "Database connection failed"
Ensure Docker containers are running:
```bash
docker-compose up -d
docker-compose logs mysql
```

### "Out of memory"
Processing too many cities at once:
- Use `--limit=50` to process in batches
- Run script multiple times with different city sets

## Future Additions

Want to add more cities? Easy!

1. Add to `US_CITIES` or `GLOBAL_CITIES` arrays in `bulkHistoricalImport.js`
2. Run import script again (skips existing cities)
3. Run climate stats script to calculate averages

**Example:**
```javascript
// Add to US_CITIES array
{ name: 'Boulder', state: 'CO', lat: 40.0150, lon: -105.2705 }
```

Then run:
```bash
node backend/scripts/bulkHistoricalImport.js --cities=US
node backend/scripts/calculateClimateStats.js
```

## Questions?

Check CLAUDE.md for full project documentation.
