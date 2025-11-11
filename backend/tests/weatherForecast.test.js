const request = require('supertest');
const nock = require('nock');

const app = require('../app');
const { pool } = require('../config/database');

const LOCATION = 'Seattle,WA';

describe.skip('GET /api/weather/forecast/:location', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM api_cache');
  });

  it('serves fresh data on first request and cached data on repeat requests', async () => {
    const forecastResponse = {
      resolvedAddress: 'Seattle, WA',
      latitude: 47.6062,
      longitude: -122.3321,
      timezone: 'America/Los_Angeles',
      queryCost: 1,
      days: [
        {
          datetime: '2025-01-01',
          tempmax: 10,
          tempmin: 5,
          temp: 7,
          feelslike: 6,
          humidity: 80,
          precip: 1.2,
          precipprob: 60,
          snow: 0,
          snowdepth: 0,
          windspeed: 12,
          winddir: 180,
          pressure: 1012,
          cloudcover: 75,
          visibility: 10,
          uvindex: 2,
          sunrise: '07:58:00',
          sunset: '16:30:00',
          conditions: 'Rain',
          description: 'Light rain throughout the day.',
          icon: 'rain'
        },
        {
          datetime: '2025-01-02',
          tempmax: 9,
          tempmin: 4,
          temp: 6,
          feelslike: 5,
          humidity: 78,
          precip: 0.5,
          precipprob: 40,
          snow: 0,
          snowdepth: 0,
          windspeed: 10,
          winddir: 200,
          pressure: 1015,
          cloudcover: 65,
          visibility: 12,
          uvindex: 3,
          sunrise: '07:57:00',
          sunset: '16:31:00',
          conditions: 'Partially cloudy',
          description: 'Clouds with sunny breaks.',
          icon: 'partly-cloudy-day'
        }
      ]
    };

    const scope = nock('https://weather.visualcrossing.com')
      .get(uri => uri.includes(`/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(LOCATION)}`))
      .reply(200, forecastResponse);

    const firstResponse = await request(app)
      .get(`/api/weather/forecast/${LOCATION}`)
      .query({ days: 2 });

    expect(firstResponse.status).toBe(200);
    expect(firstResponse.body).toMatchObject({
      success: true,
      fromCache: false,
      location: {
        address: forecastResponse.resolvedAddress
      }
    });
    expect(firstResponse.body.forecast).toHaveLength(forecastResponse.days.length);
    expect(scope.isDone()).toBe(true);

    const [rows] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM api_cache
       WHERE api_source = 'visual_crossing'
         AND JSON_UNQUOTE(request_params->'$.endpoint') = 'forecast'
         AND JSON_UNQUOTE(request_params->'$.location') = ?`,
      [LOCATION]
    );

    expect(rows[0].count).toBeGreaterThanOrEqual(1);

    const cachedResponse = await request(app)
      .get(`/api/weather/forecast/${LOCATION}`)
      .query({ days: 2 });

    expect(cachedResponse.status).toBe(200);
    expect(cachedResponse.body).toMatchObject({
      success: true,
      fromCache: true,
      forecast: expect.any(Array)
    });
    expect(cachedResponse.body.forecast).toHaveLength(forecastResponse.days.length);
  });
});
