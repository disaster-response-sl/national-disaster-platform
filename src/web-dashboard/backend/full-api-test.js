const axios = require('axios');

async function comprehensiveAPITest() {
  const baseURL = 'http://localhost:5000';
  const results = [];

  console.log('🚀 Comprehensive Backend API Test');
  console.log('='.repeat(50));

  // Test configuration
  const tests = [
    // Health Check Endpoints
    {
      name: 'Root Health Check',
      url: `${baseURL}/`,
      method: 'GET',
      category: 'health'
    },
    {
      name: 'API Test Endpoint',
      url: `${baseURL}/api/test`,
      method: 'GET',
      category: 'health'
    },
    {
      name: 'Mobile Test Endpoint',
      url: `${baseURL}/api/mobile/test`,
      method: 'GET',
      category: 'health'
    },

    // Authentication Endpoints
    {
      name: 'Test Login (Web)',
      url: `${baseURL}/api/auth/test-login`,
      method: 'POST',
      category: 'auth',
      data: { username: 'testadmin', role: 'admin' }
    },
    {
      name: 'Test Login (Mobile)',
      url: `${baseURL}/api/mobile/test-login`,
      method: 'POST',
      category: 'auth',
      data: { username: 'testmobile', role: 'citizen' }
    },

    // Map/Disaster Endpoints
    {
      name: 'Map - Get All Disasters',
      url: `${baseURL}/api/map/disasters`,
      method: 'GET',
      category: 'map'
    },
    {
      name: 'Map - Get Disasters by Bounds',
      url: `${baseURL}/api/map/disasters?bounds=5.9,79.5,9.9,81.9`,
      method: 'GET',
      category: 'map'
    },
    {
      name: 'Map - Get Disasters by Type',
      url: `${baseURL}/api/map/disasters?type=flood`,
      method: 'GET',
      category: 'map'
    },

    // Mobile Public Endpoints
    {
      name: 'Mobile - Emergency Contacts',
      url: `${baseURL}/api/mobile/emergency-contacts`,
      method: 'GET',
      category: 'mobile'
    },
    {
      name: 'Mobile - Safe Zones',
      url: `${baseURL}/api/mobile/safe-zones?lat=6.9271&lng=79.8612`,
      method: 'GET',
      category: 'mobile'
    },

    // NDX Endpoints
    {
      name: 'NDX - Weather Data',
      url: `${baseURL}/api/ndx/weather?location=Colombo`,
      method: 'GET',
      category: 'ndx'
    },
    {
      name: 'NDX - Statistics',
      url: `${baseURL}/api/ndx/statistics`,
      method: 'GET',
      category: 'ndx'
    },

    // Test CRUD Endpoints
    {
      name: 'Test CRUD - Create Disaster',
      url: `${baseURL}/api/test/test-create`,
      method: 'POST',
      category: 'crud',
      data: {
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
      }
    },
    {
      name: 'Test CRUD - Get Disasters',
      url: `${baseURL}/api/test/test-read`,
      method: 'GET',
      category: 'crud'
    },
    {
      name: 'Test CRUD - List IDs',
      url: `${baseURL}/api/test/test-list-ids`,
      method: 'GET',
      category: 'crud'
    }
  ];

  // Execute tests
  let authToken = null;
  for (const test of tests) {
    try {
      console.log(`\n🧪 Testing: ${test.name}`);
      
      let response;
      const config = {};
      
      // Add auth header if we have a token and it's an authenticated endpoint
      if (authToken && test.requiresAuth) {
        config.headers = { Authorization: `Bearer ${authToken}` };
      }
      
      if (test.method === 'POST') {
        response = await axios.post(test.url, test.data, config);
      } else {
        response = await axios.get(test.url, config);
      }
      
      console.log(`✅ PASS: ${test.name}`);
      if (response.data) {
        const preview = JSON.stringify(response.data).substring(0, 100);
        console.log(`   Response: ${preview}...`);
      }
      
      // Store auth token if this was a login request
      if (test.name.includes('Login') && response.data.token) {
        authToken = response.data.token;
        console.log(`   🔑 Auth token obtained: ${authToken.substring(0, 20)}...`);
      }
      
      results.push({ ...test, status: 'PASS', error: null, responseTime: response.headers['response-time'] || 'N/A' });
    } catch (error) {
      console.log(`❌ FAIL: ${test.name}`);
      console.log(`   Error: ${error.message}`);
      console.log(`   Status: ${error.response?.status || 'Network Error'}`);
      
      results.push({ ...test, status: 'FAIL', error: error.message, statusCode: error.response?.status });
    }
  }

  // Now test authenticated endpoints if we have a token
  if (authToken) {
    console.log('\n🔐 Testing Authenticated Endpoints...');
    
    const authenticatedTests = [
      {
        name: 'Auth - Get Profile',
        url: `${baseURL}/api/auth/profile`,
        method: 'GET',
        category: 'auth-protected'
      },
      {
        name: 'Mobile - Submit SOS (with auth)',
        url: `${baseURL}/api/mobile/sos`,
        method: 'POST',
        category: 'auth-protected',
        data: {
          location: { lat: 6.9271, lng: 79.8612, address: 'Test Emergency Location' },
          description: 'Test emergency situation',
          priority: 'high',
          type: 'medical'
        }
      }
    ];

    for (const test of authenticatedTests) {
      try {
        console.log(`\n🧪 Testing: ${test.name}`);
        
        let response;
        const config = { headers: { Authorization: `Bearer ${authToken}` } };
        
        if (test.method === 'POST') {
          response = await axios.post(test.url, test.data, config);
        } else {
          response = await axios.get(test.url, config);
        }
        
        console.log(`✅ PASS: ${test.name}`);
        if (response.data) {
          const preview = JSON.stringify(response.data).substring(0, 100);
          console.log(`   Response: ${preview}...`);
        }
        
        results.push({ ...test, status: 'PASS', error: null });
      } catch (error) {
        console.log(`❌ FAIL: ${test.name}`);
        console.log(`   Error: ${error.message}`);
        
        results.push({ ...test, status: 'FAIL', error: error.message });
      }
    }
  }

  // Generate comprehensive report
  generateFullReport(results);
}

function generateFullReport(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE BACKEND API TEST REPORT');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;
  const successRate = ((passed / total) * 100).toFixed(1);

  console.log(`\n📊 Overall Results:`);
  console.log(`   Total Tests: ${total}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${successRate}%`);

  // Category breakdown
  const categories = ['health', 'auth', 'map', 'mobile', 'ndx', 'crud', 'auth-protected'];
  
  console.log(`\n🎯 Results by Category:`);
  categories.forEach(category => {
    const categoryTests = results.filter(r => r.category === category);
    if (categoryTests.length > 0) {
      const categoryPassed = categoryTests.filter(t => t.status === 'PASS').length;
      const categoryTotal = categoryTests.length;
      const categoryRate = ((categoryPassed / categoryTotal) * 100).toFixed(0);
      
      const icon = categoryRate >= 80 ? '✅' : categoryRate >= 50 ? '⚠️' : '❌';
      console.log(`   ${icon} ${category.toUpperCase()}: ${categoryPassed}/${categoryTotal} (${categoryRate}%)`);
    }
  });

  console.log(`\n✅ Working APIs:`);
  results.filter(r => r.status === 'PASS').forEach(test => {
    console.log(`   ✅ ${test.name}`);
  });

  if (failed > 0) {
    console.log(`\n❌ Failed APIs:`);
    results.filter(r => r.status === 'FAIL').forEach(test => {
      console.log(`   ❌ ${test.name}: ${test.error}`);
    });
  }

  console.log(`\n🔧 System Health Assessment:`);
  
  // Health check assessment
  const healthTests = results.filter(r => r.category === 'health');
  const healthRate = (healthTests.filter(t => t.status === 'PASS').length / healthTests.length) * 100;
  console.log(`   🏥 Core System Health: ${healthRate >= 100 ? '🟢 EXCELLENT' : healthRate >= 80 ? '🟡 GOOD' : '🔴 POOR'}`);
  
  // Database assessment
  const mapTests = results.filter(r => r.category === 'map');
  const dbRate = (mapTests.filter(t => t.status === 'PASS').length / mapTests.length) * 100;
  console.log(`   🗄️ Database Connectivity: ${dbRate >= 100 ? '🟢 EXCELLENT' : dbRate >= 80 ? '🟡 GOOD' : '🔴 POOR'}`);
  
  // Auth assessment
  const authTests = results.filter(r => r.category === 'auth');
  const authRate = authTests.length > 0 ? (authTests.filter(t => t.status === 'PASS').length / authTests.length) * 100 : 0;
  console.log(`   🔐 Authentication System: ${authRate >= 100 ? '🟢 EXCELLENT' : authRate >= 50 ? '🟡 PARTIAL' : '🔴 ISSUES'}`);

  console.log(`\n🎯 Final Assessment:`);
  if (successRate >= 90) {
    console.log(`   🎉 EXCELLENT: Backend is fully functional and ready for production!`);
  } else if (successRate >= 75) {
    console.log(`   ✅ GOOD: Backend is mostly functional with minor issues.`);
  } else if (successRate >= 60) {
    console.log(`   ⚠️ FAIR: Backend has some issues but core functionality works.`);
  } else {
    console.log(`   🚨 POOR: Backend has significant issues requiring immediate attention.`);
  }

  console.log(`\n📋 Next Steps:`);
  if (successRate >= 90) {
    console.log(`   • Continue with frontend integration`);
    console.log(`   • Run production readiness checks`);
    console.log(`   • Set up monitoring and logging`);
  } else {
    console.log(`   • Fix failing endpoints identified above`);
    console.log(`   • Re-run tests to verify fixes`);
    console.log(`   • Review error logs for detailed troubleshooting`);
  }

  console.log('\n' + '='.repeat(60));
}

// Run the comprehensive test
comprehensiveAPITest().catch(console.error);
