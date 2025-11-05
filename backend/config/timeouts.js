/**
 * Timeout Configuration
 *
 * Centralized timeout values for backend services.
 * All values in milliseconds.
 *
 * Purpose:
 * - Self-documenting timeout values
 * - Easy to adjust based on environment
 * - Consistent timeout handling across services
 */

module.exports = {
  /**
   * External API Request Timeouts
   * These values should account for network latency and API processing time
   */
  API_TIMEOUTS: {
    // Visual Crossing Weather API
    WEATHER_API: 10000,              // 10 seconds - Weather data requests
    WEATHER_API_HISTORICAL: 15000,   // 15 seconds - Historical data (larger response)

    // OpenWeather API
    GEOCODING_API: 5000,             // 5 seconds - Location geocoding
    OPENWEATHER_TILES: 3000,         // 3 seconds - Map tile requests

    // Open-Meteo API
    AIR_QUALITY_API: 10000,          // 10 seconds - Air quality data

    // Anthropic Claude API
    AI_VALIDATION: 10000,            // 10 seconds - Quick query validation
    AI_ANALYSIS: 20000,              // 20 seconds - Full AI analysis
    AI_OVERALL: 30000,               // 30 seconds - Overall AI request timeout
  },

  /**
   * Retry Configuration
   * For exponential backoff retry logic
   */
  RETRY: {
    INITIAL_DELAY: 1000,             // 1 second - Initial retry delay
    MAX_ATTEMPTS: 2,                 // Maximum retry attempts (3 total tries)
    EXPONENTIAL_BASE: 2,             // 2x multiplier for exponential backoff
  },

  /**
   * Throttling and Rate Limiting
   * Prevent overwhelming external APIs
   */
  THROTTLE: {
    QUEUE_CHECK_INTERVAL: 50,        // 50ms - Check throttle queue
    MIN_REQUEST_INTERVAL: 100,       // 100ms - Minimum time between requests
  },

  /**
   * Background Task Intervals
   */
  INTERVALS: {
    CACHE_CLEANUP: 3600000,          // 1 hour - Auto cleanup expired cache entries
    WEATHER_REFRESH: 1800000,        // 30 minutes - Background weather data refresh (if implemented)
  },

  /**
   * Database Query Timeouts
   */
  DATABASE: {
    QUERY_TIMEOUT: 5000,             // 5 seconds - Standard query timeout
    COMPLEX_QUERY_TIMEOUT: 15000,    // 15 seconds - Complex queries (aggregations, joins)
  },
};
