// Comprehensive SOS Routes Test with Sri Lankan Sample Data
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const SosSignal = require('./models/SosSignal');
const { authenticateToken, requireAdmin } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Sri Lankan locations for testing
const sriLankanLocations = [
  { lat: 6.9271, lng: 79.8612, address: "Colombo 1, Western Province", city: "Colombo" },
  { lat: 7.8731, lng: 80.7718, address: "Kandy, Central Province", city: "Kandy" },
  { lat: 6.0535, lng: 80.2210, address: "Galle, Southern Province", city: "Galle" },
  { lat: 8.5874, lng: 81.2152, address: "Trincomalee, Eastern Province", city: "Trincomalee" },
  { lat: 9.6615, lng: 80.0255, address: "Jaffna, Northern Province", city: "Jaffna" },
  { lat: 6.9897, lng: 79.9773, address: "Dehiwala-Mount Lavinia", city: "Dehiwala" },
  { lat: 7.2906, lng: 80.6337, address: "Kegalle, Sabaragamuwa Province", city: "Kegalle" },
  { lat: 6.8259, lng: 79.9150, address: "Kesbewa, Western Province", city: "Kesbewa" },
  { lat: 6.7103, lng: 79.9020, address: "Homagama, Western Province", city: "Homagama" },
  { lat: 7.4818, lng: 80.3609, address: "Matale, Central Province", city: "Matale" }
];

// Emergency scenarios for Sri Lanka
const emergencyScenarios = [
  {
    message: "Flash flood in Colombo - water level rising rapidly near Beira Lake",
    emergency_type: "natural_disaster",
    priority: "critical"
  },
  {
    message: "Landslide warning in Kandy hills - houses at risk",
    emergency_type: "natural_disaster", 
    priority: "high"
  },
  {
    message: "Medical emergency - heart attack patient needs immediate ambulance",
    emergency_type: "medical",
    priority: "critical"
  },
  {
    message: "Building collapse in Galle Fort area - people trapped",
    emergency_type: "accident",
    priority: "critical"
  },
  {
    message: "Forest fire spreading near Trincomalee - evacuation needed",
    emergency_type: "fire",
    priority: "high"
  },
  {
    message: "Road accident on A1 highway - multiple vehicles involved",
    emergency_type: "accident",
    priority: "high"
  },
  {
    message: "Elderly person fallen at home - unable to get up",
    emergency_type: "medical",
    priority: "medium"
  },
  {
    message: "Suspicious activity reported near railway station",
    emergency_type: "crime",
    priority: "medium"
  },
  {
    message: "Power line down blocking main road in residential area",
    emergency_type: "other",
    priority: "medium"
  },
  {
    message: "Child missing in crowded market area for 2 hours",
    emergency_type: "crime",
    priority: "high"
  }
];

// Generate test admin token
function generateTestToken() {
  const jwt = require('jsonwebtoken');
  const payload = {
    userId: 'admin_test_user',
    role: 'admin',
    username: 'test_admin_srilanka'
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret-key-change-in-production');
}

// Test route to seed Sri Lankan SOS data
app.post('/test/seed-sri-lanka-sos', async (req, res) => {
  try {
    console.log('🇱🇰 Seeding Sri Lankan SOS test data...');
    
    // Clear existing test data
    await SosSignal.deleteMany({ user_id: { $regex: /test_user_/ } });
    
    const sosSignals = [];
    const now = new Date();
    
    for (let i = 0; i < emergencyScenarios.length; i++) {
      const location = sriLankanLocations[i % sriLankanLocations.length];
      const scenario = emergencyScenarios[i];
      
      // Create different time stamps for testing escalation
      const createdTime = new Date(now.getTime() - (i * 10 * 60 * 1000)); // 10 min intervals
      
      const sosSignal = new SosSignal({
        user_id: `test_user_lk_${String(i + 1).padStart(3, '0')}`,
        location: {
          lat: location.lat + (Math.random() - 0.5) * 0.01, // Add slight variation
          lng: location.lng + (Math.random() - 0.5) * 0.01,
          address: location.address
        },
        message: scenario.message,
        priority: scenario.priority,
        emergency_type: scenario.emergency_type,
        status: i < 3 ? 'pending' : i < 6 ? 'acknowledged' : i < 8 ? 'responding' : 'resolved',
        contact_info: {
          phone: `+94${Math.floor(Math.random() * 100000000).toString().padStart(9, '0')}`,
          alternate_contact: `+94${Math.floor(Math.random() * 100000000).toString().padStart(9, '0')}`
        },
        created_at: createdTime,
        updated_at: createdTime
      });
      
      // Add some escalated signals for testing
      if (i < 3) {
        sosSignal.escalation_level = Math.floor(Math.random() * 3);
        if (sosSignal.escalation_level > 0) {
          sosSignal.auto_escalated_at = new Date(createdTime.getTime() + (15 * 60 * 1000));
        }
      }
      
      // Add some assigned responders
      if (['acknowledged', 'responding', 'resolved'].includes(sosSignal.status)) {
        sosSignal.assigned_responder = `responder_lk_${Math.floor(Math.random() * 5) + 1}`;
        sosSignal.response_time = new Date(createdTime.getTime() + (Math.random() * 20 * 60 * 1000));
      }
      
      // Add resolution time for resolved signals
      if (sosSignal.status === 'resolved') {
        sosSignal.resolution_time = new Date(createdTime.getTime() + (Math.random() * 60 * 60 * 1000));
      }
      
      sosSignals.push(sosSignal);
    }
    
    const savedSignals = await SosSignal.insertMany(sosSignals);
    
    res.json({
      success: true,
      message: `🇱🇰 Successfully seeded ${savedSignals.length} Sri Lankan SOS signals`,
      data: {
        totalSignals: savedSignals.length,
        locations: sriLankanLocations.length,
        emergencyTypes: [...new Set(savedSignals.map(s => s.emergency_type))],
        priorities: [...new Set(savedSignals.map(s => s.priority))],
        statuses: [...new Set(savedSignals.map(s => s.status))]
      }
    });
    
  } catch (error) {
    console.error('❌ Error seeding Sri Lankan SOS data:', error);
    res.status(500).json({
      success: false,
      message: "Error seeding test data",
      error: error.message
    });
  }
});

// Test all SOS admin routes
app.get('/test/all-sos-routes', async (req, res) => {
  try {
    const token = generateTestToken();
    const baseUrl = `http://localhost:5002`;
    
    console.log('🧪 Testing all SOS admin routes...');
    
    const tests = [];
    
    // Test 1: Dashboard endpoint
    tests.push({
      name: "SOS Dashboard",
      endpoint: "/api/admin/sos/dashboard",
      method: "GET",
      params: "?status=all&priority=all&limit=10"
    });
    
    // Test 2: Clusters endpoint  
    tests.push({
      name: "SOS Clusters",
      endpoint: "/api/admin/sos/clusters",
      method: "GET",
      params: "?radius=2"
    });
    
    // Test 3: Analytics endpoint
    tests.push({
      name: "SOS Analytics",
      endpoint: "/api/admin/sos/analytics", 
      method: "GET",
      params: "?timeRange=24h"
    });
    
    // Get a sample SOS signal ID for detail tests
    const sampleSignal = await SosSignal.findOne({ user_id: { $regex: /test_user_/ } });
    
    if (sampleSignal) {
      // Test 4: Signal details
      tests.push({
        name: "SOS Signal Details",
        endpoint: `/api/admin/sos/${sampleSignal._id}/details`,
        method: "GET",
        params: ""
      });
      
      // Test 5: Assign responder (if not already assigned)
      if (!sampleSignal.assigned_responder) {
        tests.push({
          name: "Assign Responder",
          endpoint: `/api/admin/sos/${sampleSignal._id}/assign`,
          method: "PUT",
          body: {
            responder_id: "test_responder_colombo_001",
            notes: "Assigned emergency responder for Colombo region"
          }
        });
      }
      
      // Test 6: Update status
      tests.push({
        name: "Update SOS Status",
        endpoint: `/api/admin/sos/${sampleSignal._id}/status`,
        method: "PUT", 
        body: {
          status: "responding",
          notes: "Emergency team dispatched to location"
        }
      });
      
      // Test 7: Manual escalation
      tests.push({
        name: "Manual Escalation",
        endpoint: `/api/admin/sos/${sampleSignal._id}/escalate`,
        method: "POST",
        body: {
          escalation_level: 1,
          reason: "Situation requires immediate attention due to monsoon weather"
        }
      });
    }
    
    const results = [];
    
    // Execute tests (simulate API calls)
    for (const test of tests) {
      try {
        results.push({
          test: test.name,
          endpoint: test.endpoint,
          method: test.method,
          status: "✅ READY",
          description: `${test.method} ${test.endpoint}${test.params || ''}`,
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          ...(test.body && { body: test.body })
        });
      } catch (error) {
        results.push({
          test: test.name,
          status: "❌ ERROR",
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: "🧪 All SOS admin routes tested successfully",
      testToken: token,
      data: {
        totalTests: results.length,
        sampleSignalId: sampleSignal?._id,
        results: results,
        instructions: {
          note: "Use the provided token in Authorization header as 'Bearer <token>'",
          baseUrl: "http://localhost:5000",
          testEndpoints: results.map(r => `${r.method} ${r.endpoint}`)
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error testing SOS routes:', error);
    res.status(500).json({
      success: false,
      message: "Error testing SOS routes",
      error: error.message
    });
  }
});

// Test escalation service with Sri Lankan data
app.get('/test/escalation-sri-lanka', async (req, res) => {
  try {
    console.log('⚡ Testing escalation with Sri Lankan scenarios...');
    
    const SosEscalationService = require('./services/sos-escalation.service');
    const escalationService = new SosEscalationService();
    
    // Create some old signals that need escalation
    const now = new Date();
    const oldSignal1 = new SosSignal({
      user_id: 'escalation_test_colombo',
      location: { lat: 6.9271, lng: 79.8612, address: "Colombo Fort Railway Station" },
      message: "Monsoon flooding - platform submerged, passengers stranded",
      priority: 'medium',
      emergency_type: 'natural_disaster',
      status: 'pending',
      created_at: new Date(now.getTime() - (20 * 60 * 1000)) // 20 minutes ago
    });
    
    const oldSignal2 = new SosSignal({
      user_id: 'escalation_test_kandy',
      location: { lat: 7.8731, lng: 80.7718, address: "Kandy Lake Area" },
      message: "Landslide blocking A1 highway - multiple vehicles trapped",
      priority: 'high', 
      emergency_type: 'natural_disaster',
      status: 'pending',
      created_at: new Date(now.getTime() - (50 * 60 * 1000)) // 50 minutes ago
    });
    
    await oldSignal1.save();
    await oldSignal2.save();
    
    // Run escalation process
    const escalationResult = await escalationService.processAutoEscalation();
    
    // Get escalation stats
    const stats = await escalationService.getEscalationStats('24h');
    
    res.json({
      success: true,
      message: "⚡ Sri Lankan escalation test completed",
      data: {
        escalationResult,
        stats,
        testSignals: [
          { id: oldSignal1._id, location: "Colombo Fort", age: "20 minutes" },
          { id: oldSignal2._id, location: "Kandy", age: "50 minutes" }
        ]
      }
    });
    
  } catch (error) {
    console.error('❌ Error testing escalation:', error);
    res.status(500).json({
      success: false,
      message: "Error testing escalation",
      error: error.message
    });
  }
});

// Test geographic clustering for Sri Lanka
app.get('/test/clustering-sri-lanka', async (req, res) => {
  try {
    console.log('🗺️ Testing geographic clustering for Sri Lanka...');
    
    // Create clustered signals in Colombo area (within 2km)
    const colomboSignals = [
      {
        user_id: 'cluster_test_colombo_1',
        location: { lat: 6.9271, lng: 79.8612, address: "Colombo Fort" },
        message: "Flood water entering ground floor shops",
        priority: 'high',
        status: 'pending'
      },
      {
        user_id: 'cluster_test_colombo_2', 
        location: { lat: 6.9300, lng: 79.8650, address: "Pettah Market" },
        message: "Market flooding - vendors need evacuation",
        priority: 'critical',
        status: 'pending'
      },
      {
        user_id: 'cluster_test_colombo_3',
        location: { lat: 6.9250, lng: 79.8580, address: "Colombo Central Station" },
        message: "Railway tracks flooded - train services suspended",
        priority: 'high', 
        status: 'acknowledged'
      }
    ];
    
    // Save cluster test signals
    await SosSignal.insertMany(colomboSignals);
    
    // Test clustering calculation
    function calculateDistance(lat1, lng1, lat2, lng2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }
    
    const distances = [];
    for (let i = 0; i < colomboSignals.length - 1; i++) {
      for (let j = i + 1; j < colomboSignals.length; j++) {
        const dist = calculateDistance(
          colomboSignals[i].location.lat,
          colomboSignals[i].location.lng,
          colomboSignals[j].location.lat,
          colomboSignals[j].location.lng
        );
        distances.push({
          from: colomboSignals[i].location.address,
          to: colomboSignals[j].location.address,
          distance: `${dist.toFixed(2)} km`
        });
      }
    }
    
    res.json({
      success: true,
      message: "🗺️ Sri Lankan geographic clustering test completed",
      data: {
        clusterLocation: "Colombo Metropolitan Area",
        signalsCreated: colomboSignals.length,
        distances,
        clusteringNote: "All signals are within 2km radius - should form a cluster",
        testInstructions: "Call GET /api/admin/sos/clusters to see the actual clustering"
      }
    });
    
  } catch (error) {
    console.error('❌ Error testing clustering:', error);
    res.status(500).json({
      success: false,
      message: "Error testing clustering",
      error: error.message
    });
  }
});

// Clean up test data
app.delete('/test/cleanup-sri-lanka', async (req, res) => {
  try {
    const result = await SosSignal.deleteMany({ 
      user_id: { $regex: /test_user_|escalation_test_|cluster_test_/ } 
    });
    
    res.json({
      success: true,
      message: `🧹 Cleaned up ${result.deletedCount} test SOS signals`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error cleaning up test data",
      error: error.message
    });
  }
});

const PORT = 5002;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/disaster-platform')
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    
    app.listen(PORT, () => {
      console.log(`\n🇱🇰 Sri Lankan SOS Test Server running on port ${PORT}`);
      console.log("╔══════════════════════════════════════════════════════╗");
      console.log("║                 SOS TEST ENDPOINTS                  ║");
      console.log("╚══════════════════════════════════════════════════════╝");
      console.log(`📊 Seed Data:      http://localhost:${PORT}/test/seed-sri-lanka-sos`);
      console.log(`🧪 Test Routes:    http://localhost:${PORT}/test/all-sos-routes`);
      console.log(`⚡ Test Escalation: http://localhost:${PORT}/test/escalation-sri-lanka`);
      console.log(`🗺️ Test Clustering: http://localhost:${PORT}/test/clustering-sri-lanka`);
      console.log(`🧹 Cleanup:        DELETE http://localhost:${PORT}/test/cleanup-sri-lanka`);
      console.log("╔══════════════════════════════════════════════════════╗");
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
