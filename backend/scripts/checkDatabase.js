/**
 * Database Status Checker
 *
 * Quick diagnostic tool to see what's currently in the database
 * and identify what needs to be imported.
 */

const { pool } = require('../config/database');

async function checkDatabase() {
  console.log('\n📊 Database Status Report');
  console.log('=========================\n');

  try {
    // Check locations
    const [locations] = await pool.query('SELECT COUNT(*) as count FROM locations');
    console.log(`📍 Locations: ${locations[0].count}`);

    if (locations[0].count > 0) {
      const [locationDetails] = await pool.query(`
        SELECT city_name, state, country, latitude, longitude
        FROM locations
        ORDER BY created_at DESC
        LIMIT 5
      `);
      console.log('   Latest locations:');
      locationDetails.forEach(loc => {
        const label = loc.state
          ? `${loc.city_name}, ${loc.state}`
          : `${loc.city_name}, ${loc.country}`;
        console.log(`   • ${label} (${loc.latitude}, ${loc.longitude})`);
      });
    }

    // Check weather data
    const [weatherData] = await pool.query('SELECT COUNT(*) as count FROM weather_data');
    console.log(`\n🌤️  Weather Data Records: ${weatherData[0].count.toLocaleString()}`);

    if (weatherData[0].count > 0) {
      const [dateRange] = await pool.query(`
        SELECT
          MIN(observation_date) as earliest,
          MAX(observation_date) as latest,
          COUNT(DISTINCT location_id) as locations_with_data
        FROM weather_data
      `);
      console.log(`   Date range: ${dateRange[0].earliest} to ${dateRange[0].latest}`);
      console.log(`   Locations with data: ${dateRange[0].locations_with_data}`);

      // Coverage by location
      const [coverage] = await pool.query(`
        SELECT
          l.city_name,
          l.state,
          l.country,
          COUNT(*) as days,
          MIN(wd.observation_date) as first_date,
          MAX(wd.observation_date) as last_date
        FROM locations l
        JOIN weather_data wd ON l.id = wd.location_id
        GROUP BY l.id
        ORDER BY days DESC
        LIMIT 10
      `);

      if (coverage.length > 0) {
        console.log('\n   Top 10 locations by data coverage:');
        coverage.forEach(loc => {
          const label = loc.state
            ? `${loc.city_name}, ${loc.state}`
            : `${loc.city_name}, ${loc.country}`;
          const years = Math.round(loc.days / 365 * 10) / 10;
          console.log(`   • ${label}: ${loc.days} days (~${years} years)`);
        });
      }
    }

    // Check climate stats
    const [climateStats] = await pool.query('SELECT COUNT(*) as count FROM climate_stats');
    console.log(`\n📈 Climate Statistics: ${climateStats[0].count}`);

    if (climateStats[0].count > 0) {
      const [statsDetails] = await pool.query(`
        SELECT COUNT(DISTINCT location_id) as locations
        FROM climate_stats
      `);
      console.log(`   Locations with climate stats: ${statsDetails[0].locations}`);

      const [sampleStats] = await pool.query(`
        SELECT
          l.city_name,
          l.state,
          l.country,
          COUNT(*) as months
        FROM climate_stats cs
        JOIN locations l ON cs.location_id = l.id
        GROUP BY cs.location_id
        HAVING months = 12
        LIMIT 5
      `);

      if (sampleStats.length > 0) {
        console.log('   Sample locations with complete stats (12 months):');
        sampleStats.forEach(loc => {
          const label = loc.state
            ? `${loc.city_name}, ${loc.state}`
            : `${loc.city_name}, ${loc.country}`;
          console.log(`   • ${label}`);
        });
      }
    }

    // Check API cache
    const [apiCache] = await pool.query('SELECT COUNT(*) as count FROM api_cache');
    console.log(`\n💾 API Cache Entries: ${apiCache[0].count}`);

    if (apiCache[0].count > 0) {
      const [cacheDetails] = await pool.query(`
        SELECT
          api_source,
          COUNT(*) as entries,
          MIN(created_at) as oldest,
          MAX(created_at) as newest
        FROM api_cache
        GROUP BY api_source
      `);
      console.log('   By API source:');
      cacheDetails.forEach(cache => {
        console.log(`   • ${cache.api_source}: ${cache.entries} entries`);
      });
    }

    // Check users
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`\n👥 Users: ${users[0].count}`);

    // Recommendations
    console.log('\n💡 Recommendations');
    console.log('==================\n');

    if (weatherData[0].count === 0) {
      console.log('⚠️  No historical weather data found!');
      console.log('   👉 Run: node backend/scripts/bulkHistoricalImport.js --cities=US --limit=5 --dry-run');
      console.log('   👉 Then: node backend/scripts/bulkHistoricalImport.js --cities=US --limit=5');
    } else if (weatherData[0].count < 100000) {
      console.log('📊 Limited historical data. Consider importing more cities:');
      console.log('   👉 node backend/scripts/bulkHistoricalImport.js --cities=US');
    } else {
      console.log('✅ Good amount of historical data!');
    }

    if (climateStats[0].count === 0 && weatherData[0].count > 0) {
      console.log('\n⚠️  No climate statistics calculated from existing data!');
      console.log('   👉 Run: node backend/scripts/calculateClimateStats.js');
    } else if (climateStats[0].count > 0) {
      console.log('✅ Climate statistics calculated!');
    }

    console.log('\n📖 For full documentation:');
    console.log('   cat backend/scripts/README.md\n');

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    console.error('\n💡 Ensure database is initialized:');
    console.log('   docker-compose up -d');
    console.log('   node -e "require(\'./backend/config/database\').initializeDatabase()"');
  }

  await pool.end();
}

if (require.main === module) {
  checkDatabase().catch(console.error);
}

module.exports = { checkDatabase };
