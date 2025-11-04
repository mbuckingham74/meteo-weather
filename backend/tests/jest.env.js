// This file loads environment variables BEFORE the test framework is set up
// It must run in setupFiles, not setupFilesAfterEnv

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables in order of preference
const envTestPath = path.join(__dirname, '..', '.env.test');
const envRootPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envTestPath)) {
  dotenv.config({ path: envTestPath });
  console.log('📝 Loaded environment from .env.test');
} else if (fs.existsSync(envRootPath)) {
  dotenv.config({ path: envRootPath });
  console.log('📝 Loaded environment from backend/.env');
} else {
  dotenv.config();
  console.log('📝 Loaded environment from default .env');
}

// Ensure NODE_ENV is set to test
process.env.NODE_ENV = 'test';

// Provide default test API key if not set
process.env.VISUAL_CROSSING_API_KEY = process.env.VISUAL_CROSSING_API_KEY || 'test-api-key';

console.log(`📊 Database config: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
