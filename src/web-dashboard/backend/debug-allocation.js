const axios = require('axios');

const baseURL = 'http://localhost:5000';

async function debugAllocationIssue() {
  try {
    // Get auth token
    const responderResponse = await axios.post(`${baseURL}/api/auth/test-login`, {
      username: 'responder', 
      role: 'responder'
    });
    const responderToken = responderResponse.data.token;

    // First create a resource
    const resourceData = {
      name: 'Debug Test Resource',
      type: 'transportation',
      category: 'logistics',
      quantity: { 
        current: 10, 
        allocated: 0, 
        reserved: 0,
        unit: 'vehicles'
      },
      location: {
        lat: 6.9271,
        lng: 79.8612,
        address: 'Colombo, Sri Lanka'
      },
      priority: 'high',
      status: 'available'
    };
    
    const createResponse = await axios.post(`${baseURL}/api/resources`, resourceData, {
      headers: { Authorization: `Bearer ${responderToken}` }
    });
    
    console.log('Resource created:', createResponse.data.data._id);
    
    const resourceId = createResponse.data.data._id;
    
    // Now try to allocate
    const allocationData = {
      quantity: 2,
      disaster_id: 'test-disaster-123',
      location: { lat: 6.9271, lng: 79.8612, address: 'Emergency Site' },
      estimated_duration: '4 hours'
    };
    
    const allocateResponse = await axios.post(`${baseURL}/api/resources/${resourceId}/allocate`, allocationData, {
      headers: { Authorization: `Bearer ${responderToken}` }
    });
    
    console.log('Allocation successful:', allocateResponse.data);
    
  } catch (error) {
    console.error('Error details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      error: error.response?.data?.error,
      data: error.response?.data
    });
  }
}

debugAllocationIssue();
