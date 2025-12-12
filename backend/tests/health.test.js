const request = require('supertest');
const createApp = require('../app');
const { getConfig } = require('../config');

// Create app instance with validated config
const app = createApp(getConfig());

describe('GET /api/health', () => {
  it('returns application health metadata when the database is reachable', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'ok',
        message: 'Meteo API is running',
        database: expect.stringMatching(/connected|disconnected/),
        visualCrossingApi: expect.stringMatching(/configured|not configured/),
        timestamp: expect.any(String)
      })
    );
  });
});
