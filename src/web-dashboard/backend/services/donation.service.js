const Donor = require('../models/Donor');
const Donation = require('../models/Donation');
const PaymentService = require('./payment.service');

class DonationService {
  /**
   * Create a new donor or find existing one
   * @param {Object} donorData - Donor information
   * @returns {Promise<Object>} - Donor document
   */
  async createOrFindDonor(donorData) {
    try {
      let donor = await Donor.findOne({ email: donorData.email });

      if (!donor) {
        donor = new Donor(donorData);
        await donor.save();
      }

      return donor;
    } catch (error) {
      console.error('Error creating/finding donor:', error);
      throw new Error('Failed to process donor information');
    }
  }

  /**
   * Create a new donation record
   * @param {Object} donationData - Donation information
   * @returns {Promise<Object>} - Donation document
   */
  async createDonation(donationData) {
    try {
      const donation = new Donation(donationData);
      await donation.save();

      // Populate donor information
      await donation.populate('donor');

      return donation;
    } catch (error) {
      console.error('Error creating donation:', error);
      throw new Error('Failed to create donation record');
    }
  }

  /**
   * Confirm and process a donation
   * @param {Object} confirmationData - Confirmation data from payment gateway
   * @returns {Promise<Object>} - Processed donation
   */
  async confirmDonation(confirmationData) {
    try {
      const {
        name,
        email,
        phone,
        amount,
        orderId,
        transactionId,
        sessionId,
        status
      } = confirmationData;

      // Create or find donor
      const donor = await this.createOrFindDonor({ name, email, phone });

      // Create donation record
      const donation = await this.createDonation({
        donor: donor._id,
        amount: parseFloat(amount),
        orderId,
        transactionId,
        sessionId,
        status: status.toUpperCase()
      });

      return donation;
    } catch (error) {
      console.error('Error confirming donation:', error);
      throw error;
    }
  }

  /**
   * Get all donations with donor details
   * @param {Object} filters - Optional filters
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} - Donations with pagination
   */
  async getAllDonations(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 50 } = pagination;
      const skip = (page - 1) * limit;

      const query = {};

      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.startDate && filters.endDate) {
        query.createdAt = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }

      const donations = await Donation.find(query)
        .populate('donor')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Donation.countDocuments(query);

      return {
        donations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching donations:', error);
      throw new Error('Failed to fetch donations');
    }
  }

  /**
   * Get donation statistics
   * @returns {Promise<Object>} - Donation statistics
   */
  async getDonationStats() {
    try {
      const stats = await Donation.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalDonations: { $sum: 1 },
            successfulDonations: {
              $sum: { $cond: [{ $eq: ['$status', 'SUCCESS'] }, 1, 0] }
            },
            averageAmount: { $avg: '$amount' }
          }
        }
      ]);

      const statusBreakdown = await Donation.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      return {
        summary: stats[0] || {
          totalAmount: 0,
          totalDonations: 0,
          successfulDonations: 0,
          averageAmount: 0
        },
        statusBreakdown
      };
    } catch (error) {
      console.error('Error fetching donation stats:', error);
      throw new Error('Failed to fetch donation statistics');
    }
  }
}

module.exports = new DonationService();
