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

    server = app.listen(5002); // Different port for performance tests

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

describe('Performance Tests', () => {
  beforeAll(async () => {
    // Create test data for performance testing
    console.log('Creating test data for performance tests...');

    const donors = [];
    for (let i = 0; i < 100; i++) {
      const donor = await new Donor({
        name: `Test Donor ${i}`,
        email: `donor${i}@example.com`,
        phone: `+941234567${i.toString().padStart(2, '0')}`
      }).save();
      donors.push(donor);
    }

    // Create donations
    for (let i = 0; i < 1000; i++) {
      const donor = donors[i % donors.length];
      await new Donation({
        donor: donor._id,
        amount: Math.floor(Math.random() * 1000) + 50,
        orderId: `PERF_ORDER_${i}`,
        transactionId: `PERF_TXN_${i}`,
        sessionId: `PERF_SESSION_${i}`,
        status: ['SUCCESS', 'FAILED', 'PENDING'][Math.floor(Math.random() * 3)]
      }).save();
    }

    console.log('Test data created successfully');
  }, 60000); // 60 second timeout for data creation

  afterAll(async () => {
    // Clean up test data
    try {
      await Donation.deleteMany({});
      await Donor.deleteMany({});
      console.log('Test data cleaned up');
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  });

  test('should handle multiple concurrent donation confirmations', async () => {
    const startTime = Date.now();
    const promises = [];

    // Create 50 concurrent donation confirmations
    for (let i = 0; i < 50; i++) {
      const donationData = {
        name: `Concurrent Donor ${i}`,
        email: `concurrent${i}@example.com`,
        phone: `+941234560${i.toString().padStart(2, '0')}`,
        amount: 100 + i,
        orderId: `CONCURRENT_ORDER_${i}`,
        transactionId: `CONCURRENT_TXN_${i}`,
        sessionId: `CONCURRENT_SESSION_${i}`,
        status: 'SUCCESS'
      };

      promises.push(
        request(app)
          .post('/api/donation/confirm')
          .send(donationData)
      );
    }

    const responses = await Promise.all(promises);
    const endTime = Date.now();

    console.log(`Concurrent requests completed in ${endTime - startTime}ms`);

    // Verify all requests succeeded
    responses.forEach(response => {
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    // Performance assertion: should complete within reasonable time
    expect(endTime - startTime).toBeLessThan(10000); // Less than 10 seconds
  }, 15000);

  test('should handle large dataset queries efficiently', async () => {
    const startTime = Date.now();

    const response = await request(app)
      .get('/api/donations?page=1&limit=100');

    const endTime = Date.now();

    console.log(`Large dataset query completed in ${endTime - startTime}ms`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(100);

    // Performance assertion: should complete within reasonable time
    expect(endTime - startTime).toBeLessThan(2000); // Less than 2 seconds
  });

  test('should handle statistics calculation efficiently', async () => {
    const startTime = Date.now();

    const response = await request(app)
      .get('/api/donations/stats');

    const endTime = Date.now();

    console.log(`Statistics calculation completed in ${endTime - startTime}ms`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.summary).toBeDefined();

    // Performance assertion: should complete within reasonable time
    expect(endTime - startTime).toBeLessThan(1000); // Less than 1 second
  });

  test('should handle filtered queries efficiently', async () => {
    const startTime = Date.now();

    const response = await request(app)
      .get('/api/donations?status=SUCCESS&page=1&limit=50');

    const endTime = Date.now();

    console.log(`Filtered query completed in ${endTime - startTime}ms`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.every(d => d.status === 'SUCCESS')).toBe(true);

    // Performance assertion: should complete within reasonable time
    expect(endTime - startTime).toBeLessThan(1500); // Less than 1.5 seconds
  });
});

describe('Load Tests', () => {
  test('should handle rapid sequential requests', async () => {
    const startTime = Date.now();
    const requestCount = 100;

    for (let i = 0; i < requestCount; i++) {
      const donationData = {
        name: `Load Test Donor ${i}`,
        email: `load${i}@example.com`,
        phone: `+941234561${i.toString().padStart(2, '0')}`,
        amount: 50 + i,
        orderId: `LOAD_ORDER_${i}`,
        transactionId: `LOAD_TXN_${i}`,
        sessionId: `LOAD_SESSION_${i}`,
        status: 'SUCCESS'
      };

      const response = await request(app)
        .post('/api/donation/confirm')
        .send(donationData);

      expect(response.status).toBe(201);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / requestCount;

    console.log(`Load test: ${requestCount} requests completed in ${totalTime}ms`);
    console.log(`Average time per request: ${avgTime}ms`);

    // Performance assertions
    expect(avgTime).toBeLessThan(500); // Average less than 500ms per request
    expect(totalTime).toBeLessThan(30000); // Total less than 30 seconds
  }, 60000); // 60 second timeout

  test('should handle memory efficiently under load', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    const requestCount = 200;

    for (let i = 0; i < requestCount; i++) {
      const response = await request(app)
        .get('/api/donations?page=1&limit=10');

      expect(response.status).toBe(200);
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    console.log(`Memory usage: ${initialMemory} -> ${finalMemory} (${memoryIncrease} bytes increase)`);

    // Memory assertion: should not have excessive memory growth
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
  }, 120000); // 2 minute timeout
});
