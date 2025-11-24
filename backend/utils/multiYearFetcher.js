/**
 * Multi-Year Data Fetcher Utility
 * Provides centralized, consistent logic for fetching weather data across multiple years.
 *
 * This is the SINGLE SOURCE OF TRUTH for year-by-year historical data fetching.
 * Both weatherService and climateService should use this utility to prevent
 * duplication and ensure consistent batching/backoff behavior.
 */

/**
 * Default configuration for multi-year fetching
 */
const DEFAULT_CONFIG = {
  batchSize: 3, // Number of concurrent requests per batch
  batchDelayMs: 200, // Delay between batches (ms)
  requestDelayMs: 100, // Delay between individual requests within error handling
};

/**
 * Fetch data for multiple years with consistent batching and error handling
 *
 * @param {Object} options - Fetch options
 * @param {number} options.years - Number of years to fetch
 * @param {Function} options.fetchYear - Async function(year) that fetches data for a single year
 * @param {number} [options.startYear] - Starting year (defaults to last year)
 * @param {number} [options.batchSize] - Requests per batch (default: 3)
 * @param {number} [options.batchDelayMs] - Delay between batches in ms (default: 200)
 * @returns {Promise<Object>} Result with data array and errors array
 *
 * @example
 * const result = await fetchMultipleYears({
 *   years: 10,
 *   fetchYear: async (year) => {
 *     const data = await getHistoricalWeather(location, `${year}-01-01`, `${year}-01-31`);
 *     return data.success ? { year, data: data.historical } : null;
 *   }
 * });
 */
async function fetchMultipleYears(options) {
  const {
    years,
    fetchYear,
    startYear = new Date().getFullYear() - 1,
    batchSize = DEFAULT_CONFIG.batchSize,
    batchDelayMs = DEFAULT_CONFIG.batchDelayMs,
  } = options;

  const allData = [];
  const errors = [];

  // Process in batches to respect rate limits
  for (let i = 0; i < years; i += batchSize) {
    const batch = [];

    for (let j = 0; j < batchSize && i + j < years; j++) {
      const year = startYear - i - j;

      batch.push(
        (async () => {
          try {
            const result = await fetchYear(year);
            return result;
          } catch (error) {
            errors.push({ year, error: error.message });
            return null;
          }
        })()
      );
    }

    const batchResults = await Promise.all(batch);
    allData.push(...batchResults.filter((d) => d !== null));

    // Delay between batches (skip after last batch)
    if (i + batchSize < years) {
      await new Promise((resolve) => setTimeout(resolve, batchDelayMs));
    }
  }

  return {
    data: allData,
    errors: errors.length > 0 ? errors : undefined,
    yearsRequested: years,
    yearsReceived: allData.length,
  };
}

/**
 * Fetch data for a specific date (MM-DD) across multiple years
 *
 * @param {Object} options - Fetch options
 * @param {string} options.date - Date in MM-DD format
 * @param {number} options.years - Number of years to fetch
 * @param {Function} options.fetchDateForYear - Async function(fullDate, year) that fetches data
 * @param {number} [options.batchSize] - Requests per batch (default: 3)
 * @param {number} [options.batchDelayMs] - Delay between batches in ms (default: 200)
 * @returns {Promise<Object>} Result with data array and errors array
 *
 * @example
 * const result = await fetchDateAcrossYears({
 *   date: '11-01',
 *   years: 25,
 *   fetchDateForYear: async (fullDate, year) => {
 *     return await makeApiRequest(`/weather/${fullDate}`);
 *   }
 * });
 */
async function fetchDateAcrossYears(options) {
  const {
    date,
    years,
    fetchDateForYear,
    batchSize = DEFAULT_CONFIG.batchSize,
    batchDelayMs = DEFAULT_CONFIG.batchDelayMs,
  } = options;

  const [month, day] = date.split('-');
  const currentYear = new Date().getFullYear();

  return fetchMultipleYears({
    years,
    batchSize,
    batchDelayMs,
    startYear: currentYear - 1,
    fetchYear: async (year) => {
      const fullDate = `${year}-${month}-${day}`;
      const result = await fetchDateForYear(fullDate, year);
      return result ? { year, date: fullDate, ...result } : null;
    },
  });
}

module.exports = {
  fetchMultipleYears,
  fetchDateAcrossYears,
  DEFAULT_CONFIG,
};
