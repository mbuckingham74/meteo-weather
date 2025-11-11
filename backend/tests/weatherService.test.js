const nock = require('nock');
const weatherService = require('../services/weatherService');

// Mock the historical data service to prevent database calls
jest.mock('../services/historicalDataService', () => ({
  getHistoricalWeather: jest.fn().mockResolvedValue(null),
  getHistoricalDateData: jest.fn().mockResolvedValue(null),
}));

// Mock the geocoding service to prevent external Nominatim calls
jest.mock('../services/geocodingService', () => ({
  reverseGeocodeNominatim: jest.fn().mockResolvedValue(null),
}));

// Mock the cache service to control caching behavior
jest.mock('../services/cacheService', () => {
  const actualCacheService = jest.requireActual('../services/cacheService');

  return {
    ...actualCacheService,
    withCache: jest.fn((provider, params, fn) => {
      // Execute function directly without caching for tests
      return fn();
    }),
    generateCacheKey: actualCacheService.generateCacheKey,
    CACHE_TTL: actualCacheService.CACHE_TTL,
  };
});

const API_BASE_URL = 'https://weather.visualcrossing.com';

describe('Weather Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('getCurrentWeather', () => {
    it('fetches current weather successfully', async () => {
      const mockWeatherData = {
        currentConditions: {
          datetime: '14:30:00',
          temp: 22.5,
          feelslike: 23.1,
          humidity: 65,
          precip: 0,
          snow: 0,
          windspeed: 15.5,
          winddir: 180,
          pressure: 1013.2,
          visibility: 10,
          cloudcover: 40,
          uvindex: 5,
          conditions: 'Partially cloudy',
          icon: 'partly-cloudy-day',
        },
        resolvedAddress: 'Seattle, WA, United States',
        timezone: 'America/Los_Angeles',
        latitude: 47.6062,
        longitude: -122.3321,
      };

      nock(API_BASE_URL)
        .get(/\/VisualCrossingWebServices\/rest\/services\/timeline\/.*/)
        .query(true)
        .reply(200, mockWeatherData);

      const result = await weatherService.getCurrentWeather('Seattle, WA');

      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          location: expect.objectContaining({
            address: 'Seattle, WA, United States',
            latitude: 47.6062,
            longitude: -122.3321,
            timezone: 'America/Los_Angeles',
          }),
          current: expect.objectContaining({
            temperature: 22.5,
            conditions: 'Partially cloudy',
          }),
        })
      );
    });

    it('handles API errors gracefully', async () => {
      nock(API_BASE_URL)
        .get(/\/VisualCrossingWebServices\/rest\/services\/timeline\/.*/)
        .query(true)
        .reply(500, { error: 'Internal Server Error' });

      const result = await weatherService.getCurrentWeather('InvalidCity');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
    });

    it('handles rate limit errors with retry', async () => {
      const mockData = {
        currentConditions: {
          temp: 18,
          conditions: 'Rainy',
          datetime: '14:30:00',
          feelslike: 17,
          humidity: 80,
          precip: 5,
          snow: 0,
          windspeed: 10,
          winddir: 180,
          pressure: 1010,
          cloudcover: 90,
          visibility: 5,
          uvindex: 2,
          icon: 'rain',
        },
        resolvedAddress: 'Portland, OR',
        latitude: 45.5152,
        longitude: -122.6784,
        timezone: 'America/Los_Angeles',
      };

      // First attempt fails with 429
      nock(API_BASE_URL)
        .get(/\/VisualCrossingWebServices\/rest\/services\/timeline\/.*/)
        .query(true)
        .reply(429, { error: 'Rate limit exceeded' });

      // Second attempt succeeds
      nock(API_BASE_URL)
        .get(/\/VisualCrossingWebServices\/rest\/services\/timeline\/.*/)
        .query(true)
        .reply(200, mockData);

      const result = await weatherService.getCurrentWeather('Portland, OR');

      expect(result.success).toBe(true);
      expect(result.current.temperature).toBe(18);
    });

    it.skip('handles network timeout', async () => {
      nock(API_BASE_URL)
        .get(/\/VisualCrossingWebServices\/rest\/services\/timeline\/.*/)
        .query(true)
        .delayConnection(15000) // Delay longer than 10s timeout
        .reply(200, {});

      const result = await weatherService.getCurrentWeather('Seattle');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      // Timeout error message varies, just check it failed
      expect([
        result.error.includes('timeout'),
        result.error.includes('No response'),
        result.error.includes('Network'),
      ].some(Boolean)).toBe(true);
    }, 20000); // Increase test timeout
  });

  describe('getForecast', () => {
    it('fetches 7-day forecast successfully', async () => {
      const mockForecastData = {
        days: [
          {
            datetime: '2025-01-15',
            tempmax: 25,
            tempmin: 15,
            temp: 20,
            humidity: 70,
            precip: 2.5,
            precipprob: 60,
            conditions: 'Rain',
          },
          {
            datetime: '2025-01-16',
            tempmax: 22,
            tempmin: 12,
            temp: 17,
            humidity: 65,
            precip: 0,
            precipprob: 10,
            conditions: 'Partly cloudy',
          },
        ],
        address: 'Seattle, WA',
        resolvedAddress: 'Seattle, WA, United States',
        latitude: 47.6062,
        longitude: -122.3321,
        timezone: 'America/Los_Angeles',
      };

      nock(API_BASE_URL)
        .get(/\/VisualCrossingWebServices\/rest\/services\/timeline\/.*/)
        .query(true)
        .reply(200, mockForecastData);

      const result = await weatherService.getForecast('Seattle, WA', 7);

      expect(result.success).toBe(true);
      expect(result.forecast).toHaveLength(2);
      expect(result.forecast[0].tempMax).toBe(25);
      expect(result.forecast[1].conditions).toBe('Partly cloudy');
    });
  });

  describe('buildApiUrl', () => {
    it('builds URL for current weather', () => {
      const url = weatherService.buildApiUrl('Seattle, WA');

      expect(url).toContain('Seattle%2C%20WA');
      expect(url).toContain('unitGroup=metric');
      expect(url).toContain('contentType=json');
    });

    it('builds URL with date range', () => {
      const url = weatherService.buildApiUrl('New York', '2025-01-01', '2025-01-07');

      expect(url).toContain('New%20York/2025-01-01/2025-01-07');
    });

    it('includes custom options', () => {
      const url = weatherService.buildApiUrl('Boston', '', '', { unitGroup: 'us' });

      expect(url).toContain('unitGroup=us');
    });
  });
});
