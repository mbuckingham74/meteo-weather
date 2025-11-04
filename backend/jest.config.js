module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/jest.env.js'],  // Load env vars BEFORE framework
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],  // Setup hooks AFTER framework
  verbose: true,
  collectCoverage: false,
  testTimeout: 30000
};
