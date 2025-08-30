const PaymentService = require('../services/payment.service');
const DonationService = require('../services/donation.service');

class DonationController {
  /**
   * Create a payment session with MPGS
   * POST /api/payment/session
   */
  async createPaymentSession(req, res) {
    try {
      const sessionData = req.body; // Optional session configuration

      const session = await PaymentService.createSession(sessionData);

      res.status(200).json({
        success: true,
        sessionId: session.session.id,
        session: {
          id: session.session.id,
          version: session.session.version
        }
      });
    } catch (error) {
      console.error('Payment session creation error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to create payment session',
        message: error.message
      });
    }
  }

  /**
   * Confirm a donation after payment
   * POST /api/donation/confirm
   */
  async confirmDonation(req, res) {
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
      } = req.body;

      // Validate required fields
      if (!name || !email || !phone || !amount || !orderId || !transactionId || !sessionId || !status) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          required: ['name', 'email', 'phone', 'amount', 'orderId', 'transactionId', 'sessionId', 'status']
        });
      }

      // Validate amount
      if (isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid amount'
        });
      }

      const donation = await DonationService.confirmDonation({
        name,
        email,
        phone,
        amount,
        orderId,
        transactionId,
        sessionId,
        status
      });

      res.status(201).json({
        success: true,
        message: 'Donation confirmed successfully',
        donation: {
          id: donation._id,
          amount: donation.amount,
          status: donation.status,
          orderId: donation.orderId,
          transactionId: donation.transactionId,
          createdAt: donation.createdAt,
          donor: {
            name: donation.donor.name,
            email: donation.donor.email,
            phone: donation.donor.phone
          }
        }
      });
    } catch (error) {
      console.error('Donation confirmation error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to confirm donation',
        message: error.message
      });
    }
  }

  /**
   * Get all donations
   * GET /api/donations
   */
  async getDonations(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        status,
        startDate,
        endDate
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (startDate && endDate) {
        filters.startDate = startDate;
        filters.endDate = endDate;
      }

      const result = await DonationService.getAllDonations(filters, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      // Sanitize the response to remove internal MongoDB fields
      const sanitizedDonations = result.donations.map(donation => ({
        id: donation._id,
        amount: donation.amount,
        currency: donation.currency,
        orderId: donation.orderId,
        transactionId: donation.transactionId,
        status: donation.status,
        paymentMethod: donation.paymentMethod,
        createdAt: donation.createdAt,
        donor: {
          id: donation.donor._id,
          name: donation.donor.name,
          email: donation.donor.email,
          phone: donation.donor.phone
        }
      }));

      res.status(200).json({
        success: true,
        data: sanitizedDonations,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get donations error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch donations',
        message: error.message
      });
    }
  }

  /**
   * Get donation statistics
   * GET /api/donations/stats
   */
  async getDonationStats(req, res) {
    try {
      const stats = await DonationService.getDonationStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get donation stats error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch donation statistics',
        message: error.message
      });
    }
  }
}

module.exports = new DonationController();
