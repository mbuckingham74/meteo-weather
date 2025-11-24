const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('./config/database');
const config = require('./config');

// API route modules
const weatherRoutes = require('./routes/weather');
const locationRoutes = require('./routes/locations');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const airQualityRoutes = require('./routes/airQuality');
const cacheRoutes = require('./routes/cache');
const aiLocationFinderRoutes = require('./routes/aiLocationFinder');
const aiWeatherAnalysisRoutes = require('./routes/aiWeatherAnalysis');
const shareAnswerRoutes = require('./routes/shareAnswer');
const userPreferencesRoutes = require('./routes/userPreferences');
const adminRoutes = require('./routes/admin');
const apiKeysRoutes = require('./routes/apiKeys');

const app = express();

// Trust proxy - required when behind Nginx/reverse proxy
// This allows express-rate-limit to correctly identify users via X-Forwarded-For
app.set('trust proxy', 1);

// ============================================
// SECURITY MIDDLEWARE (Order matters!)
// ============================================

// 1. Security headers with helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Required for React
          "'unsafe-eval'", // Required for React dev mode
          'https://plausible.tachyonfuture.com',
          'https://matomo.tachyonfuture.com',
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Required for React and inline styles
          'https://unpkg.com', // Leaflet CSS
        ],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https:',
          'http://tile.openstreetmap.org',
          'http://a.tile.openstreetmap.org',
          'http://b.tile.openstreetmap.org',
          'http://c.tile.openstreetmap.org',
        ],
        fontSrc: ["'self'", 'data:'],
        connectSrc: [
          "'self'",
          'https://api.meteo-beta.tachyonfuture.com',
          'http://localhost:5001',
          'https://api.openweathermap.org',
          'https://weather.visualcrossing.com',
          'https://api.rainviewer.com',
          'https://api.anthropic.com',
          'https://ipapi.co',
          'https://geojs.io',
          'https://air-quality-api.open-meteo.com',
        ],
        frameAncestors: ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Required for some map tiles
    hsts:
      process.env.NODE_ENV === 'production'
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          }
        : false, // Don't enforce HSTS in development
  })
);

// 2. CORS with origin validation
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400, // Cache preflight for 24 hours
  })
);

// 3. Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 4. Rate limiting - Global API protection
// Uses centralized config from config/index.js to prevent drift
const apiLimiter = rateLimit({
  windowMs: config.security.rateLimits.global.windowMs,
  max: config.app.env === 'production' ? config.security.rateLimits.global.max : 1000, // Higher limit for local dev testing
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  skip: (req) => {
    // Don't rate limit health check
    return req.path === '/api/health';
  },
});

app.use('/api/', apiLimiter);

// 5. Rate limiting - Auth endpoints (strict)
// Uses centralized config from config/index.js to prevent drift
const authLimiter = rateLimit({
  windowMs: config.security.rateLimits.auth.windowMs,
  max: config.security.rateLimits.auth.max,
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    success: false,
    error: 'Too many login attempts. Please try again in 15 minutes.',
  },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 6. Rate limiting - AI endpoints (cost protection)
// Uses centralized config from config/index.js to prevent drift
const aiLimiter = rateLimit({
  windowMs: config.security.rateLimits.ai.windowMs,
  max: config.security.rateLimits.ai.max,
  message: {
    success: false,
    error: `AI query limit reached (${config.security.rateLimits.ai.max} per hour). Please try again later.`,
    retryAfter: '1 hour',
  },
});

app.use('/api/ai-weather', aiLimiter);
app.use('/api/ai-location-finder', aiLimiter);

// Health check route stays inline for quick diagnostics
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  const apiKeyConfigured = !!process.env.VISUAL_CROSSING_API_KEY;

  res.json({
    status: 'ok',
    message: 'Meteo API is running',
    database: dbConnected ? 'connected' : 'disconnected',
    visualCrossingApi: apiKeyConfigured ? 'configured' : 'not configured',
    timestamp: new Date().toISOString(),
  });
});

// Attach feature routes
app.use('/api/weather', weatherRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/air-quality', airQualityRoutes);
app.use('/api/cache', cacheRoutes);
app.use('/api/ai-location-finder', aiLocationFinderRoutes);
app.use('/api/ai-weather', aiWeatherAnalysisRoutes);
app.use('/api/share', shareAnswerRoutes);
app.use('/api/user-preferences', userPreferencesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/api-keys', apiKeysRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Global error handler (express detects four-argument signature)
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

module.exports = app;
