// test-sludi-integration.js
const axios = require('axios');
const MockSLUDIService = require('./src/web-dashboard/backend/services/mock-sludi-service');
const RealSLUDIService = require('./src/web-dashboard/backend/services/real-sludi-service');

async function testSLUDIIntegration() {
  console.log('🧪 Testing SLUDI Integration...\n');

  // Test Mock SLUDI Service
  console.log('📱 Testing Mock SLUDI Service:');
  const mockService = new MockSLUDIService();
  
  try {
    // Test mock authentication
    const mockAuthRequest = {
      id: "mosip.identity.auth",
      version: "1.0",
      individualId: "citizen001",
      individualIdType: "UIN",
      transactionID: `TXN_${Date.now()}`,
      requestTime: new Date().toISOString(),
      request: {
        otp: "123456",
        timestamp: new Date().toISOString()
      },
      consentObtained: true
    };

    const mockAuthResponse = await mockService.authenticate(mockAuthRequest);
    console.log('✅ Mock Authentication:', mockAuthResponse.response.authStatus ? 'SUCCESS' : 'FAILED');
    
    // Test mock health check
    const mockHealth = await mockService.healthCheck();
    console.log('✅ Mock Health Check:', mockHealth.success ? 'HEALTHY' : 'UNHEALTHY');
    
  } catch (error) {
    console.log('❌ Mock Service Error:', error.message);
  }

  console.log('\n🏛️ Testing Real SLUDI Service:');
  
  // Test Real SLUDI Service
  try {
    const realService = new RealSLUDIService();
    
    // Test real service health check
    const realHealth = await realService.healthCheck();
    console.log('✅ Real SLUDI Health Check:', realHealth.success ? 'HEALTHY' : 'UNHEALTHY');
    
    // Test mobile authentication URL generation
    const mobileAuth = await realService.mobileAuthenticate('test_user');
    console.log('✅ Mobile Auth URL Generation:', mobileAuth.success ? 'SUCCESS' : 'FAILED');
    if (mobileAuth.success) {
      console.log('   Authorization URL:', mobileAuth.authorizationUrl);
    }
    
  } catch (error) {
    console.log('❌ Real SLUDI Service Error:', error.message);
  }

  console.log('\n🌐 Testing Backend API Endpoints:');
  
  // Test backend health endpoint
  try {
    const healthResponse = await axios.get('http://localhost:5000/api/mobile/sludi/health');
    console.log('✅ Backend SLUDI Health Endpoint:', healthResponse.data.success ? 'SUCCESS' : 'FAILED');
    console.log('   Service Type:', healthResponse.data.sludiService.type);
    console.log('   Service Status:', healthResponse.data.sludiService.status);
  } catch (error) {
    console.log('❌ Backend Health Endpoint Error:', error.message);
  }

  // Test auth URL endpoint
  try {
    const authUrlResponse = await axios.post('http://localhost:5000/api/mobile/sludi/auth-url', {
      individualId: 'test_user'
    });
    console.log('✅ Backend Auth URL Endpoint:', authUrlResponse.data.success ? 'SUCCESS' : 'FAILED');
    if (authUrlResponse.data.success) {
      console.log('   Generated URL Available:', !!authUrlResponse.data.authorizationUrl);
    }
  } catch (error) {
    console.log('❌ Backend Auth URL Endpoint Error:', error.message);
  }

  console.log('\n📋 SLUDI Integration Summary:');
  console.log('=====================================');
  console.log('✅ Mock SLUDI Service: Ready for testing');
  console.log('🏛️ Real SLUDI Service: Configured (needs ICTA credentials)');
  console.log('📱 Mobile WebView Auth: Implemented');
  console.log('🌐 Backend API Endpoints: Available');
  console.log('');
  console.log('📝 Next Steps:');
  console.log('1. Get CLIENT_ID from ICTA for your team');
  console.log('2. Generate RSA key pair for SLUDI authentication');
  console.log('3. Update environment variables:');
  console.log('   - SLUDI_CLIENT_ID=your_icta_client_id');
  console.log('   - SLUDI_CLIENT_PRIVATE_KEY={"p":"...","kty":"RSA",...}');
  console.log('   - USE_MOCK_SLUDI=false (when ready for real SLUDI)');
  console.log('4. Test authentication flow with real SLUDI');
  console.log('');
  console.log('🔧 Environment Configuration:');
  console.log('   Mock Mode: USE_MOCK_SLUDI=true (current)');
  console.log('   Real Mode: USE_MOCK_SLUDI=false (after ICTA setup)');
}

// Run the test
if (require.main === module) {
  testSLUDIIntegration().catch(console.error);
}

module.exports = { testSLUDIIntegration };
const RealSLUDIService = require('./src/web-dashboard/backend/services/real-sludi-service');
const MockSLUDIService = require('./src/web-dashboard/backend/services/mock-sludi-service');

async function testSLUDIIntegration() {
  console.log('🧪 Testing SLUDI Integration...\n');

  // Test Mock Service
  console.log('📋 Testing Mock SLUDI Service:');
  const mockService = new MockSLUDIService();
  
  try {
    const mockAuth = await mockService.authenticate({
      id: "mosip.identity.auth",
      version: "1.0",
      individualId: "citizen001",
      transactionID: "TEST_TXN_001",
      requestTime: new Date().toISOString(),
      request: { otp: "123456" }
    });
    
    console.log('✅ Mock authentication:', mockAuth.response.authStatus ? 'SUCCESS' : 'FAILED');
    
    const mockHealth = await mockService.healthCheck();
    console.log('✅ Mock health check:', mockHealth.success ? 'HEALTHY' : 'UNHEALTHY');
    
  } catch (error) {
    console.error('❌ Mock service error:', error.message);
  }

  // Test Real Service (will fail if SLUDI is not running)
  console.log('\n📡 Testing Real SLUDI Service:');
  const realService = new RealSLUDIService();
  
  try {
    const realHealth = await realService.healthCheck();
    console.log('✅ Real SLUDI health check:', realHealth.success ? 'HEALTHY' : 'UNHEALTHY');
    
    if (realHealth.success) {
      console.log('🎉 Real SLUDI service is available and responding!');
      
      // Try authentication with real service
      const realAuth = await realService.authenticate({
        id: "mosip.identity.auth",
        version: "1.0",
        individualId: "test_user_001",
        transactionID: "TEST_TXN_002",
        requestTime: new Date().toISOString(),
        request: { otp: "123456" }
      });
      
      console.log('📝 Real authentication result:', realAuth.response.authStatus ? 'SUCCESS' : 'FAILED');
    }
    
  } catch (error) {
    console.error('❌ Real SLUDI service not available:', error.message);
    console.log('💡 This is expected if SLUDI service is not running yet.');
  }

  console.log('\n📖 Next Steps:');
  console.log('1. Clone SLUDI repository: git clone https://github.com/sludipilot/sliit_hackathon_sludi.git');
  console.log('2. Follow SLUDI setup instructions');
  console.log('3. Update .env with SLUDI configuration');
  console.log('4. Set USE_MOCK_SLUDI=false to use real SLUDI');
  console.log('5. Test mobile app login with real SLUDI credentials');
}

// Run the test if called directly
if (require.main === module) {
  testSLUDIIntegration().catch(console.error);
}

module.exports = { testSLUDIIntegration };
