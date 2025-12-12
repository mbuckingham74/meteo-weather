require('dotenv').config();
const { loadConfig } = require('./config');
const { testConnection } = require('./config/database');
const logger = require('./utils/logger');

// Load and validate config at startup (fail-fast)
const { config, error: configError } = loadConfig();
if (configError) {
  // Can't use logger yet - config might not be valid
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
      logger.warn('Server', 'VISUAL_CROSSING_API_KEY is not configured');
    }

    const server = app.listen(config.app.port, '0.0.0.0', () => {
      logger.info('Server', `Server running on port ${config.app.port}`, {
        port: config.app.port,
        env: config.app.env,
        database: config.database.name,
        visualCrossingApi: config.weather.visualCrossingKey ? 'configured' : 'not configured',
      });

      // Also log to console for development convenience
      if (config.app.env === 'development') {
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
      }
    });

    return server;
  } catch (error) {
    logger.fatal('Server', 'Failed to start server', error);
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
