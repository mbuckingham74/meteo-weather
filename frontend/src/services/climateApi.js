/**
 * Climate API Service
 * Centralized climate data endpoints using apiClient
 *
 * Migration: Part of P0-P3A API Architecture Improvements
 * Replaces direct axios calls in useClimateData.js hooks
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Request deduplication
 * - Unified error handling via ApiError
 * - Consistent timeout configuration
 */

import { apiRequest } from './apiClient';
import API_CONFIG from '../config/api';

/**
 * Fetch climate normals for a specific date
 * @param {string} location - Location identifier (city, coordinates, etc.)
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {number} years - Number of years to include in analysis (default: 10)
 * @returns {Promise<Object>} Climate normals data
 */
export async function getClimateNormals(location, date, years = 10) {
  const params = new URLSearchParams({ date, years: years.toString() });
  const endpoint = `${API_CONFIG.ENDPOINTS.CLIMATE_NORMALS}/${encodeURIComponent(location)}?${params}`;

  return await apiRequest(endpoint, {
    method: 'GET',
  });
}

/**
 * Fetch record temperatures for a date range
 * @param {string} location - Location identifier
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {number} years - Number of years to include (default: 10)
 * @returns {Promise<Object>} Record temperature data
 */
export async function getRecordTemperatures(location, startDate, endDate, years = 10) {
  const params = new URLSearchParams({
    start: startDate,
    end: endDate,
    years: years.toString(),
  });
  const endpoint = `${API_CONFIG.ENDPOINTS.CLIMATE_RECORDS}/${encodeURIComponent(location)}?${params}`;

  return await apiRequest(endpoint, {
    method: 'GET',
  });
}

/**
 * Compare forecast with climate normals
 * @param {string} location - Location identifier
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {number} years - Number of years to include (default: 30)
 * @returns {Promise<Object>} Forecast comparison data
 */
export async function compareForecastWithNormals(location, startDate, endDate, years = 30) {
  const endpoint = API_CONFIG.ENDPOINTS.CLIMATE_COMPARE;

  return await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      location,
      startDate,
      endDate,
      years,
    }),
  });
}

/**
 * Fetch "This Day in History" weather data
 * @param {string} location - Location identifier
 * @param {string} date - Date string (MM-DD format)
 * @param {number} years - Number of years to look back (default: 10)
 * @returns {Promise<Object>} Historical weather data for this day
 */
export async function getThisDayInHistory(location, date, years = 10) {
  const params = new URLSearchParams({ date, years: years.toString() });
  const endpoint = `${API_CONFIG.ENDPOINTS.CLIMATE_THIS_DAY}/${encodeURIComponent(location)}?${params}`;

  return await apiRequest(endpoint, {
    method: 'GET',
  });
}

/**
 * Get temperature probability distribution
 * @param {string} location - Location identifier
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {number} years - Number of years for analysis (default: 30)
 * @returns {Promise<Object>} Temperature probability data
 */
export async function getTemperatureProbability(location, date, years = 30) {
  const params = new URLSearchParams({ date, years: years.toString() });
  const endpoint = `${API_CONFIG.ENDPOINTS.CLIMATE_PROBABILITY}/${encodeURIComponent(location)}?${params}`;

  return await apiRequest(endpoint, {
    method: 'GET',
  });
}
