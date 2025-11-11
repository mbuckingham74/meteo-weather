/**
 * Tests for weatherApi.js
 * Testing weather API client functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock axios before any imports
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    interceptors: {
      response: {
        use: vi.fn(),
      },
    },
  },
  get: vi.fn(),
  interceptors: {
    response: {
      use: vi.fn(),
    },
  },
}));

import axios from 'axios';
import {
  getCurrentWeather,
  getWeatherForecast,
  getHourlyForecast,
  getHistoricalWeather,
  searchLocations,
  getAllLocations,
  geocodeLocation,
  reverseGeocode,
  getPopularLocations,
  testApiConnection,
} from './weatherApi';

describe('Weather API Service', () => {
  const API_BASE_URL = 'http://localhost:5001/api';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentWeather', () => {
    it('fetches current weather successfully', async () => {
      const mockData = {
        location: 'London,UK',
        temperature: 15,
        conditions: 'Cloudy',
      };

      axios.get.mockResolvedValue({ data: mockData });

      const result = await getCurrentWeather('London,UK');

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/weather/current/London%2CUK`);
      expect(result).toEqual(mockData);
    });

    it('encodes special characters in location', async () => {
      axios.get.mockResolvedValue({ data: {} });

      await getCurrentWeather('São Paulo, Brazil');

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('S%C3%A3o%20Paulo%2C%20Brazil')
      );
    });

    it('handles API errors', async () => {
      const mockError = new Error('Network error');
      axios.get.mockRejectedValue(mockError);

      await expect(getCurrentWeather('London')).rejects.toThrow('Network error');
    });

    it('logs errors to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      axios.get.mockRejectedValue(new Error('API Error'));

      await expect(getCurrentWeather('London')).rejects.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching current weather:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('getWeatherForecast', () => {
    it('fetches forecast with default days', async () => {
      const mockData = { forecast: [] };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await getWeatherForecast('Seattle');

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/weather/forecast/Seattle?days=7`);
      expect(result).toEqual(mockData);
    });

    it('fetches forecast with custom days', async () => {
      const mockData = { forecast: [] };
      axios.get.mockResolvedValue({ data: mockData });

      await getWeatherForecast('Seattle', 14);

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/weather/forecast/Seattle?days=14`);
    });

    it('encodes location in URL', async () => {
      axios.get.mockResolvedValue({ data: {} });

      await getWeatherForecast('New York, NY');

      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('New%20York%2C%20NY'));
    });

    it('handles errors', async () => {
      axios.get.mockRejectedValue(new Error('Forecast error'));

      await expect(getWeatherForecast('Seattle')).rejects.toThrow('Forecast error');
    });
  });

  describe('getHourlyForecast', () => {
    it('fetches hourly forecast with default hours', async () => {
      const mockData = { hourly: [] };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await getHourlyForecast('Boston');

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/weather/hourly/Boston?hours=48`);
      expect(result).toEqual(mockData);
    });

    it('fetches hourly forecast with custom hours', async () => {
      const mockData = { hourly: [] };
      axios.get.mockResolvedValue({ data: mockData });

      await getHourlyForecast('Boston', 72);

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/weather/hourly/Boston?hours=72`);
    });

    it('handles errors', async () => {
      axios.get.mockRejectedValue(new Error('Hourly error'));

      await expect(getHourlyForecast('Boston')).rejects.toThrow('Hourly error');
    });
  });

  describe('getHistoricalWeather', () => {
    it('fetches historical weather with date range', async () => {
      const mockData = { historical: [] };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await getHistoricalWeather('Chicago', '2025-01-01', '2025-01-31');

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/weather/historical/Chicago`, {
        params: { start: '2025-01-01', end: '2025-01-31' },
      });
      expect(result).toEqual(mockData);
    });

    it('encodes location in URL', async () => {
      axios.get.mockResolvedValue({ data: {} });

      await getHistoricalWeather('San Francisco, CA', '2025-01-01', '2025-01-31');

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('San%20Francisco%2C%20CA'),
        expect.any(Object)
      );
    });

    it('handles errors', async () => {
      axios.get.mockRejectedValue(new Error('Historical error'));

      await expect(getHistoricalWeather('Chicago', '2025-01-01', '2025-01-31')).rejects.toThrow(
        'Historical error'
      );
    });
  });

  describe('searchLocations', () => {
    it('searches locations with default limit', async () => {
      const mockData = { locations: [{ name: 'Paris' }, { name: 'Paris, TX' }] };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await searchLocations('Paris');

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/locations/search`, {
        params: { q: 'Paris', limit: 10 },
      });
      expect(result).toEqual(mockData.locations);
    });

    it('searches locations with custom limit', async () => {
      const mockData = { locations: [] };
      axios.get.mockResolvedValue({ data: mockData });

      await searchLocations('London', 5);

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/locations/search`, {
        params: { q: 'London', limit: 5 },
      });
    });

    it('returns empty array if locations is undefined', async () => {
      axios.get.mockResolvedValue({ data: {} });

      const result = await searchLocations('NonExistent');

      expect(result).toEqual([]);
    });

    it('handles errors', async () => {
      axios.get.mockRejectedValue(new Error('Search error'));

      await expect(searchLocations('Paris')).rejects.toThrow('Search error');
    });
  });

  describe('getAllLocations', () => {
    it('fetches all locations with default pagination', async () => {
      const mockData = { locations: [{ name: 'Location1' }] };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await getAllLocations();

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/locations`, {
        params: { limit: 100, offset: 0 },
      });
      expect(result).toEqual(mockData.locations);
    });

    it('fetches locations with custom pagination', async () => {
      const mockData = { locations: [] };
      axios.get.mockResolvedValue({ data: mockData });

      await getAllLocations(50, 25);

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/locations`, {
        params: { limit: 50, offset: 25 },
      });
    });

    it('returns empty array if locations is undefined', async () => {
      axios.get.mockResolvedValue({ data: {} });

      const result = await getAllLocations();

      expect(result).toEqual([]);
    });

    it('handles errors', async () => {
      axios.get.mockRejectedValue(new Error('Get all error'));

      await expect(getAllLocations()).rejects.toThrow('Get all error');
    });
  });

  describe('geocodeLocation', () => {
    it('geocodes location with default limit', async () => {
      const mockData = {
        results: [{ name: 'New York', lat: 40.7128, lon: -74.006 }],
      };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await geocodeLocation('New York');

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/locations/geocode`, {
        params: { q: 'New York', limit: 5 },
      });
      expect(result).toEqual(mockData.results);
    });

    it('geocodes location with custom limit', async () => {
      const mockData = { results: [] };
      axios.get.mockResolvedValue({ data: mockData });

      await geocodeLocation('Seattle', 10);

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/locations/geocode`, {
        params: { q: 'Seattle', limit: 10 },
      });
    });

    it('returns empty array if results is undefined', async () => {
      axios.get.mockResolvedValue({ data: {} });

      const result = await geocodeLocation('Test');

      expect(result).toEqual([]);
    });

    it('handles errors', async () => {
      axios.get.mockRejectedValue(new Error('Geocode error'));

      await expect(geocodeLocation('Test')).rejects.toThrow('Geocode error');
    });
  });

  describe('reverseGeocode', () => {
    it('reverse geocodes coordinates successfully', async () => {
      const mockData = {
        location: { name: 'San Francisco', lat: 37.7749, lon: -122.4194 },
      };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await reverseGeocode(37.7749, -122.4194);

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/locations/reverse`, {
        params: { lat: 37.7749, lon: -122.4194 },
      });
      expect(result).toEqual(mockData.location);
    });

    it('handles negative coordinates', async () => {
      const mockData = { location: {} };
      axios.get.mockResolvedValue({ data: mockData });

      await reverseGeocode(-33.8688, 151.2093);

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/locations/reverse`, {
        params: { lat: -33.8688, lon: 151.2093 },
      });
    });

    it('handles errors', async () => {
      axios.get.mockRejectedValue(new Error('Reverse geocode error'));

      await expect(reverseGeocode(0, 0)).rejects.toThrow('Reverse geocode error');
    });
  });

  describe('getPopularLocations', () => {
    it('fetches popular locations successfully', async () => {
      const mockData = {
        locations: [{ name: 'London' }, { name: 'Paris' }, { name: 'Tokyo' }],
      };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await getPopularLocations();

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/locations/popular`);
      expect(result).toEqual(mockData.locations);
    });

    it('returns empty array if locations is undefined', async () => {
      axios.get.mockResolvedValue({ data: {} });

      const result = await getPopularLocations();

      expect(result).toEqual([]);
    });

    it('handles errors', async () => {
      axios.get.mockRejectedValue(new Error('Popular error'));

      await expect(getPopularLocations()).rejects.toThrow('Popular error');
    });
  });

  describe('testApiConnection', () => {
    it('tests API connection successfully', async () => {
      const mockData = { status: 'ok', message: 'API is working' };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await testApiConnection();

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/weather/test`);
      expect(result).toEqual(mockData);
    });

    it('handles connection errors', async () => {
      axios.get.mockRejectedValue(new Error('Connection failed'));

      await expect(testApiConnection()).rejects.toThrow('Connection failed');
    });
  });

  describe('Rate Limit Handling', () => {
    it('handles 429 rate limit errors with custom message', async () => {
      const mockError = {
        response: { status: 429, data: { error: 'Rate limit exceeded' } },
      };

      // Mock the axios interceptor behavior
      axios.get.mockRejectedValue({
        message: 'Rate limit exceeded. Please wait a moment and try again.',
        rateLimitExceeded: true,
        response: mockError.response,
      });

      await expect(getCurrentWeather('Test')).rejects.toMatchObject({
        message: 'Rate limit exceeded. Please wait a moment and try again.',
        rateLimitExceeded: true,
      });
    });
  });
});
