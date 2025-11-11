/**
 * Tests for radarService.js
 * Testing RainViewer radar API integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getRadarMapData,
  buildRadarTileUrl,
  getPastFrames,
  getForecastFrames,
  getAllFrames,
  formatRadarTime,
  getRelativeTime,
  clearRadarCache,
} from './radarService';

// Mock fetch
global.fetch = vi.fn();

describe('Radar Service', () => {
  const mockRadarData = {
    host: 'https://tilecache.rainviewer.com',
    radar: {
      past: [
        { time: 1730000000, path: '/v2/radar/1730000000/256' },
        { time: 1730000600, path: '/v2/radar/1730000600/256' },
      ],
      nowcast: [
        { time: 1730001200, path: '/v2/radar/1730001200/256' },
        { time: 1730001800, path: '/v2/radar/1730001800/256' },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    clearRadarCache(); // Clear cache before each test
    global.fetch.mockClear();
  });

  describe('getRadarMapData', () => {
    it('fetches radar data successfully', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockRadarData,
      });

      const result = await getRadarMapData();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.rainviewer.com/public/weather-maps.json'
      );
      expect(result).toEqual(mockRadarData);
    });

    it('caches radar data for 5 minutes', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockRadarData,
      });

      // First call - should fetch from API
      await getRadarMapData();
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call immediately - should use cache
      await getRadarMapData();
      expect(global.fetch).toHaveBeenCalledTimes(1); // Not called again
    });

    it('refetches data after cache expires', async () => {
      vi.useFakeTimers();

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockRadarData,
      });

      // First call
      await getRadarMapData();
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Advance time by 6 minutes (cache expires after 5 min)
      vi.advanceTimersByTime(6 * 60 * 1000);

      // Second call - should fetch again
      await getRadarMapData();
      expect(global.fetch).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });

    it('handles API errors and throws if no cache', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(getRadarMapData()).rejects.toThrow('Network error');
    });

    it('uses stale cache if API fails', async () => {
      // First successful call to populate cache
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRadarData,
      });

      await getRadarMapData();

      // Simulate API failure on second call
      global.fetch.mockRejectedValueOnce(new Error('API down'));

      // Should return stale cached data instead of throwing
      const result = await getRadarMapData();
      expect(result).toEqual(mockRadarData);
    });

    it('handles non-ok response status', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(getRadarMapData()).rejects.toThrow('RainViewer API error: 500');
    });

    it('logs console messages for cache hits', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockRadarData,
      });

      // First call
      await getRadarMapData();
      // Second call (cache hit)
      await getRadarMapData();

      expect(consoleSpy).toHaveBeenCalledWith('✅ Using cached radar data');

      consoleSpy.mockRestore();
    });
  });

  describe('buildRadarTileUrl', () => {
    it('builds URL with default parameters', () => {
      const url = buildRadarTileUrl('https://tilecache.rainviewer.com', '/v2/radar/1730000000/256');

      expect(url).toBe(
        'https://tilecache.rainviewer.com/v2/radar/1730000000/256/256/{z}/{x}/{y}/2/1_0.png'
      );
    });

    it('builds URL with custom tile size', () => {
      const url = buildRadarTileUrl(
        'https://tilecache.rainviewer.com',
        '/v2/radar/1730000000/256',
        512
      );

      expect(url).toContain('/512/{z}/{x}/{y}/');
    });

    it('builds URL with custom color scheme', () => {
      const url = buildRadarTileUrl(
        'https://tilecache.rainviewer.com',
        '/v2/radar/1730000000/256',
        256,
        5
      );

      expect(url).toContain('/{z}/{x}/{y}/5/');
    });

    it('builds URL without smooth rendering', () => {
      const url = buildRadarTileUrl(
        'https://tilecache.rainviewer.com',
        '/v2/radar/1730000000/256',
        256,
        2,
        false
      );

      expect(url).toContain('/2/0_0.png');
    });

    it('builds URL with snow detection enabled', () => {
      const url = buildRadarTileUrl(
        'https://tilecache.rainviewer.com',
        '/v2/radar/1730000000/256',
        256,
        2,
        true,
        true
      );

      expect(url).toContain('/2/1_1.png');
    });

    it('includes Leaflet placeholders {z}/{x}/{y}', () => {
      const url = buildRadarTileUrl('https://tilecache.rainviewer.com', '/v2/radar/1730000000/256');

      expect(url).toMatch(/\{z\}\/\{x\}\/\{y\}/);
    });
  });

  describe('getPastFrames', () => {
    it('extracts past radar frames', () => {
      const frames = getPastFrames(mockRadarData);

      expect(frames).toHaveLength(2);
      expect(frames[0]).toMatchObject({
        time: 1730000000,
        path: '/v2/radar/1730000000/256',
      });
      expect(frames[0].url).toContain('https://tilecache.rainviewer.com');
    });

    it('returns empty array for missing radar.past', () => {
      const frames = getPastFrames({ radar: {} });
      expect(frames).toEqual([]);
    });

    it('returns empty array for null data', () => {
      const frames = getPastFrames(null);
      expect(frames).toEqual([]);
    });

    it('returns empty array for undefined data', () => {
      const frames = getPastFrames(undefined);
      expect(frames).toEqual([]);
    });

    it('builds correct URLs for each frame', () => {
      const frames = getPastFrames(mockRadarData);

      frames.forEach((frame) => {
        expect(frame.url).toMatch(/https:\/\/.*\{z\}\/\{x\}\/\{y\}/);
      });
    });
  });

  describe('getForecastFrames', () => {
    it('extracts forecast radar frames', () => {
      const frames = getForecastFrames(mockRadarData);

      expect(frames).toHaveLength(2);
      expect(frames[0]).toMatchObject({
        time: 1730001200,
        path: '/v2/radar/1730001200/256',
      });
      expect(frames[0].url).toContain('https://tilecache.rainviewer.com');
    });

    it('returns empty array for missing radar.nowcast', () => {
      const frames = getForecastFrames({ radar: {} });
      expect(frames).toEqual([]);
    });

    it('returns empty array for null data', () => {
      const frames = getForecastFrames(null);
      expect(frames).toEqual([]);
    });

    it('returns empty array for undefined data', () => {
      const frames = getForecastFrames(undefined);
      expect(frames).toEqual([]);
    });
  });

  describe('getAllFrames', () => {
    it('combines past and forecast frames', () => {
      const frames = getAllFrames(mockRadarData);

      expect(frames).toHaveLength(4); // 2 past + 2 forecast
      expect(frames[0].time).toBe(1730000000); // First past frame
      expect(frames[2].time).toBe(1730001200); // First forecast frame
    });

    it('returns empty array for invalid data', () => {
      const frames = getAllFrames({});
      expect(frames).toEqual([]);
    });

    it('handles data with only past frames', () => {
      const dataWithOnlyPast = {
        ...mockRadarData,
        radar: {
          past: mockRadarData.radar.past,
          nowcast: [],
        },
      };

      const frames = getAllFrames(dataWithOnlyPast);
      expect(frames).toHaveLength(2); // Only past frames
    });

    it('handles data with only forecast frames', () => {
      const dataWithOnlyForecast = {
        ...mockRadarData,
        radar: {
          past: [],
          nowcast: mockRadarData.radar.nowcast,
        },
      };

      const frames = getAllFrames(dataWithOnlyForecast);
      expect(frames).toHaveLength(2); // Only forecast frames
    });
  });

  describe('formatRadarTime', () => {
    it('formats Unix timestamp to readable time', () => {
      const formatted = formatRadarTime(1730000000);

      // Should contain hours and minutes
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
      // Should contain AM or PM
      expect(formatted).toMatch(/(AM|PM)/i);
    });

    it('handles different times consistently', () => {
      // Test various timestamps - just verify proper formatting
      const timestamps = [
        new Date('2025-10-28T00:00:00Z').getTime() / 1000,
        new Date('2025-10-28T12:00:00Z').getTime() / 1000,
        new Date('2025-10-28T15:30:00Z').getTime() / 1000,
      ];

      timestamps.forEach((timestamp) => {
        const formatted = formatRadarTime(timestamp);
        // Should have proper time format with AM/PM
        expect(formatted).toMatch(/\d{1,2}:\d{2}/);
        expect(formatted).toMatch(/(AM|PM)/i);
      });
    });
  });

  describe('getRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-10-28T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns "Just now" for very recent times', () => {
      const now = Date.now() / 1000;
      const result = getRelativeTime(now - 30); // 30 seconds ago

      expect(result).toBe('Just now');
    });

    it('returns minutes ago for recent times', () => {
      const now = Date.now() / 1000;
      const result = getRelativeTime(now - 5 * 60); // 5 minutes ago

      expect(result).toBe('5 min ago');
    });

    it('returns hours ago for older times', () => {
      const now = Date.now() / 1000;
      const result = getRelativeTime(now - 2 * 3600); // 2 hours ago

      expect(result).toBe('2h ago');
    });

    it('handles exactly 1 minute', () => {
      const now = Date.now() / 1000;
      const result = getRelativeTime(now - 60);

      expect(result).toBe('1 min ago');
    });

    it('handles exactly 1 hour', () => {
      const now = Date.now() / 1000;
      const result = getRelativeTime(now - 3600);

      expect(result).toBe('1h ago');
    });
  });

  describe('clearRadarCache', () => {
    it('clears cached radar data', async () => {
      // Populate cache first
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockRadarData,
      });

      await getRadarMapData();
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Verify cache is used
      await getRadarMapData();
      expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1, cache was used

      // Clear cache
      clearRadarCache();

      // Next call should fetch again
      await getRadarMapData();
      expect(global.fetch).toHaveBeenCalledTimes(2); // Now 2, cache was cleared
    });

    it('logs cache clear message', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      clearRadarCache();

      expect(consoleSpy).toHaveBeenCalledWith('🗑️ Radar cache cleared');

      consoleSpy.mockRestore();
    });
  });
});
