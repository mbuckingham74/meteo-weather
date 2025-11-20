// This file loads environment variables BEFORE the test framework is set up
// It must run in setupFiles, not setupFilesAfterEnv

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Toggle noisy logging during tests (defaults to quiet)
const quietLogs = process.env.QUIET_TEST_LOGS !== '0';
let originalLog;

// Mute dotenv's noisy logs before it runs
if (quietLogs) {
  originalLog = console.log;
  console.log = (...args) => {
    const first = args[0];
    if (typeof first === 'string' && first.toLowerCase().includes('dotenv')) {
      return;
    }
    return originalLog(...args);
  };
}

// Load environment variables in order of preference
const envTestPath = path.join(__dirname, '..', '.env.test');
const envRootPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envTestPath)) {
  dotenv.config({ path: envTestPath });
  if (!quietLogs) console.log('📝 Loaded environment from .env.test');
} else if (fs.existsSync(envRootPath)) {
  dotenv.config({ path: envRootPath });
  if (!quietLogs) console.log('📝 Loaded environment from backend/.env');
} else {
  dotenv.config();
  if (!quietLogs) console.log('📝 Loaded environment from default .env');
}

// Ensure NODE_ENV is set to test
process.env.NODE_ENV = 'test';

// Provide test defaults for required config values
// These prevent config validation from failing during tests
process.env.VISUAL_CROSSING_API_KEY = process.env.VISUAL_CROSSING_API_KEY || 'test-vc-key';
process.env.OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'test-ow-key';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_USER = process.env.DB_USER || 'test_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test_password';
process.env.DB_NAME = process.env.DB_NAME || 'test_db';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-min-32-chars-long';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-min-32-chars';

if (!quietLogs) {
  console.log(`📊 Database config: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
}

// Silence expected noisy errors (e.g., intentional Visual Crossing failures) when quiet mode is on
if (quietLogs) {
  const originalError = console.error;
  console.error = (...args) => {
    const first = args[0];
    if (typeof first === 'string' && first.includes('Visual Crossing API Error')) {
      return;
    }
    return originalError(...args);
  };
}
