/**
 * Jest Setup File
 * Runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.LOG_LEVEL = 'ERROR'; // Suppress logs during tests
process.env.CORS_ORIGIN = 'http://localhost:8080';

// Mock console methods to reduce test output noise
global.console = {
  ...console,
  // Keep console.error and console.warn for debugging
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};
