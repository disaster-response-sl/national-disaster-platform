const axios = require('axios');

const baseURL = 'http://localhost:5000';

async function debugFailingEndpoints() {
  console.log('🔍 DEBUGGING FAILING ENDPOINTS\n');

  try {
    // First, get a valid auth token
    console.log('1️⃣ Getting auth token...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/test-login`, {
      username: 'testuser',
      role: 'admin'
    });
    
    const authToken = loginResponse.data.token;
    console.log('✅ Auth token obtained\n');

    // Test 1: Create Disaster
    console.log('2️⃣ Testing Create Disaster...');
    try {
      const createResponse = await axios.post(`${baseURL}/api/test/test-create`, {
        title: 'Test Flood Event',
        type: 'flood',
        severity: 'medium',
        description: 'Test disaster for API testing - flooding in residential area',
        location: {
          lat: 6.9271,
          lng: 79.8612,
          address: 'Colombo, Sri Lanka'
        },
        priority_level: 'medium',
        public_alert: true,
        evacuation_required: false
      });
      console.log('✅ Create Disaster SUCCESS');
      console.log('Response:', JSON.stringify(createResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Create Disaster FAILED');
      console.log('Status:', error.response?.status);
      console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    }

    console.log('\n');

    // Test 2: Get Profile
    console.log('3️⃣ Testing Get Profile...');
    try {
      const profileResponse = await axios.get(`${baseURL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Get Profile SUCCESS');
      console.log('Response:', JSON.stringify(profileResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Get Profile FAILED');
      console.log('Status:', error.response?.status);
      console.log('Data:', JSON.stringify(error.response?.data, null, 2));
      console.log('Headers sent:', { Authorization: `Bearer ${authToken.substring(0, 20)}...` });
    }

    console.log('\n');

    // Test 3: Submit SOS
    console.log('4️⃣ Testing Submit SOS...');
    try {
      const sosResponse = await axios.post(`${baseURL}/api/mobile/sos`, {
        location: { lat: 6.9271, lng: 79.8612, address: 'Test Emergency Location' },
        description: 'Test emergency situation',
        priority: 'high',
        type: 'medical'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Submit SOS SUCCESS');
      console.log('Response:', JSON.stringify(sosResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Submit SOS FAILED');
      console.log('Status:', error.response?.status);
      console.log('Data:', JSON.stringify(error.response?.data, null, 2));
      console.log('Headers sent:', { Authorization: `Bearer ${authToken.substring(0, 20)}...` });
    }

  } catch (error) {
    console.error('Failed to get auth token:', error.message);
  }
}

debugFailingEndpoints();
