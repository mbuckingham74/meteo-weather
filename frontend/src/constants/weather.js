/**
 * Weather-related constants
 * Centralized configuration for weather data and display
 */

export const WEATHER_CONFIG = {
  // Forecast configuration
  DEFAULT_FORECAST_DAYS: 7,
  DEFAULT_HOURLY_HOURS: 48,
  MIN_FORECAST_DAYS: 1,
  MAX_FORECAST_DAYS: 15,

  // Timezone abbreviations for location name formatting
  TIMEZONE_ABBREVIATIONS: ['US', 'USA', 'UK', 'UAE', 'NSW', 'NY', 'CA', 'FL', 'TX', 'WA', 'DC'],

  // API timeouts and retry configuration
  API_TIMEOUT: 10000, // 10 seconds
  API_MAX_RETRIES: 3,
  API_RETRY_DELAY: 1000, // 1 second

  // Chart configuration
  CHART_DEFAULT_HEIGHT: 300,
  CHART_WIDE_HEIGHT: 320,
};

/**
 * UV Index categories
 */
export const UV_INDEX_CATEGORIES = {
  LOW: { max: 2, label: 'Low' },
  MODERATE: { max: 5, label: 'Moderate' },
  HIGH: { max: 7, label: 'High' },
  VERY_HIGH: { max: 10, label: 'Very High' },
  EXTREME: { max: Infinity, label: 'Extreme' },
};

/**
 * Get UV index category from value
 * @param {number} uv - UV index value
 * @returns {string} - Category label
 */
export function getUVCategory(uv) {
  if (uv <= UV_INDEX_CATEGORIES.LOW.max) return UV_INDEX_CATEGORIES.LOW.label;
  if (uv <= UV_INDEX_CATEGORIES.MODERATE.max) return UV_INDEX_CATEGORIES.MODERATE.label;
  if (uv <= UV_INDEX_CATEGORIES.HIGH.max) return UV_INDEX_CATEGORIES.HIGH.label;
  if (uv <= UV_INDEX_CATEGORIES.VERY_HIGH.max) return UV_INDEX_CATEGORIES.VERY_HIGH.label;
  return UV_INDEX_CATEGORIES.EXTREME.label;
}

/**
 * Visibility categories (in km)
 */
export const VISIBILITY_CATEGORIES = {
  POOR: { min: 0, max: 2, label: 'Poor' },
  MODERATE: { min: 2, max: 5, label: 'Moderate' },
  GOOD: { min: 5, max: 10, label: 'Good' },
  EXCELLENT: { min: 10, max: Infinity, label: 'Excellent' },
};

/**
 * Get visibility category from value
 * @param {number} vis - Visibility in km
 * @returns {string} - Category label
 */
export function getVisibilityCategory(vis) {
  if (vis >= VISIBILITY_CATEGORIES.EXCELLENT.min) return VISIBILITY_CATEGORIES.EXCELLENT.label;
  if (vis >= VISIBILITY_CATEGORIES.GOOD.min) return VISIBILITY_CATEGORIES.GOOD.label;
  if (vis >= VISIBILITY_CATEGORIES.MODERATE.min) return VISIBILITY_CATEGORIES.MODERATE.label;
  return VISIBILITY_CATEGORIES.POOR.label;
}

/**
 * Cloud cover categories (percentage)
 */
export const CLOUD_COVER_CATEGORIES = {
  CLEAR: { max: 20, label: 'Clear' },
  PARTLY_CLOUDY: { max: 50, label: 'Partly Cloudy' },
  MOSTLY_CLOUDY: { max: 80, label: 'Mostly Cloudy' },
  OVERCAST: { max: 100, label: 'Overcast' },
};

/**
 * Get cloud cover category from percentage
 * @param {number} cc - Cloud cover percentage
 * @returns {string} - Category label
 */
export function getCloudCoverCategory(cc) {
  if (cc < CLOUD_COVER_CATEGORIES.CLEAR.max) return CLOUD_COVER_CATEGORIES.CLEAR.label;
  if (cc < CLOUD_COVER_CATEGORIES.PARTLY_CLOUDY.max)
    return CLOUD_COVER_CATEGORIES.PARTLY_CLOUDY.label;
  if (cc < CLOUD_COVER_CATEGORIES.MOSTLY_CLOUDY.max)
    return CLOUD_COVER_CATEGORIES.MOSTLY_CLOUDY.label;
  return CLOUD_COVER_CATEGORIES.OVERCAST.label;
}

/**
 * Dew point comfort categories (in Fahrenheit)
 */
export const DEW_POINT_CATEGORIES = {
  DRY: { max: 50, label: 'Dry' },
  COMFORTABLE: { max: 60, label: 'Comfortable' },
  STICKY: { max: 65, label: 'Sticky' },
  HUMID: { max: 70, label: 'Humid' },
  OPPRESSIVE: { max: Infinity, label: 'Oppressive' },
};

/**
 * Get dew point comfort category
 * @param {number} dewPointF - Dew point in Fahrenheit
 * @returns {string} - Category label
 */
export function getDewPointCategory(dewPointF) {
  if (dewPointF < DEW_POINT_CATEGORIES.DRY.max) return DEW_POINT_CATEGORIES.DRY.label;
  if (dewPointF < DEW_POINT_CATEGORIES.COMFORTABLE.max)
    return DEW_POINT_CATEGORIES.COMFORTABLE.label;
  if (dewPointF < DEW_POINT_CATEGORIES.STICKY.max) return DEW_POINT_CATEGORIES.STICKY.label;
  if (dewPointF < DEW_POINT_CATEGORIES.HUMID.max) return DEW_POINT_CATEGORIES.HUMID.label;
  return DEW_POINT_CATEGORIES.OPPRESSIVE.label;
}

/**
 * Wind direction names (16 points)
 */
export const WIND_DIRECTIONS = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
];

/**
 * Get wind direction from degrees
 * @param {number} deg - Wind direction in degrees
 * @returns {string} - Direction abbreviation
 */
export function getWindDirection(deg) {
  const index = Math.round(deg / 22.5) % 16;
  return WIND_DIRECTIONS[index];
}

/**
 * Pressure thresholds (in millibars)
 */
export const PRESSURE_THRESHOLD = {
  STANDARD: 1013,
  HIGH_MIN: 1013,
  LOW_MAX: 1013,
};

/**
 * Get pressure category
 * @param {number} pressure - Pressure in millibars
 * @returns {string} - 'High' or 'Low'
 */
export function getPressureCategory(pressure) {
  return pressure > PRESSURE_THRESHOLD.STANDARD ? 'High' : 'Low';
}
