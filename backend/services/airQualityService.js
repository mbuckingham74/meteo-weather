const axios = require('axios');
const { withCache, CACHE_TTL } = require('./cacheService');

/**
 * Open-Meteo Air Quality API Service
 * Documentation: https://open-meteo.com/en/docs/air-quality-api
 */

const AIR_QUALITY_API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

/**
 * Get Air Quality Index (AQI) data for a location
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {number} days - Number of forecast days (default: 7, max: 5)
 * @returns {Promise<object>} Air quality data
 */
async function getAirQuality(latitude, longitude, days = 5) {
  // Validate inputs
  if (!latitude || !longitude) {
    return {
      success: false,
      error: 'Latitude and longitude are required',
      statusCode: 400,
    };
  }

  // Round coordinates to 2 decimal places for better cache hits
  const lat = Math.round(latitude * 100) / 100;
  const lon = Math.round(longitude * 100) / 100;

  return withCache(
    'open_meteo',
    { endpoint: 'air_quality', lat, lon, days },
    async () => {
      try {
        // Build API URL with parameters
        const params = new URLSearchParams({
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          hourly:
            'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,aerosol_optical_depth,dust,uv_index,uv_index_clear_sky',
          current:
            'european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust',
          forecast_days: Math.min(days, 5).toString(),
          timezone: 'auto',
        });

        const url = `${AIR_QUALITY_API_URL}?${params.toString()}`;

        // Make API request
        const response = await axios.get(url, {
          timeout: 10000,
          headers: {
            Accept: 'application/json',
          },
        });

        // Process and return data
        return {
          success: true,
          data: processAirQualityData(response.data),
        };
      } catch (error) {
        console.error('Open-Meteo Air Quality API Error:', error.message);

        return {
          success: false,
          error:
            error.response?.data?.reason || error.message || 'Failed to fetch air quality data',
          statusCode: error.response?.status || 500,
        };
      }
    },
    CACHE_TTL.AIR_QUALITY
  );
}

/**
 * Process raw air quality data into a more usable format
 * @param {object} rawData - Raw API response
 * @returns {object} Processed air quality data
 */
function processAirQualityData(rawData) {
  const processed = {
    location: {
      latitude: rawData.latitude,
      longitude: rawData.longitude,
      timezone: rawData.timezone,
      elevation: rawData.elevation,
    },
    current: null,
    hourly: [],
    summary: null,
  };

  // Process current conditions
  if (rawData.current) {
    const current = rawData.current;
    processed.current = {
      time: current.time,
      europeanAQI: current.european_aqi,
      usAQI: current.us_aqi,
      pm10: current.pm10,
      pm2_5: current.pm2_5,
      carbonMonoxide: current.carbon_monoxide,
      nitrogenDioxide: current.nitrogen_dioxide,
      sulphurDioxide: current.sulphur_dioxide,
      ozone: current.ozone,
      dust: current.dust,
      aqiLevel: getAQILevel(current.us_aqi || current.european_aqi),
      healthRecommendation: getHealthRecommendation(current.us_aqi || current.european_aqi),
    };
  }

  // Process hourly data
  if (rawData.hourly && rawData.hourly.time) {
    const hourly = rawData.hourly;
    for (let i = 0; i < hourly.time.length; i++) {
      processed.hourly.push({
        time: hourly.time[i],
        pm10: hourly.pm10?.[i],
        pm2_5: hourly.pm2_5?.[i],
        carbonMonoxide: hourly.carbon_monoxide?.[i],
        nitrogenDioxide: hourly.nitrogen_dioxide?.[i],
        sulphurDioxide: hourly.sulphur_dioxide?.[i],
        ozone: hourly.ozone?.[i],
        aerosol: hourly.aerosol_optical_depth?.[i],
        dust: hourly.dust?.[i],
        uvIndex: hourly.uv_index?.[i],
        uvIndexClearSky: hourly.uv_index_clear_sky?.[i],
      });
    }
  }

  // Calculate summary statistics
  if (processed.hourly.length > 0) {
    const pm25Values = processed.hourly.map((h) => h.pm2_5).filter((v) => v !== null);
    const ozoneValues = processed.hourly.map((h) => h.ozone).filter((v) => v !== null);

    processed.summary = {
      avgPM25: average(pm25Values),
      maxPM25: Math.max(...pm25Values),
      avgOzone: average(ozoneValues),
      maxOzone: Math.max(...ozoneValues),
    };
  }

  return processed;
}

/**
 * Get AQI level description
 * @param {number} aqi - AQI value
 * @returns {object} AQI level information
 */
function getAQILevel(aqi) {
  if (!aqi) {
    return {
      level: 'Unknown',
      color: 'var(--text-tertiary)',
      description: 'Air quality data is unavailable',
    };
  }

  if (aqi <= 50) {
    return {
      level: 'Good',
      color: 'var(--success-text)',
      description: 'Air quality is satisfactory',
    };
  } else if (aqi <= 100) {
    return {
      level: 'Moderate',
      color: 'var(--warning-text)',
      description: 'Acceptable for most people',
    };
  } else if (aqi <= 150) {
    return {
      level: 'Unhealthy for Sensitive Groups',
      color: 'var(--alert-watch)',
      description: 'Sensitive groups may experience effects',
    };
  } else if (aqi <= 200) {
    return {
      level: 'Unhealthy',
      color: 'var(--alert-warning)',
      description: 'Everyone may begin to experience health effects',
    };
  } else if (aqi <= 300) {
    return {
      level: 'Very Unhealthy',
      color: 'var(--alert-critical)',
      description: 'Health alert: everyone may experience serious effects',
    };
  } else {
    return {
      level: 'Hazardous',
      color: 'var(--alert-critical)',
      description: 'Health warnings of emergency conditions',
    };
  }
}

/**
 * Get health recommendations based on AQI
 * @param {number} aqi - AQI value
 * @returns {array} Health recommendations
 */
function getHealthRecommendation(aqi) {
  if (!aqi) return [];

  if (aqi <= 50) {
    return ['Air quality is good. Enjoy outdoor activities!'];
  } else if (aqi <= 100) {
    return [
      'Air quality is acceptable for most people',
      'Unusually sensitive people should consider reducing prolonged outdoor exertion',
    ];
  } else if (aqi <= 150) {
    return [
      'Sensitive groups should reduce prolonged outdoor exertion',
      'General public: No restrictions on outdoor activities',
    ];
  } else if (aqi <= 200) {
    return [
      'Everyone should reduce prolonged outdoor exertion',
      'Sensitive groups should avoid prolonged outdoor exertion',
    ];
  } else if (aqi <= 300) {
    return [
      'Everyone should avoid prolonged outdoor exertion',
      'Sensitive groups should remain indoors and keep activity levels low',
    ];
  } else {
    return [
      'Everyone should avoid all outdoor exertion',
      'Sensitive groups should remain indoors and avoid physical activities',
    ];
  }
}

/**
 * Calculate average of an array
 * @param {array} values - Array of numbers
 * @returns {number} Average value
 */
function average(values) {
  if (!values || values.length === 0) return 0;
  return (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1);
}

module.exports = {
  getAirQuality,
};
