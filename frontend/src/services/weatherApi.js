/**
 * Weather API Service
 * Centralized weather data endpoints using apiClient
 *
 * Migration: Part of P0-P3A API Architecture Improvements
 * Replaced custom axios instance with centralized apiClient
 *
 * Features:
 * - Automatic retry with exponential backoff (via apiClient)
 * - Request deduplication (via apiClient)
 * - Unified error handling via ApiError
 * - Consistent timeout configuration
 * - Debug logging for troubleshooting
 * - User-friendly error messages via handleAPIError
 */

import { apiRequest } from './apiClient';
import API_CONFIG from '../config/api';
import { handleAPIError } from '../utils/errorHandler';
import { debugInfo, debugError } from '../utils/debugLogger';

/**
 * Get current weather for a location
 * @param {string} location - City name (e.g., "London,UK")
 * @returns {Promise<Object>} Current weather data
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function getCurrentWeather(location) {
  try {
    debugInfo('Weather API', `Fetching current weather for: ${location}`);

    const endpoint = `${API_CONFIG.ENDPOINTS.WEATHER_CURRENT}/${encodeURIComponent(location)}`;
    const response = await apiRequest(endpoint, { method: 'GET' });

    debugInfo('Weather API', `Successfully fetched current weather for: ${location}`);
    return response;
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

    const endpoint = `${API_CONFIG.ENDPOINTS.WEATHER_FORECAST}/${encodeURIComponent(location)}?days=${days}`;
    const response = await apiRequest(endpoint, { method: 'GET' });

    debugInfo('Weather API', `Successfully fetched forecast for: ${location}`);
    return response;
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

    const endpoint = `${API_CONFIG.ENDPOINTS.WEATHER_HOURLY}/${encodeURIComponent(location)}?hours=${hours}`;
    const response = await apiRequest(endpoint, { method: 'GET' });

    debugInfo('Weather API', `Successfully fetched hourly forecast for: ${location}`);
    return response;
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

    const params = new URLSearchParams({ start: startDate, end: endDate });
    const endpoint = `${API_CONFIG.ENDPOINTS.WEATHER_HISTORICAL}/${encodeURIComponent(location)}?${params}`;
    const response = await apiRequest(endpoint, { method: 'GET' });

    debugInfo('Weather API', `Successfully fetched historical data for: ${location}`);
    return response;
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

    const params = new URLSearchParams({ q: query, limit: limit.toString() });
    const endpoint = `${API_CONFIG.LOCATIONS}/search?${params}`;
    const response = await apiRequest(endpoint, { method: 'GET' });

    const locations = response.locations || [];
    debugInfo('Weather API', `Found ${locations.length} locations for: "${query}"`);
    return locations;
  } catch (error) {
    // Don't throw errors for search - return empty array (like geocodeLocation)
    debugError('Weather API', `Search failed for "${query}"`, error);
    return [];
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

    const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
    const endpoint = `${API_CONFIG.ENDPOINTS.LOCATIONS}?${params}`;
    const response = await apiRequest(endpoint, { method: 'GET' });

    const locations = response.locations || [];
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

    const params = new URLSearchParams({ q: query, limit: limit.toString() });
    const endpoint = `${API_CONFIG.ENDPOINTS.LOCATIONS_GEOCODE}?${params}`;
    const response = await apiRequest(endpoint, {
      method: 'GET',
      timeout: 5000, // Faster timeout for autocomplete
    });

    const results = response.results || [];
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

    const params = new URLSearchParams({ lat: lat.toString(), lon: lon.toString() });
    const endpoint = `${API_CONFIG.ENDPOINTS.LOCATIONS_REVERSE}?${params}`;
    const response = await apiRequest(endpoint, { method: 'GET' });

    debugInfo('Weather API', `Successfully reverse geocoded: ${response.location?.address}`);
    return response.location;
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

    const endpoint = API_CONFIG.ENDPOINTS.LOCATIONS_POPULAR;
    const response = await apiRequest(endpoint, { method: 'GET' });

    const locations = response.locations || [];
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

    const endpoint = `${API_CONFIG.ENDPOINTS.WEATHER}/test`;
    const response = await apiRequest(endpoint, {
      method: 'GET',
      timeout: 5000, // Short timeout for connection test
    });

    debugInfo('Weather API', 'API connection test successful');
    return response;
  } catch (error) {
    throw handleAPIError(error, 'Testing API connection');
  }
}

/**
 * Get air quality data for a location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Air quality data with AQI, pollutants, and health recommendations
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function getAirQuality(lat, lon) {
  try {
    debugInfo('Weather API', `Fetching air quality for: (${lat}, ${lon})`);

    const params = new URLSearchParams({ lat: lat.toString(), lon: lon.toString() });
    const endpoint = `${API_CONFIG.ENDPOINTS.AIR_QUALITY}?${params}`;
    const response = await apiRequest(endpoint, { method: 'GET' });

    debugInfo('Weather API', `Successfully fetched air quality for: (${lat}, ${lon})`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Loading air quality data`);
  }
}
