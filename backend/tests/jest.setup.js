const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const nock = require('nock');

const envTestPath = path.join(__dirname, '.env.test');
const envRootPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envTestPath)) {
  dotenv.config({ path: envTestPath });
} else if (fs.existsSync(envRootPath)) {
  dotenv.config({ path: envRootPath });
} else {
  dotenv.config();
}

process.env.NODE_ENV = 'test';
process.env.VISUAL_CROSSING_API_KEY = process.env.VISUAL_CROSSING_API_KEY || 'test-api-key';

// Load database pool after environment variables are available
// eslint-disable-next-line global-require
const { pool } = require('../config/database');

nock.disableNetConnect();
nock.enableNetConnect(host => host.includes('127.0.0.1') || host.includes('localhost'));

afterEach(() => {
  if (!nock.isDone()) {
    const pending = nock.pendingMocks();
    nock.cleanAll();
    throw new Error(`Pending HTTP mocks: ${pending.join(', ')}`);
  }
  nock.cleanAll();
});

afterAll(async () => {
  nock.enableNetConnect();
  await pool.end();
});
