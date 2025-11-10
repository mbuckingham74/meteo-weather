import axios from 'axios';
import API_CONFIG from '../config/api';
import { handleAPIError, retryWithBackoff } from '../utils/errorHandler';
import { debugInfo, debugError } from '../utils/debugLogger';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Weather API Service
 * Communicates with the backend API
 *
 * All functions use:
 * - Centralized error handling via errorHandler utility
 * - Timeout protection (10s for data, 30s for AI endpoints)
 * - Retry logic with exponential backoff for network failures
 * - User-friendly error messages
 */

// Timeout configuration
const TIMEOUT_WEATHER_DATA = 10000; // 10 seconds for weather data

// Create axios instance with default timeout
const weatherClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT_WEATHER_DATA,
});

/**
 * Get current weather for a location
 * @param {string} location - City name (e.g., "London,UK")
 * @returns {Promise<Object>} Current weather data
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function getCurrentWeather(location) {
  try {
    debugInfo('Weather API', `Fetching current weather for: ${location}`);

    const response = await retryWithBackoff(
      async () => weatherClient.get(`/weather/current/${encodeURIComponent(location)}`),
      3,
      1000,
      `getCurrentWeather(${location})`
    );

    debugInfo('Weather API', `Successfully fetched current weather for: ${location}`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Loading current weather for ${location}`);
  }
}

/**
 * Get weather forecast
 * @param {string} location - City name
 * @param {number} days - Number of days (1-15)
 * @returns {Promise<Object>} Forecast data
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function getWeatherForecast(location, days = 7) {
  try {
    debugInfo('Weather API', `Fetching ${days}-day forecast for: ${location}`);

    const response = await retryWithBackoff(
      async () =>
        weatherClient.get(`/weather/forecast/${encodeURIComponent(location)}?days=${days}`),
      3,
      1000,
      `getWeatherForecast(${location}, ${days} days)`
    );

    debugInfo('Weather API', `Successfully fetched forecast for: ${location}`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Loading ${days}-day forecast for ${location}`);
  }
}

/**
 * Get hourly weather forecast
 * @param {string} location - City name
 * @param {number} hours - Number of hours (1-240)
 * @returns {Promise<Object>} Hourly forecast data
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function getHourlyForecast(location, hours = 48) {
  try {
    debugInfo('Weather API', `Fetching ${hours}-hour forecast for: ${location}`);

    const response = await retryWithBackoff(
      async () =>
        weatherClient.get(`/weather/hourly/${encodeURIComponent(location)}?hours=${hours}`),
      3,
      1000,
      `getHourlyForecast(${location}, ${hours} hours)`
    );

    debugInfo('Weather API', `Successfully fetched hourly forecast for: ${location}`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Loading hourly forecast for ${location}`);
  }
}

/**
 * Get historical weather data
 * @param {string} location - City name
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Historical weather data
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function getHistoricalWeather(location, startDate, endDate) {
  try {
    debugInfo(
      'Weather API',
      `Fetching historical data for: ${location} (${startDate} to ${endDate})`
    );

    const response = await retryWithBackoff(
      async () =>
        weatherClient.get(`/weather/historical/${encodeURIComponent(location)}`, {
          params: { start: startDate, end: endDate },
        }),
      3,
      1000,
      `getHistoricalWeather(${location}, ${startDate} - ${endDate})`
    );

    debugInfo('Weather API', `Successfully fetched historical data for: ${location}`);
    return response.data;
  } catch (error) {
    throw handleAPIError(
      error,
      `Loading historical weather for ${location} (${startDate} to ${endDate})`
    );
  }
}

/**
 * Search for locations
 * @param {string} query - Search query
 * @param {number} limit - Max results
 * @returns {Promise<Array>} Matching locations
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function searchLocations(query, limit = 10) {
  if (!query || query.trim() === '') {
    debugError('Weather API', 'searchLocations called with empty query');
    return [];
  }

  try {
    debugInfo('Weather API', `Searching locations: "${query}" (limit: ${limit})`);

    const response = await weatherClient.get('/locations/search', {
      params: { q: query, limit },
    });

    const locations = response.data.locations || [];
    debugInfo('Weather API', `Found ${locations.length} locations for: "${query}"`);
    return locations;
  } catch (error) {
    // Don't retry search queries - they're user-initiated
    throw handleAPIError(error, `Searching for "${query}"`);
  }
}

/**
 * Get all locations
 * @param {number} limit - Max results
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Locations
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function getAllLocations(limit = 100, offset = 0) {
  try {
    debugInfo('Weather API', `Fetching all locations (limit: ${limit}, offset: ${offset})`);

    const response = await retryWithBackoff(
      async () =>
        weatherClient.get('/locations', {
          params: { limit, offset },
        }),
      2,
      1000,
      'getAllLocations'
    );

    const locations = response.data.locations || [];
    debugInfo('Weather API', `Fetched ${locations.length} locations`);
    return locations;
  } catch (error) {
    throw handleAPIError(error, 'Loading location list');
  }
}

/**
 * Geocode location search (autocomplete)
 * @param {string} query - Search query
 * @param {number} limit - Max results
 * @returns {Promise<Array>} Matching locations
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function geocodeLocation(query, limit = 5) {
  if (!query || query.trim() === '') {
    return [];
  }

  try {
    debugInfo('Weather API', `Geocoding: "${query}" (limit: ${limit})`);

    const response = await weatherClient.get('/locations/geocode', {
      params: { q: query, limit },
      timeout: 5000, // Faster timeout for autocomplete
    });

    const results = response.data.results || [];
    debugInfo('Weather API', `Geocoded ${results.length} results for: "${query}"`);
    return results;
  } catch (error) {
    // Don't throw errors for autocomplete - just return empty array
    debugError('Weather API', `Geocode failed for "${query}"`, error);
    return [];
  }
}

/**
 * Reverse geocode coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Location details
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function reverseGeocode(lat, lon) {
  try {
    debugInfo('Weather API', `Reverse geocoding: (${lat}, ${lon})`);

    const response = await retryWithBackoff(
      async () =>
        weatherClient.get('/locations/reverse', {
          params: { lat, lon },
        }),
      2,
      1000,
      `reverseGeocode(${lat}, ${lon})`
    );

    debugInfo('Weather API', `Successfully reverse geocoded: ${response.data.location?.address}`);
    return response.data.location;
  } catch (error) {
    throw handleAPIError(error, `Finding location at coordinates (${lat}, ${lon})`);
  }
}

/**
 * Get popular locations
 * @returns {Promise<Array>} Popular locations
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function getPopularLocations() {
  try {
    debugInfo('Weather API', 'Fetching popular locations');

    const response = await retryWithBackoff(
      async () => weatherClient.get('/locations/popular'),
      2,
      1000,
      'getPopularLocations'
    );

    const locations = response.data.locations || [];
    debugInfo('Weather API', `Fetched ${locations.length} popular locations`);
    return locations;
  } catch (error) {
    throw handleAPIError(error, 'Loading popular locations');
  }
}

/**
 * Test API connection
 * @returns {Promise<Object>} Connection status
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function testApiConnection() {
  try {
    debugInfo('Weather API', 'Testing API connection');

    const response = await weatherClient.get('/weather/test', {
      timeout: 5000, // Short timeout for connection test
    });

    debugInfo('Weather API', 'API connection test successful');
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Testing API connection');
  }
}
