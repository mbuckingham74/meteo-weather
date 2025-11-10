#!/usr/bin/env node

/**
 * Database Initialization Script
 * Run with: node scripts/init-db.js
 */

require('dotenv').config();
const { initializeDatabase, seedDatabase, testConnection } = require('../config/database');

async function main() {
  console.log('\n📊 Meteo App - Database Initialization\n');

  // Test connection
  console.log('1️⃣  Testing database connection...');
  const connected = await testConnection();

  if (!connected) {
    throw new Error(
      'Cannot proceed without database connection. Please check your .env file and ensure MySQL is running.'
    );
  }

  // Initialize schema
  console.log('\n2️⃣  Creating database schema...');
  const schemaCreated = await initializeDatabase();

  if (!schemaCreated) {
    throw new Error('Schema creation failed');
  }

  // Seed data
  console.log('\n3️⃣  Seeding sample data...');
  const seeded = await seedDatabase();

  if (!seeded) {
    throw new Error('Seeding failed');
  }

  console.log('\n✅ Database initialized successfully!\n');
  console.log('You can now start the server with: npm start\n');
}

main().catch((error) => {
  console.error('\n❌ Unexpected error:', error);
  process.exitCode = 1;
});
