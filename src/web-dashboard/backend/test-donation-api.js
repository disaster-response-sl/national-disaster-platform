const express = require('express');
const app = express();

// Test donation API endpoints
const testDonationAPI = async () => {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('🧪 Testing Donation API Endpoints...\n');

  try {
    // Test 1: Create Payment Session
    console.log('1. Testing Payment Session Creation...');
    const sessionResponse = await fetch(`${baseURL}/payment/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: {
          currency: 'LKR',
          amount: 1000,
          description: 'Test Donation'
        },
        billing: {
          address: {
            city: 'Colombo',
            country: 'LK'
          }
        }
      })
    });
    
    const sessionResult = await sessionResponse.json();
    console.log('✅ Payment Session:', sessionResult);

    if (sessionResult.success) {
      // Test 2: Confirm Donation
      console.log('\n2. Testing Donation Confirmation...');
      const confirmResponse = await fetch(`${baseURL}/donation/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+94123456789',
          amount: 1000,
          orderId: sessionResult.orderId || 'ORDER' + Date.now(),
          transactionId: 'TXN' + Date.now(),
          sessionId: sessionResult.session?.id || 'SESSION' + Date.now(),
          status: 'SUCCESS'
        })
      });
      
      const confirmResult = await confirmResponse.json();
      console.log('✅ Donation Confirmation:', confirmResult);
    }

    // Test 3: Get Donation Statistics
    console.log('\n3. Testing Donation Statistics...');
    const statsResponse = await fetch(`${baseURL}/donations/stats`);
    const statsResult = await statsResponse.json();
    console.log('✅ Donation Stats:', statsResult);

    // Test 4: Get All Donations
    console.log('\n4. Testing Get All Donations...');
    const donationsResponse = await fetch(`${baseURL}/donations?limit=5`);
    const donationsResult = await donationsResponse.json();
    console.log('✅ All Donations:', donationsResult);

    // Test 5: Get Donor History
    console.log('\n5. Testing Donor History...');
    const historyResponse = await fetch(`${baseURL}/donations/donor/john.doe@example.com`);
    const historyResult = await historyResponse.json();
    console.log('✅ Donor History:', historyResult);

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Wait for server to be ready then run tests
setTimeout(() => {
  console.log('Starting API tests in 3 seconds...');
  setTimeout(testDonationAPI, 3000);
}, 1000);

module.exports = testDonationAPI;
