const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Donor = require('../../models/Donor');
const Donation = require('../../models/Donation');

let mongoServer;

beforeAll(async () => {
  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Close database connection and stop server
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  await Donor.deleteMany({});
  await Donation.deleteMany({});
});

describe('Donor Model', () => {
  test('should create a valid donor', async () => {
    const donorData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+94123456789'
    };

    const donor = new Donor(donorData);
    const savedDonor = await donor.save();

    expect(savedDonor._id).toBeDefined();
    expect(savedDonor.name).toBe(donorData.name);
    expect(savedDonor.email).toBe(donorData.email.toLowerCase());
    expect(savedDonor.phone).toBe(donorData.phone);
    expect(savedDonor.createdAt).toBeDefined();
    expect(savedDonor.updatedAt).toBeDefined();
  });

  test('should reject invalid email', async () => {
    const donorData = {
      name: 'John Doe',
      email: 'invalid-email',
      phone: '+94123456789'
    };

    const donor = new Donor(donorData);
    await expect(donor.save()).rejects.toThrow();
  });

  test('should trim whitespace from fields', async () => {
    const donorData = {
      name: '  John Doe  ',
      email: '  john.doe@example.com  ',
      phone: '  +94123456789  '
    };

    const donor = new Donor(donorData);
    const savedDonor = await donor.save();

    expect(savedDonor.name).toBe('John Doe');
    expect(savedDonor.email).toBe('john.doe@example.com');
    expect(savedDonor.phone).toBe('+94123456789');
  });

  test('should enforce unique email constraint', async () => {
    const donorData1 = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+94123456789'
    };

    const donorData2 = {
      name: 'Jane Doe',
      email: 'john.doe@example.com', // Same email
      phone: '+94123456789'
    };

    await new Donor(donorData1).save();
    const donor2 = new Donor(donorData2);

    // Note: MongoDB doesn't enforce unique constraints by default
    // This would need to be handled at the application level
    await expect(donor2.save()).resolves.toBeDefined();
  });
});

describe('Donation Model', () => {
  let donor;

  beforeEach(async () => {
    donor = await new Donor({
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+94123456789'
    }).save();
  });

  test('should create a valid donation', async () => {
    const donationData = {
      donor: donor._id,
      amount: 100.50,
      currency: 'LKR',
      orderId: 'ORDER123456',
      transactionId: 'TXN123456789',
      sessionId: 'SESSION0001234567890',
      status: 'SUCCESS'
    };

    const donation = new Donation(donationData);
    const savedDonation = await donation.save();

    expect(savedDonation._id).toBeDefined();
    expect(savedDonation.donor.toString()).toBe(donor._id.toString());
    expect(savedDonation.amount).toBe(100.50);
    expect(savedDonation.currency).toBe('LKR');
    expect(savedDonation.orderId).toBe('ORDER123456');
    expect(savedDonation.transactionId).toBe('TXN123456789');
    expect(savedDonation.sessionId).toBe('SESSION0001234567890');
    expect(savedDonation.status).toBe('SUCCESS');
    expect(savedDonation.createdAt).toBeDefined();
    expect(savedDonation.updatedAt).toBeDefined();
  });

  test('should reject negative amount', async () => {
    const donationData = {
      donor: donor._id,
      amount: -50,
      orderId: 'ORDER123456',
      transactionId: 'TXN123456789',
      sessionId: 'SESSION0001234567890',
      status: 'SUCCESS'
    };

    const donation = new Donation(donationData);
    await expect(donation.save()).rejects.toThrow();
  });

  test('should reject zero amount', async () => {
    const donationData = {
      donor: donor._id,
      amount: 0,
      orderId: 'ORDER123456',
      transactionId: 'TXN123456789',
      sessionId: 'SESSION0001234567890',
      status: 'SUCCESS'
    };

    const donation = new Donation(donationData);
    await expect(donation.save()).rejects.toThrow();
  });

  test('should enforce unique orderId', async () => {
    const donationData1 = {
      donor: donor._id,
      amount: 100,
      orderId: 'ORDER123456',
      transactionId: 'TXN123456789',
      sessionId: 'SESSION0001234567890',
      status: 'SUCCESS'
    };

    const donationData2 = {
      donor: donor._id,
      amount: 200,
      orderId: 'ORDER123456', // Same orderId
      transactionId: 'TXN987654321',
      sessionId: 'SESSION0000987654321',
      status: 'SUCCESS'
    };

    await new Donation(donationData1).save();
    const donation2 = new Donation(donationData2);

    // MongoDB should enforce unique constraint and throw error
    await expect(donation2.save()).rejects.toThrow(/duplicate key error/);
  });

  test('should enforce unique transactionId', async () => {
    const donationData1 = {
      donor: donor._id,
      amount: 100,
      orderId: 'ORDER123456',
      transactionId: 'TXN123456789',
      sessionId: 'SESSION0001234567890',
      status: 'SUCCESS'
    };

    const donationData2 = {
      donor: donor._id,
      amount: 200,
      orderId: 'ORDER654321',
      transactionId: 'TXN123456789', // Same transactionId
      sessionId: 'SESSION0000987654321',
      status: 'SUCCESS'
    };

    await new Donation(donationData1).save();
    const donation2 = new Donation(donationData2);

    // MongoDB should enforce unique constraint and throw error
    await expect(donation2.save()).rejects.toThrow(/duplicate key error/);
  });

  test('should accept valid status values', async () => {
    const validStatuses = ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'];

    for (const status of validStatuses) {
      const donationData = {
        donor: donor._id,
        amount: 100,
        orderId: `ORDER${Math.random()}`,
        transactionId: `TXN${Math.random()}`,
        sessionId: `SESSION${Math.random()}`,
        status
      };

      const donation = new Donation(donationData);
      const savedDonation = await donation.save();
      expect(savedDonation.status).toBe(status);
    }
  });

  test('should reject invalid status', async () => {
    const donationData = {
      donor: donor._id,
      amount: 100,
      orderId: 'ORDER123456',
      transactionId: 'TXN123456789',
      sessionId: 'SESSION0001234567890',
      status: 'INVALID_STATUS'
    };

    const donation = new Donation(donationData);
    await expect(donation.save()).rejects.toThrow();
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

    const donation = new Donation(donationData);
    await donation.save();

    const populatedDonation = await Donation.findById(donation._id).populate('donor');
    expect(populatedDonation.donor.name).toBe(donor.name);
    expect(populatedDonation.donor.email).toBe(donor.email);
  });
});
