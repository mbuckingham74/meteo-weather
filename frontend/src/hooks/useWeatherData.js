import { useState, useEffect } from 'react';
import {
  getCurrentWeather,
  getWeatherForecast,
  getHourlyForecast,
  getHistoricalWeather,
} from '../services/weatherApi';

/**
 * @deprecated This hook is deprecated and will be removed in a future version.
 * Use the new React Query hooks instead:
 * - useCurrentWeatherQuery() from '../hooks/useWeatherQueries'
 * - useForecastQuery() from '../hooks/useWeatherQueries'
 * - useHourlyForecastQuery() from '../hooks/useWeatherQueries'
 * - useHistoricalWeatherQuery() from '../hooks/useWeatherQueries'
 *
 * Benefits of React Query hooks:
 * - Automatic caching (5 min stale time, 30 min GC)
 * - Request deduplication
 * - Automatic retries with exponential backoff
 * - Better error handling
 * - DevTools integration
 *
 * Migration guide: See frontend/src/hooks/useWeatherQueries.js
 *
 * @param {string} location - Location to fetch weather for
 * @param {string} type - Type of data: 'current', 'forecast', 'historical'
 * @param {Object} options - Additional options (days for forecast, date range for historical)
 * @returns {Object} { data, loading, error, refetch }
 */
export function useWeatherData(location, type = 'current', options = {}) {
  // Deprecation warning (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      `[DEPRECATED] useWeatherData() is deprecated. Use React Query hooks from useWeatherQueries.js instead. See migration guide for details.`
    );
  }
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!location) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;

      switch (type) {
        case 'current':
          result = await getCurrentWeather(location);
          break;

        case 'forecast':
          result = await getWeatherForecast(location, options.days || 7);
          break;

        case 'hourly':
          result = await getHourlyForecast(location, options.hours || 48);
          break;

        case 'historical':
          if (!options.startDate || !options.endDate) {
            throw new Error('Start and end dates are required for historical data');
          }
          result = await getHistoricalWeather(location, options.startDate, options.endDate);
          break;

        default:
          throw new Error(`Unknown data type: ${type}`);
      }

      setData(result);
      setError(null);
    } catch (err) {
      console.error(`Error fetching ${type} weather:`, err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch weather data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, type, options.days, options.startDate, options.endDate]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * @deprecated Use useCurrentWeatherQuery() from '../hooks/useWeatherQueries' instead
 * Hook for fetching current weather
 */
export function useCurrentWeather(location) {
  return useWeatherData(location, 'current');
}

/**
 * @deprecated Use useForecastQuery() from '../hooks/useWeatherQueries' instead
 * Hook for fetching forecast
 */
export function useForecast(location, days = 7) {
  return useWeatherData(location, 'forecast', { days });
}

/**
 * @deprecated Use useHistoricalWeatherQuery() from '../hooks/useWeatherQueries' instead
 * Hook for fetching historical weather
 */
export function useHistoricalWeather(location, startDate, endDate) {
  return useWeatherData(location, 'historical', { startDate, endDate });
}

/**
 * @deprecated Use useHourlyForecastQuery() from '../hooks/useWeatherQueries' instead
 * Hook for fetching hourly forecast
 */
export function useHourlyForecast(location, hours = 48) {
  return useWeatherData(location, 'hourly', { hours });
}
