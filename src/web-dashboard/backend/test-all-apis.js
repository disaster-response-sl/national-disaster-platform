const axios = require('axios');

async function testAllAPIs() {
  const baseURL = 'http://localhost:5000/api';
  
  try {
    console.log('🔐 Getting authentication tokens...');
    const authResponse = await axios.post(baseURL + '/auth/login', {
      individualId: 'admin001',
      otp: '123456'
    });
    const adminToken = authResponse.data.token;
    
    const headers = { Authorization: `Bearer ${adminToken}` };
    
    console.log('\n📊 TESTING ALL API CATEGORIES');
    console.log('================================');
    
    const tests = [
      // Resource Management APIs (comprehensive)
      { category: 'Resources', name: 'Get All Resources', url: '/resources', method: 'GET' },
      { category: 'Resources', name: 'Get Inventory Summary', url: '/resources/inventory/summary', method: 'GET' },
      { category: 'Resources', name: 'Get Dashboard Metrics', url: '/resources/dashboard/metrics', method: 'GET' },
      { category: 'Resources', name: 'Get Supply Chain Status', url: '/resources/supply-chain/status', method: 'GET' },
      { category: 'Resources', name: 'Get Deployment Tracking', url: '/resources/deployment/tracking', method: 'GET' },
      { category: 'Resources', name: 'Get AI Allocation Analysis', url: '/resources/analytics/allocation?disaster_id=test-123', method: 'GET' },
      { category: 'Resources', name: 'Get AI Supply Chain Optimization', url: '/resources/ai/supply-chain-optimization', method: 'GET' },
      
      // Admin SOS APIs
      { category: 'SOS', name: 'Admin SOS Dashboard', url: '/admin/sos/dashboard', method: 'GET' },
      { category: 'SOS', name: 'Admin SOS Clusters', url: '/admin/sos/clusters', method: 'GET' },
      { category: 'SOS', name: 'Admin SOS Analytics', url: '/admin/sos/analytics', method: 'GET' },
      { category: 'SOS', name: 'Get All SOS Signals', url: '/admin/sos', method: 'GET' },
      
      // Admin Disaster Management APIs
      { category: 'Disasters', name: 'Get All Disasters', url: '/admin/disasters', method: 'GET' },
      { category: 'Disasters', name: 'Get Active Disasters', url: '/admin/disasters/active', method: 'GET' },
      { category: 'Disasters', name: 'Get Disaster Analytics', url: '/admin/disasters/analytics', method: 'GET' },
      { category: 'Disasters', name: 'Get Disaster Timeline', url: '/admin/disasters/timeline', method: 'GET' },
      
      // Admin Analytics APIs (reports/heatmap)
      { category: 'Analytics', name: 'Get Reports Analytics', url: '/admin/analytics/reports', method: 'GET' },
      { category: 'Analytics', name: 'Get Report Heatmap', url: '/admin/analytics/heatmap', method: 'GET' },
      { category: 'Analytics', name: 'Get Dashboard Overview', url: '/admin/analytics/dashboard', method: 'GET' },
      { category: 'Analytics', name: 'Get Prediction Models', url: '/admin/analytics/predictions', method: 'GET' },
      
      // Admin Zones APIs
      { category: 'Zones', name: 'Get Risk Zones', url: '/admin/zones/risk', method: 'GET' },
      { category: 'Zones', name: 'Get Zone Analytics', url: '/admin/zones/analytics', method: 'GET' },
      
      // Map/Location APIs
      { category: 'Maps', name: 'Get Map Data', url: '/map/data', method: 'GET' },
      { category: 'Maps', name: 'Get Heatmap Data', url: '/map/heatmap', method: 'GET' },
      
      // Mobile APIs
      { category: 'Mobile', name: 'Get Mobile Disasters', url: '/mobile/disasters', method: 'GET' },
      { category: 'Mobile', name: 'Get Mobile Reports', url: '/mobile/reports', method: 'GET' },
      { category: 'Mobile', name: 'Get Mobile Resources', url: '/mobile/resources', method: 'GET' },
      
      // NDX APIs
      { category: 'NDX', name: 'Get NDX Providers', url: '/ndx/providers', method: 'GET' },
    ];
    
    const results = { success: 0, failed: 0, byCategory: {} };
    
    for (const test of tests) {
      try {
        const response = await axios({ 
          method: test.method, 
          url: baseURL + test.url, 
          headers,
          timeout: 5000
        });
        
        console.log(`✅ ${test.category}: ${test.name} - SUCCESS (${response.status})`);
        results.success++;
        
        if (!results.byCategory[test.category]) {
          results.byCategory[test.category] = { success: 0, failed: 0 };
        }
        results.byCategory[test.category].success++;
        
      } catch (error) {
        const status = error.response?.status || 'ERROR';
        const message = error.response?.data?.message || error.message;
        console.log(`❌ ${test.category}: ${test.name} - FAILED (${status}): ${message}`);
        results.failed++;
        
        if (!results.byCategory[test.category]) {
          results.byCategory[test.category] = { success: 0, failed: 0 };
        }
        results.byCategory[test.category].failed++;
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 COMPREHENSIVE API TEST REPORT');
    console.log('==================================');
    console.log(`📈 Overall Results:`);
    console.log(`   Total APIs Tested: ${results.success + results.failed}`);
    console.log(`   ✅ Successful: ${results.success}`);
    console.log(`   ❌ Failed: ${results.failed}`);
    console.log(`   📊 Success Rate: ${((results.success / (results.success + results.failed)) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Results by Category:');
    Object.entries(results.byCategory).forEach(([category, stats]) => {
      const total = stats.success + stats.failed;
      const rate = ((stats.success / total) * 100).toFixed(1);
      console.log(`   ${category}: ${stats.success}/${total} (${rate}%)`);
    });
    
  } catch (error) {
    console.error('❌ Failed to get authentication token:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

testAllAPIs().catch(console.error);
