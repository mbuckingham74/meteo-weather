/**
 * Centralized Configuration with Zod Validation
 *
 * This module is SIDE-EFFECT-FREE - it does not call process.exit() on import.
 * Configuration is lazily loaded and cached on first access.
 *
 * Usage:
 *   // Option 1: Lazy loading (recommended for most files)
 *   const { getConfig } = require('./config');
 *   const config = getConfig();
 *   console.log(config.app.port); // 5001
 *
 *   // Option 2: Explicit loading with error handling (recommended for server.js)
 *   const { loadConfig } = require('./config');
 *   const { config, error } = loadConfig();
 *   if (error) {
 *     console.error(error.message);
 *     process.exit(1);
 *   }
 */

const { z } = require('zod');

/**
 * Configuration Schema
 * Defines all required and optional environment variables
 */
const ConfigSchema = z.object({
  app: z.object({
    port: z.number().int().positive().default(5001),
    env: z.enum(['development', 'production', 'test']).default('development'),
    logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  }),

  database: z.object({
    host: z.string().min(1),
    port: z.number().int().positive().default(3306),
    user: z.string().min(1),
    password: z.string().min(1),
    name: z.string().min(1),
    rootPassword: z.string().optional(), // Only needed for Docker initialization
    connectionLimit: z.number().int().positive().default(10),
  }),

  weather: z.object({
    // API keys are optional - server can start without them but weather features won't work
    visualCrossingKey: z.string().optional(),
    openWeatherKey: z.string().optional(),
    maxConcurrentRequests: z.number().int().positive().default(3),
    throttleMs: z.number().int().positive().default(100),
    apiTimeout: z.number().int().positive().default(10000),
  }),

  cache: z.object({
    enabled: z.boolean().default(true),
    cleanupIntervalMs: z.number().int().positive().default(3600000), // 1 hour
    ttl: z.object({
      current: z.number().int().positive().default(30), // minutes
      forecast: z.number().int().positive().default(360), // 6 hours
      historical: z.number().int().positive().default(10080), // 7 days
    }),
  }),

  ai: z.object({
    defaultProvider: z.string().default('anthropic'),
    defaultMaxTokens: z.number().int().positive().default(500),
    validationMaxTokens: z.number().int().positive().default(200),
    timeout: z.number().int().positive().default(30000),
    providers: z.object({
      anthropic: z.object({
        apiKey: z.string().optional(),
      }).optional(),
      openai: z.object({
        apiKey: z.string().optional(),
      }).optional(),
      grok: z.object({
        apiKey: z.string().optional(),
      }).optional(),
      google: z.object({
        apiKey: z.string().optional(),
      }).optional(),
      mistral: z.object({
        apiKey: z.string().optional(),
      }).optional(),
      cohere: z.object({
        apiKey: z.string().optional(),
      }).optional(),
      ollama: z.object({
        baseUrl: z.string().url().default('http://localhost:11434/v1'),
        model: z.string().default('llama3.2:3b'),
      }).optional(),
    }),
  }),

  security: z.object({
    jwtSecret: z.string().min(32),
    jwtRefreshSecret: z.string().min(32),
    jwtExpiresIn: z.string().default('24h'),
    jwtRefreshExpiresIn: z.string().default('7d'),
    apiKeyEncryptionSecret: z.string().min(64).optional(),
    rateLimits: z.object({
      global: z.object({
        windowMs: z.number().int().positive().default(15 * 60 * 1000), // 15 minutes
        max: z.number().int().positive().default(100),
      }),
      auth: z.object({
        windowMs: z.number().int().positive().default(15 * 60 * 1000),
        max: z.number().int().positive().default(5),
      }),
      ai: z.object({
        windowMs: z.number().int().positive().default(60 * 60 * 1000), // 1 hour
        max: z.number().int().positive().default(10),
      }),
    }),
  }),

  cors: z.object({
    allowedOrigins: z.string().transform((val) => val.split(',').map((s) => s.trim())),
  }),

  admin: z.object({
    emails: z.string().transform((val) => val.split(',').map((s) => s.trim())),
  }),
});

/**
 * Parse environment variables into configuration object
 */
function parseConfig() {
  const rawConfig = {
    app: {
      port: parseInt(process.env.PORT, 10) || 5001,
      env: process.env.NODE_ENV || 'development',
      logLevel: process.env.LOG_LEVEL || 'info',
    },

    database: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      name: process.env.DB_NAME,
      rootPassword: process.env.DB_ROOT_PASSWORD,
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
    },

    weather: {
      visualCrossingKey: process.env.VISUAL_CROSSING_API_KEY,
      openWeatherKey: process.env.OPENWEATHER_API_KEY,
      maxConcurrentRequests: parseInt(process.env.WEATHER_MAX_CONCURRENT, 10) || 3,
      throttleMs: parseInt(process.env.WEATHER_THROTTLE_MS, 10) || 100,
      apiTimeout: parseInt(process.env.WEATHER_API_TIMEOUT, 10) || 10000,
    },

    cache: {
      enabled: process.env.CACHE_ENABLED !== 'false',
      cleanupIntervalMs: parseInt(process.env.CACHE_CLEANUP_INTERVAL, 10) || 3600000,
      ttl: {
        current: parseInt(process.env.CACHE_TTL_CURRENT, 10) || 30,
        forecast: parseInt(process.env.CACHE_TTL_FORECAST, 10) || 360,
        historical: parseInt(process.env.CACHE_TTL_HISTORICAL, 10) || 10080,
      },
    },

    ai: {
      defaultProvider: process.env.AI_DEFAULT_PROVIDER || 'anthropic',
      defaultMaxTokens: parseInt(process.env.AI_MAX_TOKENS, 10) || 500,
      validationMaxTokens: parseInt(process.env.AI_VALIDATION_MAX_TOKENS, 10) || 200,
      timeout: parseInt(process.env.AI_TIMEOUT, 10) || 30000,
      providers: {
        anthropic: process.env.METEO_ANTHROPIC_API_KEY
          ? { apiKey: process.env.METEO_ANTHROPIC_API_KEY }
          : undefined,
        openai: process.env.OPENAI_API_KEY ? { apiKey: process.env.OPENAI_API_KEY } : undefined,
        grok: process.env.GROK_API_KEY ? { apiKey: process.env.GROK_API_KEY } : undefined,
        google: process.env.GOOGLE_AI_API_KEY
          ? { apiKey: process.env.GOOGLE_AI_API_KEY }
          : undefined,
        mistral: process.env.MISTRAL_API_KEY ? { apiKey: process.env.MISTRAL_API_KEY } : undefined,
        cohere: process.env.COHERE_API_KEY ? { apiKey: process.env.COHERE_API_KEY } : undefined,
        ollama: process.env.OLLAMA_BASE_URL || process.env.OLLAMA_MODEL
          ? {
              baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
              model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
            }
          : undefined,
      },
    },

    security: {
      jwtSecret: process.env.JWT_SECRET,
      jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
      jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      apiKeyEncryptionSecret: process.env.API_KEY_ENCRYPTION_SECRET,
      rateLimits: {
        global: {
          windowMs: 15 * 60 * 1000,
          max: 100,
        },
        auth: {
          windowMs: 15 * 60 * 1000,
          max: 5,
        },
        ai: {
          windowMs: 60 * 60 * 1000,
          max: 10,
        },
      },
    },

    cors: {
      // Default includes all common development ports (CRA, Vite, etc.)
      allowedOrigins:
        process.env.CORS_ALLOWED_ORIGINS ||
        'http://localhost:3000,http://localhost:3001,http://localhost:3005,http://localhost:3006,http://localhost:5173',
    },

    admin: {
      emails: process.env.ADMIN_EMAILS || '',
    },
  };

  return rawConfig;
}

/**
 * Validate configuration and return result
 * Does NOT call process.exit - caller decides how to handle errors
 *
 * @returns {{ config: Object|null, error: Error|null }}
 */
function loadConfig() {
  try {
    const rawConfig = parseConfig();
    const config = ConfigSchema.parse(rawConfig);
    return { config, error: null };
  } catch (error) {
    if (error?.issues) {
      // Zod validation error
      const errorMessage = error.issues
        .map((err) => `  ❌ ${err.path.join('.')}: ${err.message}`)
        .join('\n');

      const fullError = new Error(
        `Configuration validation failed:\n\n${errorMessage}\n\n💡 Check your .env file and ensure all required variables are set.\n   See .env.example for reference.`
      );
      fullError.name = 'ConfigValidationError';
      fullError.details = error.issues;

      return { config: null, error: fullError };
    } else {
      const fullError = new Error(`Configuration error: ${error.message}`);
      fullError.name = 'ConfigError';
      fullError.cause = error;

      return { config: null, error: fullError };
    }
  }
}

// Cached config instance for lazy loading
let cachedConfig = null;

/**
 * Get configuration (lazy loading with caching)
 * Throws on validation error - use loadConfig() for explicit error handling
 *
 * @returns {Object} Validated configuration object
 * @throws {Error} If configuration is invalid
 */
function getConfig() {
  if (cachedConfig) {
    return cachedConfig;
  }

  const { config, error } = loadConfig();
  if (error) {
    throw error;
  }

  cachedConfig = config;
  return cachedConfig;
}

/**
 * Clear cached config (useful for testing)
 */
function clearConfigCache() {
  cachedConfig = null;
}

module.exports = {
  loadConfig,
  getConfig,
  clearConfigCache,
  // Export schema for testing
  ConfigSchema,
};
