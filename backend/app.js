const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');

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

const app = express();

// CORS configuration: allow all origins in development, restrict in production
const corsOptions = process.env.NODE_ENV === 'production'
  ? { origin: process.env.CORS_ORIGIN || 'https://meteo-app.example.com' }
  : {};

app.use(cors(corsOptions));
app.use(express.json());

// Health check route stays inline for quick diagnostics
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  const apiKeyConfigured = !!process.env.VISUAL_CROSSING_API_KEY;

  res.json({
    status: 'ok',
    message: 'Meteo API is running',
    database: dbConnected ? 'connected' : 'disconnected',
    visualCrossingApi: apiKeyConfigured ? 'configured' : 'not configured',
    timestamp: new Date().toISOString()
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler (express detects four-argument signature)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

module.exports = app;
