const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Use the working SLUDI authentication
const SLUDI_CREDENTIALS = {
  individualId: 'admin001',
  otp: '123456'
};

class AdminEndpointsTest {
  constructor() {
    this.adminToken = null;
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      results: []
    };
  }

  async setup() {
    console.log('🔐 Getting admin authentication token...');
    try {
      // Use the working test auth endpoint
      const response = await axios.post(`${BASE_URL}/api/auth/test-login`, {
        username: 'admin',
        role: 'admin'
      });
      this.adminToken = response.data.token;
      console.log('✅ Admin token obtained');
    } catch (error) {
      console.error('❌ Failed to get admin token:', error.message);
      process.exit(1);
    }
  }

  getAdminHeaders() {
    return { 'Authorization': `Bearer ${this.adminToken}` };
  }

  async test(name, testFn) {
    this.stats.total++;
    process.stdout.write(`🧪 Testing: ${name} ... `);
    
    try {
      const response = await testFn();
      console.log(`✅ PASS (${response.status})`);
      this.stats.passed++;
      this.stats.results.push({ name, status: 'PASS', statusCode: response.status });
    } catch (error) {
      console.log(`❌ FAIL (${error.response?.status || 'ERROR'}): ${error.message}`);
      this.stats.failed++;
      this.stats.results.push({ 
        name, 
        status: 'FAIL', 
        statusCode: error.response?.status || 'ERROR',
        error: error.message 
      });
    }
  }

  async runTests() {
    console.log('🏥 TESTING FIXED ADMIN ENDPOINTS');
    console.log('================================');

    const adminHeaders = this.getAdminHeaders();

    // Test Admin Disasters Routes (Fixed)
    console.log('\n🔥 Testing Admin Disasters...');
    await this.test('Get Active Disasters', async () => {
      return await axios.get(`${BASE_URL}/api/admin/disasters/active`, { headers: adminHeaders });
    });

    await this.test('Get Disaster Analytics', async () => {
      return await axios.get(`${BASE_URL}/api/admin/disasters/analytics`, { headers: adminHeaders });
    });

    await this.test('Get Disaster Timeline', async () => {
      return await axios.get(`${BASE_URL}/api/admin/disasters/timeline`, { headers: adminHeaders });
    });

    // Test Admin SOS Routes (Fixed)
    console.log('\n🆘 Testing Admin SOS...');
    await this.test('Get All SOS Signals', async () => {
      return await axios.get(`${BASE_URL}/api/admin/sos`, { headers: adminHeaders });
    });

    await this.test('Get SOS Dashboard', async () => {
      return await axios.get(`${BASE_URL}/api/admin/sos/dashboard`, { headers: adminHeaders });
    });

    await this.test('Get SOS Clusters', async () => {
      return await axios.get(`${BASE_URL}/api/admin/sos/clusters`, { headers: adminHeaders });
    });

    await this.test('Get SOS Analytics', async () => {
      return await axios.get(`${BASE_URL}/api/admin/sos/analytics`, { headers: adminHeaders });
    });

    // Test Admin Analytics Routes (Fixed)
    console.log('\n📊 Testing Admin Analytics...');
    await this.test('Get Analytics Statistics', async () => {
      return await axios.get(`${BASE_URL}/api/admin/analytics/statistics`, { headers: adminHeaders });
    });

    await this.test('Get Analytics Reports', async () => {
      return await axios.get(`${BASE_URL}/api/admin/analytics/reports`, { headers: adminHeaders });
    });

    await this.test('Get Analytics Heatmap', async () => {
      return await axios.get(`${BASE_URL}/api/admin/analytics/heatmap`, { headers: adminHeaders });
    });

    await this.test('Get Analytics Dashboard', async () => {
      return await axios.get(`${BASE_URL}/api/admin/analytics/dashboard`, { headers: adminHeaders });
    });

    await this.test('Get Analytics Predictions', async () => {
      return await axios.get(`${BASE_URL}/api/admin/analytics/predictions`, { headers: adminHeaders });
    });

    // Test Admin Zones Routes (Fixed)
    console.log('\n🏘️ Testing Admin Zones...');
    await this.test('Get Safe Zones', async () => {
      return await axios.get(`${BASE_URL}/api/admin/zones/safe-zones`, { headers: adminHeaders });
    });

    await this.test('Create Safe Zone', async () => {
      return await axios.post(`${BASE_URL}/api/admin/zones/safe-zones`, {
        name: 'Test Safe Zone',
        location: {
          lat: 6.9271,
          lng: 79.8612,
          address: 'Test Location'
        },
        capacity: 100,
        facilities: ['shelter', 'water'],
        status: 'active'
      }, { headers: adminHeaders });
    });

    // Test Admin Import/Export Routes
    console.log('\n📤 Testing Admin Import/Export...');
    await this.test('Export Disasters', async () => {
      return await axios.get(`${BASE_URL}/api/admin/import-export/export?type=disasters`, { headers: adminHeaders });
    });

    await this.test('Get Import Template', async () => {
      return await axios.get(`${BASE_URL}/api/admin/import-export/template`, { headers: adminHeaders });
    });

    // Test Map Routes (Fixed)
    console.log('\n🗺️ Testing Map Routes...');
    await this.test('Map SOS Signals', async () => {
      return await axios.get(`${BASE_URL}/api/map/sos`);
    });

    await this.test('Map Safe Zones', async () => {
      return await axios.get(`${BASE_URL}/api/map/safe-zones`);
    });

    await this.test('Map Resources', async () => {
      return await axios.get(`${BASE_URL}/api/map/resources`);
    });
  }

  printReport() {
    console.log('\n==================================================');
    console.log('📊 ADMIN ENDPOINTS TEST REPORT');
    console.log('==================================================');
    console.log(`⏱️ Total Tests: ${this.stats.total}`);
    console.log(`✅ Passed: ${this.stats.passed}`);
    console.log(`❌ Failed: ${this.stats.failed}`);
    console.log(`📈 Success Rate: ${((this.stats.passed / this.stats.total) * 100).toFixed(1)}%`);

    if (this.stats.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.stats.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   • ${r.name}: ${r.error}`));
    }

    console.log('\n✅ Passed Tests:');
    this.stats.results
      .filter(r => r.status === 'PASS')
      .forEach(r => console.log(`   • ${r.name} (${r.statusCode})`));

    console.log('\n🎯 Category Summary:');
    const categories = {
      'Disasters': this.stats.results.filter(r => r.name.includes('Disaster')),
      'SOS': this.stats.results.filter(r => r.name.includes('SOS')),
      'Analytics': this.stats.results.filter(r => r.name.includes('Analytics')),
      'Zones': this.stats.results.filter(r => r.name.includes('Zone')),
      'Import/Export': this.stats.results.filter(r => r.name.includes('Export') || r.name.includes('Template')),
      'Map': this.stats.results.filter(r => r.name.includes('Map'))
    };

    Object.entries(categories).forEach(([category, tests]) => {
      const passed = tests.filter(t => t.status === 'PASS').length;
      const total = tests.length;
      const percentage = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
      console.log(`   ${category}: ${passed}/${total} (${percentage}%)`);
    });

    console.log('==================================================');
  }
}

async function main() {
  const tester = new AdminEndpointsTest();
  await tester.setup();
  await tester.runTests();
  tester.printReport();
}

main().catch(console.error);
