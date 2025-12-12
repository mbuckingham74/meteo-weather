require('dotenv').config();
const { loadConfig } = require('./config');
const { testConnection } = require('./config/database');

// Load and validate config at startup (fail-fast)
const { config, error: configError } = loadConfig();
if (configError) {
  console.error('❌ ' + configError.message);
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}

// Create app with validated config
const createApp = require('./app');
const app = createApp(config);

async function startServer() {
  try {
    await testConnection();

    if (!config.weather.visualCrossingKey) {
      console.warn('\n⚠️  WARNING: VISUAL_CROSSING_API_KEY is not configured\n');
    }

    const server = app.listen(config.app.port, '0.0.0.0', () => {
      console.log(`\n🚀 Server running on port ${config.app.port}`);
      console.log(`📊 Environment: ${config.app.env}`);
      console.log(`🗄️  Database: ${config.database.name}`);
      console.log(`🌤️  Visual Crossing API: ${config.weather.visualCrossingKey ? 'Configured' : 'Not configured'}`);
      console.log(`\n🔗 API Endpoints:`);
      console.log(`   Health check:      http://localhost:${config.app.port}/api/health`);
      console.log(`   Weather test:      http://localhost:${config.app.port}/api/weather/test`);
      console.log(`   Current weather:   http://localhost:${config.app.port}/api/weather/current/:location`);
      console.log(`   Forecast:          http://localhost:${config.app.port}/api/weather/forecast/:location`);
      console.log(`   Historical:        http://localhost:${config.app.port}/api/weather/historical/:location`);
      console.log(`   Locations:         http://localhost:${config.app.port}/api/locations\n`);
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
  startServer,
  config,
};
