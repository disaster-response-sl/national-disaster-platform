# Comprehensive Testing Guide for Donation API

This guide provides detailed instructions for testing the donation backend system comprehensively.

## Test Structure

```
tests/
├── unit/                 # Unit tests
│   ├── models.test.js   # Model validation tests
│   └── services.test.js # Service layer tests
├── integration/         # Integration tests
│   └── api.test.js     # API endpoint tests
├── performance/         # Performance tests
│   └── load.test.js    # Load and performance tests
├── security/           # Security tests
│   └── security.test.js # Security validation tests
├── setup.js            # Jest setup and utilities
├── runner.js           # Comprehensive test runner
└── README.md           # This file
```

## Prerequisites

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   - Copy `.env` file and configure test environment variables
   - Ensure MongoDB is running (tests use in-memory database)

## Running Tests

### Quick Start

Run all tests with the comprehensive runner:
```bash
node tests/runner.js
```

### Individual Test Suites

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Security tests only
npm run test:security

# Performance tests (slower)
npm run test:performance

# All tests
npm run test:all

# With coverage report
npm run test:coverage
```

### Custom Test Runs

```bash
# Skip dependency installation
node tests/runner.js --no-install

# Run only unit tests
node tests/runner.js --unit-only

# Include performance tests
node tests/runner.js --performance

# Generate coverage report
node tests/runner.js --coverage
```

## Test Categories

### 1. Unit Tests (`tests/unit/`)

**Models Test (`models.test.js`):**
- ✅ Donor model validation
- ✅ Donation model validation
- ✅ Data type validation
- ✅ Required field validation
- ✅ Unique constraint validation
- ✅ Default value assignment

**Services Test (`services.test.js`):**
- ✅ Donor creation and finding
- ✅ Donation creation and confirmation
- ✅ Business logic validation
- ✅ Error handling
- ✅ Data aggregation and statistics

### 2. Integration Tests (`tests/integration/`)

**API Test (`api.test.js`):**
- ✅ Payment session creation
- ✅ Donation confirmation endpoint
- ✅ Donations listing with pagination
- ✅ Statistics endpoint
- ✅ Input validation middleware
- ✅ Error response handling
- ✅ Data sanitization

### 3. Performance Tests (`tests/performance/`)

**Load Test (`load.test.js`):**
- ✅ Concurrent request handling
- ✅ Large dataset queries
- ✅ Statistics calculation performance
- ✅ Memory usage monitoring
- ✅ Response time validation

### 4. Security Tests (`tests/security/`)

**Security Test (`security.test.js`):**
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ XSS attack prevention
- ✅ Data exposure prevention
- ✅ Rate limiting simulation
- ✅ Error handling security
- ✅ Authentication/authorization checks

## Test Data

The tests use realistic test data:

```javascript
const testDonor = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+94123456789'
};

const testDonation = {
  ...testDonor,
  amount: 100.50,
  orderId: 'ORDER123456',
  transactionId: 'TXN123456789',
  sessionId: 'SESSION0001234567890',
  status: 'SUCCESS'
};
```

## Performance Benchmarks

Expected performance metrics:

- **Response Time:** < 500ms for individual requests
- **Concurrent Requests:** Handle 50+ simultaneous requests
- **Memory Usage:** < 50MB increase under load
- **Database Queries:** < 2 seconds for large datasets
- **Statistics Calculation:** < 1 second

## Coverage Requirements

Minimum coverage thresholds:
- **Branches:** 70%
- **Functions:** 80%
- **Lines:** 80%
- **Statements:** 80%

## Manual Testing

For manual testing, use the provided test script:

```bash
npm run test-donation
```

This runs basic API tests against a running server.

## CI/CD Integration

Add to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Run Tests
  run: |
    cd src/web-dashboard/backend
    npm install
    npm run test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./src/web-dashboard/backend/coverage/lcov.info
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **Port Already in Use:**
   - Tests use different ports (5001, 5002, 5003)
   - Kill existing processes: `npx kill-port 5000-5005`

3. **Memory Issues:**
   - Increase Node.js memory: `node --max-old-space-size=4096`
   - Run performance tests separately

4. **Timeout Errors:**
   - Increase Jest timeout in `jest.config.js`
   - Check database performance

### Debug Mode

Run tests with verbose output:
```bash
DEBUG=* npm run test:unit
```

## Test Results Interpretation

### Success Criteria

- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ Security tests pass without vulnerabilities
- ✅ Performance benchmarks met
- ✅ Code coverage requirements satisfied

### Failure Analysis

1. **Unit Test Failures:**
   - Check model validation logic
   - Verify service method implementations

2. **Integration Test Failures:**
   - Check API endpoint implementations
   - Verify middleware functionality

3. **Security Test Failures:**
   - Review input validation
   - Check for data exposure issues

4. **Performance Test Failures:**
   - Optimize database queries
   - Implement caching if needed

## Contributing

When adding new features:

1. Add corresponding unit tests
2. Add integration tests for new endpoints
3. Update performance tests if needed
4. Ensure security tests cover new functionality
5. Update this documentation

## Best Practices

- ✅ Write tests before implementing features (TDD)
- ✅ Use descriptive test names
- ✅ Test both positive and negative scenarios
- ✅ Mock external dependencies
- ✅ Clean up test data after each test
- ✅ Use appropriate assertions
- ✅ Maintain test coverage above thresholds

## Support

For test-related issues:
1. Check the test output for detailed error messages
2. Review the test code for logic errors
3. Ensure all dependencies are properly installed
4. Check environment configuration

---

🎯 **Goal:** Ensure the donation API is robust, secure, and performant before deployment.
