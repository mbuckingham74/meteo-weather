/**
 * Date Range Hints Utility
 * Provides helpful date range suggestions when historical data is unavailable
 * Part of Error Recovery UX Enhancement
 */

/**
 * Data availability rules for different data types
 */
const DATA_AVAILABILITY = {
  // Current weather: always available
  current: {
    minDaysAgo: 0,
    maxDaysAgo: 0,
    description: 'Current weather is always available',
  },

  // Forecast: up to 7 days ahead
  forecast: {
    minDaysAgo: 0,
    maxDaysAhead: 7,
    description: 'Forecast available for the next 7 days',
  },

  // Historical weather: typically 5 years back, but varies by location
  historical: {
    minDaysAgo: 1,
    maxDaysAgo: 1825, // 5 years
    description: 'Historical data available for the past 5 years',
  },

  // Climate normals: 10+ years of data
  climateNormals: {
    minYears: 10,
    description: 'Climate normals calculated from 10+ years of data',
  },
};

/**
 * Get available date range for a data type
 * @param {string} dataType - Type of data (current, forecast, historical, climateNormals)
 * @returns {Object} - Date range with start and end dates
 */
export function getAvailableDateRange(dataType) {
  const today = new Date();
  const availability = DATA_AVAILABILITY[dataType] || DATA_AVAILABILITY.historical;

  switch (dataType) {
    case 'current':
      return {
        start: today,
        end: today,
        description: availability.description,
      };

    case 'forecast':
      return {
        start: today,
        end: new Date(today.getTime() + availability.maxDaysAhead * 24 * 60 * 60 * 1000),
        description: availability.description,
      };

    case 'historical':
      return {
        start: new Date(today.getTime() - availability.maxDaysAgo * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() - availability.minDaysAgo * 24 * 60 * 60 * 1000),
        description: availability.description,
      };

    case 'climateNormals':
      return {
        minYears: availability.minYears,
        description: availability.description,
      };

    default:
      // Default to historical range for unknown types
      return {
        start: new Date(
          today.getTime() - DATA_AVAILABILITY.historical.maxDaysAgo * 24 * 60 * 60 * 1000
        ),
        end: new Date(
          today.getTime() - DATA_AVAILABILITY.historical.minDaysAgo * 24 * 60 * 60 * 1000
        ),
        description: DATA_AVAILABILITY.historical.description,
      };
  }
}

/**
 * Format date range as human-readable string
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {string} - Formatted date range
 */
export function formatDateRange(startDate, endDate) {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };

  if (!endDate || startDate.toDateString() === endDate.toDateString()) {
    return startDate.toLocaleDateString('en-US', options);
  }

  return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
}

/**
 * Check if a date is within available range
 * @param {Date} date - Date to check
 * @param {string} dataType - Type of data
 * @returns {boolean} - True if date is available
 */
export function isDateAvailable(date, dataType) {
  const range = getAvailableDateRange(dataType);
  if (!range || !range.start || !range.end) return false;

  // Normalize dates to midnight for day-based comparison
  const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const normalizedDate = normalizeDate(date);
  const normalizedStart = normalizeDate(range.start);
  const normalizedEnd = normalizeDate(range.end);

  return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
}

/**
 * Get suggestion message for "no data" errors
 * @param {string} dataType - Type of data that failed
 * @param {Date} requestedDate - The date that was requested (optional)
 * @returns {string} - Helpful suggestion message
 */
export function getNoDataSuggestion(dataType = 'historical', requestedDate = null) {
  const range = getAvailableDateRange(dataType);
  if (!range) {
    return 'Historical data may not be available for this location or time period.';
  }

  // If we have a requested date, check if it's out of range
  if (requestedDate && range.start && range.end) {
    const reqDate = new Date(requestedDate);

    if (reqDate > range.end) {
      // Date is in the future - provide data-type-specific message
      if (dataType === 'forecast') {
        return `Forecast data is only available for the next 7 days. Try dates between ${formatDateRange(range.start, range.end)}.`;
      }
      return `Data not available for future dates. Try dates between ${formatDateRange(range.start, range.end)}.`;
    }

    if (reqDate < range.start) {
      // Date is in the past - provide data-type-specific message
      if (dataType === 'forecast') {
        return `Forecast data is only available for future dates. Your date is in the past. Try dates between ${formatDateRange(range.start, range.end)}.`;
      }
      if (dataType === 'historical') {
        const yearsAgo = Math.floor(
          (Date.now() - reqDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        );
        return `Historical data only available for the past 5 years. Your date is ${yearsAgo} years ago. Try a more recent date.`;
      }
      return `Data not available for this date. Try dates between ${formatDateRange(range.start, range.end)}.`;
    }
  }

  // Generic suggestion based on data type
  switch (dataType) {
    case 'forecast':
      return `Forecast data is only available for the next 7 days. Try a date between today and ${formatDateRange(range.end, range.end)}.`;

    case 'historical':
      return `Historical weather data is available from ${formatDateRange(range.start, new Date())}. Some remote locations may have limited data.`;

    case 'climateNormals':
      return `Climate normals require at least ${range.minYears} years of historical data. Some locations may not have enough data available.`;

    default:
      return 'Try selecting a different date range or location.';
  }
}

/**
 * Get alternative date suggestions
 * @param {Date} failedDate - The date that had no data
 * @param {string} dataType - Type of data
 * @returns {Array<Object>} - Array of {date, label} suggestions
 */
export function getAlternativeDateSuggestions(failedDate, dataType = 'historical') {
  const suggestions = [];
  const today = new Date();

  switch (dataType) {
    case 'historical': {
      // Suggest same day last year
      const lastYear = new Date(failedDate);
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      if (isDateAvailable(lastYear, dataType)) {
        suggestions.push({
          date: lastYear,
          label: 'Same day last year',
        });
      }

      // Suggest one week ago
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      suggestions.push({
        date: weekAgo,
        label: 'One week ago',
      });

      // Suggest one month ago
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      suggestions.push({
        date: monthAgo,
        label: 'One month ago',
      });
      break;
    }

    case 'forecast': {
      // Suggest tomorrow
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      suggestions.push({
        date: tomorrow,
        label: 'Tomorrow',
      });

      // Suggest this weekend
      const saturday = new Date(today);
      const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
      saturday.setDate(saturday.getDate() + daysUntilSaturday);
      if (isDateAvailable(saturday, dataType)) {
        suggestions.push({
          date: saturday,
          label: 'This Saturday',
        });
      }
      break;
    }
  }

  return suggestions.filter((s) => isDateAvailable(s.date, dataType));
}

export default {
  getAvailableDateRange,
  formatDateRange,
  isDateAvailable,
  getNoDataSuggestion,
  getAlternativeDateSuggestions,
};
