const express = require('express');
const router = express.Router();
const DonationService = require('../services/donation.service');
const MPGSService = require('../services/mpgs.service');
const {
  validateDonationConfirmation,
  validatePaymentSession,
  validateQueryParams,
  sanitizeResponse,
  handleError
} = require('../middleware/donation.middleware');

// POST /api/payment/session - Create hosted checkout session
router.post('/session', validatePaymentSession, async (req, res) => {
  try {
    const sessionResult = await MPGSService.createHostedSession(req.body);
    
    if (sessionResult.success) {
      res.status(200).json(sessionResult);
    } else {
      res.status(500).json(sessionResult);
    }
  } catch (error) {
    handleError(error, req, res);
  }
});

// GET /api/payment/session/:sessionId - Verify payment session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const sessionResult = await MPGSService.verifySession(sessionId);
    
    if (sessionResult.success) {
      res.status(200).json(sessionResult);
    } else {
      res.status(400).json(sessionResult);
    }
  } catch (error) {
    handleError(error, req, res);
  }
});

// GET /api/payment/order/:orderId - Retrieve order information
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required'
      });
    }

    const orderResult = await MPGSService.retrieveOrder(orderId);
    
    if (orderResult.success) {
      res.status(200).json(orderResult);
    } else {
      res.status(400).json(orderResult);
    }
  } catch (error) {
    handleError(error, req, res);
  }
});

// POST /api/payment/direct - Process direct payment (Alternative method)
router.post('/direct', async (req, res) => {
  try {
    const { orderId, amount, currency, card, billing } = req.body;

    // Basic validation
    if (!orderId || !amount || !card) {
      return res.status(400).json({
        success: false,
        error: 'Order ID, amount, and card details are required'
      });
    }

    const paymentResult = await MPGSService.processDirectPayment({
      orderId,
      amount,
      currency,
      card,
      billing
    });
    
    if (paymentResult.success) {
      res.status(200).json(paymentResult);
    } else {
      res.status(400).json(paymentResult);
    }
  } catch (error) {
    handleError(error, req, res);
  }
});

// POST /api/payment/webhook - Handle MPGS webhooks (if configured)
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-gateway-signature'];
    const webhookSecret = process.env.MPGS_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.warn('⚠️ MPGS webhook secret not configured');
      return res.status(400).json({
        success: false,
        error: 'Webhook not configured'
      });
    }

    // Verify webhook signature
    const isValidSignature = MPGSService.validateWebhookSignature(
      JSON.stringify(req.body),
      signature,
      webhookSecret
    );

    if (!isValidSignature) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    // Process webhook data
    const { order, transaction } = req.body;
    
    console.log('🔔 MPGS Webhook received:', {
      orderId: order?.id,
      result: transaction?.result,
      amount: order?.amount
    });

    // Update donation status based on webhook
    if (order?.id && transaction?.result) {
      // Here you would update your donation record
      // This is a placeholder for the actual implementation
      console.log(`📋 Updating donation for order ${order.id} with result ${transaction.result}`);
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({
      success: true,
      message: 'Webhook processed'
    });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    handleError(error, req, res);
  }
});

module.exports = router;
