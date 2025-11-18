require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/database');
const emailScheduler = require('./services/emailScheduler');

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await testConnection();

    if (!process.env.VISUAL_CROSSING_API_KEY) {
      console.warn('\n⚠️  WARNING: VISUAL_CROSSING_API_KEY is not configured\n');
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🗄️  Database: ${process.env.DB_NAME}`);
      console.log(`🌤️  Visual Crossing API: ${process.env.VISUAL_CROSSING_API_KEY ? 'Configured' : 'Not configured'}`);
      console.log(`📧 Email Notifications: ${process.env.EMAIL_ENABLED === 'true' ? 'Enabled' : 'Disabled'}`);
      console.log(`\n🔗 API Endpoints:`);
      console.log(`   Health check:      http://localhost:${PORT}/api/health`);
      console.log(`   Weather test:      http://localhost:${PORT}/api/weather/test`);
      console.log(`   Current weather:   http://localhost:${PORT}/api/weather/current/:location`);
      console.log(`   Forecast:          http://localhost:${PORT}/api/weather/forecast/:location`);
      console.log(`   Historical:        http://localhost:${PORT}/api/weather/historical/:location`);
      console.log(`   Locations:         http://localhost:${PORT}/api/locations\n`);

      // Initialize email schedulers after server starts
      emailScheduler.initializeSchedulers();
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      emailScheduler.stopAllSchedulers();
      server.close(() => {
        console.log('HTTP server closed');
      });
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
