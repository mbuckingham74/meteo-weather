import CACHE_TTL from '../config/cache';

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
/**
 * Default values for storage
 */
export const STORAGE_DEFAULTS = {
  RECENT_SEARCHES: [],
  TEMPERATURE_UNIT: 'F',
  THEME: 'system',
};

export const STORAGE_LIMITS = {
  MAX_RECENT_SEARCHES: 5,
  LOCATION_CACHE_TTL: CACHE_TTL.LOCATION_MS,
  PREFERENCES_VERSION: 1,
};
