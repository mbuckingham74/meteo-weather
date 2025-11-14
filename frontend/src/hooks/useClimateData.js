/**
 * Climate Data Hooks
 * Custom React hooks for fetching climate and historical weather data
 *
 * Migration: Part of P0-P3A API Architecture Improvements
 * Now uses centralized climateApi service instead of direct axios calls
 *
 * Benefits:
 * - Automatic retry with exponential backoff
 * - Request deduplication (prevents duplicate in-flight requests)
 * - Unified error handling via ApiError
 * - Consistent timeout configuration
 */

import { useState, useEffect } from 'react';
import {
  getClimateNormals,
  getRecordTemperatures,
  compareForecastWithNormals,
  getThisDayInHistory,
  getTemperatureProbability,
} from '../services/climateApi';
import { ApiError } from '../services/apiClient';

/**
 * Hook to fetch climate normals for a specific date
 * @param {string} location - Location identifier
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {number} years - Number of years to include in analysis (default: 10)
 * @returns {Object} { data, loading, error }
 */
export function useClimateNormals(location, date, years = 10) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location || !date) {
      setLoading(false);
      return;
    }

    let isCancelled = false;

    const fetchNormals = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getClimateNormals(location, date, years);

        if (!isCancelled) {
          if (response.success) {
            setData(response);
          } else {
            setError(response.error || 'Failed to fetch climate normals');
          }
        }
      } catch (err) {
        if (!isCancelled) {
          if (err instanceof ApiError) {
            setError(err.data?.error || err.message);
          } else {
            setError(err.message || 'Network error');
          }
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchNormals();

    return () => {
      isCancelled = true;
    };
  }, [location, date, years]);

  return { data, loading, error };
}

/**
 * Hook to fetch record temperatures for a date range
 * @param {string} location - Location identifier
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {number} years - Number of years to include (default: 10)
 * @returns {Object} { data, loading, error, refetch }
 */
export function useRecordTemperatures(location, startDate, endDate, years = 10) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!location || !startDate || !endDate) {
      setLoading(false);
      return;
    }

    let isCancelled = false;

    const fetchRecords = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getRecordTemperatures(location, startDate, endDate, years);

        if (!isCancelled) {
          if (response.success) {
            setData(response);
          } else {
            setError(response.error || 'Failed to fetch record temperatures');
          }
        }
      } catch (err) {
        if (!isCancelled) {
          if (err instanceof ApiError) {
            setError(err.data?.error || err.message);
          } else {
            setError(err.message || 'Network error');
          }
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchRecords();

    return () => {
      isCancelled = true;
    };
  }, [location, startDate, endDate, years, retryToken]);

  return { data, loading, error, refetch: () => setRetryToken((token) => token + 1) };
}

/**
 * Hook to compare forecast with historical climate data
 * @param {string} location - Location identifier
 * @param {Array} forecastData - Forecast data array
 * @param {number} years - Number of years for comparison (default: 10)
 * @returns {Object} { data, loading, error, refetch }
 */
export function useForecastComparison(location, forecastData, years = 10) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!location || !forecastData || forecastData.length === 0) {
      setLoading(false);
      return;
    }

    let isCancelled = false;

    const fetchComparison = async () => {
      setLoading(true);
      setError(null);

      try {
        // Extract start and end dates from forecast data
        const dates = forecastData.map((d) => d.date).sort();
        const startDate = dates[0];
        const endDate = dates[dates.length - 1];

        const response = await compareForecastWithNormals(location, startDate, endDate, years);

        if (!isCancelled) {
          if (response.success) {
            setData(response.comparisons);
          } else {
            setError(response.error || 'Failed to compare with historical data');
          }
        }
      } catch (err) {
        if (!isCancelled) {
          if (err instanceof ApiError) {
            setError(err.data?.error || err.message);
          } else {
            setError(err.message || 'Network error');
          }
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchComparison();

    return () => {
      isCancelled = true;
    };
  }, [location, forecastData, years, retryToken]);

  return { data, loading, error, refetch: () => setRetryToken((token) => token + 1) };
}

/**
 * Hook to fetch "This Day in History" weather data
 * @param {string} location - Location identifier
 * @param {string|null} date - Date string (MM-DD format), null for today
 * @param {number} years - Number of years to look back (default: 10)
 * @returns {Object} { data, loading, error, refetch }
 */
export function useThisDayInHistory(location, date = null, years = 10) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!location) {
      setLoading(false);
      return;
    }

    let isCancelled = false;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use current date if not provided
        const queryDate = date || new Date().toISOString().split('T')[0].substring(5); // MM-DD

        const response = await getThisDayInHistory(location, queryDate, years);

        if (!isCancelled) {
          if (response.success) {
            setData(response);
          } else {
            setError(response.error || 'Failed to fetch historical data');
          }
        }
      } catch (err) {
        if (!isCancelled) {
          if (err instanceof ApiError) {
            setError(err.data?.error || err.message);
          } else {
            setError(err.message || 'Network error');
          }
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      isCancelled = true;
    };
  }, [location, date, years, retryToken]);

  return { data, loading, error, refetch: () => setRetryToken((token) => token + 1) };
}

/**
 * Hook to fetch temperature probability distribution
 * @param {string} location - Location identifier
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {number} years - Number of years for analysis (default: 10)
 * @returns {Object} { data, loading, error, refetch }
 */
export function useTemperatureProbability(location, startDate, endDate, years = 10) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!location || !startDate || !endDate) {
      setLoading(false);
      return;
    }

    let isCancelled = false;

    const fetchProbability = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getTemperatureProbability(location, startDate, years);

        if (!isCancelled) {
          if (response.success) {
            setData(response);
          } else {
            setError(response.error || 'Failed to fetch temperature probability');
          }
        }
      } catch (err) {
        if (!isCancelled) {
          if (err instanceof ApiError) {
            setError(err.data?.error || err.message);
          } else {
            setError(err.message || 'Network error');
          }
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchProbability();

    return () => {
      isCancelled = true;
    };
  }, [location, startDate, endDate, years, retryToken]);

  return { data, loading, error, refetch: () => setRetryToken((token) => token + 1) };
}
