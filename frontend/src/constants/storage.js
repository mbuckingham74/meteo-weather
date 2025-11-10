/**
 * Local storage keys and configuration
 * Centralized storage management
 */

/**
 * Storage keys for localStorage
 */
export const STORAGE_KEYS = {
  RECENT_SEARCHES: 'meteo_recent_searches',
  CURRENT_LOCATION: 'meteo_current_location',
  LOCATION_DATA: 'meteo_location_data',
  USER_PREFERENCES: 'meteo_preferences',
  THEME: 'meteo_theme',
  TEMPERATURE_UNIT: 'meteo_temperature_unit',
};

/**
 * Storage limits and configurations
 */
export const STORAGE_LIMITS = {
  MAX_RECENT_SEARCHES: 5,
  LOCATION_CACHE_TTL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  PREFERENCES_VERSION: 1,
};

/**
 * Default values for storage
 */
export const STORAGE_DEFAULTS = {
  RECENT_SEARCHES: [],
  TEMPERATURE_UNIT: 'F',
  THEME: 'system',
};
