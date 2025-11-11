import { useState, useEffect } from 'react';
import axios from 'axios';
import API_CONFIG from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Hook to fetch climate normals for a specific date
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

    const fetchNormals = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${API_BASE_URL}/weather/climate/normals/${encodeURIComponent(location)}`,
          {
            params: { date, years },
          }
        );

        if (response.data.success) {
          setData(response.data);
        } else {
          setError(response.data.error || 'Failed to fetch climate normals');
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchNormals();
  }, [location, date, years]);

  return { data, loading, error };
}

/**
 * Hook to fetch record temperatures
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

    const fetchRecords = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${API_BASE_URL}/weather/climate/records/${encodeURIComponent(location)}`,
          {
            params: { start: startDate, end: endDate, years },
          }
        );

        if (response.data.success) {
          setData(response.data);
        } else {
          setError(response.data.error || 'Failed to fetch record temperatures');
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [location, startDate, endDate, years, retryToken]);

  return { data, loading, error, refetch: () => setRetryToken((token) => token + 1) };
}

/**
 * Hook to compare forecast with historical data
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

    const fetchComparison = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(
          `${API_BASE_URL}/weather/climate/compare/${encodeURIComponent(location)}`,
          { forecastData, years }
        );

        if (response.data.success) {
          setData(response.data.comparisons);
        } else {
          setError(response.data.error || 'Failed to compare with historical data');
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [location, forecastData, years, retryToken]);

  return { data, loading, error, refetch: () => setRetryToken((token) => token + 1) };
}

/**
 * Hook to fetch "This Day in History" data
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

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = { years };
        if (date) {
          params.date = date;
        }

        const response = await axios.get(
          `${API_BASE_URL}/weather/climate/this-day/${encodeURIComponent(location)}`,
          { params }
        );

        if (response.data.success) {
          setData(response.data);
        } else {
          setError(response.data.error || 'Failed to fetch historical data');
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [location, date, years, retryToken]);

  return { data, loading, error, refetch: () => setRetryToken((token) => token + 1) };
}

/**
 * Hook to fetch temperature probability distribution
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

    const fetchProbability = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${API_BASE_URL}/weather/climate/probability/${encodeURIComponent(location)}`,
          {
            params: { start: startDate, end: endDate, years },
          }
        );

        if (response.data.success) {
          setData(response.data);
        } else {
          setError(response.data.error || 'Failed to fetch temperature probability');
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchProbability();
  }, [location, startDate, endDate, years, retryToken]);

  return { data, loading, error, refetch: () => setRetryToken((token) => token + 1) };
}
