// This file sets up test hooks and utilities AFTER the test framework is ready
// Environment variables are loaded by jest.env.js BEFORE this runs

const nock = require('nock');

// Load database pool - environment variables are already set by jest.env.js
const { pool } = require('../config/database');

nock.disableNetConnect();
nock.enableNetConnect((host) => host.includes('127.0.0.1') || host.includes('localhost'));

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
