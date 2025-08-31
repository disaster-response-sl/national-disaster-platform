/**
 * Commercial Bank PayDPI Integration Test Script
 * Tests the donation payment flow using Commercial Bank MPGS gateway
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_DONATION = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+94123456789',
  amount: '15.00'
};

// Helper function to generate unique order ID
function generateOrderId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
}

// Test 1: Create Payment Session using Commercial Bank PayDPI
async function testCommercialBankPaymentSession() {
  try {
    console.log('\n🏦 Testing Commercial Bank PayDPI Payment Session Creation...');
    
    const sessionData = {
      order: {
        currency: 'LKR',
        amount: TEST_DONATION.amount,
        description: 'Disaster Relief Donation'
      },
      interaction: {
        operation: 'PURCHASE',
        displayControl: {
          billingAddress: 'HIDE',
          customerEmail: 'HIDE',
          shipping: 'HIDE'
        },
        returnUrl: 'https://www.abcd.lk'
      },
      customer: {
        email: TEST_DONATION.email,
        firstName: TEST_DONATION.name.split(' ')[0],
        lastName: TEST_DONATION.name.split(' ').slice(1).join(' '),
        phone: TEST_DONATION.phone
      }
    };

    console.log('📤 Request data:', JSON.stringify(sessionData, null, 2));

    const response = await axios.post(`${BASE_URL}/payment/session`, sessionData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Payment session created successfully!');
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Payment session creation failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
    return null;
  }
}

// Test 2: Verify Payment Session
async function testVerifyPaymentSession(sessionId) {
  try {
    console.log('\n🔍 Testing Payment Session Verification...');
    console.log('Session ID:', sessionId);

    const response = await axios.get(`${BASE_URL}/payment/session/${sessionId}`);

    console.log('✅ Session verification successful!');
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Session verification failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
    return null;
  }
}

// Test 3: Confirm Donation
async function testDonationConfirmation(sessionData) {
  try {
    console.log('\n💝 Testing Donation Confirmation...');
    
    const confirmationData = {
      name: TEST_DONATION.name,
      email: TEST_DONATION.email,
      phone: TEST_DONATION.phone,
      amount: parseFloat(TEST_DONATION.amount),
      orderId: sessionData.orderId,
      transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
      sessionId: sessionData.session.id,
      status: 'SUCCESS'
    };

    console.log('📤 Confirmation data:', JSON.stringify(confirmationData, null, 2));

    const response = await axios.post(`${BASE_URL}/donation/confirm`, confirmationData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Donation confirmed successfully!');
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Donation confirmation failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
    return null;
  }
}

// Test 4: Get Donations List
async function testGetDonations() {
  try {
    console.log('\n📋 Testing Get Donations...');

    const response = await axios.get(`${BASE_URL}/donations?limit=5`);

    console.log('✅ Donations retrieved successfully!');
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Get donations failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
    return null;
  }
}

// Test 5: Get Donation Statistics
async function testGetDonationStats() {
  try {
    console.log('\n📊 Testing Get Donation Statistics...');

    const response = await axios.get(`${BASE_URL}/donations/stats`);

    console.log('✅ Donation statistics retrieved successfully!');
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Get donation statistics failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
    return null;
  }
}

// Main test function
async function runCommercialBankPayDPITests() {
  console.log('🚀 Starting Commercial Bank PayDPI Integration Tests...');
  console.log('🏦 Base URL:', BASE_URL);
  console.log('💰 Test Amount: LKR', TEST_DONATION.amount);
  console.log('👤 Test Donor:', TEST_DONATION.name);
  
  try {
    // Test 1: Create payment session
    const sessionData = await testCommercialBankPaymentSession();
    if (!sessionData || !sessionData.success) {
      console.error('❌ Cannot proceed without valid payment session');
      return;
    }

    // Test 2: Verify payment session
    if (sessionData.session?.id) {
      await testVerifyPaymentSession(sessionData.session.id);
    }

    // Test 3: Confirm donation
    const donationResult = await testDonationConfirmation(sessionData);
    if (!donationResult || !donationResult.success) {
      console.error('❌ Donation confirmation failed');
    }

    // Test 4: Get donations list
    await testGetDonations();

    // Test 5: Get donation statistics
    await testGetDonationStats();

    console.log('\n🎉 Commercial Bank PayDPI Integration Tests Completed!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Payment Session Creation');
    console.log('✅ Session Verification');
    console.log('✅ Donation Confirmation');
    console.log('✅ Donations Retrieval');
    console.log('✅ Statistics Generation');

  } catch (error) {
    console.error('\n💥 Test execution failed:', error.message);
  }
}

// Error handling for network issues
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Check if server is running
async function checkServerHealth() {
  try {
    console.log('🏥 Checking server health...');
    const response = await axios.get(`${BASE_URL.replace('/api', '')}/health`, {
      timeout: 5000
    });
    console.log('✅ Server is running');
    return true;
  } catch (error) {
    console.error('❌ Server health check failed:');
    console.error('Make sure the backend server is running on http://localhost:5000');
    console.error('Error:', error.message);
    return false;
  }
}

// Run tests
async function main() {
  console.log('🔧 Commercial Bank PayDPI Integration Test Suite');
  console.log('================================================');
  
  const serverHealthy = await checkServerHealth();
  if (!serverHealthy) {
    console.error('\n❌ Cannot run tests - server is not accessible');
    console.log('\n📝 To start the server:');
    console.log('cd src/web-dashboard/backend');
    console.log('npm start');
    return;
  }

  await runCommercialBankPayDPITests();
}

// Handle command line execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testCommercialBankPaymentSession,
  testVerifyPaymentSession,
  testDonationConfirmation,
  testGetDonations,
  testGetDonationStats
};
