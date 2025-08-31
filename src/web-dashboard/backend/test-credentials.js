const express = require('express');
const router = express.Router();

// Simple test endpoint to verify MPGS credentials
router.get('/test-credentials', (req, res) => {
  const config = {
    merchantId: process.env.MERCHANT_ID,
    apiUsername: process.env.API_USERNAME,
    apiPassword: process.env.API_PASSWORD ? 'SET' : 'NOT SET',
    baseUrl: process.env.MPGS_BASE_URL
  };
  
  console.log('MPGS Test Credentials:', config);
  
  // Test Basic Auth format
  const auth = Buffer.from(`${process.env.API_USERNAME}:${process.env.API_PASSWORD}`).toString('base64');
  console.log('Auth header would be:', `Basic ${auth.substring(0, 20)}...`);
  
  res.json({
    success: true,
    config: config,
    authFormatTest: 'Check server console for details'
  });
});

module.exports = router;
