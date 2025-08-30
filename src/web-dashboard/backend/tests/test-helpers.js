const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Donor = require('../models/Donor');
const Donation = require('../models/Donation');

let mongoServer;

/**
 * Setup in-memory MongoDB for testing
 */
const setupTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
};

/**
 * Clean up test database
 */
const teardownTestDB = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

/**
 * Clear all collections
 */
const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Create test donor data
 */
const createTestDonor = (overrides = {}) => ({
  name: 'Test Donor',
  email: 'test.donor@example.com',
  phone: '+94123456789',
  ...overrides
});

/**
 * Create test donation data
 */
const createTestDonation = (donorId, overrides = {}) => ({
  donor: donorId,
  amount: 100.00,
  currency: 'LKR',
  orderId: 'TEST_ORDER_001',
  transactionId: 'TEST_TXN_001',
  sessionId: 'TEST_SESSION_001',
  status: 'SUCCESS',
  ...overrides
});

/**
 * Create test payment session data
 */
const createTestSessionData = (overrides = {}) => ({
  apiOperation: 'CREATE_CHECKOUT_SESSION',
  interaction: {
    operation: 'PURCHASE',
    returnUrl: 'http://localhost:3000/donation/success',
    cancelUrl: 'http://localhost:3000/donation/cancel'
  },
  order: {
    currency: 'LKR',
    amount: '100.00'
  },
  ...overrides
});

module.exports = {
  setupTestDB,
  teardownTestDB,
  clearTestDB,
  createTestDonor,
  createTestDonation,
  createTestSessionData
};
