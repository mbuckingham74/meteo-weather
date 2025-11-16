/**
 * Tests for locationFinderService.js
 * Testing AI-powered location finder API integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateQuery, parseLocationQuery } from './locationFinderService';

/**
 * Helper to create proper Response-like objects for fetch mocks
 * Includes headers Map to prevent "Cannot read properties of undefined (reading 'get')" errors
 */
const createMockResponse = (data, options = {}) => {
  const status = options.status || 200;
  const ok = options.ok !== undefined ? options.ok : status < 400;
  let statusText = options.statusText;

  if (!statusText) {
    if (status === 200) statusText = 'OK';
    else if (status === 400) statusText = 'Bad Request';
    else if (status === 401) statusText = 'Unauthorized';
    else if (status === 403) statusText = 'Forbidden';
    else if (status === 404) statusText = 'Not Found';
    else if (status === 500) statusText = 'Internal Server Error';
    else statusText = 'Unknown';
  }

  return {
    ok,
    status,
    statusText,
    headers: new Map([['content-type', 'application/json']]),
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
};

describe('Location Finder Service', () => {
  let originalFetch;

  beforeEach(() => {
    // Save original fetch
    originalFetch = global.fetch;
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });

  describe('validateQuery', () => {
    it('validates query successfully', async () => {
      const mockResponse = {
        success: true,
        isValid: true,
        reason: 'Query appears valid',
        tokensUsed: 250,
      };

      global.fetch = vi.fn(() => Promise.resolve(createMockResponse(mockResponse)));

      const result = await validateQuery('I want somewhere warmer with less rain');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai-location-finder/validate-query'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('I want somewhere warmer'),
        })
      );
    });

    it('rejects invalid query', async () => {
      const mockResponse = {
        success: true,
        isValid: false,
        reason: 'Query too short',
        tokensUsed: 200,
      };

      global.fetch = vi.fn(() => Promise.resolve(createMockResponse(mockResponse)));

      const result = await validateQuery('test');

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Query too short');
    });

    it('handles API error responses', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve(createMockResponse({ error: 'Bad request' }, { status: 400, ok: false }))
      );

      await expect(validateQuery('test query')).rejects.toThrow('Bad request');
    });

    it('handles network errors', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      await expect(validateQuery('test query')).rejects.toThrow('Network error');
    });

    it('sends correct API endpoint', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve(
          createMockResponse({ success: true, isValid: true, reason: '', tokensUsed: 250 })
        )
      );

      await validateQuery('test query');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/ai-location-finder/validate-query'),
        expect.any(Object)
      );
    });
  });

  describe('parseLocationQuery', () => {
    const mockCurrentLocation = {
      lat: 29.0258,
      lng: -80.9278,
      city: 'New Smyrna Beach, FL',
    };

    it('parses query successfully without current location', async () => {
      const mockResponse = {
        success: true,
        criteria: {
          current_location: null,
          time_period: { start: 'June', end: 'October' },
          temperature_delta: -15,
          humidity: 'lower',
          precipitation: 'less',
          lifestyle_factors: [],
          deal_breakers: [],
          additional_notes: 'Looking for cooler climate',
        },
        tokensUsed: 500,
        cost: '$0.005',
      };

      global.fetch = vi.fn(() => Promise.resolve(createMockResponse(mockResponse)));

      const result = await parseLocationQuery(
        'I want somewhere 15 degrees cooler from June-October'
      );

      expect(result).toEqual(mockResponse);
      expect(result.criteria.temperature_delta).toBe(-15);
      expect(result.criteria.time_period).toEqual({ start: 'June', end: 'October' });
    });

    it('parses query with current location', async () => {
      const mockResponse = {
        success: true,
        criteria: {
          current_location: 'New Smyrna Beach, FL',
          time_period: { start: 'June', end: 'October' },
          temperature_delta: -15,
          humidity: 'lower',
          precipitation: 'less',
          lifestyle_factors: ['good community feel'],
          deal_breakers: [],
          additional_notes: 'User wants cooler, drier climate',
        },
        tokensUsed: 650,
        cost: '$0.007',
      };

      global.fetch = vi.fn(() => Promise.resolve(createMockResponse(mockResponse)));

      const result = await parseLocationQuery(
        'I currently live in New Smyrna Beach, FL. I want somewhere 15 degrees cooler',
        mockCurrentLocation
      );

      expect(result.criteria.current_location).toBe('New Smyrna Beach, FL');
      expect(result.criteria.lifestyle_factors).toContain('good community feel');
    });

    it('sends current location to API', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve(
          createMockResponse({
            success: true,
            criteria: {},
            tokensUsed: 500,
            cost: '$0.005',
          })
        )
      );

      await parseLocationQuery('test query', mockCurrentLocation);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"currentLocation"'),
        })
      );
    });

    it('handles API error responses', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve(
          createMockResponse({ error: 'AI service unavailable' }, { status: 500, ok: false })
        )
      );

      await expect(parseLocationQuery('test query')).rejects.toThrow('AI service unavailable');
    });

    it('handles network errors', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Connection timeout')));

      await expect(parseLocationQuery('test query')).rejects.toThrow('Connection timeout');
    });

    it('extracts all climate criteria correctly', async () => {
      const mockResponse = {
        success: true,
        criteria: {
          current_location: 'Miami, FL',
          time_period: { start: 'November', end: 'March' },
          temperature_delta: -20,
          temperature_range: { min: 15, max: 25 },
          humidity: 'much lower',
          precipitation: 'much less',
          lifestyle_factors: ['outdoor activities', 'hiking'],
          deal_breakers: ['expensive housing'],
          additional_notes: 'Prefers mountain climates',
        },
        tokensUsed: 800,
        cost: '$0.010',
      };

      global.fetch = vi.fn(() => Promise.resolve(createMockResponse(mockResponse)));

      const result = await parseLocationQuery(
        'I live in Miami and want somewhere much cooler and less humid'
      );

      expect(result.criteria).toHaveProperty('current_location');
      expect(result.criteria).toHaveProperty('time_period');
      expect(result.criteria).toHaveProperty('temperature_delta');
      expect(result.criteria).toHaveProperty('temperature_range');
      expect(result.criteria).toHaveProperty('humidity');
      expect(result.criteria).toHaveProperty('precipitation');
      expect(result.criteria).toHaveProperty('lifestyle_factors');
      expect(result.criteria).toHaveProperty('deal_breakers');
      expect(result.criteria).toHaveProperty('additional_notes');
    });

    it('handles missing optional current location', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve(
          createMockResponse({
            success: true,
            criteria: { current_location: null },
            tokensUsed: 450,
            cost: '$0.005',
          })
        )
      );

      const _result = await parseLocationQuery('I want somewhere cooler');

      expect(global.fetch).toHaveBeenCalled();
      const callArgs = global.fetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.currentLocation).toBeNull();
    });
  });

  describe('API URL Configuration', () => {
    it('uses correct API endpoint for validation', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve(
          createMockResponse({
            success: true,
            isValid: true,
            reason: '',
            tokensUsed: 250,
          })
        )
      );

      await validateQuery('test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/ai-location-finder/validate-query'),
        expect.any(Object)
      );
    });

    it('uses correct API endpoint for parsing', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve(
          createMockResponse({
            success: true,
            criteria: {},
            tokensUsed: 500,
            cost: '$0.005',
          })
        )
      );

      await parseLocationQuery('test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/ai-location-finder/parse-query'),
        expect.any(Object)
      );
    });
  });
});
