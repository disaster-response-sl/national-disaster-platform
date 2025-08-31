// Test the updated MPGS service with Commercial Bank PayDPI
const mpgsService = require('./services/mpgs.service');

const testUpdatedMPGSService = async () => {
  console.log('🧪 Testing Updated MPGS Service...');
  
  // Set environment variables for testing
  process.env.MERCHANT_ID = 'TESTITCALANKALKR';
  process.env.API_USERNAME = 'merchant.TESTITCALANKALKR';
  process.env.API_PASSWORD = '0144a33905ebfc5a6d39dd074ce5d40d';
  process.env.MPGS_MOCK_MODE = 'false'; // Test real integration
  
  const sessionData = {
    order: {
      currency: 'LKR',
      amount: 1500, // LKR 15.00
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
    billing: {
      address: {
        city: 'Colombo',
        country: 'LKA',
        postcodeZip: '10100',
        stateProvince: 'Western'
      }
    },
    customer: {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+94771234567'
    }
  };
  
  try {
    console.log('🔄 Creating payment session...');
    const result = await mpgsService.createHostedSession(sessionData);
    
    console.log('✅ Payment Session Result:', JSON.stringify(result, null, 2));
    
    if (result.success && result.session) {
      console.log('🎉 SUCCESS: Payment session created successfully!');
      console.log(`Session ID: ${result.session.id}`);
      console.log(`Order ID: ${result.orderId}`);
      console.log(`Success Indicator: ${result.successIndicator}`);
      
      return result;
    } else {
      console.log('❌ FAILED:', result.error || 'Unknown error');
      return result;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  }
};

// Run the test
testUpdatedMPGSService();
