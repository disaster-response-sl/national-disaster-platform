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

// GET /api/mobile/disasters - Get active disasters
router.get('/disasters', authenticateToken, async (req, res) => {
  try {
    const disasters = await Disaster.find({ status: 'active' })
      .sort({ timestamp: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: disasters
    });
  } catch (error) {
    console.error('[DISASTERS ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error fetching disasters"
    });
  }
});

// GET /api/mobile/reports - Get recent reports
router.get('/reports', authenticateToken, async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ timestamp: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('[REPORTS ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error fetching reports"
    });
  }
});

// GET /api/mobile/sos-signals - Get recent SOS signals
router.get('/sos-signals', authenticateToken, async (req, res) => {
  try {
    const sosSignals = await SosSignal.find()
      .sort({ timestamp: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: sosSignals
    });
  } catch (error) {
    console.error('[SOS SIGNALS ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error fetching SOS signals"
    });
  }
});

// GET /api/mobile/resources - Get available resources
router.get('/resources', authenticateToken, async (req, res) => {
  try {
    const resources = await Resource.find({ status: 'available' })
      .sort({ timestamp: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    console.error('[RESOURCES ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error fetching resources"
    });
  }
});

// GET /api/mobile/chat-logs - Get user's chat history
router.get('/chat-logs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.user_id || req.user.individualId;
    const chatLogs = await ChatLog.find({ user_id: userId })
      .sort({ timestamp: -1 })
      .limit(20);
    
    res.json({
      success: true,
      data: chatLogs
    });
  } catch (error) {
    console.error('[CHAT LOGS ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error fetching chat logs"
    });
  }
});

// POST /api/mobile/reports - Submit a new report
router.post('/reports', authenticateToken, async (req, res) => {
  try {
    const { type, description, disaster_id, image_url } = req.body;
    const userId = req.user._id || req.user.user_id || req.user.individualId;
    
    if (!type || !description) {
      return res.status(400).json({
        success: false,
        message: "Type and description are required"
      });
    }

    const report = new Report({
      user_id: userId,
      disaster_id: disaster_id || null,
      type,
      description,
      image_url: image_url || null,
      status: 'pending'
    });

    await report.save();

    res.json({
      success: true,
      message: "Report submitted successfully",
      data: report
    });
  } catch (error) {
    console.error('[REPORT SUBMISSION ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error submitting report"
    });
  }
});

// POST /api/mobile/chat - Submit a chat message
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.user._id || req.user.user_id || req.user.individualId;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required"
      });
    }

    // Mock response - in real app, this would be AI/chatbot response
    const response = "Thank you for your message. Our support team will get back to you shortly.";

    const chatLog = new ChatLog({
      user_id: userId,
      query,
      response
    });

    await chatLog.save();

    res.json({
      success: true,
      message: "Chat message sent",
      data: {
        query,
        response,
        timestamp: chatLog.timestamp
      }
    });
  } catch (error) {
    console.error('[CHAT ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error sending chat message"
    });
  }
});


module.exports = router;