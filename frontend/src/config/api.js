/**
 * Centralized API Configuration
 *
 * Single source of truth for all API endpoints and configuration.
 * This prevents duplication of API URLs across 13+ files.
 *
 * Environment Variables:
 * - VITE_API_URL: Backend API base URL (set in .env for production)
 *
 * Default: http://localhost:5001/api (development)
 */

const API_CONFIG = {
  /**
   * Base URL for backend API
   * Automatically uses environment variable in production
   * Falls back to localhost for development
   */
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',

  /**
   * API endpoint paths (relative to BASE_URL)
   */
  ENDPOINTS: {
    // Weather endpoints
    WEATHER: '/weather',
    WEATHER_CURRENT: '/weather/current',
    WEATHER_FORECAST: '/weather/forecast',
    WEATHER_HOURLY: '/weather/hourly',
    WEATHER_HISTORICAL: '/weather/historical',

    // Climate endpoints
    CLIMATE: '/weather/climate',
    CLIMATE_NORMALS: '/weather/climate/normals',
    CLIMATE_RECORDS: '/weather/climate/records',
    CLIMATE_COMPARE: '/weather/climate/compare',
    CLIMATE_THIS_DAY: '/weather/climate/this-day',
    CLIMATE_PROBABILITY: '/weather/climate/probability',

    // Location endpoints
    LOCATIONS: '/locations',
    LOCATIONS_GEOCODE: '/locations/geocode',
    LOCATIONS_REVERSE: '/locations/reverse',
    LOCATIONS_POPULAR: '/locations/popular',

    // Authentication endpoints
    AUTH: '/auth',
    AUTH_REGISTER: '/auth/register',
    AUTH_LOGIN: '/auth/login',
    AUTH_ME: '/auth/me',
    AUTH_PROFILE: '/auth/profile',
    AUTH_CHANGE_PASSWORD: '/auth/change-password',

    // User endpoints
    USER: '/user',
    USER_PREFERENCES: '/user-preferences',
    USER_FAVORITES: '/user/favorites',

    // AI endpoints
    AI_LOCATION_FINDER: '/ai-location-finder',
    AI_LOCATION_VALIDATE: '/ai-location-finder/validate-query',
    AI_LOCATION_PARSE: '/ai-location-finder/parse-query',
    AI_WEATHER: '/ai-weather',
    AI_WEATHER_VALIDATE: '/ai-weather/validate',
    AI_WEATHER_ANALYZE: '/ai-weather/analyze',
    SHARE_ANSWER: '/share-answer',

    // Air quality endpoints
    AIR_QUALITY: '/air-quality',

    // Cache endpoints
    CACHE: '/cache',
    CACHE_STATS: '/cache/stats',
  },

  /**
   * Request timeout (in milliseconds)
   * Default: 30 seconds for API requests
   */
  TIMEOUT: 30000,

  /**
   * Retry configuration
   */
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: 1000, // 1 second
  },
};

/**
 * Helper function to build full API URL
 * @param {string} endpoint - Endpoint path (use API_CONFIG.ENDPOINTS)
 * @param {string} pathParams - Additional path parameters
 * @returns {string} Full API URL
 *
 * @example
 * buildUrl(API_CONFIG.ENDPOINTS.WEATHER_FORECAST, '/Seattle,WA')
 * // Returns: http://localhost:5001/api/weather/forecast/Seattle,WA
 */
export function buildUrl(endpoint, pathParams = '') {
  return `${API_CONFIG.BASE_URL}${endpoint}${pathParams}`;
}

/**
 * Helper function to build URL with query parameters
 * @param {string} endpoint - Endpoint path
 * @param {object} queryParams - Query parameters object
 * @returns {string} Full API URL with query string
 *
 * @example
 * buildUrlWithQuery(API_CONFIG.ENDPOINTS.WEATHER_FORECAST, { days: 7 })
 * // Returns: http://localhost:5001/api/weather/forecast?days=7
 */
export function buildUrlWithQuery(endpoint, queryParams = {}) {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const params = new URLSearchParams(queryParams);
  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

export default API_CONFIG;
