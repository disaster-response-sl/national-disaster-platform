module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'models/**/*.js',
    'services/**/*.js',
    'controllers/**/*.js',
    'routes/**/*.js',
    'middleware/**/*.js',
    '!tests/**'
  ],
  coverageDirectory: 'tests/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000, // Increased timeout for performance tests
  verbose: true,
  // Handle open handles and async operations
  detectOpenHandles: true,
  forceExit: true,
  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
