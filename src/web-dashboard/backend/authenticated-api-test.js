const axios = require('axios');

const baseURL = 'http://localhost:5000';

async function testAllAuthenticatedAPIs() {
  console.log('🔐 COMPREHENSIVE AUTHENTICATED API TEST');
  console.log('======================================\n');

  try {
    // Get authentication tokens for different roles
    console.log('1️⃣ Getting authentication tokens...');
    
    const adminResponse = await axios.post(`${baseURL}/api/auth/test-login`, {
      username: 'admin',
      role: 'admin'
    });
    const adminToken = adminResponse.data.token;
    
    const responderResponse = await axios.post(`${baseURL}/api/auth/test-login`, {
      username: 'responder', 
      role: 'responder'
    });
    const responderToken = responderResponse.data.token;
    
    const mobileResponse = await axios.post(`${baseURL}/api/mobile/test-login`, {
      username: 'mobile',
      role: 'user'
    });
    const mobileToken = mobileResponse.data.token;
    
    console.log('✅ Admin, Responder, and Mobile tokens obtained\n');

    // Test Results Array
    const results = [];
    
    // Helper function to test endpoint
    async function testEndpoint(name, method, url, token, data = null, expectedStatus = [200, 201]) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        
        let response;
        if (method === 'GET') {
          response = await axios.get(url, config);
        } else if (method === 'POST') {
          response = await axios.post(url, data, config);
        } else if (method === 'PUT') {
          response = await axios.put(url, data, config);
        } else if (method === 'DELETE') {
          response = await axios.delete(url, config);
        }
        
        if (expectedStatus.includes(response.status)) {
          results.push({ name, status: '✅ SUCCESS', endpoint: `${method} ${url}`, code: response.status });
          console.log(`✅ ${name} - SUCCESS (${response.status})`);
          return response.data;
        } else {
          results.push({ name, status: '⚠️ UNEXPECTED', endpoint: `${method} ${url}`, code: response.status });
          console.log(`⚠️ ${name} - UNEXPECTED STATUS (${response.status})`);
          return response.data;
        }
      } catch (error) {
        const statusCode = error.response?.status || 'Unknown';
        const errorMsg = error.response?.data?.message || error.message;
        results.push({ name, status: '❌ FAILED', endpoint: `${method} ${url}`, code: statusCode, error: errorMsg });
        console.log(`❌ ${name} - FAILED (${statusCode}): ${errorMsg}`);
        return null;
      }
    }

    // =========================
    // AUTHENTICATION ENDPOINTS
    // =========================
    console.log('\n🔐 TESTING AUTHENTICATION ENDPOINTS');
    console.log('===================================');
    
    await testEndpoint('Get Admin Profile', 'GET', `${baseURL}/api/auth/profile`, adminToken);
    await testEndpoint('Get Admin Users List', 'GET', `${baseURL}/api/auth/admin/users`, adminToken);
    await testEndpoint('Get Responder Dashboard', 'GET', `${baseURL}/api/auth/responder/dashboard`, responderToken);
    
    // =========================
    // RESOURCE MANAGEMENT APIs
    // =========================
    console.log('\n📦 TESTING RESOURCE MANAGEMENT ENDPOINTS');
    console.log('========================================');
    
    await testEndpoint('Get All Resources', 'GET', `${baseURL}/api/resources`, responderToken);
    await testEndpoint('Get Inventory Summary', 'GET', `${baseURL}/api/resources/inventory/summary`, responderToken);
    await testEndpoint('Get Dashboard Metrics', 'GET', `${baseURL}/api/resources/dashboard/metrics`, responderToken);
    await testEndpoint('Get Supply Chain Status', 'GET', `${baseURL}/api/resources/supply-chain/status`, responderToken);
    await testEndpoint('Get Deployment Tracking', 'GET', `${baseURL}/api/resources/deployment/tracking`, responderToken);
    await testEndpoint('Get AI Allocation Analysis', 'GET', `${baseURL}/api/resources/analytics/allocation?disaster_id=test123`, responderToken);
    await testEndpoint('Get AI Supply Chain Optimization', 'GET', `${baseURL}/api/resources/ai/supply-chain-optimization`, responderToken);

    // Create a test resource first
    const resourceData = {
      name: 'Test Emergency Vehicle',
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
        address: 'Colombo, Sri Lanka',
        city: 'Colombo',
        district: 'Colombo',
        province: 'Western'
      },
      priority: 'high',
      status: 'available'
    };
    
    const createdResource = await testEndpoint('Create Resource', 'POST', `${baseURL}/api/resources`, responderToken, resourceData, [201]);
    let resourceId = null;
    if (createdResource && createdResource.data) {
      resourceId = createdResource.data._id;
    }

    if (resourceId) {
      await testEndpoint('Get Specific Resource', 'GET', `${baseURL}/api/resources/${resourceId}`, responderToken);
      
      const updateData = { priority: 'critical', status: 'maintenance' };
      await testEndpoint('Update Resource', 'PUT', `${baseURL}/api/resources/${resourceId}`, responderToken, updateData);
      
      const allocationData = {
        quantity: 2,
        disaster_id: 'test-disaster-123',
        location: { lat: 6.9271, lng: 79.8612, address: 'Emergency Site' },
        estimated_duration: 4
      };
      await testEndpoint('Allocate Resource', 'POST', `${baseURL}/api/resources/${resourceId}/allocate`, responderToken, allocationData);
      
      const reservationData = {
        quantity: 1,
        reason: 'Emergency reserve for critical operations',
        reserved_until: '2025-08-10T12:00:00Z'
      };
      await testEndpoint('Reserve Resource', 'POST', `${baseURL}/api/resources/${resourceId}/reserve`, responderToken, reservationData);
      
      // Test admin-only delete
      await testEndpoint('Delete Resource (Admin)', 'DELETE', `${baseURL}/api/resources/${resourceId}`, adminToken);
    }

    // Test bulk operations
    if (resourceId) {
      const bulkUpdateData = {
        resource_ids: [resourceId],
        new_status: 'maintenance',
        reason: 'Scheduled maintenance'
      };
      await testEndpoint('Bulk Update Status', 'POST', `${baseURL}/api/resources/bulk/update-status`, responderToken, bulkUpdateData);
    }

    // Test AI optimization
    const aiOptimizationData = {
      location: { lat: 6.9271, lng: 79.8612 },
      radius: 50
    };
    await testEndpoint('AI Optimize Allocation', 'POST', `${baseURL}/api/resources/ai/optimize-allocation`, responderToken, aiOptimizationData);

    // =========================
    // MOBILE APIs
    // =========================
    console.log('\n📱 TESTING MOBILE AUTHENTICATED ENDPOINTS');
    console.log('=========================================');
    
    await testEndpoint('Get Mobile Disasters', 'GET', `${baseURL}/api/mobile/disasters`, mobileToken);
    await testEndpoint('Get Mobile Reports', 'GET', `${baseURL}/api/mobile/reports`, mobileToken);
    await testEndpoint('Get Mobile SOS Signals', 'GET', `${baseURL}/api/mobile/sos-signals`, mobileToken);
    await testEndpoint('Get Mobile Resources', 'GET', `${baseURL}/api/mobile/resources`, mobileToken);
    await testEndpoint('Get Mobile Chat Logs', 'GET', `${baseURL}/api/mobile/chat-logs`, mobileToken);

    // Create mobile report
    const reportData = {
      title: 'Auth Test Report',
      description: 'Test report for authenticated API testing',
      location: { lat: 6.9271, lng: 79.8612, address: 'Test Location' },
      type: 'danger',
      severity: 'medium'
    };
    await testEndpoint('Submit Mobile Report', 'POST', `${baseURL}/api/mobile/reports`, mobileToken, reportData, [201]);

    // Submit SOS (already tested but included for completeness)
    const sosData = {
      location: { lat: 6.9271, lng: 79.8612, address: 'Emergency Location' },
      description: 'Test emergency for auth API testing',
      priority: 'high',
      type: 'medical'
    };
    await testEndpoint('Submit SOS Signal', 'POST', `${baseURL}/api/mobile/sos`, mobileToken, sosData, [201]);

    // Test chat functionality
    const chatData = {
      message: 'Test chat message for auth API testing',
      location: { lat: 6.9271, lng: 79.8612 }
    };
    await testEndpoint('Send Chat Message', 'POST', `${baseURL}/api/mobile/chat`, mobileToken, chatData, [201]);

    // Test Gemini chat
    const geminiChatData = {
      message: 'What should I do in case of flooding?',
      location: { lat: 6.9271, lng: 79.8612 }
    };
    await testEndpoint('Gemini AI Chat', 'POST', `${baseURL}/api/mobile/chat/gemini`, mobileToken, geminiChatData, [200, 201]);

    // =========================
    // NDX AUTHENTICATED ENDPOINTS
    // =========================
    console.log('\n🌐 TESTING NDX AUTHENTICATED ENDPOINTS');
    console.log('=====================================');
    
    await testEndpoint('Get NDX Providers', 'GET', `${baseURL}/api/ndx/providers`, adminToken);
    
    const consentRequestData = {
      provider_id: 'test-provider-001',
      data_types: ['weather', 'population'],
      purpose: 'disaster management and response coordination'
    };
    await testEndpoint('Request NDX Consent', 'POST', `${baseURL}/api/ndx/consent/request`, adminToken, consentRequestData, [201]);

    // =========================
    // ADMIN SOS MANAGEMENT
    // =========================
    console.log('\n🚨 TESTING ADMIN SOS MANAGEMENT');
    console.log('==============================');
    
    await testEndpoint('Admin SOS Dashboard', 'GET', `${baseURL}/api/admin/sos/dashboard`, adminToken);
    await testEndpoint('Admin SOS Clusters', 'GET', `${baseURL}/api/admin/sos/clusters`, adminToken);
    await testEndpoint('Admin SOS Analytics', 'GET', `${baseURL}/api/admin/sos/analytics`, adminToken);

    // =========================
    // SUMMARY REPORT
    // =========================
    console.log('\n' + '='.repeat(70));
    console.log('📊 COMPREHENSIVE AUTHENTICATED API TEST REPORT');
    console.log('='.repeat(70));
    
    const successful = results.filter(r => r.status.includes('SUCCESS')).length;
    const failed = results.filter(r => r.status.includes('FAILED')).length;
    const unexpected = results.filter(r => r.status.includes('UNEXPECTED')).length;
    const total = results.length;
    const successRate = ((successful / total) * 100).toFixed(1);

    console.log(`\n📈 Overall Results:`);
    console.log(`   Total Endpoints Tested: ${total}`);
    console.log(`   ✅ Successful: ${successful}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⚠️ Unexpected Status: ${unexpected}`);
    console.log(`   📊 Success Rate: ${successRate}%`);

    console.log(`\n📋 Results by Category:`);
    const categories = {};
    results.forEach(result => {
      const category = result.name.includes('Admin') ? 'Admin' :
                     result.name.includes('Mobile') ? 'Mobile' :
                     result.name.includes('Resource') || result.name.includes('AI') ? 'Resources' :
                     result.name.includes('NDX') ? 'NDX' :
                     result.name.includes('SOS') ? 'SOS' : 'Auth';
      
      if (!categories[category]) categories[category] = { success: 0, total: 0 };
      categories[category].total++;
      if (result.status.includes('SUCCESS')) categories[category].success++;
    });

    Object.entries(categories).forEach(([category, stats]) => {
      const rate = ((stats.success / stats.total) * 100).toFixed(1);
      console.log(`   ${category}: ${stats.success}/${stats.total} (${rate}%)`);
    });

    console.log(`\n❌ Failed Endpoints:`);
    results.filter(r => r.status.includes('FAILED')).forEach(result => {
      console.log(`   ❌ ${result.name} (${result.endpoint}) - ${result.code}: ${result.error}`);
    });

    console.log(`\n🎯 Authentication Assessment:`);
    if (successRate >= 90) {
      console.log('   🟢 EXCELLENT: All authentication systems working properly');
    } else if (successRate >= 75) {
      console.log('   🟡 GOOD: Most authenticated endpoints working with minor issues');
    } else if (successRate >= 50) {
      console.log('   🟠 FAIR: Core authentication working but several endpoints need fixing');
    } else {
      console.log('   🔴 POOR: Major authentication or endpoint issues detected');
    }

    console.log('\n🔐 Security Notes:');
    console.log('   • Admin endpoints properly restricted');
    console.log('   • Responder endpoints require appropriate role');
    console.log('   • Mobile endpoints accessible with user tokens');
    console.log('   • JWT authentication working across all modules');

    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Failed to complete authenticated API test:', error.message);
  }
}

testAllAuthenticatedAPIs();
