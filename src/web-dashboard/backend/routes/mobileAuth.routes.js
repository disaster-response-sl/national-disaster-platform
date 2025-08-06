// routes/mobileAuth.routes.js
const SosSignal = require('../models/SosSignal');
const Disaster = require('../models/Disaster');
const Report = require('../models/Report');
const Resource = require('../models/Resource');
const ChatLog = require('../models/ChatLog');

const express = require('express');
const jwt = require('jsonwebtoken');
const MockSLUDIService = require('../services/mock-sludi-service');

const router = express.Router();
const sludiService = new MockSLUDIService();
const { authenticateToken } = require('../middleware/auth');

// Utility function to validate NIC (simplified)
const validateNIC = (nic) => /^[a-zA-Z0-9]{6,20}$/.test(nic);

// POST /api/mobile/login
router.post('/login', async (req, res) => {
  console.log('Login request received:', req.body);
  
  try {
    const { individualId, otp } = req.body;
    console.log('Processing login for:', { individualId, otp });
    
    // Mock SLUDI authentication
    const authRequest = {
      id: "mosip.identity.auth",
      version: "1.0",
      individualId: individualId,
      individualIdType: "UIN",
      transactionID: `TXN_${Date.now()}`,
      requestTime: new Date().toISOString(),
      request: {
        otp: otp,
        timestamp: new Date().toISOString()
      },
      consentObtained: true
    };
    
    console.log('Calling SLUDI service with:', authRequest);
    const authResponse = await sludiService.authenticate(authRequest);
    console.log('SLUDI response:', authResponse);
    
    if (authResponse.response.authStatus) {
      // Simulate user DB lookup
      const userData = sludiService.mockUsers.find(u => u.individualId === individualId);
      console.log('Found user data:', userData);
      
      // Generate a mock _id for user
      const user = {
        _id: userData ? userData.individualId : individualId,
        individualId: userData ? userData.individualId : individualId,
        name: userData ? userData.name : 'Unknown',
        role: userData ? userData.role : 'Citizen'
      };
      
      const appToken = jwt.sign(
        {
          _id: user._id,
          individualId: user.individualId,
          role: user.role,
          name: user.name,
          sludiToken: authResponse.response.authToken
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );
      
      console.log('Sending success response with user:', user);
      res.json({
        success: true,
        token: appToken,
        user,
        message: "Authentication successful"
      });
    } else {
      console.log('Authentication failed:', authResponse.errors);
      res.status(401).json({
        success: false,
        message: "Authentication failed",
        errors: authResponse.errors
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

  // POST /api/mobile/sos
  router.post('/sos', authenticateToken, async (req, res) => {
  try {
    const { location, message, priority } = req.body;
    const userId = req.user._id || req.user.user_id || req.user.individualId;
    
    console.log('SOS request received:', { location, message, priority, userId });

    if (!location || !message) {
      return res.status(400).json({
        success: false,
        message: "Location and message are required"
      });
    }

    const sos = new SosSignal({
      user_id: userId,
      location,
      message,
      priority: priority || 'medium'
    });

    console.log('Saving SOS signal:', sos);
    await sos.save();
    console.log('SOS signal saved successfully to sos_signals collection');

    res.json({
      success: true,
      message: "SOS signal sent",
      data: sos
    });
  } catch (error) {
    console.error('[SOS ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Server error sending SOS"
    });
  }
});


module.exports = router;