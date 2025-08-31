// Test MPGS payment session creation with fixed country code
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000';

async function testPaymentSession() {
  console.log('Testing MPGS payment session creation...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/payment/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order: {
          currency: 'LKR',
          amount: 1000,
          description: 'Test Disaster Relief Donation',
        },
        billing: {
          address: {
            city: 'Colombo',
            country: 'LKA', // Fixed: using LKA instead of LK
            postcodeZip: '10100',
            stateProvince: 'Western'
          },
        },
        customer: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          phone: '+94771234567'
        }
      }),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Payment session created successfully!');
      console.log('Order ID:', result.orderId);
      console.log('Session ID:', result.session?.id);
      console.log('Checkout Script:', result.checkoutScript);
    } else {
      console.log('❌ Payment session creation failed:');
      console.log('Status:', response.status);
      console.log('Error:', result);
    }
  } catch (error) {
    console.error('❌ Error testing payment session:', error.message);
  }
}

testPaymentSession();
