const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const DonationController = require('../../controllers/donation.controller');
const DonationService = require('../../services/donation.service');
const Donor = require('../../models/Donor');
const Donation = require('../../models/Donation');

let mongoServer;

// Mock request/response objects
const mockRequest = (body = {}, query = {}, params = {}) => ({
  body,
  query,
  params
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Donor.deleteMany({});
  await Donation.deleteMany({});
});

describe('Donation Controller Unit Tests', () => {
  describe('confirmDonation', () => {
    test('should confirm donation successfully', async () => {
      const req = mockRequest({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+94123456789',
        amount: 100.50,
        orderId: 'ORDER123456',
        transactionId: 'TXN123456789',
        sessionId: 'SESSION0001234567890',
        status: 'SUCCESS'
      });
      const res = mockResponse();

      await DonationController.confirmDonation(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Donation confirmed successfully',
          donation: expect.objectContaining({
            amount: 100.5,
            status: 'SUCCESS',
            donor: expect.objectContaining({
              name: 'John Doe',
              email: 'john.doe@example.com'
            })
          })
        })
      );
    });

    test('should handle missing required fields', async () => {
      const req = mockRequest({
        name: 'John Doe',
        email: 'john.doe@example.com'
        // Missing other required fields
      });
      const res = mockResponse();

      await DonationController.confirmDonation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Missing required fields'
        })
      );
    });

    test('should handle invalid email', async () => {
      const req = mockRequest({
        name: 'John Doe',
        email: 'invalid-email',
        phone: '+94123456789',
        amount: 100,
        orderId: 'ORDER123456',
        transactionId: 'TXN123456789',
        sessionId: 'SESSION0001234567890',
        status: 'SUCCESS'
      });
      const res = mockResponse();

      await DonationController.confirmDonation(req, res);

      expect(res.status).toHaveBeenCalledWith(500); // Controller returns 500 for service errors
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Failed to confirm donation',
          message: 'Failed to process donor information'
        })
      );
    });

    test('should handle invalid amount', async () => {
      const req = mockRequest({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+94123456789',
        amount: -50,
        orderId: 'ORDER123456',
        transactionId: 'TXN123456789',
        sessionId: 'SESSION0001234567890',
        status: 'SUCCESS'
      });
      const res = mockResponse();

      await DonationController.confirmDonation(req, res);

      expect(res.status).toHaveBeenCalledWith(400); // Controller returns 400 for invalid amount
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Invalid amount'
        })
      );
    });
  });

  describe('getDonations', () => {
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
      const req = mockRequest({}, {}, {});
      const res = mockResponse();

      await DonationController.getDonations(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
          pagination: expect.objectContaining({
            total: 3,
            page: 1
          })
        })
      );
    });

    test('should filter by status', async () => {
      const req = mockRequest({}, { status: 'SUCCESS' }, {});
      const res = mockResponse();

      await DonationController.getDonations(req, res);

      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data).toHaveLength(2);
      expect(responseData.data.every(d => d.status === 'SUCCESS')).toBe(true);
    });

    test('should handle pagination', async () => {
      const req = mockRequest({}, { page: '1', limit: '2' }, {});
      const res = mockResponse();

      await DonationController.getDonations(req, res);

      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data).toHaveLength(2);
      expect(responseData.pagination.page).toBe(1);
      expect(responseData.pagination.limit).toBe(2);
      expect(responseData.pagination.total).toBe(3);
    });
  });

  describe('getDonationStats', () => {
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
      const req = mockRequest();
      const res = mockResponse();

      await DonationController.getDonationStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            summary: expect.objectContaining({
              totalAmount: 350,
              totalDonations: 3,
              successfulDonations: 2
            }),
            statusBreakdown: expect.any(Array)
          })
        })
      );
    });
  });
});
