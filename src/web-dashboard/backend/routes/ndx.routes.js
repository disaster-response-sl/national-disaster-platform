// ndx.routes.js - NDX (National Data Exchange) Routes
// Implements WSO2 Choreo API Manager pattern for data exchange

const express = require('express');
const MockNDXService = require('../services/ndx-service');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const ndxService = new MockNDXService();

// GET /api/ndx/providers - Get available data providers
router.get('/providers', authenticateToken, async (req, res) => {
  try {
    const result = await ndxService.getDataProviders();
    res.json(result);
  } catch (error) {
    console.error('NDX providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch data providers'
    });
  }
});

// POST /api/ndx/consent/request - Request data exchange consent
router.post('/consent/request', authenticateToken, async (req, res) => {
  try {
    const { individualId } = req.user;
    const {
      dataProvider,
      dataType,
      purpose,
      consentDuration
    } = req.body;

    if (!dataProvider || !dataType || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'dataProvider, dataType, and purpose are required'
      });
    }

    const request = {
      individualId,
      dataProvider,
      dataType,
      purpose,
      consentDuration,
      requestId: `req_${Date.now()}`
    };

    const result = await ndxService.requestDataExchange(request);
    res.json(result);
  } catch (error) {
    console.error('NDX consent request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request consent'
    });
  }
});

// POST /api/ndx/consent/approve - Approve consent (simulates citizen approval)
router.post('/consent/approve', authenticateToken, async (req, res) => {
  try {
    const { individualId } = req.user;
    const { consentId } = req.body;

    if (!consentId) {
      return res.status(400).json({
        success: false,
        message: 'consentId is required'
      });
    }

    const result = await ndxService.approveConsent(consentId, individualId);
    res.json(result);
  } catch (error) {
    console.error('NDX consent approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve consent'
    });
  }
});

// GET /api/ndx/consent/:consentId - Get consent status
router.get('/consent/:consentId', authenticateToken, async (req, res) => {
  try {
    const { individualId } = req.user;
    const { consentId } = req.params;

    const result = await ndxService.getConsentStatus(consentId, individualId);
    res.json(result);
  } catch (error) {
    console.error('NDX consent status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get consent status'
    });
  }
});

// POST /api/ndx/consent/revoke - Revoke consent
router.post('/consent/revoke', authenticateToken, async (req, res) => {
  try {
    const { individualId } = req.user;
    const { consentId } = req.body;

    if (!consentId) {
      return res.status(400).json({
        success: false,
        message: 'consentId is required'
      });
    }

    const result = await ndxService.revokeConsent(consentId, individualId);
    res.json(result);
  } catch (error) {
    console.error('NDX consent revocation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke consent'
    });
  }
});

// POST /api/ndx/data/exchange - Exchange data using approved consent
router.post('/data/exchange', authenticateToken, async (req, res) => {
  try {
    const { consentId, dataRequest } = req.body;

    if (!consentId) {
      return res.status(400).json({
        success: false,
        message: 'consentId is required'
      });
    }

    const result = await ndxService.exchangeData(consentId, dataRequest);
    res.json(result);
  } catch (error) {
    console.error('NDX data exchange error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to exchange data'
    });
  }
});

// POST /api/ndx/data/disaster-info - Get disaster information via NDX
router.post('/data/disaster-info', authenticateToken, async (req, res) => {
  try {
    const { individualId } = req.user;
    const { location } = req.body;

    // First, request consent for disaster data
    const consentRequest = {
      individualId,
      dataProvider: 'disaster-management',
      dataType: 'disasters',
      purpose: 'emergency-response',
      consentDuration: 24 * 60 * 60 * 1000, // 24 hours
      requestId: `disaster_req_${Date.now()}`
    };

    const consentResult = await ndxService.requestDataExchange(consentRequest);
    
    if (!consentResult.success) {
      return res.status(400).json(consentResult);
    }

    // Auto-approve for demo purposes (in real scenario, citizen would approve)
    await ndxService.approveConsent(consentResult.consentId, individualId);

    // Exchange data
    const dataResult = await ndxService.exchangeData(consentResult.consentId, {
      location,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: dataResult.data,
      consentId: consentResult.consentId,
      message: 'Disaster information retrieved via NDX'
    });
  } catch (error) {
    console.error('NDX disaster info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve disaster information'
    });
  }
});

// POST /api/ndx/data/weather-alerts - Get weather alerts via NDX
router.post('/data/weather-alerts', authenticateToken, async (req, res) => {
  try {
    const { individualId } = req.user;
    const { area } = req.body;

    // Request consent for weather data
    const consentRequest = {
      individualId,
      dataProvider: 'weather-service',
      dataType: 'weather-alerts',
      purpose: 'safety-notifications',
      consentDuration: 12 * 60 * 60 * 1000, // 12 hours
      requestId: `weather_req_${Date.now()}`
    };

    const consentResult = await ndxService.requestDataExchange(consentRequest);
    
    if (!consentResult.success) {
      return res.status(400).json(consentResult);
    }

    // Auto-approve for demo
    await ndxService.approveConsent(consentResult.consentId, individualId);

    // Exchange data
    const dataResult = await ndxService.exchangeData(consentResult.consentId, {
      area,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: dataResult.data,
      consentId: consentResult.consentId,
      message: 'Weather alerts retrieved via NDX'
    });
  } catch (error) {
    console.error('NDX weather alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve weather alerts'
    });
  }
});

module.exports = router;
