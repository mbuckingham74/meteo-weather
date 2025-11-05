import API_CONFIG from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Validate if a user query is legitimate for location/climate search
 * @param {string} userInput - The user's natural language query
 * @returns {Promise<{success: boolean, isValid: boolean, reason: string, tokensUsed: number}>}
 */
export async function validateQuery(userInput) {
  try {
    const response = await fetch(`${API_BASE_URL}/ai-location-finder/validate-query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

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
    const response = await fetch(`${API_BASE_URL}/ai-location-finder/parse-query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userInput,
        currentLocation,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('[Location Finder] Parse error:', error);
    throw error;
  }
}
