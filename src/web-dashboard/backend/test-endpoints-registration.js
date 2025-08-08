const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test all admin endpoints to ensure they're properly registered
async function testAdminEndpoints() {
  console.log('🔧 Testing Admin Disaster API Endpoints Registration\n');
  console.log('=' .repeat(60));
  
  const endpoints = [
    {
      method: 'GET',
      path: '/admin/disasters',
      description: 'List disasters',
      expectedAuthError: true
    },
    {
      method: 'GET',
      path: '/admin/disasters/statistics',
      description: 'Get statistics',
      expectedAuthError: true
    },
    {
      method: 'GET',
      path: '/admin/disasters/timeline',
      description: 'Get timeline',
      expectedAuthError: true
    },
    {
      method: 'GET',
      path: '/admin/disasters/zones-overlap',
      description: 'Check zone overlaps',
      expectedAuthError: true
    },
    {
      method: 'GET',
      path: '/admin/disasters/resource-summary',
      description: 'Get resource summary',
      expectedAuthError: true
    },
    {
      method: 'GET',
      path: '/admin/disasters/template',
      description: 'Download import template',
      expectedAuthError: true
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🧪 Testing ${endpoint.method} ${endpoint.path}`);
      console.log(`   Description: ${endpoint.description}`);
      
      let response;
      if (endpoint.method === 'GET') {
        response = await axios.get(`${BASE_URL}${endpoint.path}`);
      }
      
      // If we get here without error, the endpoint exists
      console.log(`   Status: ${response.status}`);
      console.log('   ✅ Endpoint is registered and accessible');
      passed++;
      
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Unknown error';
        
        console.log(`   Status: ${status}`);
        console.log(`   Message: ${message}`);
        
        if (endpoint.expectedAuthError && (status === 401 || status === 403)) {
          console.log('   ✅ Endpoint exists and properly requires authentication');
          passed++;
        } else if (status === 404) {
          console.log('   ❌ Endpoint not found - route may not be registered');
          failed++;
        } else {
          console.log('   ⚠️  Endpoint exists but returned unexpected error');
          passed++; // Still counts as endpoint being registered
        }
      } else {
        console.log(`   ❌ Connection error: ${error.message}`);
        failed++;
      }
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 Endpoint Registration Test Results:');
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${endpoints.length}`);
  
  if (failed === 0) {
    console.log('   ✅ All admin endpoints are properly registered!');
  } else {
    console.log('   ⚠️  Some endpoints may not be properly registered');
  }

  // Test a few non-admin endpoints for comparison
  console.log('\n📋 Testing Non-Admin Endpoints for Comparison:');
  
  const publicEndpoints = [
    { path: '/map/disasters', description: 'Public disaster map data' },
    { path: '/map/statistics', description: 'Public map statistics' }
  ];

  for (const endpoint of publicEndpoints) {
    try {
      console.log(`\n🔍 Testing GET ${endpoint.path}`);
      const response = await axios.get(`${BASE_URL}${endpoint.path}`);
      console.log(`   ✅ Status: ${response.status} - ${endpoint.description} working`);
    } catch (error) {
      console.log(`   ❌ Status: ${error.response?.status || 'Error'} - ${endpoint.description} failed`);
    }
  }
}

// Test basic server functionality
async function testServerHealth() {
  console.log('🏥 Testing Server Health\n');
  
  try {
    console.log('🔌 Testing basic connectivity...');
    const response = await axios.get(`${BASE_URL}/map/disasters`);
    console.log(`✅ Server is running (Status: ${response.status})`);
    console.log(`📊 Current disasters in database: ${response.data.count}`);
    
    // Test MongoDB connection by trying to fetch data
    if (response.data.data && Array.isArray(response.data.data)) {
      console.log('✅ MongoDB connection is working');
      console.log(`📈 Sample disaster types: ${[...new Set(response.data.data.map(d => d.type))].join(', ')}`);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Server health check failed:', error.message);
    return false;
  }
}

// Main test runner
async function runEndpointTests() {
  console.log('🚀 Admin Disaster Management API - Endpoint Registration Test\n');
  
  // First check if server is healthy
  const isHealthy = await testServerHealth();
  if (!isHealthy) {
    console.log('\n❌ Cannot proceed with endpoint tests - server is not responding');
    return;
  }
  
  console.log('\n' + '=' .repeat(60));
  
  // Test admin endpoints
  await testAdminEndpoints();
  
  console.log('\n✨ Endpoint registration test completed!');
  console.log('\n💡 Notes:');
  console.log('   - 401/403 errors on admin endpoints are expected (authentication required)');
  console.log('   - All admin endpoints should return auth errors, not 404 errors');
  console.log('   - This confirms the routes are properly registered');
}

// Export for reuse
module.exports = {
  testAdminEndpoints,
  testServerHealth,
  runEndpointTests
};

// Run if called directly
if (require.main === module) {
  runEndpointTests().catch(error => {
    console.error('Test error:', error.message);
  });
}
