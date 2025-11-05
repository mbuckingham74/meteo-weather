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
 */

const TIMEOUTS = {
  /**
   * API Request Timeouts
   * These should be slightly longer than backend timeouts to account for network latency
   */
  API: {
    DEFAULT: 30000,                  // 30 seconds - Standard API request
    WEATHER_DATA: 15000,             // 15 seconds - Weather data requests
    GEOCODING: 10000,                // 10 seconds - Location searches
    AI_VALIDATION: 10000,            // 10 seconds - AI query validation
    AI_ANALYSIS: 20000,              // 20 seconds - AI weather analysis
    AI_OVERALL: 30000,               // 30 seconds - Overall AI request timeout
    FILE_UPLOAD: 60000,              // 60 seconds - File uploads (if implemented)
  },

  /**
   * User Interaction Timeouts
   */
  USER: {
    DEBOUNCE_SEARCH: 300,            // 300ms - Search input debounce
    DEBOUNCE_TYPING: 500,            // 500ms - General typing debounce
    TOOLTIP_DELAY: 500,              // 500ms - Tooltip show delay
    AUTO_DISMISS: 5000,              // 5 seconds - Auto-dismiss notifications
    IDLE_TIMEOUT: 1800000,           // 30 minutes - Session idle timeout
  },

  /**
   * Geolocation Timeouts
   * Browser geolocation can be slow, especially on first request
   */
  GEOLOCATION: {
    LOW_ACCURACY: 5000,              // 5 seconds - Wi-Fi/IP-based geolocation
    HIGH_ACCURACY: 30000,            // 30 seconds - GPS geolocation (mobile)
    FALLBACK_DELAY: 10000,           // 10 seconds - Wait before trying IP fallback
  },

  /**
   * UI Animation and Loading States
   */
  UI: {
    LOADING_SKELETON_MIN: 500,       // 500ms - Minimum time to show skeleton (prevent flashing)
    TOAST_DURATION: 3000,            // 3 seconds - Toast notification duration
    MODAL_TRANSITION: 300,           // 300ms - Modal open/close animation
    SMOOTH_SCROLL: 800,              // 800ms - Smooth scroll duration
  },

  /**
   * Caching and Retry
   */
  RETRY: {
    INITIAL_DELAY: 1000,             // 1 second - Initial retry delay
    MAX_DELAY: 5000,                 // 5 seconds - Maximum retry delay
    MAX_ATTEMPTS: 3,                 // Maximum retry attempts
  },

  /**
   * Service Worker and PWA
   */
  PWA: {
    SYNC_TIMEOUT: 30000,             // 30 seconds - Background sync timeout
    UPDATE_CHECK_INTERVAL: 3600000,  // 1 hour - Check for app updates
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
