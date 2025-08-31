const Donor = require('../models/Donor');
const Donation = require('../models/Donation');

class DonationService {
  // Find or create donor
  async findOrCreateDonor(donorData) {
    try {
      const { name, email, phone } = donorData;
      
      // Try to find existing donor by email
      let donor = await Donor.findOne({ email: email.toLowerCase().trim() });
      
      if (!donor) {
        // Create new donor
        donor = new Donor({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim()
        });
        await donor.save();
      }
      
      return donor;
    } catch (error) {
      throw new Error(`Failed to find or create donor: ${error.message}`);
    }
  }

  // Create donation
  async createDonation(donationData) {
    try {
      const {
        name,
        email,
        phone,
        amount,
        orderId,
        transactionId,
        sessionId,
        status,
        currency = 'LKR',
        paymentMethod = 'CARD',
        description = 'Disaster Relief Donation'
      } = donationData;

      // Find or create donor
      const donor = await this.findOrCreateDonor({ name, email, phone });

      // Create donation
      const donation = new Donation({
        donor: donor._id,
        amount: Number(amount),
        currency,
        orderId: orderId.trim(),
        transactionId: transactionId.trim(),
        sessionId: sessionId.trim(),
        status: status.toUpperCase(),
        paymentMethod,
        description
      });

      await donation.save();

      // Update donor stats if donation is successful
      if (status.toUpperCase() === 'SUCCESS') {
        await donor.updateStats(Number(amount));
      }

      return donation;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Donation with this order ID already exists');
      }
      throw new Error(`Failed to create donation: ${error.message}`);
    }
  }

  // Confirm donation
  async confirmDonation(donationData) {
    try {
      const donation = await this.createDonation(donationData);
      
      // Populate donor information
      await donation.populate('donor');
      
      // Set confirmation timestamp if successful
      if (donation.status === 'SUCCESS') {
        donation.confirmedAt = new Date();
        await donation.save();
      }

      return donation;
    } catch (error) {
      throw error;
    }
  }

  // Get donations with pagination and filtering
  async getDonations(filters = {}, pagination = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        status,
        startDate,
        endDate,
        donorId
      } = { ...filters, ...pagination };

      // Build query
      const query = {};

      if (status) {
        query.status = status.toUpperCase();
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      if (donorId) {
        query.donor = donorId;
      }

      // Calculate pagination
      const skip = (page - 1) * Math.min(limit, 100);
      const limitValue = Math.min(limit, 100);

      // Execute query
      const [donations, total] = await Promise.all([
        Donation.find(query)
          .populate('donor', 'name email phone')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitValue),
        Donation.countDocuments(query)
      ]);

      return {
        data: donations,
        pagination: {
          page: Number(page),
          limit: limitValue,
          total,
          pages: Math.ceil(total / limitValue)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch donations: ${error.message}`);
    }
  }

  // Get donation statistics
  async getDonationStats(filters = {}) {
    try {
      const { startDate, endDate } = filters;
      
      // Build date filter
      const dateFilter = {};
      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
        if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
      }

      // Get summary statistics
      const summary = await Donation.getStats(dateFilter);
      
      // Get status breakdown
      const statusBreakdown = await Donation.getStatusBreakdown(dateFilter);
      
      // Get recent activity (last 7 days)
      const recentActivity = await Donation.getRecentActivity(7);

      return {
        summary,
        statusBreakdown,
        recentActivity
      };
    } catch (error) {
      throw new Error(`Failed to fetch donation statistics: ${error.message}`);
    }
  }

  // Get donor's donation history
  async getDonorHistory(email) {
    try {
      const donor = await Donor.findOne({ email: email.toLowerCase().trim() });
      
      if (!donor) {
        return {
          donor: null,
          donations: [],
          stats: {
            totalDonations: 0,
            totalAmount: 0,
            averageDonation: 0
          }
        };
      }

      const donations = await Donation.find({ donor: donor._id })
        .sort({ createdAt: -1 })
        .limit(50);

      return {
        donor: {
          name: donor.name,
          email: donor.email,
          phone: donor.phone,
          donationCount: donor.donationCount,
          totalDonated: donor.totalDonated,
          firstDonationDate: donor.firstDonationDate,
          lastDonationDate: donor.lastDonationDate
        },
        donations,
        stats: {
          totalDonations: donor.donationCount,
          totalAmount: donor.totalDonated,
          averageDonation: donor.donationCount > 0 ? 
            Math.round((donor.totalDonated / donor.donationCount) * 100) / 100 : 0
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch donor history: ${error.message}`);
    }
  }
}

module.exports = new DonationService();
