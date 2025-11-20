/**
 * Weather Data Queries - React Query Implementation
 *
 * Migration from useWeatherData.js (legacy useState/useEffect pattern)
 * to modern React Query hooks with automatic caching, retries, and deduplication.
 *
 * Part of P0-4: TanStack Query Migration
 *
 * Benefits over legacy hooks:
 * - Automatic caching (5 min stale time, 30 min cache)
 * - Automatic retries with exponential backoff
 * - Request deduplication (prevents duplicate in-flight requests)
 * - Refetch on reconnect
 * - DevTools integration for debugging
 * - ~50% less boilerplate code
 *
 * Usage:
 *   const { data, isLoading, error, refetch } = useCurrentWeatherQuery(lat, lng);
 *   const { data, isLoading, error } = useForecastQuery(lat, lng, days);
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../config/queryClient';
import {
  getCurrentWeather,
  getWeatherForecast,
  getHourlyForecast,
  getHistoricalWeather,
} from '../services/weatherApi';

/**
 * Query: Current weather for a location
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {Object} options - React Query options (enabled, refetchInterval, etc.)
 * @returns {Object} { data, isLoading, error, refetch, ... }
 *
 * @example
 * const { data: weather, isLoading, error } = useCurrentWeatherQuery(40.7128, -74.0060);
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * return <WeatherDisplay weather={weather} />;
 */
export function useCurrentWeatherQuery(lat, lng, options = {}) {
  return useQuery({
    queryKey: queryKeys.weather.current(lat, lng),
    queryFn: async () => {
      // Convert lat/lng to location string format expected by API
      // API expects "lat,lng" format
      const location = `${lat},${lng}`;
      return getCurrentWeather(location);
    },
    // Only run query if we have valid coordinates
    enabled: lat != null && lng != null && options.enabled !== false,
    // Merge any custom options
    ...options,
  });
}

/**
 * Query: Weather forecast for a location
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} days - Number of forecast days (default: 7)
 * @param {Object} options - React Query options
 * @returns {Object} { data, isLoading, error, refetch, ... }
 *
 * @example
 * const { data: forecast } = useForecastQuery(40.7128, -74.0060, 7);
 */
export function useForecastQuery(lat, lng, days = 7, options = {}) {
  return useQuery({
    queryKey: queryKeys.weather.forecast(lat, lng),
    queryFn: async () => {
      const location = `${lat},${lng}`;
      return getWeatherForecast(location, days);
    },
    enabled: lat != null && lng != null && options.enabled !== false,
    ...options,
  });
}

/**
 * Query: Hourly forecast for a location
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} hours - Number of forecast hours (default: 48)
 * @param {Object} options - React Query options
 * @returns {Object} { data, isLoading, error, refetch, ... }
 *
 * @example
 * const { data: hourly } = useHourlyForecastQuery(40.7128, -74.0060, 48);
 */
export function useHourlyForecastQuery(lat, lng, hours = 48, options = {}) {
  return useQuery({
    queryKey: queryKeys.weather.hourly(lat, lng, hours),
    queryFn: async () => {
      const location = `${lat},${lng}`;
      return getHourlyForecast(location, hours);
    },
    enabled: lat != null && lng != null && options.enabled !== false,
    ...options,
  });
}

/**
 * Query: Historical weather data for a location
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} startDate - Start date (YYYY-MM-DD format)
 * @param {string} endDate - End date (YYYY-MM-DD format)
 * @param {Object} options - React Query options
 * @returns {Object} { data, isLoading, error, refetch, ... }
 *
 * @example
 * const { data: historical } = useHistoricalWeatherQuery(
 *   40.7128,
 *   -74.0060,
 *   '2024-01-01',
 *   '2024-01-31'
 * );
 */
export function useHistoricalWeatherQuery(lat, lng, startDate, endDate, options = {}) {
  return useQuery({
    queryKey: queryKeys.weather.historical(lat, lng, startDate, endDate),
    queryFn: async () => {
      const location = `${lat},${lng}`;
      return getHistoricalWeather(location, startDate, endDate);
    },
    enabled:
      lat != null &&
      lng != null &&
      startDate != null &&
      endDate != null &&
      options.enabled !== false,
    ...options,
  });
}

/**
 * Legacy compatibility exports
 * These maintain the same API as the old useWeatherData hook
 * for easier gradual migration
 */

/**
 * @deprecated Use useCurrentWeatherQuery instead
 * Provided for backward compatibility during migration
 */
export function useCurrentWeather(location) {
  // Parse location string to lat/lng if needed
  // This is a simplified version - in production, you'd need proper parsing
  console.warn(
    'useCurrentWeather (string location) is deprecated. Use useCurrentWeatherQuery(lat, lng) instead.'
  );

  const [lat, lng] = typeof location === 'string' ? location.split(',').map(Number) : [null, null];

  const query = useCurrentWeatherQuery(lat, lng);

  // Transform React Query result to match old hook API
  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * @deprecated Use useForecastQuery instead
 */
export function useForecast(location, days = 7) {
  console.warn(
    'useForecast (string location) is deprecated. Use useForecastQuery(lat, lng, days) instead.'
  );

  const [lat, lng] = typeof location === 'string' ? location.split(',').map(Number) : [null, null];

  const query = useForecastQuery(lat, lng, days);

  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * @deprecated Use useHourlyForecastQuery instead
 */
export function useHourlyForecast(location, hours = 48) {
  console.warn(
    'useHourlyForecast (string location) is deprecated. Use useHourlyForecastQuery(lat, lng, hours) instead.'
  );

  const [lat, lng] = typeof location === 'string' ? location.split(',').map(Number) : [null, null];

  const query = useHourlyForecastQuery(lat, lng, hours);

  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * @deprecated Use useHistoricalWeatherQuery instead
 */
export function useHistoricalWeather(location, startDate, endDate) {
  console.warn(
    'useHistoricalWeather (string location) is deprecated. Use useHistoricalWeatherQuery(lat, lng, startDate, endDate) instead.'
  );

  const [lat, lng] = typeof location === 'string' ? location.split(',').map(Number) : [null, null];

  const query = useHistoricalWeatherQuery(lat, lng, startDate, endDate);

  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
