const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';

// Test data
const testDonor = {
  name: 'Test Donor',
  email: 'test.donor@example.com',
  phone: '+94123456789'
};

const testDonation = {
  ...testDonor,
  amount: 100.00,
  orderId: 'TEST_ORDER_001',
  transactionId: 'TEST_TXN_001',
  sessionId: 'TEST_SESSION_001',
  status: 'SUCCESS'
};

async function testPaymentSession() {
  try {
    console.log('Testing payment session creation...');
    const response = await axios.post(`${BASE_URL}/payment/session`, {
      order: {
        currency: 'LKR',
        amount: '100.00'
      }
    });

    console.log('✅ Payment session created:', response.data);
    return response.data.sessionId;
  } catch (error) {
    console.log('❌ Payment session creation failed:', error.response?.data || error.message);
    return null;
  }
}

async function testDonationConfirmation() {
  try {
    console.log('Testing donation confirmation...');
    const response = await axios.post(`${BASE_URL}/donation/confirm`, testDonation);

    console.log('✅ Donation confirmed:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ Donation confirmation failed:', error.response?.data || error.message);
    return null;
  }
}

async function testGetDonations() {
  try {
    console.log('Testing get donations...');
    const response = await axios.get(`${BASE_URL}/donations`);

    console.log('✅ Donations retrieved:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ Get donations failed:', error.response?.data || error.message);
    return null;
  }
}

async function testGetDonationStats() {
  try {
    console.log('Testing donation statistics...');
    const response = await axios.get(`${BASE_URL}/donations/stats`);

    console.log('✅ Donation stats retrieved:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ Get donation stats failed:', error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Donation API Tests...\n');

  // Note: Payment session test will fail without proper MPGS credentials
  // Comment out if you don't have test credentials configured
  // await testPaymentSession();

  await testDonationConfirmation();
  await testGetDonations();
  await testGetDonationStats();

  console.log('\n✨ Tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testPaymentSession,
  testDonationConfirmation,
  testGetDonations,
  testGetDonationStats,
  runTests
};
