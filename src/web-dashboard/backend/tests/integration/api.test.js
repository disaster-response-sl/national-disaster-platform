const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const cors = require('cors');
const donationRoutes = require('../../routes/donation.routes');
const Donor = require('../../models/Donor');
const Donation = require('../../models/Donation');

let mongoServer;
let app;
let server;

beforeAll(async () => {
  // Disconnect from any existing connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create a minimal Express app for testing
  app = express();
  app.use(cors());
  app.use(express.json());

  // Use only donation routes
  app.use('/api', donationRoutes);

  // Start the server
  server = app.listen(5002);
}, 30000);

afterAll(async () => {
  if (server) {
    server.close();
  }
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 30000);

beforeEach(async () => {
  await Donor.deleteMany({});
  await Donation.deleteMany({});
});

describe('Donation Routes Integration Tests', () => {
  describe('POST /api/payment/session', () => {
    test('should return 500 without MPGS credentials', async () => {
      const response = await request(app)
        .post('/api/payment/session')
        .send({
          order: {
            currency: 'LKR',
            amount: '100.00'
          }
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/donation/confirm', () => {
    test('should confirm donation successfully', async () => {
      const donationData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+94123456789',
        amount: 100.50,
        orderId: 'ORDER123456',
        transactionId: 'TXN123456789',
        sessionId: 'SESSION0001234567890',
        status: 'SUCCESS'
      };

      const response = await request(app)
        .post('/api/donation/confirm')
        .send(donationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Donation confirmed successfully');
      expect(response.body.donation).toBeDefined();
      expect(response.body.donation.amount).toBe(100.5);
      expect(response.body.donation.status).toBe('SUCCESS');
      expect(response.body.donation.donor.name).toBe('John Doe');
      expect(response.body.donation.donor.email).toBe('john.doe@example.com');
    });

    test('should handle missing required fields', async () => {
      const incompleteData = {
        name: 'John Doe',
        email: 'john.doe@example.com'
        // Missing other required fields
      };

      const response = await request(app)
        .post('/api/donation/confirm')
        .send(incompleteData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    test('should handle invalid email', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        phone: '+94123456789',
        amount: 100,
        orderId: 'ORDER123456',
        transactionId: 'TXN123456789',
        sessionId: 'SESSION0001234567890',
        status: 'SUCCESS'
      };

      const response = await request(app)
        .post('/api/donation/confirm')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should sanitize input data', async () => {
      const unsanitizedData = {
        name: '  John Doe  ',
        email: '  JOHN.DOE@EXAMPLE.COM  ',
        phone: '  +94123456789  ',
        amount: 100,
        orderId: '  ORDER123456  ',
        transactionId: '  TXN123456789  ',
        sessionId: '  SESSION0001234567890  ',
        status: 'success' // lowercase
      };

      const response = await request(app)
        .post('/api/donation/confirm')
        .send(unsanitizedData);

      expect(response.status).toBe(201);
      expect(response.body.donation.donor.name).toBe('John Doe');
      expect(response.body.donation.donor.email).toBe('john.doe@example.com');
      expect(response.body.donation.donor.phone).toBe('+94123456789');
      expect(response.body.donation.orderId).toBe('ORDER123456');
      expect(response.body.donation.transactionId).toBe('TXN123456789');
      expect(response.body.donation.status).toBe('SUCCESS');
      expect(response.body.donation.amount).toBe(100);
    });
  });

  describe('GET /api/donations', () => {
    beforeEach(async () => {
      // Create test data
      const donor1 = await new Donor({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+94123456789'
      }).save();

      const donor2 = await new Donor({
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+94123456780'
      }).save();

      await new Donation({
        donor: donor1._id,
        amount: 100,
        orderId: 'ORDER1',
        transactionId: 'TXN1',
        sessionId: 'SESSION1',
        status: 'SUCCESS'
      }).save();

      await new Donation({
        donor: donor2._id,
        amount: 200,
        orderId: 'ORDER2',
        transactionId: 'TXN2',
        sessionId: 'SESSION2',
        status: 'SUCCESS'
      }).save();

      await new Donation({
        donor: donor1._id,
        amount: 50,
        orderId: 'ORDER3',
        transactionId: 'TXN3',
        sessionId: 'SESSION3',
        status: 'FAILED'
      }).save();
    });

    test('should return all donations', async () => {
      const response = await request(app)
        .get('/api/donations');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination.total).toBe(3);
    });

    test('should filter by status', async () => {
      const response = await request(app)
        .get('/api/donations?status=SUCCESS');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(d => d.status === 'SUCCESS')).toBe(true);
    });

    test('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/donations?page=1&limit=2');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.total).toBe(3);
      expect(response.body.pagination.pages).toBe(2);
    });

    test('should include donor information', async () => {
      const response = await request(app)
        .get('/api/donations');

      expect(response.status).toBe(200);
      expect(response.body.data[0].donor).toBeDefined();
      expect(response.body.data[0].donor.name).toBeDefined();
      expect(response.body.data[0].donor.email).toBeDefined();
      expect(response.body.data[0].donor.phone).toBeDefined();
    });
  });

  describe('GET /api/donations/stats', () => {
    beforeEach(async () => {
      const donor = await new Donor({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+94123456789'
      }).save();

      await new Donation({
        donor: donor._id,
        amount: 100,
        orderId: 'ORDER1',
        transactionId: 'TXN1',
        sessionId: 'SESSION1',
        status: 'SUCCESS'
      }).save();

      await new Donation({
        donor: donor._id,
        amount: 200,
        orderId: 'ORDER2',
        transactionId: 'TXN2',
        sessionId: 'SESSION2',
        status: 'SUCCESS'
      }).save();

      await new Donation({
        donor: donor._id,
        amount: 50,
        orderId: 'ORDER3',
        transactionId: 'TXN3',
        sessionId: 'SESSION3',
        status: 'FAILED'
      }).save();
    });

    test('should return donation statistics', async () => {
      const response = await request(app)
        .get('/api/donations/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.summary.totalAmount).toBe(350);
      expect(response.body.data.summary.totalDonations).toBe(3);
      expect(response.body.data.summary.successfulDonations).toBe(2);
      expect(response.body.data.statusBreakdown).toHaveLength(2);
    });
  });
});
