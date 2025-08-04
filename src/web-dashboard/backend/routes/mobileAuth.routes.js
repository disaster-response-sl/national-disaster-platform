// routes/mobileAuth.routes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const MockSLUDIService = require('../services/mock-sludi-service');

const router = express.Router();
const sludiService = new MockSLUDIService();

// Utility function to validate NIC (simplified)
const validateNIC = (nic) => /^[a-zA-Z0-9]{6,20}$/.test(nic);

// POST /api/mobile/login
router.post('/login', async (req, res) => {
  try {
    const { individualId, otp } = req.body;

    if (!individualId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'NIC and OTP are required'
      });
    }

    if (!validateNIC(individualId)) {
      return res.status(422).json({
        success: false,
        message: 'Invalid NIC format'
      });
    }

    const authRequest = {
      id: "mosip.identity.auth",
      version: "1.0",
      individualId,
      individualIdType: "UIN",
      transactionID: `TXN_${Date.now()}`,
      requestTime: new Date().toISOString(),
      request: {
        otp,
        timestamp: new Date().toISOString()
      },
      consentObtained: true
    };

    const authResponse = await sludiService.authenticate(authRequest);

    if (!authResponse.response.authStatus) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
        errors: authResponse.errors
      });
    }

    const user = sludiService.mockUsers.find(u => u.individualId === individualId);

    const token = jwt.sign(
      {
        individualId: user.individualId,
        name: user.name,
        role: user.role,
        sludiToken: authResponse.response.authToken
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        individualId: user.individualId,
        name: user.name,
        role: user.role
      },
      message: 'Mobile login successful'
    });

  } catch (error) {
    console.error('[MOBILE LOGIN ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;