/**
 * Climate Data Queries - React Query Implementation
 *
 * Migration from useClimateData.js (legacy useState/useEffect pattern)
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
 * - Eliminates manual cancellation token management
 * - ~60% less boilerplate code
 *
 * Usage:
 *   const { data, isLoading, error } = useClimateNormalsQuery(lat, lng, date, years);
 *   const { data, isLoading, error, refetch } = useRecordTemperaturesQuery(...);
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../config/queryClient';
import {
  getClimateNormals,
  getRecordTemperatures,
  compareForecastWithNormals,
  getThisDayInHistory,
  getTemperatureProbability,
} from '../services/climateApi';

/**
 * Query: Climate normals for a specific date
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {number} years - Number of years to include in analysis (default: 10)
 * @param {Object} options - React Query options
 * @returns {Object} { data, isLoading, error, refetch, ... }
 *
 * @example
 * const { data: normals, isLoading } = useClimateNormalsQuery(
 *   40.7128,
 *   -74.0060,
 *   '2024-01-15',
 *   10
 * );
 */
export function useClimateNormalsQuery(lat, lng, date, years = 10, options = {}) {
  return useQuery({
    queryKey: queryKeys.climate.normals(lat, lng, date, years),
    queryFn: async () => {
      const location = `${lat},${lng}`;
      const response = await getClimateNormals(location, date, years);

      // Handle legacy API response format
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch climate normals');
      }

      return response;
    },
    enabled: lat != null && lng != null && date != null && options.enabled !== false,
    ...options,
  });
}

/**
 * Query: Record temperatures for a date range
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {number} years - Number of years to include (default: 10)
 * @param {Object} options - React Query options
 * @returns {Object} { data, isLoading, error, refetch, ... }
 *
 * @example
 * const { data: records, refetch } = useRecordTemperaturesQuery(
 *   40.7128,
 *   -74.0060,
 *   '2024-01-01',
 *   '2024-01-31',
 *   10
 * );
 */
export function useRecordTemperaturesQuery(lat, lng, startDate, endDate, years = 10, options = {}) {
  return useQuery({
    queryKey: queryKeys.climate.records(lat, lng, startDate, endDate, years),
    queryFn: async () => {
      const location = `${lat},${lng}`;
      const response = await getRecordTemperatures(location, startDate, endDate, years);

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch record temperatures');
      }

      return response;
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
 * Query: Compare forecast with historical climate data
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {Array} forecastData - Forecast data array with date fields
 * @param {number} years - Number of years for comparison (default: 10)
 * @param {Object} options - React Query options
 * @returns {Object} { data, isLoading, error, refetch, ... }
 *
 * @example
 * const { data: comparison } = useForecastComparisonQuery(
 *   40.7128,
 *   -74.0060,
 *   forecastData,
 *   10
 * );
 */
export function useForecastComparisonQuery(lat, lng, forecastData, years = 10, options = {}) {
  // Extract start and end dates from forecast data
  const dates =
    forecastData && forecastData.length > 0 ? forecastData.map((d) => d.date).sort() : [null, null];
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  return useQuery({
    queryKey: queryKeys.climate.forecastComparison(lat, lng, startDate, endDate, years),
    queryFn: async () => {
      const location = `${lat},${lng}`;
      const response = await compareForecastWithNormals(location, startDate, endDate, years);

      if (!response.success) {
        throw new Error(response.error || 'Failed to compare with historical data');
      }

      return response.comparisons;
    },
    enabled:
      lat != null &&
      lng != null &&
      forecastData != null &&
      forecastData.length > 0 &&
      startDate != null &&
      endDate != null &&
      options.enabled !== false,
    ...options,
  });
}

/**
 * Query: "This Day in History" weather data
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string|null} date - Date string (MM-DD format), null for today
 * @param {number} years - Number of years to look back (default: 10)
 * @param {Object} options - React Query options
 * @returns {Object} { data, isLoading, error, refetch, ... }
 *
 * @example
 * // Get historical data for today
 * const { data: history } = useThisDayInHistoryQuery(40.7128, -74.0060, null, 10);
 *
 * // Get historical data for specific date
 * const { data: history } = useThisDayInHistoryQuery(40.7128, -74.0060, '01-15', 10);
 */
export function useThisDayInHistoryQuery(lat, lng, date = null, years = 10, options = {}) {
  // Use current date if not provided (MM-DD format)
  const queryDate = date || new Date().toISOString().split('T')[0].substring(5);

  return useQuery({
    queryKey: queryKeys.climate.thisDayInHistory(lat, lng, queryDate, years),
    queryFn: async () => {
      const location = `${lat},${lng}`;
      const response = await getThisDayInHistory(location, queryDate, years);

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch historical data');
      }

      return response;
    },
    enabled: lat != null && lng != null && options.enabled !== false,
    ...options,
  });
}

/**
 * Query: Temperature probability distribution
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {number} years - Number of years for analysis (default: 10)
 * @param {Object} options - React Query options
 * @returns {Object} { data, isLoading, error, refetch, ... }
 *
 * @example
 * const { data: probability } = useTemperatureProbabilityQuery(
 *   40.7128,
 *   -74.0060,
 *   '2024-01-15',
 *   10
 * );
 */
export function useTemperatureProbabilityQuery(lat, lng, startDate, years = 10, options = {}) {
  return useQuery({
    queryKey: queryKeys.climate.temperatureProbability(lat, lng, startDate, years),
    queryFn: async () => {
      const location = `${lat},${lng}`;
      const response = await getTemperatureProbability(location, startDate, years);

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch temperature probability');
      }

      return response;
    },
    enabled: lat != null && lng != null && startDate != null && options.enabled !== false,
    ...options,
  });
}
