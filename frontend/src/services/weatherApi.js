import axios from 'axios';
import API_CONFIG from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Weather API Service
 * Communicates with the backend API
 */

// Add response interceptor for better error handling
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 429) {
      // Rate limit exceeded
      const customError = new Error('Rate limit exceeded. Please wait a moment and try again.');
      customError.rateLimitExceeded = true;
      customError.response = error.response;
      return Promise.reject(customError);
    }
    return Promise.reject(error);
  }
);

/**
 * Get current weather for a location
 * @param {string} location - City name (e.g., "London,UK")
 * @returns {Promise<Object>} Current weather data
 */
export async function getCurrentWeather(location) {
  try {
    const response = await axios.get(`${API_BASE_URL}/weather/current/${encodeURIComponent(location)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
}

/**
 * Get weather forecast
 * @param {string} location - City name
 * @param {number} days - Number of days (1-15)
 * @returns {Promise<Object>} Forecast data
 */
export async function getWeatherForecast(location, days = 7) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/weather/forecast/${encodeURIComponent(location)}?days=${days}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
}

/**
 * Get hourly weather forecast
 * @param {string} location - City name
 * @param {number} hours - Number of hours (1-240)
 * @returns {Promise<Object>} Hourly forecast data
 */
export async function getHourlyForecast(location, hours = 48) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/weather/hourly/${encodeURIComponent(location)}?hours=${hours}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching hourly forecast:', error);
    throw error;
  }
}

/**
 * Get historical weather data
 * @param {string} location - City name
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Historical weather data
 */
export async function getHistoricalWeather(location, startDate, endDate) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/weather/historical/${encodeURIComponent(location)}`,
      {
        params: { start: startDate, end: endDate }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching historical weather:', error);
    throw error;
  }
}

/**
 * Search for locations
 * @param {string} query - Search query
 * @param {number} limit - Max results
 * @returns {Promise<Array>} Matching locations
 */
export async function searchLocations(query, limit = 10) {
  try {
    const response = await axios.get(`${API_BASE_URL}/locations/search`, {
      params: { q: query, limit }
    });
    return response.data.locations || [];
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
}

/**
 * Get all locations
 * @param {number} limit - Max results
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Locations
 */
export async function getAllLocations(limit = 100, offset = 0) {
  try {
    const response = await axios.get(`${API_BASE_URL}/locations`, {
      params: { limit, offset }
    });
    return response.data.locations || [];
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
}

/**
 * Geocode location search (autocomplete)
 * @param {string} query - Search query
 * @param {number} limit - Max results
 * @returns {Promise<Array>} Matching locations
 */
export async function geocodeLocation(query, limit = 5) {
  try {
    const response = await axios.get(`${API_BASE_URL}/locations/geocode`, {
      params: { q: query, limit }
    });
    return response.data.results || [];
  } catch (error) {
    console.error('Error geocoding location:', error);
    throw error;
  }
}

/**
 * Reverse geocode coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Location details
 */
export async function reverseGeocode(lat, lon) {
  try {
    const response = await axios.get(`${API_BASE_URL}/locations/reverse`, {
      params: { lat, lon }
    });
    return response.data.location;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    throw error;
  }
}

/**
 * Get popular locations
 * @returns {Promise<Array>} Popular locations
 */
export async function getPopularLocations() {
  try {
    const response = await axios.get(`${API_BASE_URL}/locations/popular`);
    return response.data.locations || [];
  } catch (error) {
    console.error('Error fetching popular locations:', error);
    throw error;
  }
}

/**
 * Test API connection
 * @returns {Promise<Object>} Connection status
 */
export async function testApiConnection() {
  try {
    const response = await axios.get(`${API_BASE_URL}/weather/test`);
    return response.data;
  } catch (error) {
    console.error('Error testing API:', error);
    throw error;
  }
}
