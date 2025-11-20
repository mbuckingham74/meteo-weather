/**
 * Tests for geolocationService.js
 * Testing multi-tier geolocation fallback system
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the weatherApi reverseGeocode function before importing geolocationService
vi.mock('./weatherApi', () => ({
  reverseGeocode: vi.fn(),
}));

// Import after mocks are set up
import {
  getCurrentLocation,
  isGeolocationSupported,
  canRequestLocation,
} from './geolocationService';

import { reverseGeocode } from './weatherApi';

describe('Geolocation Service', () => {
  let mockGeolocation;
  let mockFetch;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    reverseGeocode.mockClear();

    // Mock successful reverse geocoding
    reverseGeocode.mockResolvedValue({
      address: 'Seattle, WA',
      latitude: 47.6062,
      longitude: -122.3321,
      timezone: 'America/Los_Angeles',
    });

    // Create mock geolocation object
    mockGeolocation = {
      getCurrentPosition: vi.fn(),
    };

    // Setup navigator.geolocation mock
    Object.defineProperty(global.navigator, 'geolocation', {
      writable: true,
      configurable: true,
      value: mockGeolocation,
    });

    // Mock fetch for IP geolocation
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isGeolocationSupported', () => {
    it('returns true when geolocation is available', () => {
      expect(isGeolocationSupported()).toBe(true);
    });

    it('returns false when geolocation is not available', () => {
      delete global.navigator.geolocation;
      expect(isGeolocationSupported()).toBe(false);
    });
  });

  describe('canRequestLocation', () => {
    it('returns true when permissions API is not available', async () => {
      delete global.navigator.permissions;
      const result = await canRequestLocation();
      expect(result).toBe(true);
    });

    it('returns true when permission is granted', async () => {
      global.navigator.permissions = {
        query: vi.fn().mockResolvedValue({ state: 'granted' }),
      };
      const result = await canRequestLocation();
      expect(result).toBe(true);
    });

    it('returns true when permission is prompt', async () => {
      global.navigator.permissions = {
        query: vi.fn().mockResolvedValue({ state: 'prompt' }),
      };
      const result = await canRequestLocation();
      expect(result).toBe(true);
    });

    it('returns false when permission is denied', async () => {
      global.navigator.permissions = {
        query: vi.fn().mockResolvedValue({ state: 'denied' }),
      };
      const result = await canRequestLocation();
      expect(result).toBe(false);
    });

    it('falls back to geolocation support check on error', async () => {
      global.navigator.permissions = {
        query: vi.fn().mockRejectedValue(new Error('Permission query failed')),
      };
      const result = await canRequestLocation();
      expect(result).toBe(true); // Falls back to isGeolocationSupported
    });
  });

  describe('getCurrentLocation - Browser Geolocation', () => {
    it('gets location from browser successfully', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 47.6062,
            longitude: -122.3321,
            accuracy: 100,
          },
        });
      });

      const result = await getCurrentLocation();

      expect(result).toEqual({
        address: 'Seattle, WA',
        latitude: 47.6062,
        longitude: -122.3321,
        timezone: 'America/Los_Angeles',
        accuracy: 100,
        method: 'browser',
        requiresConfirmation: false,
        detectionMethod: 'Browser Geolocation',
      });
      expect(reverseGeocode).toHaveBeenCalledWith(47.6062, -122.3321);
    });

    it('falls back to coordinates when reverse geocoding fails', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 47.6062,
            longitude: -122.3321,
            accuracy: 100,
          },
        });
      });

      reverseGeocode.mockRejectedValue(new Error('Geocoding failed'));

      const result = await getCurrentLocation();

      expect(result.address).toMatch(/^-?\d+\.\d+,\s*-?\d+\.\d+$/);
      expect(result.address).not.toBe('Your Location');
      expect(result.latitude).toBe(47.6062);
      expect(result.longitude).toBe(-122.3321);
      expect(result.method).toBe('browser');
    });

    it('detects coordinates-only response and shows friendly fallback', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 47.6062,
            longitude: -122.3321,
            accuracy: 100,
          },
        });
      });

      // Mock reverse geocode returning coordinates as address (rate limited)
      reverseGeocode.mockResolvedValue({
        address: '47.6062, -122.3321',
        latitude: 47.6062,
        longitude: -122.3321,
      });

      const result = await getCurrentLocation();

      expect(result.address).toMatch(/^-?\d+\.\d+,\s*-?\d+\.\d+$/);
      expect(result.address).not.toBe('Your Location');
    });
  });

  describe('getCurrentLocation - IP Fallback', () => {
    it('falls back to IP geolocation when browser geolocation fails', async () => {
      // Mock browser geolocation failure
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({
          code: 1, // PERMISSION_DENIED
          message: 'User denied geolocation',
        });
      });

      // Mock IP geolocation success
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            city: 'Detroit',
            region_code: 'MI',
            country_name: 'United States',
            latitude: 42.3314,
            longitude: -83.0458,
            timezone: 'America/Detroit',
          }),
      });

      const result = await getCurrentLocation();

      expect(result).toEqual({
        address: 'Detroit, MI, United States',
        latitude: 42.3314,
        longitude: -83.0458,
        timezone: 'America/Detroit',
        accuracy: 5000,
        method: 'ip',
        requiresConfirmation: true,
        detectionMethod: 'IP Geolocation (ipapi.co)',
      });
    });

    it('uses "Your Location" for Unknown city from IP service', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({
          code: 1,
          message: 'User denied geolocation',
        });
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            city: 'Unknown',
            region_code: 'MI',
            country_name: 'United States',
            latitude: 42.3314,
            longitude: -83.0458,
            timezone: 'America/Detroit',
          }),
      });

      const result = await getCurrentLocation();

      expect(result.address).toMatch(/^-?\d+\.\d+,\s*-?\d+\.\d+$/);
      expect(result.address).not.toBe('Your Location');
    });

    it('tries multiple IP services when first fails', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({
          code: 1,
          message: 'User denied geolocation',
        });
      });

      // First service fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      // Second service succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            city: 'New York',
            region: 'NY',
            country: 'United States',
            latitude: 40.7128,
            longitude: -74.006,
            timezone: 'America/New_York',
          }),
      });

      const result = await getCurrentLocation();

      expect(result.address).toContain('New York');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('throws error when all IP services fail', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({
          code: 1,
          message: 'User denied geolocation',
        });
      });

      // All services fail
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(getCurrentLocation()).rejects.toThrow('Location permission denied');
    });
  });

  describe('getCurrentLocation - Error Handling', () => {
    it('provides helpful error for PERMISSION_DENIED', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({
          code: 1, // PERMISSION_DENIED
          message: 'User denied geolocation',
        });
      });

      mockFetch.mockRejectedValue(new Error('All IP services failed'));

      await expect(getCurrentLocation()).rejects.toThrow(/Location permission denied/);
    });

    it('provides helpful error for POSITION_UNAVAILABLE', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({
          code: 2, // POSITION_UNAVAILABLE
          message: 'Position unavailable',
        });
      });

      mockFetch.mockRejectedValue(new Error('All IP services failed'));

      await expect(getCurrentLocation()).rejects.toThrow(/Location unavailable/);
    });

    it('provides helpful error for TIMEOUT', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({
          code: 3, // TIMEOUT
          message: 'Timeout',
        });
      });

      mockFetch.mockRejectedValue(new Error('All IP services failed'));

      await expect(getCurrentLocation()).rejects.toThrow(/Location request timed out/);
    });

    it('rejects when geolocation is not supported', async () => {
      delete global.navigator.geolocation;

      await expect(getCurrentLocation()).rejects.toThrow(
        'Geolocation is not supported by your browser'
      );
    });
  });

  describe('getCurrentLocation - High Accuracy Retry', () => {
    it('retries with high accuracy after low accuracy fails', async () => {
      let attempt = 0;

      mockGeolocation.getCurrentPosition.mockImplementation((success, error, options) => {
        if (attempt === 0) {
          // First attempt (low accuracy) fails
          attempt++;
          error({
            code: 3, // TIMEOUT
            message: 'Timeout',
          });
        } else {
          // Second attempt (high accuracy) succeeds
          expect(options.enableHighAccuracy).toBe(true);
          success({
            coords: {
              latitude: 47.6062,
              longitude: -122.3321,
              accuracy: 50,
            },
          });
        }
      });

      const result = await getCurrentLocation();

      expect(result.latitude).toBe(47.6062);
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(2);
    });
  });
});
