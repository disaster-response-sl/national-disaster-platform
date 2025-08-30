# Comprehensive Testing Guide for Donation Backend

This guide covers all testing aspects of the donation backend implementation, including unit tests, integration tests, and manual testing procedures.

## 🧪 Test Structure

```
tests/
├── setup.js                    # Jest setup and global configuration
├── test-helpers.js            # Test utilities and database setup
├── unit/                      # Unit tests
│   ├── payment.service.test.js    # PaymentService unit tests
│   └── donation.service.test.js   # DonationService unit tests
└── integration/               # Integration tests
    └── donation.api.test.js       # API endpoint integration tests
```

## 🚀 Running Tests

### Quick Start
```bash
# Run all tests with comprehensive reporting
npm run test:all

# Run specific test types
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:coverage      # Tests with coverage report
npm run test:manual        # Manual API tests
```

### Individual Test Files
```bash
# Run specific test files
npx jest tests/unit/payment.service.test.js
npx jest tests/unit/donation.service.test.js
npx jest tests/integration/donation.api.test.js
```

## 📋 Test Coverage

### Unit Tests (`tests/unit/`)

#### PaymentService Tests
- ✅ Constructor validation with missing credentials
- ✅ Successful session creation
- ✅ Session creation with custom data
- ✅ API error handling (network errors, MPGS errors)
- ✅ Session retrieval
- ✅ Order retrieval

#### DonationService Tests
- ✅ Donor creation and finding existing donors
- ✅ Donation record creation with population
- ✅ Donation confirmation workflow
- ✅ Donation retrieval with filtering and pagination
- ✅ Statistics calculation
- ✅ Error handling for database operations

### Integration Tests (`tests/integration/`)

#### API Endpoint Tests
- ✅ `POST /api/payment/session` - Session creation
- ✅ `POST /api/donation/confirm` - Donation confirmation with validation
- ✅ `GET /api/donations` - Donation listing with pagination
- ✅ `GET /api/donations/stats` - Statistics endpoint

## 🔧 Test Configuration

### Environment Setup
Tests use the following configuration:

```javascript
// tests/setup.js
process.env.NODE_ENV = 'test';
process.env.MERCHANT_ID = 'test_merchant_id';
process.env.API_USERNAME = 'test_username';
process.env.API_PASSWORD = 'test_password';
```

### Database Setup
Tests use MongoDB Memory Server for isolated testing:

```javascript
// tests/test-helpers.js
const { MongoMemoryServer } = require('mongodb-memory-server');

// Setup in-memory database for each test suite
const setupTestDB = async () => {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
};
```

## 📊 Test Data

### Test Helpers
The `test-helpers.js` file provides utilities for creating test data:

```javascript
const createTestDonor = (overrides = {}) => ({
  name: 'Test Donor',
  email: 'test.donor@example.com',
  phone: '+94123456789',
  ...overrides
});

const createTestDonation = (donorId, overrides = {}) => ({
  donor: donorId,
  amount: 100.00,
  orderId: 'TEST_ORDER_001',
  transactionId: 'TEST_TXN_001',
  sessionId: 'TEST_SESSION_001',
  status: 'SUCCESS',
  ...overrides
});
```

## 🛠 Manual Testing

### API Testing with Postman/Insomnia

#### 1. Create Payment Session
```http
POST http://localhost:5000/api/payment/session
Content-Type: application/json

{
  "order": {
    "currency": "LKR",
    "amount": "100.00"
  }
}
```

#### 2. Confirm Donation
```http
POST http://localhost:5000/api/donation/confirm
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+94123456789",
  "amount": 100.00,
  "orderId": "ORDER123456",
  "transactionId": "TXN123456789",
  "sessionId": "SESSION0001234567890",
  "status": "SUCCESS"
}
```

#### 3. Get Donations
```http
GET http://localhost:5000/api/donations?page=1&limit=10&status=SUCCESS
```

#### 4. Get Statistics
```http
GET http://localhost:5000/api/donations/stats
```

### Manual Test Script
```bash
# Run the manual test script
npm run test-donation
```

## 🔍 Test Scenarios Covered

### ✅ Success Scenarios
- [x] Create payment session successfully
- [x] Confirm donation with new donor
- [x] Confirm donation with existing donor
- [x] Retrieve donations with pagination
- [x] Filter donations by status
- [x] Get donation statistics
- [x] Handle empty database gracefully

### ❌ Error Scenarios
- [x] Missing MPGS credentials
- [x] Invalid input validation
- [x] Database connection errors
- [x] API network errors
- [x] Invalid pagination parameters
- [x] Malformed request data

### 🔒 Security & Validation
- [x] Input sanitization
- [x] Email format validation
- [x] Amount validation (positive numbers)
- [x] Required field validation
- [x] Status enum validation
- [x] No sensitive data logging

## 📈 Coverage Report

Generate coverage report:
```bash
npm run test:coverage
```

Coverage report will be available at:
- **HTML Report**: `tests/coverage/lcov-report/index.html`
- **Text Report**: Terminal output
- **LCOV Format**: `tests/coverage/lcov.info`

### Coverage Goals
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 95%
- **Lines**: > 90%

## 🚨 Troubleshooting

### Common Issues

#### 1. MongoDB Memory Server Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. Port Already in Use
```bash
# Kill process using port 5000
npx kill-port 5000
```

#### 3. Environment Variables Not Set
```bash
# Check environment variables
echo $MERCHANT_ID
echo $API_USERNAME
echo $API_PASSWORD
```

#### 4. Test Timeouts
```javascript
// Increase timeout in jest.config.js
testTimeout: 15000
```

### Debug Mode
```bash
# Run tests in debug mode
DEBUG=jest:* npm test

# Run specific test with verbose output
npx jest --verbose tests/unit/donation.service.test.js
```

## 📝 Best Practices

### Writing New Tests
1. **Use descriptive test names**
2. **Test one thing per test case**
3. **Use test helpers for common setup**
4. **Mock external dependencies**
5. **Clean up after tests**
6. **Test both success and error scenarios**

### Test File Naming Convention
- Unit tests: `*.test.js`
- Integration tests: `*.api.test.js`
- Helpers: `test-helpers.js`

### Test Organization
```javascript
describe('Component Name', () => {
  describe('Method Name', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
});
```

## 🎯 CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:all
      - uses: codecov/codecov-action@v2
        with:
          file: ./tests/coverage/lcov.info
```

## 📊 Performance Testing

### Load Testing
```bash
# Use Artillery for load testing
npm install -g artillery
artillery quick --count 10 --num 5 http://localhost:5000/api/donations
```

### Memory Leak Testing
```bash
# Use clinic for memory analysis
npm install -g clinic
clinic heapprofiler -- node app.js
```

## 🔄 Continuous Testing

### Watch Mode
```bash
# Run tests in watch mode during development
npm run test:watch
```

### Pre-commit Hooks
```bash
# Install husky for pre-commit hooks
npm install husky --save-dev
npx husky install
npx husky add .husky/pre-commit "npm run test:unit"
```

This comprehensive testing suite ensures your donation backend is robust, secure, and production-ready! 🚀
