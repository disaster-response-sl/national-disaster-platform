// Quick test to verify SOS routes are working
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Simple test route to verify SOS model
app.get('/test-sos-model', async (req, res) => {
  try {
    const SosSignal = require('./models/SosSignal');
    
    // Test creating a sample SOS signal
    const testSos = new SosSignal({
      user_id: 'test_user_123',
      location: { lat: 23.7937, lng: 90.4066 },
      message: 'Test SOS signal for backend verification',
      priority: 'high',
      emergency_type: 'medical'
    });

    const savedSos = await testSos.save();
    
    res.json({
      success: true,
      message: "SOS Model working perfectly!",
      data: savedSos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "SOS Model test failed",
      error: error.message
    });
  }
});

// Test escalation service
app.get('/test-escalation', async (req, res) => {
  try {
    const SosEscalationService = require('./services/sos-escalation.service');
    const escalationService = new SosEscalationService();
    
    const result = await escalationService.processAutoEscalation();
    
    res.json({
      success: true,
      message: "Escalation service working!",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Escalation service test failed",
      error: error.message
    });
  }
});

const PORT = 5001; // Use different port for testing

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/disaster-platform')
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    
    app.listen(PORT, () => {
      console.log(`🚀 SOS Test Server running on port ${PORT}`);
      console.log(`📊 Test SOS Model: http://localhost:${PORT}/test-sos-model`);
      console.log(`⚡ Test Escalation: http://localhost:${PORT}/test-escalation`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
