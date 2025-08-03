// routes/auth.js
const express = require('express');
const MockSLUDIService = require('../services/mock-sludi-service');
const jwt = require('jsonwebtoken');
const { authenticateToken, requireAdmin, requireResponder } = require('../middleware/auth');

const router = express.Router();
const sludiService = new MockSLUDIService();

// Login endpoint (no auth required)
router.post('/login', async (req, res) => {
  try {
    const { individualId, otp } = req.body;
    
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

    const authResponse = await sludiService.authenticate(authRequest);
    
    if (authResponse.response.authStatus) {
      // Get user data for JWT payload
      const userData = sludiService.mockUsers.find(u => u.individualId === individualId);
      
      // Generate JWT token with user info
      const appToken = jwt.sign(
        { 
          individualId: individualId,
          role: userData.role,
          name: userData.name,
          sludiToken: authResponse.response.authToken
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );
      
      res.json({
        success: true,
        token: appToken,
        user: {
          individualId: userData.individualId,
          name: userData.name,
          role: userData.role
        },
        message: "Authentication successful"
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Authentication failed",
        errors: authResponse.errors
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Get user profile (requires authentication)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { individualId } = req.user;
    
    const kycRequest = {
      id: "mosip.identity.kyc",
      version: "1.0", 
      individualId: individualId,
      individualIdType: "UIN",
      transactionID: `TXN_${Date.now()}`,
      requestTime: new Date().toISOString(),
      allowedKycAttributes: ["name", "email", "phone", "role"],
      consentObtained: true
    };

    const kycResponse = await sludiService.performKYC(kycRequest);
    
    if (kycResponse.response.kycStatus) {
      res.json({
        success: true,
        user: kycResponse.response.identity
      });
    } else {
      res.status(400).json({
        success: false,
        message: "KYC failed"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false, 
      message: "Internal server error"
    });
  }
});

// Admin-only route example
router.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  res.json({
    success: true,
    users: sludiService.mockUsers,
    message: "Admin access granted"
  });
});

// Responder route example  
router.get('/responder/dashboard', authenticateToken, requireResponder, async (req, res) => {
  res.json({
    success: true,
    message: "Responder dashboard access granted",
    user: req.user
  });
});

// Logout endpoint
router.post('/logout', authenticateToken, async (req, res) => {
  // In a real implementation, you might blacklist the token
  res.json({
    success: true,
    message: "Logged out successfully"
  });
});

module.exports = router;
