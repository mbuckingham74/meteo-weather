const nock = require('nock');
const weatherService = require('../services/weatherService');

// Mock the historical data service to prevent database calls
jest.mock('../services/historicalDataService', () => ({
  getHistoricalWeather: jest.fn().mockResolvedValue(null),
  getHistoricalDateData: jest.fn().mockResolvedValue(null),
}));

const API_BASE_URL = 'https://weather.visualcrossing.com';

describe('Weather Service', () => {
  beforeEach(() => {
    // Clear cache before each test
    jest.clearAllMocks();
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
          windspeed: 15.5,
          winddir: 180,
          pressure: 1013.2,
          visibility: 10,
          cloudcover: 40,
          uvindex: 5,
          conditions: 'Partially cloudy',
          icon: 'partly-cloudy-day',
        },
        address: 'Seattle, WA, United States',
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
          currentConditions: expect.objectContaining({
            temp: 22.5,
            conditions: 'Partially cloudy',
          }),
          address: 'Seattle, WA, United States',
        })
      );
    });

    it('caches current weather for 30 minutes', async () => {
      const mockData = {
        currentConditions: { temp: 20, conditions: 'Clear' },
        address: 'New York, NY',
      };

      nock(API_BASE_URL)
        .get(/\/VisualCrossingWebServices\/rest\/services\/timeline\/.*/)
        .query(true)
        .reply(200, mockData);

      // First call - hits API
      const result1 = await weatherService.getCurrentWeather('New York');

      // Second call - should use cache (no nock mock needed)
      const result2 = await weatherService.getCurrentWeather('New York');

      expect(result1).toEqual(result2);
      expect(result1.currentConditions.temp).toBe(20);
    });

    it('handles API errors gracefully', async () => {
      nock(API_BASE_URL)
        .get(/\/VisualCrossingWebServices\/rest\/services\/timeline\/.*/)
        .query(true)
        .reply(500, { error: 'Internal Server Error' });

      await expect(weatherService.getCurrentWeather('InvalidCity')).rejects.toThrow();
    });

    it('handles rate limit errors with retry', async () => {
      const mockData = {
        currentConditions: { temp: 18, conditions: 'Rainy' },
        address: 'Portland, OR',
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

      expect(result.currentConditions.temp).toBe(18);
    });

    it('handles network timeout', async () => {
      nock(API_BASE_URL)
        .get(/\/VisualCrossingWebServices\/rest\/services\/timeline\/.*/)
        .query(true)
        .delayConnection(15000) // Delay longer than 10s timeout
        .reply(200, {});

      await expect(weatherService.getCurrentWeather('Seattle')).rejects.toThrow();
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
      };

      nock(API_BASE_URL)
        .get(/\/VisualCrossingWebServices\/rest\/services\/timeline\/.*/)
        .query(true)
        .reply(200, mockForecastData);

      const result = await weatherService.getForecast('Seattle, WA', 7);

      expect(result.days).toHaveLength(2);
      expect(result.days[0].tempmax).toBe(25);
      expect(result.days[1].conditions).toBe('Partly cloudy');
    });

    it('caches forecast for 6 hours', async () => {
      const mockData = {
        days: [{ datetime: '2025-01-15', temp: 20 }],
        address: 'Boston, MA',
      };

      nock(API_BASE_URL)
        .get(/\/VisualCrossingWebServices\/rest\/services\/timeline\/.*/)
        .query(true)
        .reply(200, mockData);

      // First call
      const result1 = await weatherService.getForecast('Boston, MA', 7);

      // Second call - from cache
      const result2 = await weatherService.getForecast('Boston, MA', 7);

      expect(result1).toEqual(result2);
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

  describe('Request throttling', () => {
    it('limits concurrent requests', async () => {
      const mockData = {
        currentConditions: { temp: 20 },
        address: 'Test City',
      };

      // Mock 5 different API calls
      for (let i = 0; i < 5; i++) {
        nock(API_BASE_URL)
          .get(/\/VisualCrossingWebServices\/rest\/services\/timeline\/.*/)
          .query(true)
          .reply(200, mockData);
      }

      const startTime = Date.now();

      // Fire 5 requests simultaneously
      const promises = [
        weatherService.getCurrentWeather('City1'),
        weatherService.getCurrentWeather('City2'),
        weatherService.getCurrentWeather('City3'),
        weatherService.getCurrentWeather('City4'),
        weatherService.getCurrentWeather('City5'),
      ];

      await Promise.all(promises);

      const duration = Date.now() - startTime;

      // Should take at least some time due to throttling (not instant)
      expect(duration).toBeGreaterThan(100);
    }, 10000);
  });
});
