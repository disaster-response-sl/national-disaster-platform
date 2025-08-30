// Setup file for Jest tests
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.MERCHANT_ID = process.env.MERCHANT_ID || 'test_merchant_id';
process.env.API_USERNAME = process.env.API_USERNAME || 'test_username';
process.env.API_PASSWORD = process.env.API_PASSWORD || 'test_password';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test_db';

// Increase timeout for async operations
jest.setTimeout(10000);

// Mock console methods to reduce noise during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
