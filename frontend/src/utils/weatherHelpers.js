/**
 * Weather helper utilities
 */

/**
 * Convert Celsius to Fahrenheit
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit
 */
export function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

/**
 * Convert Fahrenheit to Celsius
 * @param {number} fahrenheit - Temperature in Fahrenheit
 * @returns {number} Temperature in Celsius
 */
export function fahrenheitToCelsius(fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
}

/**
 * Format temperature with unit
 * @param {number} temp - Temperature value
 * @param {string} unit - 'C' or 'F'
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted temperature
 */
export function formatTemperature(temp, unit = 'C', decimals = 1) {
  if (temp === null || temp === undefined) return '--';
  const value = unit === 'F' ? celsiusToFahrenheit(temp) : temp;
  return `${value.toFixed(decimals)}°${unit}`;
}

/**
 * Format date for display
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format date short (Mon, Day)
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
export function formatDateShort(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get day of week
 * @param {string} dateString - Date string
 * @returns {string} Day name
 */
export function getDayOfWeek(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Format precipitation
 * @param {number} precip - Precipitation in mm
 * @returns {string} Formatted precipitation
 */
export function formatPrecipitation(precip) {
  if (precip === null || precip === undefined) return '0 mm';
  return `${precip.toFixed(1)} mm`;
}

/**
 * Format wind speed
 * @param {number} speed - Wind speed in km/h
 * @returns {string} Formatted wind speed
 */
export function formatWindSpeed(speed) {
  if (speed === null || speed === undefined) return '--';
  return `${speed.toFixed(1)} km/h`;
}

/**
 * Get wind direction from degrees
 * @param {number} degrees - Wind direction in degrees (0-360)
 * @returns {string} Cardinal direction
 */
export function getWindDirection(degrees) {
  if (degrees === null || degrees === undefined) return '--';

  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Format humidity
 * @param {number} humidity - Humidity percentage
 * @returns {string} Formatted humidity
 */
export function formatHumidity(humidity) {
  if (humidity === null || humidity === undefined) return '--';
  return `${Math.round(humidity)}%`;
}

/**
 * Format pressure
 * @param {number} pressure - Pressure in hPa/mb
 * @returns {string} Formatted pressure
 */
export function formatPressure(pressure) {
  if (pressure === null || pressure === undefined) return '--';
  return `${Math.round(pressure)} mb`;
}

/**
 * Get weather icon emoji based on condition string
 * Centralized implementation - all components should use this
 * @param {string} conditions - Weather condition string
 * @returns {string} Weather emoji
 */
export function getWeatherEmoji(conditions) {
  if (!conditions) return '☀️';

  const c = conditions.toLowerCase();

  // Check most specific conditions first
  if (c.includes('thunder') || c.includes('storm')) return '⛈️';
  if (c.includes('rain') || c.includes('shower') || c.includes('drizzle')) return '🌧️';
  if (c.includes('snow') || c.includes('sleet') || c.includes('ice')) return '❄️';
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return '🌫️';
  if (c.includes('wind') || c.includes('breezy') || c.includes('gust')) return '💨';
  if (c.includes('partly') || c.includes('partial')) return '⛅';
  if (c.includes('cloud') || c.includes('overcast')) return '☁️';
  if (c.includes('clear') || c.includes('sunny') || c.includes('fair')) return '☀️';

  return '☀️';
}

/**
 * Calculate date range
 * @param {number} days - Number of days back from today
 * @returns {Object} { startDate, endDate } in YYYY-MM-DD format
 */
export function getDateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

/**
 * Get month range for a specific month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {Object} { startDate, endDate }
 */
export function getMonthRange(year, month) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

/**
 * Aggregate weather data for better chart readability
 * @param {Array} data - Array of weather data objects
 * @param {string} timeRange - Time range identifier (e.g., '7days', '1year')
 * @returns {Object} { aggregatedData, aggregationLabel }
 */
export function aggregateWeatherData(data, timeRange) {
  if (!data || data.length === 0) {
    return { aggregatedData: [], aggregationLabel: null };
  }

  // Determine aggregation level based on time range
  let aggregationType = 'daily';
  let aggregationLabel = null;

  if (timeRange === '7days' || timeRange === '1month') {
    // Keep daily data for short ranges (7-30 points)
    return { aggregatedData: data, aggregationLabel: null };
  } else if (timeRange === '3months' || timeRange === '6months') {
    // Use weekly averages for medium ranges (~13-26 points)
    aggregationType = 'weekly';
    aggregationLabel = 'Showing weekly averages';
  } else {
    // Use monthly averages for long ranges (12-60 points)
    aggregationType = 'monthly';
    aggregationLabel = 'Showing monthly averages';
  }

  // Group data by period
  const groups = {};

  data.forEach((day) => {
    const date = new Date(day.date);
    let key;

    if (aggregationType === 'weekly') {
      // Group by week (ISO week)
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const weekNum = Math.ceil(((date - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
      key = `${date.getFullYear()}-W${weekNum}`;
    } else if (aggregationType === 'monthly') {
      // Group by month
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(day);
  });

  // Calculate averages for each group
  const aggregatedData = Object.keys(groups)
    .sort()
    .map((key) => {
      const groupData = groups[key];
      const firstDate = new Date(groupData[0].date);

      // Calculate averages for all metrics
      const avgTemp =
        groupData.reduce((sum, d) => sum + (d.tempAvg || d.temp || 0), 0) / groupData.length;
      const avgTempMax =
        groupData.reduce((sum, d) => sum + (d.tempMax || d.tempHigh || 0), 0) / groupData.length;
      const avgTempMin =
        groupData.reduce((sum, d) => sum + (d.tempMin || d.tempLow || 0), 0) / groupData.length;
      const totalPrecip = groupData.reduce((sum, d) => sum + (d.precipitation || d.precip || 0), 0);
      const avgHumidity =
        groupData.reduce((sum, d) => sum + (d.humidity || 0), 0) / groupData.length;
      const avgWindSpeed =
        groupData.reduce((sum, d) => sum + (d.windSpeed || 0), 0) / groupData.length;
      const avgWindDirection =
        groupData.reduce((sum, d) => sum + (d.windDirection || 0), 0) / groupData.length;
      const avgPrecipProb =
        groupData.reduce((sum, d) => sum + (d.precipProbability || d.precipProb || 0), 0) /
        groupData.length;

      // Create display label
      let displayLabel;
      if (aggregationType === 'weekly') {
        displayLabel = `Week of ${firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      } else {
        displayLabel = firstDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }

      return {
        date: groupData[0].date, // Use first date as representative
        displayLabel,
        temp: avgTemp,
        tempAvg: avgTemp,
        tempMax: avgTempMax,
        tempMin: avgTempMin,
        tempHigh: avgTempMax,
        tempLow: avgTempMin,
        precipitation: totalPrecip,
        precip: totalPrecip,
        humidity: avgHumidity,
        windSpeed: avgWindSpeed,
        windDirection: avgWindDirection,
        precipProbability: avgPrecipProb,
        precipProb: avgPrecipProb,
        conditions: groupData[0].conditions, // Take first day's conditions
        snow: groupData.reduce((sum, d) => sum + (d.snow || 0), 0),
        aggregatedDays: groupData.length, // Track how many days were aggregated
      };
    });

  return { aggregatedData, aggregationLabel };
}

/**
 * Format date for aggregated data labels
 * @param {string} dateString - Date string
 * @param {string} aggregationType - 'daily', 'weekly', or 'monthly'
 * @returns {string} Formatted date label
 */
export function formatAggregatedDate(dateString, aggregationType = 'daily') {
  const date = new Date(dateString);

  if (aggregationType === 'monthly') {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } else if (aggregationType === 'weekly') {
    return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  } else {
    return formatDateShort(dateString);
  }
}
