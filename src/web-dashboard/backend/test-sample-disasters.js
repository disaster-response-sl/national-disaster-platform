const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Mock admin token - in a real scenario, you'd get this from login
// For testing, we'll simulate the token structure
const mockAdminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluMTIzIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzIzMTM4MzAwfQ.mock-signature';

// Sample disaster data for testing
const sampleDisasters = [
  {
    title: 'Severe Flooding in Colombo Metropolitan Area',
    type: 'flood',
    severity: 'high',
    description: 'Heavy monsoon rains causing severe flooding in multiple districts of Colombo. Water levels have risen significantly affecting residential and commercial areas.',
    location: { lat: 6.9271, lng: 79.8612 },
    zones: [
      {
        zone_name: 'Colombo Central Business District',
        boundary_coordinates: [
          [6.9271, 79.8612],
          [6.9371, 79.8612],
          [6.9371, 79.8712],
          [6.9271, 79.8712],
          [6.9271, 79.8612]
        ],
        estimated_population: 45000,
        area_km2: 12.5,
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
        area_km2: 8.2,
        risk_level: 'critical'
      }
    ],
    priority_level: 'high',
    incident_commander: 'Commander Rajesh Silva',
    contact_number: '+94771234567',
    reporting_agency: 'Sri Lanka Disaster Management Center',
    public_alert: true,
    alert_message: 'FLOOD ALERT: Severe flooding in Colombo area. Residents in low-lying areas are advised to evacuate immediately. Emergency shelters have been set up.',
    evacuation_required: true,
    evacuation_zones: ['Colombo Central Business District', 'Colombo Port Area'],
    assigned_teams: ['Rescue Team Alpha', 'Medical Team Beta', 'Evacuation Team Gamma'],
    estimated_duration: 72,
    resources_required: {
      personnel: 150,
      rescue_teams: 8,
      medical_units: 5,
      vehicles: 25,
      boats: 10,
      helicopters: 3,
      food_supplies: 15000,
      water_supplies: 75000,
      medical_supplies: 200,
      temporary_shelters: 500
    }
  },
  {
    title: 'Landslide Emergency in Kandy Hills',
    type: 'landslide',
    severity: 'critical',
    description: 'Critical landslide situation in Kandy hill country following continuous rainfall. Multiple slopes showing signs of instability with immediate threat to residential areas.',
    location: { lat: 7.2906, lng: 80.6337 },
    zones: [
      {
        zone_name: 'Upper Kandy Hills',
        boundary_coordinates: [
          [7.2906, 80.6337],
          [7.3006, 80.6337],
          [7.3006, 80.6437],
          [7.2906, 80.6437],
          [7.2906, 80.6337]
        ],
        estimated_population: 15000,
        area_km2: 18.7,
        risk_level: 'critical'
      },
      {
        zone_name: 'Kandy Valley Settlements',
        boundary_coordinates: [
          [7.2806, 80.6237],
          [7.2906, 80.6237],
          [7.2906, 80.6337],
          [7.2806, 80.6337],
          [7.2806, 80.6237]
        ],
        estimated_population: 8500,
        area_km2: 6.3,
        risk_level: 'high'
      }
    ],
    priority_level: 'emergency',
    incident_commander: 'Commander Priya Mendis',
    contact_number: '+94812345678',
    reporting_agency: 'National Building Research Organization',
    public_alert: true,
    alert_message: 'LANDSLIDE EMERGENCY: Critical landslide risk in Kandy hills. Immediate evacuation ordered for high-risk zones. Do not return to homes until all-clear is given.',
    evacuation_required: true,
    evacuation_zones: ['Upper Kandy Hills', 'Kandy Valley Settlements'],
    assigned_teams: ['Emergency Response Team 1', 'Geological Assessment Team', 'Search and Rescue Unit'],
    estimated_duration: 120,
    resources_required: {
      personnel: 200,
      rescue_teams: 12,
      medical_units: 8,
      vehicles: 35,
      boats: 0,
      helicopters: 5,
      food_supplies: 8000,
      water_supplies: 40000,
      medical_supplies: 150,
      temporary_shelters: 300
    }
  }
];

// Function to test server connectivity
async function testServerConnection() {
  try {
    console.log('🔌 Testing server connection...');
    const response = await axios.get(`${BASE_URL}/map/disasters`);
    console.log('✅ Server is running and accessible');
    console.log(`📊 Current disasters in database: ${response.data.count}`);
    return true;
  } catch (error) {
    console.log('❌ Server connection failed:', error.message);
    console.log('💡 Make sure the server is running on http://localhost:5000');
    return false;
  }
}

// Function to validate disaster data structure
function validateDisasterData(disaster) {
  const requiredFields = ['title', 'type', 'severity', 'description'];
  const missingFields = requiredFields.filter(field => !disaster[field]);
  
  if (missingFields.length > 0) {
    console.log(`❌ Missing required fields: ${missingFields.join(', ')}`);
    return false;
  }
  
  // Validate zones
  if (disaster.zones && disaster.zones.length > 0) {
    for (let i = 0; i < disaster.zones.length; i++) {
      const zone = disaster.zones[i];
      if (!zone.zone_name || !zone.boundary_coordinates) {
        console.log(`❌ Zone ${i + 1} missing required fields (zone_name, boundary_coordinates)`);
        return false;
      }
      
      if (zone.boundary_coordinates.length < 3) {
        console.log(`❌ Zone ${i + 1} boundary coordinates must have at least 3 points`);
        return false;
      }
    }
  }
  
  console.log('✅ Disaster data structure is valid');
  return true;
}

// Function to test disaster creation (dry run - no actual database save)
async function testDisasterCreation(disasterData, testName) {
  try {
    console.log(`\n🧪 Testing ${testName}...`);
    
    // Validate data first
    if (!validateDisasterData(disasterData)) {
      return false;
    }
    
    // Show what would be created
    console.log(`📝 Disaster Details:`);
    console.log(`   Title: ${disasterData.title}`);
    console.log(`   Type: ${disasterData.type}`);
    console.log(`   Severity: ${disasterData.severity}`);
    console.log(`   Priority: ${disasterData.priority_level}`);
    console.log(`   Zones: ${disasterData.zones.length}`);
    console.log(`   Total Population at Risk: ${disasterData.zones.reduce((sum, zone) => sum + zone.estimated_population, 0)}`);
    console.log(`   Total Area: ${disasterData.zones.reduce((sum, zone) => sum + zone.area_km2, 0)} km²`);
    console.log(`   Resources Required:`);
    console.log(`     Personnel: ${disasterData.resources_required.personnel}`);
    console.log(`     Vehicles: ${disasterData.resources_required.vehicles}`);
    console.log(`     Emergency Shelters: ${disasterData.resources_required.temporary_shelters}`);
    
    // Calculate zone statistics
    const riskLevels = disasterData.zones.reduce((acc, zone) => {
      acc[zone.risk_level] = (acc[zone.risk_level] || 0) + 1;
      return acc;
    }, {});
    console.log(`   Risk Level Distribution:`, riskLevels);
    
    // Show evacuation info
    if (disasterData.evacuation_required) {
      console.log(`🚨 Evacuation Required for: ${disasterData.evacuation_zones.join(', ')}`);
    }
    
    // Note: In a real test, you would uncomment the next line to actually create the disaster
    // const response = await axios.post(`${BASE_URL}/admin/disasters`, disasterData, {
    //   headers: { Authorization: `Bearer ${mockAdminToken}` }
    // });
    
    console.log('✅ Disaster data structure validation passed');
    console.log('ℹ️  Note: This is a dry run - no data was saved to the database');
    
    return true;
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Function to show API endpoints that would be available
function showAvailableEndpoints() {
  console.log('\n📚 Available Admin API Endpoints:');
  console.log('   POST   /api/admin/disasters              - Create disaster');
  console.log('   GET    /api/admin/disasters              - List disasters');
  console.log('   GET    /api/admin/disasters/:id          - Get specific disaster');
  console.log('   PUT    /api/admin/disasters/:id          - Update disaster');
  console.log('   DELETE /api/admin/disasters/:id          - Archive disaster');
  console.log('   PATCH  /api/admin/disasters/:id/status   - Update status');
  console.log('   POST   /api/admin/disasters/:id/zones    - Add zone');
  console.log('   GET    /api/admin/disasters/statistics   - Get statistics');
  console.log('   GET    /api/admin/disasters/timeline     - Get timeline');
  console.log('   PATCH  /api/admin/disasters/bulk-status - Bulk status update');
  console.log('   POST   /api/admin/disasters/import       - Import data');
  console.log('   GET    /api/admin/disasters/export       - Export data');
}

// Main test function
async function runSampleDataTest() {
  console.log('🚀 Starting Admin Disaster Management API Test with Sample Data\n');
  console.log('=' .repeat(70));
  
  // Test server connection
  const isConnected = await testServerConnection();
  if (!isConnected) {
    console.log('\n❌ Cannot proceed without server connection');
    return;
  }
  
  console.log('\n' + '=' .repeat(70));
  
  // Test sample disasters
  let testsPassed = 0;
  
  for (let i = 0; i < sampleDisasters.length; i++) {
    const disaster = sampleDisasters[i];
    const testName = `Sample Disaster ${i + 1} (${disaster.type.toUpperCase()})`;
    
    const passed = await testDisasterCreation(disaster, testName);
    if (passed) testsPassed++;
  }
  
  // Show summary
  console.log('\n' + '=' .repeat(70));
  console.log('📊 Test Summary:');
  console.log(`   Tests Passed: ${testsPassed}/${sampleDisasters.length}`);
  console.log(`   Total Population at Risk: ${sampleDisasters.reduce((sum, d) => sum + d.zones.reduce((zSum, z) => zSum + z.estimated_population, 0), 0)}`);
  console.log(`   Total Area Coverage: ${sampleDisasters.reduce((sum, d) => sum + d.zones.reduce((zSum, z) => zSum + z.area_km2, 0), 0)} km²`);
  console.log(`   Critical/Emergency Disasters: ${sampleDisasters.filter(d => d.severity === 'critical' || d.priority_level === 'emergency').length}`);
  
  // Show available endpoints
  showAvailableEndpoints();
  
  console.log('\n✨ Sample data test completed!');
  console.log('💡 To actually create these disasters, uncomment the API call in the test function');
  console.log('🔧 To enable real API testing, implement proper admin authentication');
}

// Export functions for potential reuse
module.exports = {
  sampleDisasters,
  testServerConnection,
  validateDisasterData,
  testDisasterCreation,
  runSampleDataTest
};

// Run the test if this file is executed directly
if (require.main === module) {
  runSampleDataTest().catch(error => {
    console.error('Test runner error:', error.message);
  });
}
