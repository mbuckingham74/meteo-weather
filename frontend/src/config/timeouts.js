/**
 * Frontend Timeout Configuration
 *
 * Centralized timeout values for frontend API calls and user interactions.
 * All values in milliseconds.
 *
 * Purpose:
 * - Self-documenting timeout values
 * - Consistent timeout handling across components
 * - Easy to adjust based on user experience needs
 * - Environment-configurable for different deployment scenarios
 *
 * Environment Variables (Vite):
 * - VITE_API_TIMEOUT_DEFAULT - Override default API timeout
 * - VITE_API_TIMEOUT_WEATHER - Override weather data timeout
 * - VITE_API_TIMEOUT_GEOCODING - Override geocoding timeout
 * - VITE_API_TIMEOUT_AI - Override AI request timeout
 * - VITE_RETRY_MAX_ATTEMPTS - Override max retry attempts
 *
 * @example
 * // In .env.local:
 * VITE_API_TIMEOUT_DEFAULT=15000
 * VITE_RETRY_MAX_ATTEMPTS=5
 */

/**
 * Helper to get environment variable as number with fallback
 * @param {string} key - Environment variable key
 * @param {number} defaultValue - Default value if env var not set
 * @returns {number} Parsed value or default
 */
function getEnvTimeout(key, defaultValue) {
  const value = import.meta.env[key];
  if (value === undefined || value === null) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

const TIMEOUTS = {
  /**
   * API Request Timeouts
   * These should be slightly longer than backend timeouts to account for network latency
   *
   * Rationale:
   * - DEFAULT: 30s covers most API calls with network latency
   * - WEATHER_DATA: 15s for responsive weather fetching
   * - GEOCODING: 10s for location search autocomplete
   * - AI_*: 10-30s for AI processing (varies by complexity)
   * - FILE_UPLOAD: 60s for large file transfers
   */
  API: {
    DEFAULT: getEnvTimeout('VITE_API_TIMEOUT_DEFAULT', 30000), // 30 seconds - Standard API request
    WEATHER_DATA: getEnvTimeout('VITE_API_TIMEOUT_WEATHER', 15000), // 15 seconds - Weather data requests
    GEOCODING: getEnvTimeout('VITE_API_TIMEOUT_GEOCODING', 10000), // 10 seconds - Location searches
    AI_VALIDATION: getEnvTimeout('VITE_API_TIMEOUT_AI_VALIDATION', 10000), // 10 seconds - AI query validation
    AI_ANALYSIS: getEnvTimeout('VITE_API_TIMEOUT_AI_ANALYSIS', 20000), // 20 seconds - AI weather analysis
    AI_OVERALL: getEnvTimeout('VITE_API_TIMEOUT_AI', 30000), // 30 seconds - Overall AI request timeout
    FILE_UPLOAD: getEnvTimeout('VITE_API_TIMEOUT_FILE_UPLOAD', 60000), // 60 seconds - File uploads (if implemented)
    AUTH: getEnvTimeout('VITE_API_TIMEOUT_AUTH', 10000), // 10 seconds - Authentication requests
  },

  /**
   * User Interaction Timeouts
   *
   * Rationale:
   * - DEBOUNCE_SEARCH: 300ms feels instant but prevents API spam
   * - DEBOUNCE_TYPING: 500ms for non-search inputs (less aggressive)
   * - TOOLTIP_DELAY: 500ms prevents accidental tooltip triggers
   * - AUTO_DISMISS: 5s for non-critical toast notifications
   * - IDLE_TIMEOUT: 30min for security (JWT refresh token lifetime)
   */
  USER: {
    DEBOUNCE_SEARCH: 300, // 300ms - Search input debounce
    DEBOUNCE_TYPING: 500, // 500ms - General typing debounce
    TOOLTIP_DELAY: 500, // 500ms - Tooltip show delay
    AUTO_DISMISS: 5000, // 5 seconds - Auto-dismiss notifications
    IDLE_TIMEOUT: 1800000, // 30 minutes - Session idle timeout
  },

  /**
   * Geolocation Timeouts
   * Browser geolocation can be slow, especially on first request
   *
   * Rationale:
   * - LOW_ACCURACY: 5s for IP/Wi-Fi geolocation (fast but less precise)
   * - HIGH_ACCURACY: 30s for GPS (slow but accurate, used on mobile)
   * - FALLBACK_DELAY: 10s wait before falling back to IP geolocation
   *
   * Note: GPS can take 30+ seconds on first request (cold start)
   * After first fix, subsequent requests are usually < 5 seconds
   */
  GEOLOCATION: {
    LOW_ACCURACY: 5000, // 5 seconds - Wi-Fi/IP-based geolocation
    HIGH_ACCURACY: 30000, // 30 seconds - GPS geolocation (mobile)
    FALLBACK_DELAY: 10000, // 10 seconds - Wait before trying IP fallback
  },

  /**
   * UI Animation and Loading States
   */
  UI: {
    LOADING_SKELETON_MIN: 500, // 500ms - Minimum time to show skeleton (prevent flashing)
    TOAST_DURATION: 3000, // 3 seconds - Toast notification duration
    MODAL_TRANSITION: 300, // 300ms - Modal open/close animation
    SMOOTH_SCROLL: 800, // 800ms - Smooth scroll duration
  },

  /**
   * Caching and Retry
   *
   * Rationale:
   * - INITIAL_DELAY: 1s allows transient errors to clear
   * - MAX_DELAY: 5s prevents excessive wait times
   * - MAX_ATTEMPTS: 3 balances persistence with user patience
   * - Uses exponential backoff: 1s, 2s, 4s (capped at MAX_DELAY)
   */
  RETRY: {
    INITIAL_DELAY: getEnvTimeout('VITE_RETRY_INITIAL_DELAY', 1000), // 1 second - Initial retry delay
    MAX_DELAY: getEnvTimeout('VITE_RETRY_MAX_DELAY', 5000), // 5 seconds - Maximum retry delay
    MAX_ATTEMPTS: getEnvTimeout('VITE_RETRY_MAX_ATTEMPTS', 3), // Maximum retry attempts
  },

  /**
   * Service Worker and PWA
   */
  PWA: {
    SYNC_TIMEOUT: 30000, // 30 seconds - Background sync timeout
    UPDATE_CHECK_INTERVAL: 3600000, // 1 hour - Check for app updates
  },
};

/**
 * Get timeout value for specific API endpoint
 * @param {string} endpoint - Endpoint path
 * @returns {number} Timeout in milliseconds
 */
export function getApiTimeout(endpoint) {
  if (endpoint.includes('/ai-weather') || endpoint.includes('/ai-location-finder')) {
    return TIMEOUTS.API.AI_OVERALL;
  }
  if (endpoint.includes('/weather')) {
    return TIMEOUTS.API.WEATHER_DATA;
  }
  if (endpoint.includes('/locations')) {
    return TIMEOUTS.API.GEOCODING;
  }
  return TIMEOUTS.API.DEFAULT;
}

/**
 * Create AbortController with timeout
 * @param {number} timeout - Timeout in milliseconds
 * @returns {AbortController} Controller with automatic timeout
 *
 * @example
 * const controller = createTimeoutController(10000);
 * fetch(url, { signal: controller.signal });
 */
export function createTimeoutController(timeout) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller;
}

export default TIMEOUTS;
