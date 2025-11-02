/**
 * Calculate Climate Statistics from Historical Data
 *
 * This script calculates monthly climate normals and statistics
 * from the historical weather data already in the database.
 *
 * NO API CALLS - All calculations done from existing data.
 *
 * Usage:
 *   node backend/scripts/calculateClimateStats.js [options]
 *
 * Options:
 *   --start-year=YYYY    Start year for statistics (default: 2015)
 *   --end-year=YYYY      End year for statistics (default: 2025)
 *   --recalculate        Recalculate even if stats already exist
 */

const { pool } = require('../config/database');

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  acc[key.replace('--', '')] = value || true;
  return acc;
}, {});

const CONFIG = {
  startYear: args['start-year'] || 2015,
  endYear: args['end-year'] || 2025,
  recalculate: args.recalculate || false
};

const stats = {
  locationsProcessed: 0,
  statsInserted: 0,
  statsSkipped: 0,
  errors: []
};

/**
 * Calculate climate statistics for a single location
 */
async function calculateLocationStats(locationId, locationName) {
  console.log(`\n📊 Processing: ${locationName} (ID: ${locationId})`);

  // Check if stats already exist
  if (!CONFIG.recalculate) {
    const [existing] = await pool.query(
      'SELECT COUNT(*) as count FROM climate_stats WHERE location_id = ?',
      [locationId]
    );

    if (existing[0].count >= 12) {
      console.log(`  ⊘ Climate stats already exist (${existing[0].count} months), skipping...`);
      stats.statsSkipped++;
      return;
    }
  }

  // Calculate monthly statistics for each month (1-12)
  for (let month = 1; month <= 12; month++) {
    try {
      // Query to calculate statistics for this month across all years
      const [monthlyData] = await pool.query(`
        SELECT
          ? as month,
          AVG(temperature_high) as avg_temp_high,
          AVG(temperature_low) as avg_temp_low,
          MAX(temperature_high) as record_high,
          MIN(temperature_low) as record_low,
          AVG(precipitation) as avg_precipitation,
          AVG(humidity) as avg_humidity,
          AVG(wind_speed) as avg_wind_speed,
          SUM(CASE WHEN cloud_cover < 30 THEN 1 ELSE 0 END) as sunny_days,
          SUM(CASE WHEN precipitation > 1.0 THEN 1 ELSE 0 END) as rainy_days,
          SUM(CASE WHEN weather_condition LIKE '%snow%' THEN 1 ELSE 0 END) as snowy_days
        FROM weather_data
        WHERE location_id = ?
          AND MONTH(observation_date) = ?
          AND YEAR(observation_date) >= ?
          AND YEAR(observation_date) <= ?
      `, [month, locationId, month, CONFIG.startYear, CONFIG.endYear]);

      if (!monthlyData || monthlyData.length === 0) {
        console.log(`  ⚠️  No data for month ${month}, skipping...`);
        continue;
      }

      const data = monthlyData[0];

      // Insert or update climate stats
      const query = `
        INSERT INTO climate_stats (
          location_id, month, avg_temp_high, avg_temp_low,
          record_high, record_low, avg_precipitation, avg_humidity,
          avg_wind_speed, sunny_days, rainy_days, snowy_days,
          data_year_start, data_year_end
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          avg_temp_high = VALUES(avg_temp_high),
          avg_temp_low = VALUES(avg_temp_low),
          record_high = VALUES(record_high),
          record_low = VALUES(record_low),
          avg_precipitation = VALUES(avg_precipitation),
          avg_humidity = VALUES(avg_humidity),
          avg_wind_speed = VALUES(avg_wind_speed),
          sunny_days = VALUES(sunny_days),
          rainy_days = VALUES(rainy_days),
          snowy_days = VALUES(snowy_days),
          data_year_start = VALUES(data_year_start),
          data_year_end = VALUES(data_year_end),
          updated_at = CURRENT_TIMESTAMP
      `;

      const values = [
        locationId,
        data.month,
        data.avg_temp_high,
        data.avg_temp_low,
        data.record_high,
        data.record_low,
        data.avg_precipitation,
        data.avg_humidity,
        data.avg_wind_speed,
        data.sunny_days,
        data.rainy_days,
        data.snowy_days,
        CONFIG.startYear,
        CONFIG.endYear
      ];

      await pool.query(query, values);
      stats.statsInserted++;

      console.log(`  ✓ Month ${month.toString().padStart(2, '0')}: ` +
        `High ${data.avg_temp_high ? data.avg_temp_high.toFixed(1) : 'N/A'}°C, ` +
        `Low ${data.avg_temp_low ? data.avg_temp_low.toFixed(1) : 'N/A'}°C, ` +
        `Precip ${data.avg_precipitation ? data.avg_precipitation.toFixed(1) : 'N/A'}mm`);

    } catch (error) {
      console.error(`  ✗ Error calculating month ${month}: ${error.message}`);
      stats.errors.push({ location: locationName, month, error: error.message });
    }
  }

  stats.locationsProcessed++;
  console.log(`  ✅ Complete: 12 months calculated`);
}

/**
 * Main execution
 */
async function main() {
  console.log('\n📈 Calculate Climate Statistics');
  console.log('================================\n');
  console.log(`Configuration:`);
  console.log(`  • Data Range: ${CONFIG.startYear} - ${CONFIG.endYear}`);
  console.log(`  • Recalculate: ${CONFIG.recalculate ? 'Yes' : 'No'}`);
  console.log('');

  const startTime = Date.now();

  // Get all locations that have weather data
  const [locations] = await pool.query(`
    SELECT
      l.id,
      l.city_name,
      CONCAT(l.city_name, ', ', COALESCE(l.state, l.country)) as location_name,
      COUNT(DISTINCT wd.observation_date) as data_points
    FROM locations l
    JOIN weather_data wd ON l.id = wd.location_id
    WHERE YEAR(wd.observation_date) >= ?
      AND YEAR(wd.observation_date) <= ?
    GROUP BY l.id, l.city_name, l.state, l.country
    HAVING data_points >= 365
    ORDER BY l.city_name
  `, [CONFIG.startYear, CONFIG.endYear]);

  console.log(`📊 Found ${locations.length} locations with sufficient data\n`);

  if (locations.length === 0) {
    console.log('⚠️  No locations with weather data found.');
    console.log('💡 Run bulkHistoricalImport.js first to populate historical data.\n');
    await pool.end();
    process.exit(0);
  }

  // Process each location
  for (const location of locations) {
    await calculateLocationStats(location.id, location.location_name);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Print summary
  console.log('\n\n📈 Calculation Summary');
  console.log('======================');
  console.log(`✓ Locations processed: ${stats.locationsProcessed}`);
  console.log(`⊘ Locations skipped: ${stats.statsSkipped}`);
  console.log(`📝 Statistics inserted: ${stats.statsInserted}`);
  console.log(`⏱️  Duration: ${duration} seconds`);

  if (stats.errors.length > 0) {
    console.log(`\n⚠️  Errors encountered: ${stats.errors.length}`);
    stats.errors.forEach(err => {
      console.log(`  • ${err.location} (Month ${err.month}): ${err.error}`);
    });
  }

  console.log('\n✅ Calculation complete!\n');

  await pool.end();
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main, calculateLocationStats };
