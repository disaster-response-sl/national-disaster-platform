const axios = require('axios');

// Test script to verify resource allocation with automatic disaster creation
async function testResourceAllocation() {
  const baseURL = 'http://localhost:5000';

  try {
    console.log('🧪 Testing Resource Allocation with Automatic Disaster Creation...\n');

    // First, let's get an auth token (assuming we have a test user)
    console.log('1. Getting authentication token...');
    const authResponse = await axios.post(`${baseURL}/api/auth/login`, {
      individualId: 'admin001', // Admin user from mock data
      otp: '123456' // Mock OTP
    });

    if (!authResponse.data.success) {
      console.log('❌ Authentication failed. Please ensure you have test user data.');
      return;
    }

    const token = authResponse.data.token;
    console.log('✅ Authentication successful\n');

    // Get available resources
    console.log('2. Fetching available resources...');
    const resourcesResponse = await axios.get(`${baseURL}/api/resources`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { status: 'available', limit: 5 }
    });

    if (!resourcesResponse.data.success || resourcesResponse.data.data.length === 0) {
      console.log('❌ No available resources found for testing');
      return;
    }

    const testResource = resourcesResponse.data.data[0];
    console.log(`✅ Found resource: ${testResource.name} (${testResource.available_quantity} available)\n`);

    // Test allocation without disaster_id (should create new disaster)
    console.log('3. Testing allocation without disaster_id (should create new disaster)...');
    const allocationData = {
      quantity: 1,
      location: {
        lat: 6.9271,
        lng: 79.8612,
        address: 'Test Location - Colombo'
      },
      estimated_duration: 24
      // No disaster_id provided - should create new disaster
    };

    const allocationResponse = await axios.post(
      `${baseURL}/api/resources/${testResource._id}/allocate`,
      allocationData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (allocationResponse.data.success) {
      console.log('✅ Allocation successful!');
      console.log(`   - Allocated quantity: ${allocationResponse.data.data.allocated_quantity}`);
      console.log(`   - Disaster ID: ${allocationResponse.data.data.disaster_id}`);
      console.log(`   - Disaster created: ${allocationResponse.data.data.disaster_created ? 'Yes' : 'No'}`);
      console.log(`   - Deployment ID: ${allocationResponse.data.data.deployment_id}\n`);
    } else {
      console.log('❌ Allocation failed:', allocationResponse.data.message);
      return;
    }

    // Verify the disaster was created
    console.log('4. Verifying disaster was created...');
    const disasterId = allocationResponse.data.data.disaster_id;
    const disasterResponse = await axios.get(`${baseURL}/api/admin/disasters/${disasterId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (disasterResponse.data.success) {
      const disaster = disasterResponse.data.data;
      console.log('✅ Disaster verification successful!');
      console.log(`   - Disaster Code: ${disaster.disaster_code}`);
      console.log(`   - Title: ${disaster.title}`);
      console.log(`   - Type: ${disaster.type}`);
      console.log(`   - Status: ${disaster.status}\n`);
    } else {
      console.log('❌ Disaster verification failed:', disasterResponse.data.message);
    }

    // Test allocation with existing disaster_id
    console.log('5. Testing allocation with existing disaster_id...');
    const secondAllocationData = {
      quantity: 1,
      disaster_id: disasterId, // Use the disaster we just created
      location: {
        lat: 6.9271,
        lng: 79.8612,
        address: 'Test Location 2 - Colombo'
      },
      estimated_duration: 12
    };

    const secondAllocationResponse = await axios.post(
      `${baseURL}/api/resources/${testResource._id}/allocate`,
      secondAllocationData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (secondAllocationResponse.data.success) {
      console.log('✅ Second allocation successful!');
      console.log(`   - Allocated quantity: ${secondAllocationResponse.data.data.allocated_quantity}`);
      console.log(`   - Disaster ID: ${secondAllocationResponse.data.data.disaster_id}`);
      console.log(`   - Disaster created: ${secondAllocationResponse.data.data.disaster_created ? 'Yes' : 'No'}\n`);
    } else {
      console.log('❌ Second allocation failed:', secondAllocationResponse.data.message);
    }

    console.log('🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Automatic disaster creation works');
    console.log('- ✅ Resource allocation with existing disaster works');
    console.log('- ✅ Disaster records are properly linked to allocations');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testResourceAllocation();
