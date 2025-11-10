import { chartPalette } from '../constants';

/**
 * Weather Spark-style color scales
 */

/**
 * Temperature color bands (Weather Spark style)
 * @param {number} temp - Temperature in Celsius
 * @returns {string} Color token
 */
export function getTemperatureColor(temp) {
  if (temp < 0) return chartPalette.accent; // Frigid - Indigo
  if (temp < 10) return chartPalette.cool; // Cold - Cool blue
  if (temp < 15) return chartPalette.coolAccent; // Cool - Aqua
  if (temp < 25) return chartPalette.positive; // Comfortable
  if (temp < 30) return chartPalette.warning; // Warm
  if (temp < 35) return chartPalette.hot; // Hot
  return chartPalette.hot; // Sweltering
}

/**
 * Get temperature band name
 * @param {number} temp - Temperature in Celsius
 * @returns {string} Band name
 */
export function getTemperatureBand(temp) {
  if (temp < 0) return 'Frigid';
  if (temp < 10) return 'Cold';
  if (temp < 15) return 'Cool';
  if (temp < 25) return 'Comfortable';
  if (temp < 30) return 'Warm';
  if (temp < 35) return 'Hot';
  return 'Sweltering';
}

/**
 * Temperature bands for area chart
 */
export const TEMPERATURE_BANDS = [
  { name: 'Frigid', min: -40, max: 0, color: chartPalette.accent },
  { name: 'Cold', min: 0, max: 10, color: chartPalette.cool },
  { name: 'Cool', min: 10, max: 15, color: chartPalette.coolAccent },
  { name: 'Comfortable', min: 15, max: 25, color: chartPalette.positive },
  { name: 'Warm', min: 25, max: 30, color: chartPalette.warning },
  { name: 'Hot', min: 30, max: 35, color: chartPalette.hot },
  { name: 'Sweltering', min: 35, max: 50, color: chartPalette.hot },
];

/**
 * Precipitation colors
 */
export const PRECIPITATION_COLORS = {
  rain: chartPalette.cool,
  snow: 'var(--bg-tertiary)',
  mixed: chartPalette.accentSecondary,
  probability: chartPalette.warning,
};

/**
 * Weather metric colors
 */
export const METRIC_COLORS = {
  temperature: chartPalette.hot,
  feelsLike: chartPalette.warning,
  humidity: chartPalette.coolAccent,
  precipitation: chartPalette.cool,
  cloudCover: chartPalette.neutral,
  uvIndex: chartPalette.warning,
  windSpeed: chartPalette.positive,
  pressure: chartPalette.accentSecondary,
};

/**
 * Get UV Index color
 * @param {number} uvIndex - UV Index value (0-11+)
 * @returns {string} Color hex code
 */
export function getUVIndexColor(uvIndex) {
  if (uvIndex < 3) return chartPalette.positive; // Low
  if (uvIndex < 6) return chartPalette.warning; // Moderate
  if (uvIndex < 8) return chartPalette.warning; // High
  if (uvIndex < 11) return chartPalette.hot; // Very High
  return chartPalette.hot; // Extreme
}

/**
 * Get cloud cover color
 * @param {number} cloudCover - Cloud cover percentage (0-100)
 * @returns {string} Color hex code
 */
export function getCloudCoverColor(cloudCover) {
  if (cloudCover < 20) return chartPalette.cool; // Clear
  if (cloudCover < 50) return chartPalette.neutral; // Partly cloudy
  if (cloudCover < 80) return chartPalette.textMuted; // Mostly cloudy
  return 'var(--text-secondary)'; // Overcast
}

/**
 * Get wind speed color
 * @param {number} windSpeed - Wind speed in km/h
 * @returns {string} Color hex code
 */
export function getWindSpeedColor(windSpeed) {
  if (windSpeed < 10) return chartPalette.positive; // Calm
  if (windSpeed < 30) return chartPalette.warning; // Light
  if (windSpeed < 50) return chartPalette.warning; // Moderate
  if (windSpeed < 70) return chartPalette.hot; // Strong
  return chartPalette.hot; // Gale
}
