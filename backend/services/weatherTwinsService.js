const { pool } = require('../config/database');

/**
 * Weather Twins Service
 * Finds cities with similar current weather conditions
 */

/**
 * Calculate similarity score between two weather conditions
 * @param {Object} weather1 - First weather condition object
 * @param {Object} weather2 - Second weather condition object
 * @returns {Object} - Similarity breakdown and overall score
 */
function calculateSimilarity(weather1, weather2) {
  const scores = {};

  // Temperature similarity (40% weight)
  // Perfect match: 100, drops by 5 points per degree difference
  const tempDiff = Math.abs(weather1.temperature - weather2.temperature);
  scores.temperature = Math.max(0, 100 - (tempDiff * 5));

  // Humidity similarity (20% weight)
  // Perfect match: 100, drops by 2 points per percentage point difference
  const humidityDiff = Math.abs(weather1.humidity - weather2.humidity);
  scores.humidity = Math.max(0, 100 - (humidityDiff * 2));

  // Precipitation similarity (20% weight)
  // Compare precipitation amounts (both must have precip or both must not)
  const precip1 = weather1.precipitation || 0;
  const precip2 = weather2.precipitation || 0;

  if (precip1 === 0 && precip2 === 0) {
    scores.precipitation = 100; // Both dry
  } else if (precip1 === 0 || precip2 === 0) {
    scores.precipitation = 0; // One dry, one wet
  } else {
    // Both have precipitation, compare amounts
    const precipDiff = Math.abs(precip1 - precip2);
    scores.precipitation = Math.max(0, 100 - (precipDiff * 20));
  }

  // Wind speed similarity (10% weight)
  const windDiff = Math.abs((weather1.wind_speed || 0) - (weather2.wind_speed || 0));
  scores.wind = Math.max(0, 100 - (windDiff * 5));

  // Weather condition similarity (10% weight)
  // Exact match: 100, partial match: 50, no match: 0
  const condition1 = (weather1.weather_condition || '').toLowerCase();
  const condition2 = (weather2.weather_condition || '').toLowerCase();

  if (condition1 === condition2) {
    scores.conditions = 100;
  } else if (condition1.includes(condition2) || condition2.includes(condition1)) {
    scores.conditions = 50;
  } else {
    scores.conditions = 0;
  }

  // Calculate weighted overall score
  const overall = Math.round(
    scores.temperature * 0.40 +
    scores.humidity * 0.20 +
    scores.precipitation * 0.20 +
    scores.wind * 0.10 +
    scores.conditions * 0.10
  );

  return {
    overall,
    breakdown: {
      temperature: Math.round(scores.temperature),
      humidity: Math.round(scores.humidity),
      precipitation: Math.round(scores.precipitation),
      wind: Math.round(scores.wind),
      conditions: Math.round(scores.conditions)
    }
  };
}

/**
 * Find weather twins for a given location
 * @param {number} locationId - Database ID of the location
 * @param {Object} options - Search options
 * @param {string} options.scope - Search scope: 'us', 'north-america', 'worldwide'
 * @param {number} options.limit - Maximum number of twins to return (default: 5)
 * @param {number} options.minSimilarity - Minimum similarity score (default: 80)
 * @returns {Promise<Object>} - Weather twins data
 */
async function findWeatherTwins(locationId, options = {}) {
  const {
    scope = 'us',
    limit = 5,
    minSimilarity = 80
  } = options;

  try {
    // Get the reference location's current weather
    // TEMPORARY: Using 2025-11-01 instead of CURDATE() for testing
    const [referenceWeather] = await pool.query(
      `SELECT
        l.id, l.city_name, l.state, l.country, l.country_code,
        l.latitude, l.longitude,
        w.temperature_avg as temperature,
        w.humidity,
        w.precipitation,
        w.wind_speed,
        w.weather_condition,
        w.weather_description,
        w.observation_date
      FROM locations l
      JOIN weather_data w ON l.id = w.location_id
      WHERE l.id = ?
        AND w.observation_date = '2025-11-01'
      ORDER BY w.observation_date DESC, w.created_at DESC
      LIMIT 1`,
      [locationId]
    );

    if (!referenceWeather || referenceWeather.length === 0) {
      return {
        success: false,
        error: 'No current weather data found for this location'
      };
    }

    const refWeather = referenceWeather[0];

    // Build country filter based on scope
    let countryFilter = '';
    let countryParams = [];

    if (scope === 'us') {
      countryFilter = 'AND l.country_code = ?';
      countryParams = ['US'];
    } else if (scope === 'north-america') {
      countryFilter = 'AND l.country_code IN (?, ?, ?)';
      countryParams = ['US', 'CA', 'MX'];
    }
    // For 'worldwide', no filter needed

    // Find similar weather conditions
    // We use temperature range as the primary filter for performance
    const tempTolerance = 10; // ±10°F initial filter

    // TEMPORARY: Using 2025-11-01 instead of CURDATE() for testing
    const [candidates] = await pool.query(
      `SELECT
        l.id, l.city_name, l.state, l.country, l.country_code,
        l.latitude, l.longitude,
        w.temperature_avg as temperature,
        w.humidity,
        w.precipitation,
        w.wind_speed,
        w.weather_condition,
        w.weather_description,
        w.cloud_cover,
        w.feels_like
      FROM locations l
      JOIN weather_data w ON l.id = w.location_id
      WHERE l.id != ?
        AND w.observation_date = '2025-11-01'
        AND w.temperature_avg BETWEEN ? AND ?
        ${countryFilter}
      ORDER BY w.created_at DESC`,
      [
        locationId,
        refWeather.temperature - tempTolerance,
        refWeather.temperature + tempTolerance,
        ...countryParams
      ]
    );

    // Calculate similarity scores for all candidates
    const twins = candidates.map(candidate => {
      const similarity = calculateSimilarity(refWeather, candidate);

      return {
        location: {
          id: candidate.id,
          name: candidate.city_name,
          state: candidate.state,
          country: candidate.country,
          country_code: candidate.country_code,
          latitude: candidate.latitude,
          longitude: candidate.longitude
        },
        conditions: {
          temperature: candidate.temperature,
          feelsLike: candidate.feels_like,
          humidity: candidate.humidity,
          precipitation: candidate.precipitation,
          windSpeed: candidate.wind_speed,
          weatherCondition: candidate.weather_condition,
          weatherDescription: candidate.weather_description,
          cloudCover: candidate.cloud_cover
        },
        similarity: similarity
      };
    });

    // Filter by minimum similarity and sort by score
    const filteredTwins = twins
      .filter(twin => twin.similarity.overall >= minSimilarity)
      .sort((a, b) => b.similarity.overall - a.similarity.overall)
      .slice(0, limit);

    return {
      success: true,
      reference: {
        location: {
          id: refWeather.id,
          name: refWeather.city_name,
          state: refWeather.state,
          country: refWeather.country,
          country_code: refWeather.country_code,
          latitude: refWeather.latitude,
          longitude: refWeather.longitude
        },
        conditions: {
          temperature: refWeather.temperature,
          humidity: refWeather.humidity,
          precipitation: refWeather.precipitation,
          windSpeed: refWeather.wind_speed,
          weatherCondition: refWeather.weather_condition,
          weatherDescription: refWeather.weather_description
        },
        date: refWeather.observation_date
      },
      twins: filteredTwins,
      searchParams: {
        scope,
        limit,
        minSimilarity,
        candidatesFound: candidates.length,
        twinsFound: filteredTwins.length
      }
    };

  } catch (error) {
    console.error('Error finding weather twins:', error);
    return {
      success: false,
      error: 'Failed to find weather twins: ' + error.message
    };
  }
}

module.exports = {
  findWeatherTwins,
  calculateSimilarity
};
