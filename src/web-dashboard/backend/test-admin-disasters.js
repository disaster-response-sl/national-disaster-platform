const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Mock admin token (you'll need to get a real token from login)
let adminToken = '';

// Test authentication first (you need to implement this with your actual admin credentials)
async function getAdminToken() {
  try {
    // This is a mock - replace with actual admin login
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      individualId: 'admin123',
      otp: '123456'
    });
    
    if (response.data.success) {
      adminToken = response.data.token;
      console.log('✅ Admin token obtained');
      return true;
    }
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test creating a new disaster
async function testCreateDisaster() {
  try {
    console.log('\n🧪 Testing Create Disaster...');
    
    const disasterData = {
      title: 'Test Flood Emergency in Colombo',
      type: 'flood',
      severity: 'high',
      description: 'Severe flooding in Colombo metropolitan area due to heavy monsoon rains',
      location: { lat: 6.9271, lng: 79.8612 },
      zones: [
        {
          zone_name: 'Colombo Central',
          boundary_coordinates: [
            [6.9271, 79.8612],
            [6.9371, 79.8612],
            [6.9371, 79.8712],
            [6.9271, 79.8712],
            [6.9271, 79.8612]
          ],
          estimated_population: 50000,
          area_km2: 10.5,
          risk_level: 'high'
        },
        {
          zone_name: 'Colombo Port Area',
          boundary_coordinates: [
            [6.9171, 79.8512],
            [6.9271, 79.8512],
            [6.9271, 79.8612],
            [6.9171, 79.8612],
            [6.9171, 79.8512]
          ],
          estimated_population: 25000,
          area_km2: 5.2,
          risk_level: 'critical'
        }
      ],
      priority_level: 'high',
      incident_commander: 'Commander Silva',
      contact_number: '+94771234567',
      reporting_agency: 'Sri Lanka Disaster Management Center',
      public_alert: true,
      alert_message: 'Severe flooding in Colombo. Residents in low-lying areas advised to evacuate immediately.',
      evacuation_required: true,
      evacuation_zones: ['Colombo Central', 'Colombo Port Area'],
      assigned_teams: ['Rescue Team Alpha', 'Medical Team Beta'],
      estimated_duration: 72
    };

    const response = await axios.post(`${BASE_URL}/admin/disasters`, disasterData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Disaster created successfully');
    console.log('   Disaster Code:', response.data.data.disaster_code);
    console.log('   Total Zones:', response.data.data.zones.length);
    console.log('   Warnings:', response.data.warnings);
    
    return response.data.data._id; // Return disaster ID for further tests
  } catch (error) {
    console.log('❌ Create disaster failed:', error.response?.data?.message || error.message);
    return null;
  }
}

// Test getting disaster list
async function testGetDisasters() {
  try {
    console.log('\n🧪 Testing Get Disasters List...');
    
    const response = await axios.get(`${BASE_URL}/admin/disasters?limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Disasters retrieved successfully');
    console.log('   Total:', response.data.pagination.total);
    console.log('   Current page:', response.data.pagination.page);
    console.log('   Summary:', response.data.summary);
    
    if (response.data.data.length > 0) {
      console.log('   First disaster:', response.data.data[0].disaster_code, '-', response.data.data[0].title);
    }
  } catch (error) {
    console.log('❌ Get disasters failed:', error.response?.data?.message || error.message);
  }
}

// Test disaster statistics
async function testGetStatistics() {
  try {
    console.log('\n🧪 Testing Disaster Statistics...');
    
    const response = await axios.get(`${BASE_URL}/admin/disasters/statistics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Statistics retrieved successfully');
    console.log('   Overview:', response.data.data.overview);
    console.log('   By Status:', response.data.data.by_status);
    console.log('   By Type:', response.data.data.by_type);
  } catch (error) {
    console.log('❌ Get statistics failed:', error.response?.data?.message || error.message);
  }
}

// Test adding a zone to disaster
async function testAddZone(disasterId) {
  if (!disasterId) return;
  
  try {
    console.log('\n🧪 Testing Add Zone to Disaster...');
    
    const zoneData = {
      zone_name: 'Colombo Suburbs',
      boundary_coordinates: [
        [6.9471, 79.8812],
        [6.9571, 79.8812],
        [6.9571, 79.8912],
        [6.9471, 79.8912],
        [6.9471, 79.8812]
      ],
      estimated_population: 30000,
      area_km2: 8.0,
      risk_level: 'medium'
    };

    const response = await axios.post(`${BASE_URL}/admin/disasters/${disasterId}/zones`, zoneData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Zone added successfully');
    console.log('   Zone ID:', response.data.data.zone._id);
    console.log('   Total zones now:', response.data.data.total_zones);
  } catch (error) {
    console.log('❌ Add zone failed:', error.response?.data?.message || error.message);
  }
}

// Test resource summary
async function testResourceSummary() {
  try {
    console.log('\n🧪 Testing Resource Summary...');
    
    const response = await axios.get(`${BASE_URL}/admin/disasters/resource-summary`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Resource summary retrieved successfully');
    console.log('   Summary:', response.data.data.summary);
    console.log('   Personnel:', response.data.data.personnel);
    console.log('   Equipment:', response.data.data.equipment);
  } catch (error) {
    console.log('❌ Get resource summary failed:', error.response?.data?.message || error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Admin Disaster API Tests...\n');
  
  // Test authentication first
  const isAuthenticated = await getAdminToken();
  if (!isAuthenticated) {
    console.log('\n❌ Cannot proceed without admin authentication');
    console.log('💡 Please ensure you have proper admin credentials or mock the token');
    return;
  }
  
  // Run tests
  const disasterId = await testCreateDisaster();
  await testGetDisasters();
  await testGetStatistics();
  await testAddZone(disasterId);
  await testResourceSummary();
  
  console.log('\n✨ All tests completed!');
  console.log('📝 Note: Some tests may fail if admin authentication is not properly set up');
}

// Run the tests
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test runner error:', error.message);
  });
}

module.exports = {
  runTests,
  testCreateDisaster,
  testGetDisasters,
  testGetStatistics,
  testAddZone,
  testResourceSummary
};
