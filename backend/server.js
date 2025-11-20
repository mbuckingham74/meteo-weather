require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 5001;

// List of environment variables that must be set for a healthy boot
const REQUIRED_ENV_VARS = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'API_KEY_ENCRYPTION_SECRET'];

function validateRequiredEnv() {
  const missing = REQUIRED_ENV_VARS.filter(name => !process.env[name]);

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    console.error(`\n❌ Server startup aborted: ${message}\n`);
    throw new Error(message);
  }
}

async function startServer() {
  try {
    // Fail fast if critical secrets are not present
    validateRequiredEnv();

    await testConnection();

    if (!process.env.VISUAL_CROSSING_API_KEY) {
      console.warn('\n⚠️  WARNING: VISUAL_CROSSING_API_KEY is not configured\n');
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🗄️  Database: ${process.env.DB_NAME}`);
      console.log(`🌤️  Visual Crossing API: ${process.env.VISUAL_CROSSING_API_KEY ? 'Configured' : 'Not configured'}`);
      console.log(`\n🔗 API Endpoints:`);
      console.log(`   Health check:      http://localhost:${PORT}/api/health`);
      console.log(`   Weather test:      http://localhost:${PORT}/api/weather/test`);
      console.log(`   Current weather:   http://localhost:${PORT}/api/weather/current/:location`);
      console.log(`   Forecast:          http://localhost:${PORT}/api/weather/forecast/:location`);
      console.log(`   Historical:        http://localhost:${PORT}/api/weather/historical/:location`);
      console.log(`   Locations:         http://localhost:${PORT}/api/locations\n`);
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    throw error;
  }
}

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer
};
