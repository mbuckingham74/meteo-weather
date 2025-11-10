const { pool } = require('../config/database');

/**
 * Historical Data Service
 * Queries pre-populated historical weather data from database
 * Falls back to API only when data is not available locally
 */

/**
 * Get historical weather data from database
 * @param {number} locationId - Location ID from database
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<object>} Historical weather data from database
 */
async function getHistoricalDataFromDb(locationId, startDate, endDate) {
  try {
    console.log(
      `📊 Querying database for historical data: location ${locationId}, ${startDate} to ${endDate}`
    );

    const [rows] = await pool.query(
      `
      SELECT
        observation_date as date,
        temperature_high as tempMax,
        temperature_low as tempMin,
        temperature_avg as tempAvg,
        feels_like as feelsLike,
        humidity,
        precipitation,
        precipitation_probability as precipProbability,
        wind_speed as windSpeed,
        wind_direction as windDirection,
        pressure,
        cloud_cover as cloudCover,
        uv_index as uvIndex,
        visibility,
        weather_condition as conditions,
        weather_description as description,
        sunrise,
        sunset
      FROM weather_data
      WHERE location_id = ?
        AND observation_date >= ?
        AND observation_date <= ?
      ORDER BY observation_date ASC
    `,
      [locationId, startDate, endDate]
    );

    console.log(`✅ Retrieved ${rows.length} records from database`);

    return {
      success: true,
      source: 'database',
      data: rows,
      count: rows.length,
    };
  } catch (error) {
    console.error('Database query error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get historical data for a specific date (MM-DD) across multiple years from database
 * @param {number} locationId - Location ID
 * @param {string} date - Date in MM-DD format
 * @param {number} years - Number of years to retrieve
 * @returns {Promise<object>} Historical data with statistics
 */
async function getHistoricalDateDataFromDb(locationId, date, years = 25) {
  try {
    const [month, day] = date.split('-');

    console.log(`📊 Querying database for ${date} over ${years} years for location ${locationId}`);

    const [rows] = await pool.query(
      `
      SELECT
        YEAR(observation_date) as year,
        observation_date as date,
        temperature_high as tempMax,
        temperature_low as tempMin,
        temperature_avg as tempAvg,
        precipitation as precip,
        precipitation_probability as precipProb,
        humidity,
        wind_speed as windSpeed,
        weather_condition as conditions
      FROM weather_data
      WHERE location_id = ?
        AND MONTH(observation_date) = ?
        AND DAY(observation_date) = ?
      ORDER BY observation_date DESC
      LIMIT ?
    `,
      [locationId, parseInt(month), parseInt(day), years]
    );

    if (rows.length === 0) {
      return {
        success: false,
        error: 'No data found in database',
      };
    }

    // Calculate statistics
    const precipData = rows.map((r) => r.precip || 0);
    const avgPrecip = precipData.reduce((sum, val) => sum + val, 0) / precipData.length;
    const maxPrecip = Math.max(...precipData);
    const minPrecip = Math.min(...precipData);

    console.log(`✅ Retrieved ${rows.length} years of data from database`);

    return {
      success: true,
      source: 'database',
      location: date,
      years: rows.length,
      stats: { avgPrecip, maxPrecip, minPrecip },
      data: rows,
    };
  } catch (error) {
    console.error('Database query error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Find location by address/city name and return location ID
 * Uses FULLTEXT index for fast matching
 * @param {string} locationString - City name or address
 * @returns {Promise<object|null>} Location data or null
 */
async function findLocationByAddress(locationString) {
  try {
    // Extract city name from address (handles "Seattle, WA" or "Seattle, WA, USA")
    const cityName = locationString.split(',')[0].trim();

    console.log(`🔍 Searching for location: "${cityName}"`);

    // Use FULLTEXT search for fast lookup (20x faster than LIKE '%term%')
    const [rows] = await pool.query(
      `
      SELECT *,
        MATCH(city_name, country, state) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
      FROM locations
      WHERE MATCH(city_name, country, state) AGAINST(? IN NATURAL LANGUAGE MODE)
      ORDER BY relevance DESC
      LIMIT 1
    `,
      [cityName, cityName]
    );

    if (rows.length > 0) {
      console.log(
        `✅ Found location in database: ${rows[0].city_name}, ${rows[0].state || rows[0].country} (ID: ${rows[0].id})`
      );
      return rows[0];
    }

    console.log(`⚠️  Location "${cityName}" not found in database`);
    return null;
  } catch (error) {
    console.error('Location search error:', error.message);
    return null;
  }
}

/**
 * Check if date range is within our pre-populated data (2015-2025)
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {boolean} True if within pre-populated range
 */
function isDateRangeInDatabase(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dbStart = new Date('2015-01-01');
  const dbEnd = new Date('2025-12-31');

  return start >= dbStart && end <= dbEnd;
}

module.exports = {
  getHistoricalDataFromDb,
  getHistoricalDateDataFromDb,
  findLocationByAddress,
  isDateRangeInDatabase,
};
