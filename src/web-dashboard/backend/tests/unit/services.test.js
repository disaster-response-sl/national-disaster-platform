const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const DonationService = require('../../services/donation.service');
const Donor = require('../../models/Donor');
const Donation = require('../../models/Donation');

let mongoServer;

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

describe('DonationService', () => {
  describe('createOrFindDonor', () => {
    test('should create a new donor when not exists', async () => {
      const donorData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+94123456789'
      };

      const donor = await DonationService.createOrFindDonor(donorData);

      expect(donor._id).toBeDefined();
      expect(donor.name).toBe(donorData.name);
      expect(donor.email).toBe(donorData.email);
      expect(donor.phone).toBe(donorData.phone);
    });

    test('should find existing donor when email exists', async () => {
      const donorData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+94123456789'
      };

      // Create donor first
      const existingDonor = await new Donor(donorData).save();

      // Try to create/find again
      const foundDonor = await DonationService.createOrFindDonor(donorData);

      expect(foundDonor._id.toString()).toBe(existingDonor._id.toString());
      expect(foundDonor.name).toBe(donorData.name);
    });

    test('should handle database errors', async () => {
      // Mock mongoose save to throw error
      const originalSave = Donor.prototype.save;
      Donor.prototype.save = jest.fn().mockRejectedValue(new Error('Database error'));

      const donorData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+94123456789'
      };

      await expect(DonationService.createOrFindDonor(donorData)).rejects.toThrow('Failed to process donor information');

      // Restore original save method
      Donor.prototype.save = originalSave;
    });
  });

  describe('createDonation', () => {
    let donor;

    beforeEach(async () => {
      donor = await new Donor({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+94123456789'
      }).save();
    });

    test('should create a donation successfully', async () => {
      const donationData = {
        donor: donor._id,
        amount: 100.50,
        orderId: 'ORDER123456',
        transactionId: 'TXN123456789',
        sessionId: 'SESSION0001234567890',
        status: 'SUCCESS'
      };

      const donation = await DonationService.createDonation(donationData);

      expect(donation._id).toBeDefined();
      expect(donation.donor._id.toString()).toBe(donor._id.toString());
      expect(donation.amount).toBe(100.50);
      expect(donation.status).toBe('SUCCESS');
    });

    test('should populate donor information', async () => {
      const donationData = {
        donor: donor._id,
        amount: 100,
        orderId: 'ORDER123456',
        transactionId: 'TXN123456789',
        sessionId: 'SESSION0001234567890',
        status: 'SUCCESS'
      };

      const donation = await DonationService.createDonation(donationData);

      expect(donation.donor.name).toBe(donor.name);
      expect(donation.donor.email).toBe(donor.email);
    });

    test('should handle database errors', async () => {
      const originalSave = Donation.prototype.save;
      Donation.prototype.save = jest.fn().mockRejectedValue(new Error('Database error'));

      const donationData = {
        donor: donor._id,
        amount: 100,
        orderId: 'ORDER123456',
        transactionId: 'TXN123456789',
        sessionId: 'SESSION0001234567890',
        status: 'SUCCESS'
      };

      await expect(DonationService.createDonation(donationData)).rejects.toThrow('Failed to create donation record');

      Donation.prototype.save = originalSave;
    });
  });

  describe('confirmDonation', () => {
    test('should confirm donation successfully', async () => {
      const confirmationData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+94123456789',
        amount: 100.50,
        orderId: 'ORDER123456',
        transactionId: 'TXN123456789',
        sessionId: 'SESSION0001234567890',
        status: 'SUCCESS'
      };

      const donation = await DonationService.confirmDonation(confirmationData);

      expect(donation._id).toBeDefined();
      expect(donation.amount).toBe(100.50);
      expect(donation.status).toBe('SUCCESS');
      expect(donation.donor.name).toBe('John Doe');
      expect(donation.donor.email).toBe('john.doe@example.com');
    });

    test('should reuse existing donor', async () => {
      // Create donor first
      const existingDonor = await new Donor({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+94123456789'
      }).save();

      const confirmationData = {
        name: 'Jane Doe', // Different name
        email: 'john.doe@example.com', // Same email
        phone: '+94123456789',
        amount: 100,
        orderId: 'ORDER123456',
        transactionId: 'TXN123456789',
        sessionId: 'SESSION0001234567890',
        status: 'SUCCESS'
      };

      const donation = await DonationService.confirmDonation(confirmationData);

      // Should still use existing donor
      expect(donation.donor._id.toString()).toBe(existingDonor._id.toString());
      expect(donation.donor.name).toBe('John Doe'); // Original name preserved
    });
  });

  describe('getAllDonations', () => {
    let donor1, donor2;

    beforeEach(async () => {
      donor1 = await new Donor({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+94123456789'
      }).save();

      donor2 = await new Donor({
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+94123456780'
      }).save();

      // Create test donations
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

    test('should return all donations with pagination', async () => {
      const result = await DonationService.getAllDonations({}, { page: 1, limit: 10 });

      expect(result.donations).toHaveLength(3);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.pages).toBe(1);
    });

    test('should filter by status', async () => {
      const result = await DonationService.getAllDonations({ status: 'SUCCESS' }, { page: 1, limit: 10 });

      expect(result.donations).toHaveLength(2);
      expect(result.donations.every(d => d.status === 'SUCCESS')).toBe(true);
    });

    test('should handle pagination correctly', async () => {
      const result = await DonationService.getAllDonations({}, { page: 1, limit: 2 });

      expect(result.donations).toHaveLength(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.pages).toBe(2);
    });

    test('should sort by creation date descending', async () => {
      const result = await DonationService.getAllDonations({}, { page: 1, limit: 10 });

      // Check that donations are sorted by creation date (newest first)
      for (let i = 0; i < result.donations.length - 1; i++) {
        expect(result.donations[i].createdAt.getTime()).toBeGreaterThanOrEqual(
          result.donations[i + 1].createdAt.getTime()
        );
      }
    });
  });

  describe('getDonationStats', () => {
    beforeEach(async () => {
      const donor = await new Donor({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+94123456789'
      }).save();

      // Create test donations with different statuses and amounts
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

    test('should calculate correct statistics', async () => {
      const stats = await DonationService.getDonationStats();

      expect(stats.summary.totalAmount).toBe(350); // 100 + 200 + 50
      expect(stats.summary.totalDonations).toBe(3);
      expect(stats.summary.successfulDonations).toBe(2);
      expect(stats.summary.averageAmount).toBe(116.66666666666667); // 350 / 3
    });

    test('should provide status breakdown', async () => {
      const stats = await DonationService.getDonationStats();

      const successBreakdown = stats.statusBreakdown.find(s => s._id === 'SUCCESS');
      const failedBreakdown = stats.statusBreakdown.find(s => s._id === 'FAILED');

      expect(successBreakdown.count).toBe(2);
      expect(successBreakdown.totalAmount).toBe(300); // 100 + 200
      expect(failedBreakdown.count).toBe(1);
      expect(failedBreakdown.totalAmount).toBe(50);
    });
  });
});
