/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useWeatherData,
  useCurrentWeather,
  useForecast,
  useHistoricalWeather,
  useHourlyForecast,
} from './useWeatherData';
import * as weatherApi from '../services/weatherApi';

// Mock the weather API
vi.mock('../services/weatherApi');

describe('useWeatherData hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('useWeatherData', () => {
    it('returns initial loading state', () => {
      const { result } = renderHook(() => useWeatherData('Seattle, WA', 'current'));

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('fetches current weather successfully', async () => {
      const mockData = {
        currentConditions: { temp: 68, conditions: 'Clear' },
      };
      weatherApi.getCurrentWeather.mockResolvedValue(mockData);

      const { result } = renderHook(() => useWeatherData('Seattle, WA', 'current'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
      expect(weatherApi.getCurrentWeather).toHaveBeenCalledWith('Seattle, WA');
    });

    it('fetches forecast weather successfully', async () => {
      const mockData = {
        days: [{ datetime: '2025-11-05', tempmax: 70, tempmin: 55 }],
      };
      weatherApi.getWeatherForecast.mockResolvedValue(mockData);

      const { result } = renderHook(() => useWeatherData('Seattle, WA', 'forecast', { days: 7 }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(weatherApi.getWeatherForecast).toHaveBeenCalledWith('Seattle, WA', 7);
    });

    it('fetches hourly forecast successfully', async () => {
      const mockData = {
        hours: [{ datetime: '00:00:00', temp: 65 }],
      };
      weatherApi.getHourlyForecast.mockResolvedValue(mockData);

      const { result } = renderHook(() => useWeatherData('Seattle, WA', 'hourly', { hours: 48 }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(weatherApi.getHourlyForecast).toHaveBeenCalledWith('Seattle, WA', 48);
    });

    it('fetches historical weather successfully', async () => {
      const mockData = {
        days: [{ datetime: '2024-01-01', temp: 50 }],
      };
      weatherApi.getHistoricalWeather.mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useWeatherData('Seattle, WA', 'historical', {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(weatherApi.getHistoricalWeather).toHaveBeenCalledWith(
        'Seattle, WA',
        '2024-01-01',
        '2024-01-31'
      );
    });

    it('handles API error gracefully', async () => {
      const errorMessage = 'API Error';
      weatherApi.getCurrentWeather.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useWeatherData('Seattle, WA', 'current'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe(errorMessage);
      expect(console.error).toHaveBeenCalled();
    });

    it('handles API response error with error message', async () => {
      const apiError = {
        response: {
          data: {
            error: 'Invalid location',
          },
        },
      };
      weatherApi.getCurrentWeather.mockRejectedValue(apiError);

      const { result } = renderHook(() => useWeatherData('Invalid', 'current'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Invalid location');
    });

    it('does not fetch when location is empty', async () => {
      const { result } = renderHook(() => useWeatherData('', 'current'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(weatherApi.getCurrentWeather).not.toHaveBeenCalled();
      expect(result.current.data).toBeNull();
    });

    it('throws error for historical data without date range', async () => {
      const { result } = renderHook(() => useWeatherData('Seattle, WA', 'historical', {}));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Start and end dates are required for historical data');
      expect(result.current.data).toBeNull();
    });

    it('throws error for unknown data type', async () => {
      const { result } = renderHook(() => useWeatherData('Seattle, WA', 'unknown', {}));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toContain('Unknown data type');
      expect(result.current.data).toBeNull();
    });

    it('refetch function works correctly', async () => {
      const mockData1 = { currentConditions: { temp: 68 } };
      const mockData2 = { currentConditions: { temp: 72 } };

      weatherApi.getCurrentWeather
        .mockResolvedValueOnce(mockData1)
        .mockResolvedValueOnce(mockData2);

      const { result } = renderHook(() => useWeatherData('Seattle, WA', 'current'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData1);

      // Call refetch
      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData2);
      });

      expect(weatherApi.getCurrentWeather).toHaveBeenCalledTimes(2);
    });

    it('re-fetches when location changes', async () => {
      const mockDataSeattle = { currentConditions: { temp: 68 } };
      const mockDataPortland = { currentConditions: { temp: 65 } };

      weatherApi.getCurrentWeather
        .mockResolvedValueOnce(mockDataSeattle)
        .mockResolvedValueOnce(mockDataPortland);

      const { result, rerender } = renderHook(
        ({ location }) => useWeatherData(location, 'current'),
        { initialProps: { location: 'Seattle, WA' } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockDataSeattle);

      // Change location
      rerender({ location: 'Portland, OR' });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockDataPortland);
      });

      expect(weatherApi.getCurrentWeather).toHaveBeenCalledTimes(2);
    });

    it('re-fetches when type changes', async () => {
      const currentData = { currentConditions: { temp: 68 } };
      const forecastData = { days: [{ datetime: '2025-11-05' }] };

      weatherApi.getCurrentWeather.mockResolvedValue(currentData);
      weatherApi.getWeatherForecast.mockResolvedValue(forecastData);

      const { result, rerender } = renderHook(({ type }) => useWeatherData('Seattle, WA', type), {
        initialProps: { type: 'current' },
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(currentData);

      // Change type
      rerender({ type: 'forecast' });

      await waitFor(() => {
        expect(result.current.data).toEqual(forecastData);
      });
    });

    it('uses default options when not provided', async () => {
      const mockData = { days: [] };
      weatherApi.getWeatherForecast.mockResolvedValue(mockData);

      renderHook(() => useWeatherData('Seattle, WA', 'forecast'));

      await waitFor(() => {
        expect(weatherApi.getWeatherForecast).toHaveBeenCalledWith('Seattle, WA', 7); // Default days
      });
    });
  });

  describe('useCurrentWeather', () => {
    it('fetches current weather', async () => {
      const mockData = { currentConditions: { temp: 68 } };
      weatherApi.getCurrentWeather.mockResolvedValue(mockData);

      const { result } = renderHook(() => useCurrentWeather('Seattle, WA'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(weatherApi.getCurrentWeather).toHaveBeenCalledWith('Seattle, WA');
    });
  });

  describe('useForecast', () => {
    it('fetches forecast with default days', async () => {
      const mockData = { days: [] };
      weatherApi.getWeatherForecast.mockResolvedValue(mockData);

      renderHook(() => useForecast('Seattle, WA'));

      await waitFor(() => {
        expect(weatherApi.getWeatherForecast).toHaveBeenCalledWith('Seattle, WA', 7);
      });
    });

    it('fetches forecast with custom days', async () => {
      const mockData = { days: [] };
      weatherApi.getWeatherForecast.mockResolvedValue(mockData);

      renderHook(() => useForecast('Seattle, WA', 14));

      await waitFor(() => {
        expect(weatherApi.getWeatherForecast).toHaveBeenCalledWith('Seattle, WA', 14);
      });
    });
  });

  describe('useHistoricalWeather', () => {
    it('fetches historical weather with date range', async () => {
      const mockData = { days: [] };
      weatherApi.getHistoricalWeather.mockResolvedValue(mockData);

      renderHook(() => useHistoricalWeather('Seattle, WA', '2024-01-01', '2024-01-31'));

      await waitFor(() => {
        expect(weatherApi.getHistoricalWeather).toHaveBeenCalledWith(
          'Seattle, WA',
          '2024-01-01',
          '2024-01-31'
        );
      });
    });
  });

  describe('useHourlyForecast', () => {
    it('fetches hourly forecast with default hours', async () => {
      const mockData = { hours: [] };
      weatherApi.getHourlyForecast.mockResolvedValue(mockData);

      renderHook(() => useHourlyForecast('Seattle, WA'));

      await waitFor(() => {
        expect(weatherApi.getHourlyForecast).toHaveBeenCalledWith('Seattle, WA', 48);
      });
    });

    it('fetches hourly forecast with custom hours', async () => {
      const mockData = { hours: [] };
      weatherApi.getHourlyForecast.mockResolvedValue(mockData);

      renderHook(() => useHourlyForecast('Seattle, WA', 72));

      await waitFor(() => {
        expect(weatherApi.getHourlyForecast).toHaveBeenCalledWith('Seattle, WA', 72);
      });
    });
  });

  describe('loading states', () => {
    it('sets loading to true while fetching', async () => {
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      weatherApi.getCurrentWeather.mockReturnValue(promise);

      const { result } = renderHook(() => useCurrentWeather('Seattle, WA'));

      expect(result.current.loading).toBe(true);

      resolvePromise({ currentConditions: { temp: 68 } });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('clears previous error when refetching', async () => {
      weatherApi.getCurrentWeather
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce({ currentConditions: { temp: 68 } });

      const { result } = renderHook(() => useCurrentWeather('Seattle, WA'));

      // Wait for first (failed) fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('First error');

      // Refetch (should succeed and clear error)
      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.data).toBeTruthy();
      });
    });
  });
});
