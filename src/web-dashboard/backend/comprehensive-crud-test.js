const axios = require('axios');

const baseURL = 'http://localhost:5000';

async function testAllCrudOperations() {
  console.log('🔍 COMPREHENSIVE CRUD OPERATIONS TEST');
  console.log('=====================================\n');

  try {
    // Get auth tokens for different roles
    console.log('1️⃣ Getting authentication tokens...');
    const adminResponse = await axios.post(`${baseURL}/api/auth/test-login`, {
      username: 'admin',
      role: 'admin'
    });
    const adminToken = adminResponse.data.token;
    
    const mobileResponse = await axios.post(`${baseURL}/api/mobile/test-login`, {
      username: 'mobile',
      role: 'user'
    });
    const mobileToken = mobileResponse.data.token;
    
    console.log('✅ Admin and Mobile tokens obtained\n');

    // Test Results Array
    const results = [];
    
    // =========================
    // TEST CRUD - DISASTERS
    // =========================
    console.log('📋 TESTING DISASTER CRUD OPERATIONS');
    console.log('===================================');
    
    let createdDisasterId = null;
    
    // CREATE Disaster
    try {
      const createResponse = await axios.post(`${baseURL}/api/test/test-create`, {
        title: 'CRUD Test Disaster',
        type: 'flood',
        severity: 'high',
        description: 'Comprehensive CRUD test disaster',
        location: { lat: 7.2906, lng: 80.6337, address: 'Kandy, Sri Lanka' },
        priority_level: 'high',
        public_alert: true,
        evacuation_required: true
      });
      createdDisasterId = createResponse.data.data._id;
      results.push({ operation: 'CREATE Disaster', status: '✅ SUCCESS', endpoint: 'POST /api/test/test-create' });
      console.log('✅ CREATE Disaster - SUCCESS');
    } catch (error) {
      results.push({ operation: 'CREATE Disaster', status: '❌ FAILED', endpoint: 'POST /api/test/test-create', error: error.message });
      console.log('❌ CREATE Disaster - FAILED');
    }

    // READ All Disasters
    try {
      await axios.get(`${baseURL}/api/test/test-read`);
      results.push({ operation: 'READ All Disasters', status: '✅ SUCCESS', endpoint: 'GET /api/test/test-read' });
      console.log('✅ READ All Disasters - SUCCESS');
    } catch (error) {
      results.push({ operation: 'READ All Disasters', status: '❌ FAILED', endpoint: 'GET /api/test/test-read', error: error.message });
      console.log('❌ READ All Disasters - FAILED');
    }

    // READ Single Disaster
    if (createdDisasterId) {
      try {
        await axios.get(`${baseURL}/api/test/test-get-one/${createdDisasterId}`);
        results.push({ operation: 'READ Single Disaster', status: '✅ SUCCESS', endpoint: 'GET /api/test/test-get-one/:id' });
        console.log('✅ READ Single Disaster - SUCCESS');
      } catch (error) {
        results.push({ operation: 'READ Single Disaster', status: '❌ FAILED', endpoint: 'GET /api/test/test-get-one/:id', error: error.message });
        console.log('❌ READ Single Disaster - FAILED');
      }

      // UPDATE Disaster
      try {
        await axios.put(`${baseURL}/api/test/test-update/${createdDisasterId}`, {
          severity: 'critical',
          description: 'Updated CRUD test disaster - now critical'
        });
        results.push({ operation: 'UPDATE Disaster', status: '✅ SUCCESS', endpoint: 'PUT /api/test/test-update/:id' });
        console.log('✅ UPDATE Disaster - SUCCESS');
      } catch (error) {
        results.push({ operation: 'UPDATE Disaster', status: '❌ FAILED', endpoint: 'PUT /api/test/test-update/:id', error: error.message });
        console.log('❌ UPDATE Disaster - FAILED');
      }

      // DELETE (Archive) Disaster
      try {
        await axios.delete(`${baseURL}/api/test/test-delete/${createdDisasterId}`);
        results.push({ operation: 'DELETE (Archive) Disaster', status: '✅ SUCCESS', endpoint: 'DELETE /api/test/test-delete/:id' });
        console.log('✅ DELETE (Archive) Disaster - SUCCESS');
      } catch (error) {
        results.push({ operation: 'DELETE (Archive) Disaster', status: '❌ FAILED', endpoint: 'DELETE /api/test/test-delete/:id', error: error.message });
        console.log('❌ DELETE (Archive) Disaster - FAILED');
      }
    }

    console.log('\n📱 TESTING MOBILE CRUD OPERATIONS');
    console.log('=================================');

    // CREATE SOS Signal
    try {
      await axios.post(`${baseURL}/api/mobile/sos`, {
        location: { lat: 6.9271, lng: 79.8612, address: 'Emergency Location' },
        description: 'CRUD Test Emergency',
        priority: 'critical',
        type: 'medical'
      }, {
        headers: { Authorization: `Bearer ${mobileToken}` }
      });
      results.push({ operation: 'CREATE SOS Signal', status: '✅ SUCCESS', endpoint: 'POST /api/mobile/sos' });
      console.log('✅ CREATE SOS Signal - SUCCESS');
    } catch (error) {
      results.push({ operation: 'CREATE SOS Signal', status: '❌ FAILED', endpoint: 'POST /api/mobile/sos', error: error.message });
      console.log('❌ CREATE SOS Signal - FAILED');
    }

    // READ SOS Signals
    try {
      await axios.get(`${baseURL}/api/mobile/sos-signals`, {
        headers: { Authorization: `Bearer ${mobileToken}` }
      });
      results.push({ operation: 'READ SOS Signals', status: '✅ SUCCESS', endpoint: 'GET /api/mobile/sos-signals' });
      console.log('✅ READ SOS Signals - SUCCESS');
    } catch (error) {
      results.push({ operation: 'READ SOS Signals', status: '❌ FAILED', endpoint: 'GET /api/mobile/sos-signals', error: error.message });
      console.log('❌ READ SOS Signals - FAILED');
    }

    // CREATE Report
    try {
      await axios.post(`${baseURL}/api/mobile/reports`, {
        title: 'CRUD Test Report',
        description: 'Test report for CRUD operations',
        location: { lat: 6.9271, lng: 79.8612, address: 'Test Location' },
        type: 'infrastructure_damage',
        severity: 'medium'
      }, {
        headers: { Authorization: `Bearer ${mobileToken}` }
      });
      results.push({ operation: 'CREATE Report', status: '✅ SUCCESS', endpoint: 'POST /api/mobile/reports' });
      console.log('✅ CREATE Report - SUCCESS');
    } catch (error) {
      results.push({ operation: 'CREATE Report', status: '❌ FAILED', endpoint: 'POST /api/mobile/reports', error: error.message });
      console.log('❌ CREATE Report - FAILED');
    }

    // READ Reports
    try {
      await axios.get(`${baseURL}/api/mobile/reports`, {
        headers: { Authorization: `Bearer ${mobileToken}` }
      });
      results.push({ operation: 'READ Reports', status: '✅ SUCCESS', endpoint: 'GET /api/mobile/reports' });
      console.log('✅ READ Reports - SUCCESS');
    } catch (error) {
      results.push({ operation: 'READ Reports', status: '❌ FAILED', endpoint: 'GET /api/mobile/reports', error: error.message });
      console.log('❌ READ Reports - FAILED');
    }

    console.log('\n🔐 TESTING ADMIN CRUD OPERATIONS');
    console.log('================================');

    // Admin CRUD would typically require admin authentication
    // These endpoints exist but require proper admin tokens

    try {
      await axios.get(`${baseURL}/api/admin/sos/dashboard`);
      results.push({ operation: 'READ Admin SOS Dashboard', status: '✅ SUCCESS', endpoint: 'GET /api/admin/sos/dashboard' });
      console.log('✅ READ Admin SOS Dashboard - SUCCESS');
    } catch (error) {
      results.push({ operation: 'READ Admin SOS Dashboard', status: '❌ FAILED', endpoint: 'GET /api/admin/sos/dashboard', error: error.message });
      console.log('❌ READ Admin SOS Dashboard - FAILED');
    }

    try {
      await axios.get(`${baseURL}/api/admin/sos/analytics`);
      results.push({ operation: 'READ Admin Analytics', status: '✅ SUCCESS', endpoint: 'GET /api/admin/sos/analytics' });
      console.log('✅ READ Admin Analytics - SUCCESS');
    } catch (error) {
      results.push({ operation: 'READ Admin Analytics', status: '❌ FAILED', endpoint: 'GET /api/admin/sos/analytics', error: error.message });
      console.log('❌ READ Admin Analytics - FAILED');
    }

    // =========================
    // SUMMARY REPORT
    // =========================
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE CRUD OPERATIONS REPORT');
    console.log('='.repeat(60));
    
    const successful = results.filter(r => r.status.includes('SUCCESS')).length;
    const failed = results.filter(r => r.status.includes('FAILED')).length;
    const total = results.length;
    const successRate = ((successful / total) * 100).toFixed(1);

    console.log(`\n📈 Overall Results:`);
    console.log(`   Total Operations: ${total}`);
    console.log(`   ✅ Successful: ${successful}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📊 Success Rate: ${successRate}%`);

    console.log(`\n📋 Detailed Results:`);
    results.forEach(result => {
      console.log(`   ${result.status} ${result.operation} (${result.endpoint})`);
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
    });

    console.log(`\n🎯 CRUD Operations Assessment:`);
    if (successRate >= 90) {
      console.log('   🟢 EXCELLENT: All major CRUD operations are functional');
    } else if (successRate >= 75) {
      console.log('   🟡 GOOD: Most CRUD operations working with minor issues');
    } else if (successRate >= 50) {
      console.log('   🟠 FAIR: Core CRUD working but several issues need fixing');
    } else {
      console.log('   🔴 POOR: Major CRUD functionality issues detected');
    }

    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Failed to complete CRUD operations test:', error.message);
  }
}

testAllCrudOperations();
