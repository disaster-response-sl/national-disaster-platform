// ndx.routes.js - NDX (National Data Exchange) Routes
// Implements WSO2 Choreo API Manager pattern for data exchange

const express = require('express');
const MockNDXService = require('../services/ndx-service');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const ndxService = new MockNDXService();

// Public test endpoints for development
router.get('/weather', async (req, res) => {
  try {
    const { location = 'Colombo' } = req.query;
    res.json({
      success: true,
      data: {
        location: location,
        temperature: Math.round(25 + Math.random() * 10),
        humidity: Math.round(60 + Math.random() * 30),
        conditions: ['Sunny', 'Cloudy', 'Rainy', 'Stormy'][Math.floor(Math.random() * 4)],
        windSpeed: Math.round(5 + Math.random() * 15),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/statistics', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        disasters: {
          total: 156,
          active: 3,
          resolved: 153
        },
        population: {
          affected: 12450,
          evacuated: 3200,
          sheltered: 890
        },
        resources: {
          teams_deployed: 15,
          hospitals_active: 45,
          safe_zones: 28
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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
      provider_id,
      dataType,
      data_types,
      purpose,
      consentDuration
    } = req.body;

    // Accept both field name variations for backwards compatibility
    const providerField = dataProvider || provider_id;
    const dataTypeField = dataType || (Array.isArray(data_types) ? data_types.join(',') : data_types);

    if (!providerField || !dataTypeField || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'dataProvider (or provider_id), dataType (or data_types), and purpose are required',
        received_fields: Object.keys(req.body)
      });
    }

    const request = {
      individualId,
      dataProvider: providerField,
      dataType: dataTypeField,
      purpose,
      consentDuration: consentDuration || '1 year',
      requestId: `req_${Date.now()}`,
      requestedAt: new Date().toISOString()
    };

    console.log('NDX consent request:', request);

    // Mock NDX service response since we might not have the actual service
    const mockResult = {
      success: true,
      data: {
        requestId: request.requestId,
        status: 'pending',
        message: 'Consent request submitted successfully',
        provider: request.dataProvider,
        dataTypes: request.dataType,
        purpose: request.purpose,
        estimatedProcessingTime: '2-5 business days'
      }
    };

    res.status(201).json(mockResult);
  } catch (error) {
    console.error('NDX consent request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request consent',
      error: error.message
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
