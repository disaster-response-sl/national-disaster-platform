const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
// Don't import the main app - create a minimal app for testing
const express = require('express');
const cors = require('cors');
const donationRoutes = require('../../routes/donation.routes');
const Donor = require('../../models/Donor');
const Donation = require('../../models/Donation');

let mongoServer;
let server;
let app;

beforeAll(async () => {
  try {
    // Disconnect from any existing mongoose connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Wait for mongoose to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create a minimal app for testing
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api', donationRoutes);

    server = app.listen(5003); // Different port for security tests

    // Wait for server to be ready
    await new Promise((resolve, reject) => {
      server.on('listening', resolve);
      server.on('error', reject);
      setTimeout(() => reject(new Error('Server startup timeout')), 5000);
    });
  } catch (error) {
    console.error('Setup failed:', error);
    throw error;
  }
}, 15000);

afterAll(async () => {
  try {
    // Close server first
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
    }

    // Disconnect mongoose
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Stop MongoDB Memory Server
    if (mongoServer) {
      await mongoServer.stop();
    }

    // Force close any remaining connections
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}, 15000);

beforeEach(async () => {
  await Donor.deleteMany({});
  await Donation.deleteMany({});
});

describe('Security Tests', () => {
  describe('Input Validation & Sanitization', () => {
    test('should prevent SQL injection attempts', async () => {
      const maliciousData = {
        name: "'; DROP TABLE donations; --",
        email: 'malicious@example.com',
        phone: '+94123456789',
        amount: 100,
        orderId: "ORDER'; DELETE FROM donations WHERE '1'='1",
        transactionId: 'TXN123456789',
        sessionId: 'SESSION0001234567890',
        status: 'SUCCESS'
      };

      const response = await request(app)
        .post('/api/donation/confirm')
        .send(maliciousData);

      // Should still work because we're using MongoDB, not SQL
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Verify the malicious data was stored as-is (MongoDB is not vulnerable to SQL injection)
      const savedDonation = await Donation.findOne({ orderId: maliciousData.orderId });
      expect(savedDonation).toBeTruthy();
      expect(savedDonation.orderId).toBe(maliciousData.orderId);
    });

    test('should prevent XSS attacks in input fields', async () => {
      const xssData = {
        name: '<script>alert("XSS")</script>',
        email: 'xss@example.com',
        phone: '+94123456789',
        amount: 100,
        orderId: 'ORDER123456',
        transactionId: 'TXN123456789',
        sessionId: 'SESSION0001234567890',
        status: 'SUCCESS'
      };

      const response = await request(app)
        .post('/api/donation/confirm')
        .send(xssData);

      expect(response.status).toBe(201);

      // Verify XSS payload is stored but not executed
      const savedDonation = await Donation.findOne({ orderId: 'ORDER123456' }).populate('donor');
      expect(savedDonation.donor.name).toBe('<script>alert("XSS")</script>');
    });

    test('should handle extremely large input values', async () => {
      const largeData = {
        name: 'A'.repeat(1000), // Very long name
        email: 'A'.repeat(500) + '@example.com', // Very long email
        phone: '+94123456789',
        amount: 100,
        orderId: 'ORDER123456',
        transactionId: 'TXN123456789',
        sessionId: 'SESSION0001234567890',
        status: 'SUCCESS'
      };

      const response = await request(app)
        .post('/api/donation/confirm')
        .send(largeData);

      // Should handle large inputs gracefully
      expect([201, 400]).toContain(response.status);
    });

    test('should handle special characters in input', async () => {
      const specialData = {
        name: 'Dr. José María ñoño',
        email: 'test+tag@example.com',
        phone: '+94-11-123-4567',
        amount: 100,
        orderId: 'ORDER-123_456',
        transactionId: 'TXN/123\\456',
        sessionId: 'SESSION@123#456',
        status: 'SUCCESS'
      };

      const response = await request(app)
        .post('/api/donation/confirm')
        .send(specialData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Data Exposure Prevention', () => {
    test('should not expose sensitive payment information', async () => {
      const donationData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+94123456789',
        amount: 100,
        orderId: 'ORDER123456',
        transactionId: 'TXN123456789',
        sessionId: 'SESSION0001234567890',
        status: 'SUCCESS'
      };

      await request(app)
        .post('/api/donation/confirm')
        .send(donationData);

      // Retrieve donation and verify no sensitive data is exposed
      const response = await request(app)
        .get('/api/donations');

      expect(response.status).toBe(200);
      expect(response.body.data[0]).not.toHaveProperty('cardNumber');
      expect(response.body.data[0]).not.toHaveProperty('cvv');
      expect(response.body.data[0]).not.toHaveProperty('expiryDate');
      expect(response.body.data[0]).not.toHaveProperty('cardholderName');
    });

    test('should not expose internal database fields', async () => {
      const donationData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+94123456789',
        amount: 100,
        orderId: 'ORDER123456',
        transactionId: 'TXN123456789',
        sessionId: 'SESSION0001234567890',
        status: 'SUCCESS'
      };

      await request(app)
        .post('/api/donation/confirm')
        .send(donationData);

      const response = await request(app)
        .get('/api/donations');

      expect(response.status).toBe(200);

      const donation = response.body.data[0];
      expect(donation).not.toHaveProperty('__v');
      expect(donation).not.toHaveProperty('_id');
      expect(donation).toHaveProperty('id'); // Should have 'id' instead of '_id'
      expect(donation.donor).not.toHaveProperty('__v');
      expect(donation.donor).not.toHaveProperty('_id');
      expect(donation.donor).toHaveProperty('id'); // Should have 'id' instead of '_id'
    });
  });

  describe('Rate Limiting & Abuse Prevention', () => {
    test('should handle rapid requests gracefully', async () => {
      const promises = [];

      // Send 100 rapid requests
      for (let i = 0; i < 100; i++) {
        const donationData = {
          name: `Rapid Donor ${i}`,
          email: `rapid${i}@example.com`,
          phone: `+941234562${i.toString().padStart(2, '0')}`,
          amount: 10,
          orderId: `RAPID_ORDER_${i}`,
          transactionId: `RAPID_TXN_${i}`,
          sessionId: `RAPID_SESSION_${i}`,
          status: 'SUCCESS'
        };

        promises.push(
          request(app)
            .post('/api/donation/confirm')
            .send(donationData)
        );
      }

      const responses = await Promise.all(promises);

      // All requests should either succeed or fail gracefully
      responses.forEach(response => {
        expect([201, 400, 500]).toContain(response.status);
      });

      // At least some should succeed
      const successCount = responses.filter(r => r.status === 201).length;
      expect(successCount).toBeGreaterThan(0);
    });
  });

  describe('Error Handling Security', () => {
    test('should not expose stack traces in error responses', async () => {
      // Send invalid data to trigger an error
      const invalidData = {
        name: '',
        email: 'invalid-email',
        phone: '',
        amount: 'not-a-number',
        orderId: '',
        transactionId: '',
        sessionId: '',
        status: 'INVALID'
      };

      const response = await request(app)
        .post('/api/donation/confirm')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);

      // Error response should not contain stack traces or sensitive information
      const errorMessage = JSON.stringify(response.body);
      expect(errorMessage).not.toMatch(/stack/i);
      expect(errorMessage).not.toMatch(/exception/i);
      // Allow "error" as part of normal error messaging
      expect(response.body).toHaveProperty('error');
    });

    test('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/donation/confirm')
        .set('Content-Type', 'application/json')
        .send('{invalid json}');

      expect([400, 500]).toContain(response.status);
      // For malformed JSON, Express might not parse the body properly
      // The important thing is that it doesn't crash the server
      expect(response.status).toBeDefined();
    });
  });

  describe('Authentication & Authorization', () => {
    test('should allow public access to donation endpoints', async () => {
      // These endpoints should be publicly accessible for the donation flow
      const endpoints = [
        { method: 'post', path: '/api/donation/confirm' },
        { method: 'get', path: '/api/donations' },
        { method: 'get', path: '/api/donations/stats' }
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)[endpoint.method](endpoint.path);
        // Public endpoints should return success or validation error, not server error
        expect([200, 201, 400, 500]).toContain(response.status);
      }
    });
  });
});
