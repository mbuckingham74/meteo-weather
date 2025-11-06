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
 * Reverse geocode using OpenStreetMap Nominatim (free, no API key)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object|null>} Location address or null if failed
 */
async function reverseGeocodeNominatim(lat, lon) {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon,
        format: 'json',
        addressdetails: 1,
        zoom: 10 // City level
      },
      headers: {
        'User-Agent': 'Meteo-Weather-App/1.0'
      },
      timeout: 5000
    });

    if (response.data && response.data.address) {
      const addr = response.data.address;

      // Build a clean address string from OSM data
      const parts = [];
      if (addr.city) parts.push(addr.city);
      else if (addr.town) parts.push(addr.town);
      else if (addr.village) parts.push(addr.village);
      else if (addr.county) parts.push(addr.county);

      if (addr.state) parts.push(addr.state);
      if (addr.country) parts.push(addr.country);

      if (parts.length > 0) {
        console.log(`✅ Nominatim reverse geocoding successful: ${parts.join(', ')}`);
        return {
          address: parts.join(', '),
          source: 'nominatim'
        };
      }
    }

    return null;
  } catch (error) {
    console.warn(`⚠️ Nominatim reverse geocoding failed: ${error.message}`);
    return null;
  }
}

/**
 * Get location details by coordinates
 * Uses Nominatim first (free, reliable), falls back to Visual Crossing
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

  // Try Nominatim first (free, no rate limits, no API key)
  const nominatimResult = await reverseGeocodeNominatim(lat, lon);

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

      // Prefer Nominatim result if Visual Crossing returned a placeholder
      let finalAddress;
      if (isPlaceholder && nominatimResult) {
        finalAddress = nominatimResult.address;
        console.log(`🌍 Using Nominatim address instead of Visual Crossing placeholder`);
      } else if (isPlaceholder) {
        finalAddress = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        console.log(`⚠️ Both services failed, using coordinates`);
      } else {
        // Visual Crossing returned a good address, but prefer Nominatim if available
        // as it's more reliable for city names
        finalAddress = nominatimResult ? nominatimResult.address : capitalizeAddress(resolvedAddress);
        if (nominatimResult) {
          console.log(`🌍 Using Nominatim address (more reliable)`);
        }
      }

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

    // If we have Nominatim data, use it even if Visual Crossing failed
    if (nominatimResult) {
      console.log(`🌍 Visual Crossing failed, but Nominatim succeeded`);
      return {
        success: true,
        location: {
          address: nominatimResult.address,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          timezone: 'UTC', // Default timezone when VC fails
          tzOffset: 0
        }
      };
    }

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
