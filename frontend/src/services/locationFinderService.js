import { apiRequest } from './apiClient';

/**
 * Validate if a user query is legitimate for location/climate search
 * @param {string} userInput - The user's natural language query
 * @returns {Promise<{success: boolean, isValid: boolean, reason: string, tokensUsed: number}>}
 */
export async function validateQuery(userInput) {
  try {
    const data = await apiRequest('/ai-location-finder/validate-query', {
      method: 'POST',
      body: { userInput },
      skipAuth: true,
    });

    return data;
  } catch (error) {
    console.error('[Location Finder] Validation error:', error);
    throw error;
  }
}

/**
 * Parse natural language location query into structured criteria
 * @param {string} userInput - The user's natural language query
 * @param {Object} currentLocation - Optional current location {lat, lng, city}
 * @returns {Promise<{success: boolean, criteria: Object, tokensUsed: number, cost: string}>}
 */
export async function parseLocationQuery(userInput, currentLocation = null) {
  try {
    const data = await apiRequest('/ai-location-finder/parse-query', {
      method: 'POST',
      body: {
        userInput,
        currentLocation,
      },
      skipAuth: true,
    });

    return data;
  } catch (error) {
    console.error('[Location Finder] Parse error:', error);
    throw error;
  }
}
