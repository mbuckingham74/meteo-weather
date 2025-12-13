const mysql = require('mysql2/promise');
require('dotenv').config();
const TIMEOUTS = require('./timeouts');

/**
 * Helper to get environment variable as number with fallback
 */
function getEnvNumber(key, defaultValue) {
  const value = process.env[key];
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Database configuration with configurable pool settings and timeouts
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'meteo_app',
  waitForConnections: true,
  connectionLimit: getEnvNumber('DB_CONNECTION_LIMIT', 10),
  queueLimit: getEnvNumber('DB_QUEUE_LIMIT', 0),
  timezone: 'Z', // Use UTC
  // Connection timeout for establishing new connections
  connectTimeout: TIMEOUTS.DATABASE.CONNECTION_TIMEOUT,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Slow query threshold (log queries slower than this)
const SLOW_QUERY_THRESHOLD_MS = getEnvNumber('DB_SLOW_QUERY_THRESHOLD', 1000);

/**
 * Execute a query with timeout and slow query logging
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @param {object} options - Optional settings
 * @param {number} options.timeout - Query timeout in ms (default: TIMEOUTS.DATABASE.QUERY_TIMEOUT)
 * @param {boolean} options.isComplex - Use complex query timeout (default: false)
 * @returns {Promise<Array>} Query results
 */
async function query(sql, params = [], options = {}) {
  const timeout = options.timeout ||
    (options.isComplex ? TIMEOUTS.DATABASE.COMPLEX_QUERY_TIMEOUT : TIMEOUTS.DATABASE.QUERY_TIMEOUT);

  const startTime = Date.now();

  try {
    // mysql2 supports per-query timeout via queryTimeout option
    const result = await pool.query({ sql, timeout }, params);

    const duration = Date.now() - startTime;
    if (duration > SLOW_QUERY_THRESHOLD_MS) {
      console.warn(`⚠️ Slow query (${duration}ms): ${sql.substring(0, 100)}...`);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    if (error.code === 'PROTOCOL_SEQUENCE_TIMEOUT' || error.message?.includes('timeout')) {
      console.error(`❌ Query timeout after ${duration}ms: ${sql.substring(0, 100)}...`);
    }
    throw error;
  }
}

/**
 * Execute multiple queries in a transaction
 * Automatically rolls back on error
 * @param {Function} callback - Async function receiving connection object
 * @returns {Promise<any>} Result from callback
 *
 * @example
 * await withTransaction(async (conn) => {
 *   await conn.query('INSERT INTO users ...', [data]);
 *   await conn.query('INSERT INTO preferences ...', [prefs]);
 * });
 */
async function withTransaction(callback) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Create a query wrapper that respects timeouts
    const wrappedConnection = {
      query: async (sql, params = [], options = {}) => {
        const timeout = options.timeout || TIMEOUTS.DATABASE.QUERY_TIMEOUT;
        return connection.query({ sql, timeout }, params);
      },
      execute: async (sql, params = [], options = {}) => {
        const timeout = options.timeout || TIMEOUTS.DATABASE.QUERY_TIMEOUT;
        return connection.execute({ sql, timeout }, params);
      }
    };

    const result = await callback(wrappedConnection);

    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    return false;
  }
}

// Initialize database with schema
async function initializeDatabase() {
  const fs = require('fs');
  const path = require('path');

  try {
    // Read schema file (works both locally and in Docker)
    const schemaPath = path.join(__dirname, '../../database/schema.sql');

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by statements and execute
    const statements = schema
      .split(';')
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';');

    const connection = await pool.getConnection();

    for (const statement of statements) {
      await connection.query(statement);
    }

    connection.release();
    console.log('✓ Database schema initialized successfully');
    return true;
  } catch (error) {
    console.error('✗ Database initialization failed:', error.message);
    return false;
  }
}

// Seed database with sample data
async function seedDatabase() {
  const fs = require('fs');
  const path = require('path');

  try {
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    const seedData = fs.readFileSync(seedPath, 'utf8');

    const statements = seedData
      .split(';')
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';');

    const connection = await pool.getConnection();

    for (const statement of statements) {
      await connection.query(statement);
    }

    connection.release();
    console.log('✓ Database seeded successfully');
    return true;
  } catch (error) {
    console.error('✗ Database seeding failed:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  query,
  withTransaction,
  testConnection,
  initializeDatabase,
  seedDatabase
};
