const express = require('express');
const router = express.Router();
const DonationController = require('../controllers/donation.controller');
const { validateDonationConfirmation, validatePagination } = require('../middleware/donation.middleware');

// Payment session routes
router.post('/payment/session', DonationController.createPaymentSession);

// Donation routes
router.post('/donation/confirm', validateDonationConfirmation, DonationController.confirmDonation);
router.get('/donations', validatePagination, DonationController.getDonations);
router.get('/donations/stats', DonationController.getDonationStats);

module.exports = router;
