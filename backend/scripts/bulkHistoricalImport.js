/**
 * Bulk Historical Weather Data Import Script
 *
 * Uses Visual Crossing API premium subscription to fetch and store
 * 10 years of historical weather data for major cities.
 *
 * This is a ONE-TIME operation that pre-populates the database
 * with historical data that never changes, drastically reducing
 * future API costs.
 *
 * Usage:
 *   node backend/scripts/bulkHistoricalImport.js [options]
 *
 * Options:
 *   --cities=US          Import top US cities only (default)
 *   --cities=GLOBAL      Import top global cities only
 *   --cities=ALL         Import both US and global cities
 *   --limit=N            Limit to first N cities (for testing)
 *   --start-year=YYYY    Start year for historical data (default: 2015)
 *   --end-year=YYYY      End year for historical data (default: 2025)
 *   --dry-run            Preview what would be imported without making API calls
 */

const axios = require('axios');
const { pool } = require('../config/database');
require('dotenv').config();

// Configuration
const VISUAL_CROSSING_API_KEY = process.env.VISUAL_CROSSING_API_KEY;
const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  acc[key.replace('--', '')] = value || true;
  return acc;
}, {});

const CONFIG = {
  cities: args.cities || 'US',
  limit: args.limit ? parseInt(args.limit) : null,
  startYear: args['start-year'] || 2015,
  endYear: args['end-year'] || 2025,
  dryRun: args['dry-run'] || false
};

// Top 100 US cities by population
const US_CITIES = [
  { name: 'New York', state: 'NY', lat: 40.7128, lon: -74.0060 },
  { name: 'Los Angeles', state: 'CA', lat: 34.0522, lon: -118.2437 },
  { name: 'Chicago', state: 'IL', lat: 41.8781, lon: -87.6298 },
  { name: 'Houston', state: 'TX', lat: 29.7604, lon: -95.3698 },
  { name: 'Phoenix', state: 'AZ', lat: 33.4484, lon: -112.0740 },
  { name: 'Philadelphia', state: 'PA', lat: 39.9526, lon: -75.1652 },
  { name: 'San Antonio', state: 'TX', lat: 29.4241, lon: -98.4936 },
  { name: 'San Diego', state: 'CA', lat: 32.7157, lon: -117.1611 },
  { name: 'Dallas', state: 'TX', lat: 32.7767, lon: -96.7970 },
  { name: 'San Jose', state: 'CA', lat: 37.3382, lon: -121.8863 },
  { name: 'Austin', state: 'TX', lat: 30.2672, lon: -97.7431 },
  { name: 'Jacksonville', state: 'FL', lat: 30.3322, lon: -81.6557 },
  { name: 'Fort Worth', state: 'TX', lat: 32.7555, lon: -97.3308 },
  { name: 'Columbus', state: 'OH', lat: 39.9612, lon: -82.9988 },
  { name: 'Charlotte', state: 'NC', lat: 35.2271, lon: -80.8431 },
  { name: 'San Francisco', state: 'CA', lat: 37.7749, lon: -122.4194 },
  { name: 'Indianapolis', state: 'IN', lat: 39.7684, lon: -86.1581 },
  { name: 'Seattle', state: 'WA', lat: 47.6062, lon: -122.3321 },
  { name: 'Denver', state: 'CO', lat: 39.7392, lon: -104.9903 },
  { name: 'Washington', state: 'DC', lat: 38.9072, lon: -77.0369 },
  { name: 'Boston', state: 'MA', lat: 42.3601, lon: -71.0589 },
  { name: 'El Paso', state: 'TX', lat: 31.7619, lon: -106.4850 },
  { name: 'Nashville', state: 'TN', lat: 36.1627, lon: -86.7816 },
  { name: 'Detroit', state: 'MI', lat: 42.3314, lon: -83.0458 },
  { name: 'Oklahoma City', state: 'OK', lat: 35.4676, lon: -97.5164 },
  { name: 'Portland', state: 'OR', lat: 45.5152, lon: -122.6784 },
  { name: 'Las Vegas', state: 'NV', lat: 36.1699, lon: -115.1398 },
  { name: 'Memphis', state: 'TN', lat: 35.1495, lon: -90.0490 },
  { name: 'Louisville', state: 'KY', lat: 38.2527, lon: -85.7585 },
  { name: 'Baltimore', state: 'MD', lat: 39.2904, lon: -76.6122 },
  { name: 'Milwaukee', state: 'WI', lat: 43.0389, lon: -87.9065 },
  { name: 'Albuquerque', state: 'NM', lat: 35.0844, lon: -106.6504 },
  { name: 'Tucson', state: 'AZ', lat: 32.2226, lon: -110.9747 },
  { name: 'Fresno', state: 'CA', lat: 36.7378, lon: -119.7871 },
  { name: 'Mesa', state: 'AZ', lat: 33.4152, lon: -111.8315 },
  { name: 'Sacramento', state: 'CA', lat: 38.5816, lon: -121.4944 },
  { name: 'Atlanta', state: 'GA', lat: 33.7490, lon: -84.3880 },
  { name: 'Kansas City', state: 'MO', lat: 39.0997, lon: -94.5786 },
  { name: 'Colorado Springs', state: 'CO', lat: 38.8339, lon: -104.8214 },
  { name: 'Omaha', state: 'NE', lat: 41.2565, lon: -95.9345 },
  { name: 'Raleigh', state: 'NC', lat: 35.7796, lon: -78.6382 },
  { name: 'Miami', state: 'FL', lat: 25.7617, lon: -80.1918 },
  { name: 'Long Beach', state: 'CA', lat: 33.7701, lon: -118.1937 },
  { name: 'Virginia Beach', state: 'VA', lat: 36.8529, lon: -75.9780 },
  { name: 'Oakland', state: 'CA', lat: 37.8044, lon: -122.2712 },
  { name: 'Minneapolis', state: 'MN', lat: 44.9778, lon: -93.2650 },
  { name: 'Tulsa', state: 'OK', lat: 36.1540, lon: -95.9928 },
  { name: 'Tampa', state: 'FL', lat: 27.9506, lon: -82.4572 },
  { name: 'Arlington', state: 'TX', lat: 32.7357, lon: -97.1081 },
  { name: 'New Orleans', state: 'LA', lat: 29.9511, lon: -90.0715 },
  // Add 50 more cities here for top 100...
  { name: 'Wichita', state: 'KS', lat: 37.6872, lon: -97.3301 },
  { name: 'Cleveland', state: 'OH', lat: 41.4993, lon: -81.6944 },
  { name: 'Bakersfield', state: 'CA', lat: 35.3733, lon: -119.0187 },
  { name: 'Aurora', state: 'CO', lat: 39.7294, lon: -104.8319 },
  { name: 'Anaheim', state: 'CA', lat: 33.8366, lon: -117.9143 },
  { name: 'Honolulu', state: 'HI', lat: 21.3099, lon: -157.8581 },
  { name: 'Santa Ana', state: 'CA', lat: 33.7455, lon: -117.8677 },
  { name: 'Riverside', state: 'CA', lat: 33.9533, lon: -117.3961 },
  { name: 'Corpus Christi', state: 'TX', lat: 27.8006, lon: -97.3964 },
  { name: 'Lexington', state: 'KY', lat: 38.0406, lon: -84.5037 },
  { name: 'Stockton', state: 'CA', lat: 37.9577, lon: -121.2908 },
  { name: 'Henderson', state: 'NV', lat: 36.0395, lon: -114.9817 },
  { name: 'Saint Paul', state: 'MN', lat: 44.9537, lon: -93.0900 },
  { name: 'Cincinnati', state: 'OH', lat: 39.1031, lon: -84.5120 },
  { name: 'Pittsburgh', state: 'PA', lat: 40.4406, lon: -79.9959 },
  { name: 'Greensboro', state: 'NC', lat: 36.0726, lon: -79.7920 },
  { name: 'Anchorage', state: 'AK', lat: 61.2181, lon: -149.9003 },
  { name: 'Plano', state: 'TX', lat: 33.0198, lon: -96.6989 },
  { name: 'Lincoln', state: 'NE', lat: 40.8136, lon: -96.7026 },
  { name: 'Orlando', state: 'FL', lat: 28.5383, lon: -81.3792 },
  { name: 'Irvine', state: 'CA', lat: 33.6846, lon: -117.8265 },
  { name: 'Newark', state: 'NJ', lat: 40.7357, lon: -74.1724 },
  { name: 'Durham', state: 'NC', lat: 35.9940, lon: -78.8986 },
  { name: 'Chula Vista', state: 'CA', lat: 32.6401, lon: -117.0842 },
  { name: 'Toledo', state: 'OH', lat: 41.6528, lon: -83.5379 },
  { name: 'Fort Wayne', state: 'IN', lat: 41.0793, lon: -85.1394 },
  { name: 'St. Petersburg', state: 'FL', lat: 27.7676, lon: -82.6403 },
  { name: 'Laredo', state: 'TX', lat: 27.5306, lon: -99.4803 },
  { name: 'Jersey City', state: 'NJ', lat: 40.7178, lon: -74.0431 },
  { name: 'Chandler', state: 'AZ', lat: 33.3062, lon: -111.8413 },
  { name: 'Madison', state: 'WI', lat: 43.0731, lon: -89.4012 },
  { name: 'Lubbock', state: 'TX', lat: 33.5779, lon: -101.8552 },
  { name: 'Scottsdale', state: 'AZ', lat: 33.4942, lon: -111.9261 },
  { name: 'Reno', state: 'NV', lat: 39.5296, lon: -119.8138 },
  { name: 'Buffalo', state: 'NY', lat: 42.8864, lon: -78.8784 },
  { name: 'Gilbert', state: 'AZ', lat: 33.3528, lon: -111.7890 },
  { name: 'Glendale', state: 'AZ', lat: 33.5387, lon: -112.1860 },
  { name: 'North Las Vegas', state: 'NV', lat: 36.1989, lon: -115.1175 },
  { name: 'Winston-Salem', state: 'NC', lat: 36.0999, lon: -80.2442 },
  { name: 'Chesapeake', state: 'VA', lat: 36.7682, lon: -76.2875 },
  { name: 'Norfolk', state: 'VA', lat: 36.8508, lon: -76.2859 },
  { name: 'Fremont', state: 'CA', lat: 37.5485, lon: -121.9886 },
  { name: 'Garland', state: 'TX', lat: 32.9126, lon: -96.6389 },
  { name: 'Irving', state: 'TX', lat: 32.8140, lon: -96.9489 },
  { name: 'Hialeah', state: 'FL', lat: 25.8576, lon: -80.2781 },
  { name: 'Richmond', state: 'VA', lat: 37.5407, lon: -77.4360 },
  { name: 'Boise', state: 'ID', lat: 43.6150, lon: -116.2023 },
  { name: 'Spokane', state: 'WA', lat: 47.6588, lon: -117.4260 }
];

// Top 50 global cities (non-US)
const GLOBAL_CITIES = [
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708 },
  { name: 'Hong Kong', country: 'China', lat: 22.3193, lon: 114.1694 },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777 },
  { name: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737 },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.9780 },
  { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332 },
  { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333 },
  { name: 'Moscow', country: 'Russia', lat: 55.7558, lon: 37.6173 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784 },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018 },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lon: 106.8456 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357 },
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lon: 3.3792 },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lon: -58.3816 },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lon: -43.1729 },
  { name: 'Delhi', country: 'India', lat: 28.7041, lon: 77.1025 },
  { name: 'Manila', country: 'Philippines', lat: 14.5995, lon: 120.9842 },
  { name: 'Karachi', country: 'Pakistan', lat: 24.8607, lon: 67.0011 },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lon: 4.9041 },
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038 },
  { name: 'Barcelona', country: 'Spain', lat: 41.3851, lon: 2.1734 },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964 },
  { name: 'Athens', country: 'Greece', lat: 37.9838, lon: 23.7275 },
  { name: 'Vienna', country: 'Austria', lat: 48.2082, lon: 16.3738 },
  { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lon: 18.0686 },
  { name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lon: 12.5683 },
  { name: 'Oslo', country: 'Norway', lat: 59.9139, lon: 10.7522 },
  { name: 'Helsinki', country: 'Finland', lat: 60.1699, lon: 24.9384 },
  { name: 'Warsaw', country: 'Poland', lat: 52.2297, lon: 21.0122 },
  { name: 'Prague', country: 'Czech Republic', lat: 50.0755, lon: 14.4378 },
  { name: 'Budapest', country: 'Hungary', lat: 47.4979, lon: 19.0402 },
  { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lon: -9.1393 },
  { name: 'Dublin', country: 'Ireland', lat: 53.3498, lon: -6.2603 },
  { name: 'Brussels', country: 'Belgium', lat: 50.8503, lon: 4.3517 },
  { name: 'Zurich', country: 'Switzerland', lat: 47.3769, lon: 8.5417 },
  { name: 'Geneva', country: 'Switzerland', lat: 46.2044, lon: 6.1432 },
  { name: 'Vancouver', country: 'Canada', lat: 49.2827, lon: -123.1207 },
  { name: 'Montreal', country: 'Canada', lat: 45.5017, lon: -73.5673 },
  { name: 'Melbourne', country: 'Australia', lat: -37.8136, lon: 144.9631 },
  { name: 'Brisbane', country: 'Australia', lat: -27.4698, lon: 153.0251 },
  { name: 'Auckland', country: 'New Zealand', lat: -36.8485, lon: 174.7633 },
  { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lon: 18.4241 },
  { name: 'Tel Aviv', country: 'Israel', lat: 32.0853, lon: 34.7818 }
];

// Statistics
const stats = {
  citiesProcessed: 0,
  citiesSkipped: 0,
  apiCallsMade: 0,
  recordsInserted: 0,
  errors: []
};

/**
 * Fetch historical weather data for a single city
 */
async function fetchHistoricalData(city, startDate, endDate) {
  const location = `${city.lat},${city.lon}`;
  const url = `${BASE_URL}/${location}/${startDate}/${endDate}`;

  const params = {
    key: VISUAL_CROSSING_API_KEY,
    unitGroup: 'metric',
    include: 'days',
    elements: 'datetime,tempmax,tempmin,temp,feelslike,humidity,precip,precipprob,precipcover,preciptype,snow,snowdepth,windgust,windspeed,winddir,pressure,cloudcover,visibility,solarradiation,solarenergy,uvindex,sunrise,sunset,conditions,description,icon'
  };

  try {
    const response = await axios.get(url, { params, timeout: 30000 });
    stats.apiCallsMade++;
    return response.data;
  } catch (error) {
    throw new Error(`API call failed: ${error.message}`);
  }
}

/**
 * Insert or update location in database
 */
async function upsertLocation(city) {
  const isUS = city.state !== undefined;

  const query = `
    INSERT INTO locations (city_name, country, country_code, state, latitude, longitude, timezone, elevation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      city_name = VALUES(city_name),
      country = VALUES(country),
      state = VALUES(state),
      timezone = VALUES(timezone),
      elevation = VALUES(elevation),
      updated_at = CURRENT_TIMESTAMP
  `;

  const values = [
    city.name,
    isUS ? 'United States' : city.country,
    isUS ? 'US' : null,
    isUS ? city.state : null,
    city.lat,
    city.lon,
    null, // Will be populated from API response
    null  // Will be populated from API response
  ];

  const [result] = await pool.query(query, values);

  // Get the location ID (either inserted or existing)
  if (result.insertId) {
    return result.insertId;
  } else {
    // Location already exists, fetch its ID
    const [rows] = await pool.query(
      'SELECT id FROM locations WHERE latitude = ? AND longitude = ?',
      [city.lat, city.lon]
    );
    return rows[0].id;
  }
}

/**
 * Insert weather data for a location
 */
async function insertWeatherData(locationId, weatherData) {
  if (!weatherData.days || weatherData.days.length === 0) {
    return 0;
  }

  const query = `
    INSERT INTO weather_data (
      location_id, observation_date, temperature_high, temperature_low,
      temperature_avg, feels_like, humidity, pressure, wind_speed,
      wind_direction, precipitation, precipitation_probability,
      cloud_cover, uv_index, visibility, weather_condition,
      weather_description, sunrise, sunset, data_source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      temperature_high = VALUES(temperature_high),
      temperature_low = VALUES(temperature_low),
      temperature_avg = VALUES(temperature_avg),
      feels_like = VALUES(feels_like),
      humidity = VALUES(humidity),
      pressure = VALUES(pressure),
      wind_speed = VALUES(wind_speed),
      wind_direction = VALUES(wind_direction),
      precipitation = VALUES(precipitation),
      precipitation_probability = VALUES(precipitation_probability),
      cloud_cover = VALUES(cloud_cover),
      uv_index = VALUES(uv_index),
      visibility = VALUES(visibility),
      weather_condition = VALUES(weather_condition),
      weather_description = VALUES(weather_description),
      sunrise = VALUES(sunrise),
      sunset = VALUES(sunset)
  `;

  let insertedCount = 0;

  for (const day of weatherData.days) {
    const values = [
      locationId,
      day.datetime,
      day.tempmax || null,
      day.tempmin || null,
      day.temp || null,
      day.feelslike || null,
      day.humidity || null,
      day.pressure || null,
      day.windspeed || null,
      day.winddir || null,
      day.precip || 0,
      day.precipprob || null,
      day.cloudcover || null,
      day.uvindex || null,
      day.visibility || null,
      day.conditions || null,
      day.description || null,
      day.sunrise || null,
      day.sunset || null,
      'visualcrossing'
    ];

    try {
      await pool.query(query, values);
      insertedCount++;
    } catch (error) {
      // Skip duplicates or constraint violations
      if (!error.message.includes('Duplicate entry')) {
        console.error(`  ⚠️  Error inserting day ${day.datetime}: ${error.message}`);
      }
    }
  }

  return insertedCount;
}

/**
 * Process a single city
 */
async function processCity(city, index, total) {
  const cityLabel = city.state
    ? `${city.name}, ${city.state}`
    : `${city.name}, ${city.country}`;

  console.log(`\n[${index + 1}/${total}] Processing: ${cityLabel}`);

  try {
    // Check if we already have data for this city
    const [existingData] = await pool.query(
      `SELECT COUNT(*) as count FROM weather_data wd
       JOIN locations l ON wd.location_id = l.id
       WHERE l.latitude = ? AND l.longitude = ?
       AND wd.observation_date >= ? AND wd.observation_date <= ?`,
      [city.lat, city.lon, `${CONFIG.startYear}-01-01`, `${CONFIG.endYear}-12-31`]
    );

    const expectedDays = (CONFIG.endYear - CONFIG.startYear + 1) * 365;
    const existingDays = existingData[0].count;

    if (existingDays >= expectedDays * 0.95) { // 95% threshold to account for leap years
      console.log(`  ✓ Already populated (${existingDays} days), skipping...`);
      stats.citiesSkipped++;
      return;
    }

    if (CONFIG.dryRun) {
      console.log(`  [DRY RUN] Would fetch ${CONFIG.startYear}-${CONFIG.endYear} data`);
      console.log(`  [DRY RUN] Would insert ~${expectedDays} records`);
      stats.citiesProcessed++;
      return;
    }

    // Insert/update location
    const locationId = await upsertLocation(city);
    console.log(`  ✓ Location ID: ${locationId}`);

    // Fetch historical data (Visual Crossing allows up to 1024 days per request)
    // We'll break it into yearly chunks for reliability
    let totalInserted = 0;

    for (let year = CONFIG.startYear; year <= CONFIG.endYear; year++) {
      const startDate = `${year}-01-01`;
      const endDate = year === CONFIG.endYear ?
        new Date().toISOString().split('T')[0] : // Today if current year
        `${year}-12-31`;

      console.log(`  📅 Fetching ${year}...`);

      try {
        const weatherData = await fetchHistoricalData(city, startDate, endDate);
        const inserted = await insertWeatherData(locationId, weatherData);
        totalInserted += inserted;
        console.log(`    ✓ Inserted ${inserted} days`);

        // Rate limiting: wait 200ms between API calls to be respectful
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`    ✗ Error fetching ${year}: ${error.message}`);
        stats.errors.push({ city: cityLabel, year, error: error.message });
      }
    }

    console.log(`  ✅ Complete: ${totalInserted} total records inserted`);
    stats.citiesProcessed++;
    stats.recordsInserted += totalInserted;

  } catch (error) {
    console.error(`  ✗ Failed: ${error.message}`);
    stats.errors.push({ city: cityLabel, error: error.message });
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🌍 Bulk Historical Weather Data Import');
  console.log('=====================================\n');
  console.log(`Configuration:`);
  console.log(`  • Cities: ${CONFIG.cities}`);
  console.log(`  • Date Range: ${CONFIG.startYear} - ${CONFIG.endYear}`);
  console.log(`  • Limit: ${CONFIG.limit || 'None'}`);
  console.log(`  • Dry Run: ${CONFIG.dryRun ? 'Yes' : 'No'}`);
  console.log('');

  // Select cities based on configuration
  let citiesToProcess = [];

  if (CONFIG.cities === 'US' || CONFIG.cities === 'ALL') {
    citiesToProcess = [...citiesToProcess, ...US_CITIES];
  }

  if (CONFIG.cities === 'GLOBAL' || CONFIG.cities === 'ALL') {
    citiesToProcess = [...citiesToProcess, ...GLOBAL_CITIES];
  }

  if (CONFIG.limit) {
    citiesToProcess = citiesToProcess.slice(0, CONFIG.limit);
  }

  console.log(`📊 Total cities to process: ${citiesToProcess.length}\n`);

  const startTime = Date.now();

  // Process cities sequentially (to respect API rate limits)
  for (let i = 0; i < citiesToProcess.length; i++) {
    await processCity(citiesToProcess[i], i, citiesToProcess.length);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);

  // Print summary
  console.log('\n\n📈 Import Summary');
  console.log('=================');
  console.log(`✓ Cities processed: ${stats.citiesProcessed}`);
  console.log(`⊘ Cities skipped: ${stats.citiesSkipped}`);
  console.log(`📞 API calls made: ${stats.apiCallsMade}`);
  console.log(`📝 Records inserted: ${stats.recordsInserted}`);
  console.log(`⏱️  Duration: ${duration} minutes`);
  console.log(`🔢 Remaining API calls this month: ~${(9997560 - stats.apiCallsMade).toLocaleString()}`);

  if (stats.errors.length > 0) {
    console.log(`\n⚠️  Errors encountered: ${stats.errors.length}`);
    stats.errors.forEach(err => {
      console.log(`  • ${err.city}${err.year ? ` (${err.year})` : ''}: ${err.error}`);
    });
  }

  console.log('\n✅ Import complete!\n');

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

module.exports = { main, fetchHistoricalData, insertWeatherData };
