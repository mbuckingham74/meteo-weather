const request = require('supertest');
const nock = require('nock');
const app = require('../app');

const API_BASE_URL = 'https://weather.visualcrossing.com';

describe.skip('Weather API Routes', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('GET /api/weather/current', () => {
    it('returns current weather for a location', async () => {
      const mockWeatherData = {
        currentConditions: {
          temp: 22.5,
          feelslike: 23.1,
          humidity: 65,
          conditions: 'Partially cloudy',
          windspeed: 15.5,
          pressure: 1013.2,
          cloudcover: 40,
          uvindex: 5
        },
        address: 'Seattle, WA, United States',
        timezone: 'America/Los_Angeles',
        latitude: 47.6062,
        longitude: -122.3321
      };

      nock(API_BASE_URL)
        .get(/\/VisualCrossingWebServices\/rest\/services\/timeline\/.*/)
        .query(true)
        .reply(200, mockWeatherData);

      const response = await request(app)
        .get('/api/weather/current')
        .query({ location: 'Seattle, WA' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('current');
    });

    it('returns 400 when location is missing', async () => {
      const response = await request(app)
        .get('/api/weather/current');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/weather/forecast', () => {
    it('returns forecast for a location', async () => {
      const mockForecastData = {
        days: [
          { datetime: '2025-01-15', tempmax: 25, tempmin: 15 },
          { datetime: '2025-01-16', tempmax: 23, tempmin: 14 }
        ],
        address: 'Portland, OR'
      };

      nock(API_BASE_URL)
        .get(/\/VisualCrossingWebServices\/rest\/services\/timeline\/.*/)
        .query(true)
        .reply(200, mockForecastData);

      const response = await request(app)
        .get('/api/weather/forecast')
        .query({ location: 'Portland, OR' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('handles API errors gracefully', async () => {
      nock(API_BASE_URL)
        .get(/\/VisualCrossingWebServices\/rest\/services\/timeline\/.*/)
        .query(true)
        .reply(500, { error: 'Internal Server Error' });

      const response = await request(app)
        .get('/api/weather/current')
        .query({ location: 'InvalidCity' });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('handles rate limit errors', async () => {
      nock(API_BASE_URL)
        .get(/\/VisualCrossingWebServices\/rest\/services\/timeline\/.*/)
        .query(true)
        .reply(429, { error: 'Rate limit exceeded' });

      const response = await request(app)
        .get('/api/weather/current')
        .query({ location: 'Seattle' });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
