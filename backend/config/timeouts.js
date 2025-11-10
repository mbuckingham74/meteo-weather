/**
 * Backend Timeout Configuration
 *
 * Centralized timeout values for backend services.
 * All values in milliseconds.
 *
 * Purpose:
 * - Self-documenting timeout values
 * - Easy to adjust based on environment
 * - Consistent timeout handling across services
 * - Environment-configurable for different deployment scenarios
 *
 * Environment Variables:
 * - API_TIMEOUT_DEFAULT - Override default API timeout
 * - API_TIMEOUT_WEATHER - Override weather API timeout
 * - API_TIMEOUT_AI - Override AI API timeout
 * - DB_QUERY_TIMEOUT - Override database query timeout
 * - RETRY_MAX_ATTEMPTS - Override max retry attempts
 *
 * @example
 * // In backend/.env:
 * API_TIMEOUT_DEFAULT=20000
 * DB_QUERY_TIMEOUT=10000
 * RETRY_MAX_ATTEMPTS=3
 */

/**
 * Helper to get environment variable as number with fallback
 * @param {string} key - Environment variable key
 * @param {number} defaultValue - Default value if env var not set
 * @returns {number} Parsed value or default
 */
function getEnvTimeout(key, defaultValue) {
  const value = process.env[key];
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

const TIMEOUTS = {
  /**
   * External API Request Timeouts
   * These values should account for network latency and API processing time
   *
   * Rationale:
   * - WEATHER_API: 10s for Visual Crossing (usually responds in 1-3s)
   * - WEATHER_API_HISTORICAL: 15s for larger historical datasets
   * - GEOCODING_API: 5s for location search (should be quick)
   * - OPENWEATHER_TILES: 3s for map tile requests (small images)
   * - AIR_QUALITY_API: 10s for Open-Meteo air quality data
   * - AI_*: 10-30s for Anthropic Claude (varies by complexity)
   *
   * These are shorter than frontend timeouts to allow retry logic
   */
  API_TIMEOUTS: {
    // Visual Crossing Weather API
    WEATHER_API: getEnvTimeout('API_TIMEOUT_WEATHER', 10000),                          // 10 seconds - Weather data requests
    WEATHER_API_HISTORICAL: getEnvTimeout('API_TIMEOUT_WEATHER_HISTORICAL', 15000),    // 15 seconds - Historical data (larger response)

    // OpenWeather API
    GEOCODING_API: getEnvTimeout('API_TIMEOUT_GEOCODING', 5000),                       // 5 seconds - Location geocoding
    OPENWEATHER_TILES: getEnvTimeout('API_TIMEOUT_OPENWEATHER_TILES', 3000),           // 3 seconds - Map tile requests

    // Open-Meteo API
    AIR_QUALITY_API: getEnvTimeout('API_TIMEOUT_AIR_QUALITY', 10000),                  // 10 seconds - Air quality data

    // Anthropic Claude API
    AI_VALIDATION: getEnvTimeout('API_TIMEOUT_AI_VALIDATION', 10000),                  // 10 seconds - Quick query validation
    AI_ANALYSIS: getEnvTimeout('API_TIMEOUT_AI_ANALYSIS', 20000),                      // 20 seconds - Full AI analysis
    AI_OVERALL: getEnvTimeout('API_TIMEOUT_AI', 30000),                                // 30 seconds - Overall AI request timeout

    // Default fallback
    DEFAULT: getEnvTimeout('API_TIMEOUT_DEFAULT', 15000),                              // 15 seconds - Generic external API
  },

  /**
   * Retry Configuration
   * For exponential backoff retry logic
   *
   * Rationale:
   * - INITIAL_DELAY: 500ms (faster than frontend since we have less latency)
   * - MAX_ATTEMPTS: 2 (fewer attempts since frontend will also retry)
   * - EXPONENTIAL_BASE: 2 (doubles delay: 500ms, 1000ms, 2000ms)
   * - MAX_DELAY: 3s cap (shorter max since we have frontend retry layer)
   *
   * Note: Backend retries are conservative to prevent cascading failures
   */
  RETRY: {
    INITIAL_DELAY: getEnvTimeout('RETRY_INITIAL_DELAY', 500),           // 500ms - Initial retry delay
    MAX_ATTEMPTS: getEnvTimeout('RETRY_MAX_ATTEMPTS', 2),               // Maximum retry attempts (3 total tries)
    EXPONENTIAL_BASE: 2,                                                // 2x multiplier for exponential backoff
    MAX_DELAY: getEnvTimeout('RETRY_MAX_DELAY', 3000),                  // 3 seconds - Maximum retry delay
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
   *
   * Rationale:
   * - QUERY_TIMEOUT: 5s for standard SELECT/INSERT/UPDATE queries
   * - COMPLEX_QUERY_TIMEOUT: 15s for JOINs, aggregations, bulk operations
   * - CONNECTION_TIMEOUT: 10s for establishing connection (includes auth)
   * - POOL_ACQUIRE_TIMEOUT: 30s for acquiring connection from pool
   *
   * Note: Queries taking > 5s indicate indexing or schema issues
   */
  DATABASE: {
    QUERY_TIMEOUT: getEnvTimeout('DB_QUERY_TIMEOUT', 5000),                          // 5 seconds - Standard query timeout
    COMPLEX_QUERY_TIMEOUT: getEnvTimeout('DB_COMPLEX_QUERY_TIMEOUT', 15000),         // 15 seconds - Complex queries (aggregations, joins)
    CONNECTION_TIMEOUT: getEnvTimeout('DB_CONNECTION_TIMEOUT', 10000),               // 10 seconds - Connection establishment
    POOL_ACQUIRE_TIMEOUT: getEnvTimeout('DB_POOL_ACQUIRE_TIMEOUT', 30000),           // 30 seconds - Pool connection acquire
    TRANSACTION_TIMEOUT: getEnvTimeout('DB_TRANSACTION_TIMEOUT', 10000),             // 10 seconds - Transaction timeout
  },

  /**
   * Cache Operation Timeouts and TTL
   *
   * Rationale:
   * - OPERATION: 100ms for cache get/set (should be instant)
   * - DEFAULT_TTL: 5min for most cached data (balance freshness vs load)
   * - WEATHER_TTL: 10min for weather data (updates every 15min typically)
   * - LOCATION_TTL: 1 hour for geocoding (rarely changes)
   *
   * Note: Cache operations should be fast. Slow cache defeats its purpose.
   */
  CACHE: {
    OPERATION_TIMEOUT: getEnvTimeout('CACHE_OPERATION_TIMEOUT', 100),                // 100ms - Cache get/set
    DEFAULT_TTL: getEnvTimeout('CACHE_TTL', 300000),                                 // 5 minutes - Default cache lifetime
    WEATHER_TTL: getEnvTimeout('CACHE_WEATHER_TTL', 600000),                         // 10 minutes - Weather data
    LOCATION_TTL: getEnvTimeout('CACHE_LOCATION_TTL', 3600000),                      // 1 hour - Geocoding results
  },

  /**
   * Rate Limiting Windows
   *
   * Note: These are not timeouts but time windows for rate limiting.
   * Kept here for centralized time-based configuration.
   *
   * Current limits:
   * - API: 100 requests per 15 minutes
   * - AUTH: 5 requests per 15 minutes
   * - AI: 10 requests per 1 hour
   */
  RATE_LIMIT: {
    API_WINDOW: getEnvTimeout('RATE_LIMIT_API_WINDOW', 900000),                      // 15 minutes - API rate limit window
    AUTH_WINDOW: getEnvTimeout('RATE_LIMIT_AUTH_WINDOW', 900000),                    // 15 minutes - Auth rate limit window
    AI_WINDOW: getEnvTimeout('RATE_LIMIT_AI_WINDOW', 3600000),                       // 1 hour - AI rate limit window
  },
};

/**
 * Get timeout for specific external API
 * @param {string} apiName - API name (weather, openweather, geocoding, ai)
 * @returns {number} Timeout in milliseconds
 */
function getExternalApiTimeout(apiName) {
  const name = apiName.toLowerCase();
  if (name.includes('visual') || name.includes('weather')) {
    return TIMEOUTS.API_TIMEOUTS.WEATHER_API;
  }
  if (name.includes('openweather')) {
    return TIMEOUTS.API_TIMEOUTS.OPENWEATHER_TILES;
  }
  if (name.includes('geocod') || name.includes('nominatim')) {
    return TIMEOUTS.API_TIMEOUTS.GEOCODING_API;
  }
  if (name.includes('ai') || name.includes('claude') || name.includes('anthropic')) {
    return TIMEOUTS.API_TIMEOUTS.AI_OVERALL;
  }
  return TIMEOUTS.API_TIMEOUTS.DEFAULT;
}

module.exports = TIMEOUTS;
module.exports.getExternalApiTimeout = getExternalApiTimeout;
