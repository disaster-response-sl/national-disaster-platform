const express = require('express');
const router = express.Router();
const DonationService = require('../services/donation.service');
const {
  validateDonationConfirmation,
  validateQueryParams,
  sanitizeResponse,
  handleError
} = require('../middleware/donation.middleware');

// POST /api/donation/confirm - Confirm donation after payment
router.post('/confirm', validateDonationConfirmation, async (req, res) => {
  try {
    const donation = await DonationService.confirmDonation(req.body);
    
    // Sanitize response
    const sanitizedDonation = sanitizeResponse(donation.toObject());
    
    res.status(201).json({
      success: true,
      message: 'Donation confirmed successfully',
      donation: sanitizedDonation
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

// GET /api/donations - Get all donations with filtering and pagination
router.get('/', validateQueryParams, async (req, res) => {
  try {
    const result = await DonationService.getDonations(req.query, req.query);
    
    // Sanitize response
    const sanitizedData = sanitizeResponse(result.data.map(item => item.toObject()));
    
    res.status(200).json({
      success: true,
      data: sanitizedData,
      pagination: result.pagination
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

// GET /api/donations/stats - Get donation statistics
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await DonationService.getDonationStats({ startDate, endDate });
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

// GET /api/donations/donor/:email - Get donor history
router.get('/donor/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const donorHistory = await DonationService.getDonorHistory(email);
    
    // Sanitize response
    const sanitizedHistory = {
      ...donorHistory,
      donations: sanitizeResponse(donorHistory.donations.map(item => item.toObject()))
    };
    
    res.status(200).json({
      success: true,
      data: sanitizedHistory
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

module.exports = router;
