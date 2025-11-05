const axios = require('axios');

/**
 * Geocoding Service using Visual Crossing Weather API
 * Provides location search and autocomplete functionality
 */

const API_KEY = process.env.VISUAL_CROSSING_API_KEY;

/**
 * Properly capitalize address text (Visual Crossing returns lowercase)
 * @param {string} address - Address to capitalize
 * @returns {string} Properly capitalized address
 */
function capitalizeAddress(address) {
  if (!address) return address;

  // Split by comma to handle each part separately
  return address
    .split(',')
    .map(part => {
      // Trim whitespace
      part = part.trim();

      // Split by spaces and capitalize each word
      return part
        .split(' ')
        .map(word => {
          // Handle special cases (abbreviations, etc.)
          const upper = word.toUpperCase();
          if (['US', 'USA', 'UK', 'UAE', 'NSW', 'NY', 'CA', 'FL', 'TX', 'WA', 'DC'].includes(upper)) {
            return upper;
          }

          // Capitalize first letter of each word
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
    })
    .join(', ');
}

/**
 * Search for locations by query string
 * Uses Visual Crossing's geocoding capabilities
 * @param {string} query - Search query (city name, address, etc.)
 * @param {number} limit - Maximum number of results (default: 5)
 * @returns {Promise<object>} Search results
 */
async function searchLocations(query, limit = 5) {
  if (!query || query.trim().length < 2) {
    return {
      success: false,
      error: 'Search query must be at least 2 characters'
    };
  }

  try {
    // Use Visual Crossing Timeline API with current data to resolve location
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(query)}`;

    const response = await axios.get(url, {
      params: {
        key: API_KEY,
        include: 'current',
        elements: 'temp', // Minimal data to reduce cost
        contentType: 'json'
      },
      timeout: 5000
    });

    if (response.data) {
      // Visual Crossing returns a single location resolution
      // For autocomplete, we'll return this as a single result
      const result = {
        address: capitalizeAddress(response.data.resolvedAddress),
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        timezone: response.data.timezone,
        tzOffset: response.data.tzoffset
      };

      return {
        success: true,
        results: [result],
        count: 1
      };
    }

    return {
      success: false,
      error: 'No location found'
    };
  } catch (error) {
    console.error('Geocoding error:', error.message);

    if (error.response) {
      return {
        success: false,
        error: error.response.data?.message || 'Location not found',
        statusCode: error.response.status
      };
    }

    return {
      success: false,
      error: 'Failed to search location'
    };
  }
}

/**
 * Get location details by coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object>} Location details
 */
async function reverseGeocode(lat, lon) {
  if (lat === undefined || lon === undefined) {
    return {
      success: false,
      error: 'Latitude and longitude are required'
    };
  }

  try {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}`;

    const response = await axios.get(url, {
      params: {
        key: API_KEY,
        include: 'current',
        elements: 'temp',
        contentType: 'json'
      },
      timeout: 5000
    });

    if (response.data) {
      const resolvedAddress = response.data.resolvedAddress || '';

      // Check if the resolved address is a placeholder or generic name
      // These indicate the API doesn't have proper address data
      const isPlaceholder = /^(old location|location|unknown|coordinates?|unnamed)$/i.test(resolvedAddress.trim());

      // Use coordinates as address if we got a placeholder
      const finalAddress = isPlaceholder
        ? `${lat.toFixed(4)}, ${lon.toFixed(4)}`
        : capitalizeAddress(resolvedAddress);

      return {
        success: true,
        location: {
          address: finalAddress,
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          timezone: response.data.timezone,
          tzOffset: response.data.tzoffset
        }
      };
    }

    return {
      success: false,
      error: 'No location found for coordinates'
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);

    // If rate limited (429) or any other error, return a fallback with coordinates
    if (error.response?.status === 429) {
      console.warn('⚠️ Rate limit hit for reverse geocoding, using coordinates as fallback');
      return {
        success: true,
        location: {
          address: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          timezone: 'UTC',
          tzOffset: 0
        }
      };
    }

    return {
      success: false,
      error: 'Failed to reverse geocode coordinates'
    };
  }
}

/**
 * Get popular/suggested locations
 * Returns a curated list of major cities
 */
function getPopularLocations() {
  return {
    success: true,
    locations: [
      { address: 'London, England, United Kingdom', latitude: 51.5074, longitude: -0.1278 },
      { address: 'New York, NY, United States', latitude: 40.7128, longitude: -74.0060 },
      { address: 'Paris, Île-de-France, France', latitude: 48.8566, longitude: 2.3522 },
      { address: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503 },
      { address: 'Sydney, NSW, Australia', latitude: -33.8688, longitude: 151.2093 },
      { address: 'Dubai, United Arab Emirates', latitude: 25.2048, longitude: 55.2708 },
      { address: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
      { address: 'Los Angeles, CA, United States', latitude: 34.0522, longitude: -118.2437 },
      { address: 'Berlin, Germany', latitude: 52.5200, longitude: 13.4050 },
      { address: 'Mumbai, Maharashtra, India', latitude: 19.0760, longitude: 72.8777 }
    ]
  };
}

module.exports = {
  searchLocations,
  reverseGeocode,
  getPopularLocations
};
