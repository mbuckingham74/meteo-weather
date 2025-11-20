/**
 * Configuration Tests
 * Tests centralized config validation and structure
 */

describe('Configuration', () => {
  let originalEnv;

  beforeAll(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment after each test
    process.env = { ...originalEnv };
    // Clear require cache for config module
    delete require.cache[require.resolve('../../config')];
  });

  describe('App Configuration', () => {
    it('should load with valid config values', () => {
      const config = require('../../config');
      expect(config.app).toBeDefined();
      expect(typeof config.app.port).toBe('number');
      expect(config.app.port).toBeGreaterThan(0);
      expect(['development', 'production', 'test']).toContain(config.app.env);
      expect(['debug', 'info', 'warn', 'error']).toContain(config.app.logLevel);
    });
  });

  describe('Database Configuration', () => {
    it('should have valid database config', () => {
      const config = require('../../config');
      expect(config.database).toBeDefined();
      expect(typeof config.database.host).toBe('string');
      expect(typeof config.database.port).toBe('number');
      expect(config.database.port).toBeGreaterThan(0);
      expect(typeof config.database.connectionLimit).toBe('number');
    });
  });

  describe('Weather API Configuration', () => {
    it('should require API keys', () => {
      const config = require('../../config');
      expect(config.weather).toBeDefined();
      expect(config.weather.visualCrossingKey).toBeDefined();
      expect(config.weather.openWeatherKey).toBeDefined();
    });

    it('should have default timeouts and limits', () => {
      const config = require('../../config');
      expect(config.weather.maxConcurrentRequests).toBe(3);
      expect(config.weather.throttleMs).toBe(100);
      expect(config.weather.apiTimeout).toBe(10000);
    });
  });

  describe('Cache Configuration', () => {
    it('should have TTL settings', () => {
      const config = require('../../config');
      expect(config.cache).toBeDefined();
      expect(typeof config.cache.enabled).toBe('boolean');
      expect(config.cache.ttl).toBeDefined();
      expect(typeof config.cache.ttl.current).toBe('number');
      expect(typeof config.cache.ttl.forecast).toBe('number');
      expect(typeof config.cache.ttl.historical).toBe('number');
    });
  });

  describe('AI Configuration', () => {
    it('should have default provider and token limits', () => {
      const config = require('../../config');
      expect(config.ai).toBeDefined();
      expect(config.ai.defaultProvider).toBe('anthropic');
      expect(config.ai.defaultMaxTokens).toBe(500);
      expect(config.ai.validationMaxTokens).toBe(200);
    });

    it('should parse optional provider API keys when provided', () => {
      const config = require('../../config');
      // If the key is provided in .env, it should be loaded
      if (process.env.METEO_ANTHROPIC_API_KEY) {
        expect(config.ai.providers.anthropic).toBeDefined();
        expect(config.ai.providers.anthropic.apiKey).toBeDefined();
        expect(typeof config.ai.providers.anthropic.apiKey).toBe('string');
      }
    });
  });

  describe('Security Configuration', () => {
    it('should require JWT secrets', () => {
      const config = require('../../config');
      expect(config.security).toBeDefined();
      expect(config.security.jwtSecret).toBeDefined();
      expect(config.security.jwtRefreshSecret).toBeDefined();
    });

    it('should have rate limit settings', () => {
      const config = require('../../config');
      expect(config.security.rateLimits).toBeDefined();
      expect(config.security.rateLimits.global).toBeDefined();
      expect(config.security.rateLimits.auth).toBeDefined();
      expect(config.security.rateLimits.ai).toBeDefined();
    });
  });

  describe('CORS Configuration', () => {
    it('should parse comma-separated origins', () => {
      const config = require('../../config');
      expect(config.cors).toBeDefined();
      expect(Array.isArray(config.cors.allowedOrigins)).toBe(true);
      expect(config.cors.allowedOrigins.length).toBeGreaterThan(0);
    });
  });

  describe('Admin Configuration', () => {
    it('should parse admin emails as array', () => {
      const config = require('../../config');
      expect(config.admin).toBeDefined();
      expect(Array.isArray(config.admin.emails)).toBe(true);
    });
  });
});
