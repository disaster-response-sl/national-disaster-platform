const https = require('https');

// Commercial Bank PayDPI Test Script
// Based on exact documentation provided

const testCommercialBankPayDPI = async () => {
  console.log('🧪 Testing Commercial Bank PayDPI Integration...');
  
  // Credentials from ITCA test.txt
  const merchantId = 'TESTITCALANKALKR';
  const apiUsername = 'merchant.TESTITCALANKALKR';
  const apiPassword = '0144a33905ebfc5a6d39dd074ce5d40d';
  
  // Create Basic Auth
  const auth = Buffer.from(`${apiUsername}:${apiPassword}`).toString('base64');
  
  // Request data exactly as per Commercial Bank documentation
  const requestData = {
    "apiOperation": "INITIATE_CHECKOUT",
    "interaction": {
      "merchant": {
        "name": merchantId
      },
      "operation": "PURCHASE",
      "displayControl": {
        "billingAddress": "HIDE",
        "customerEmail": "HIDE",
        "shipping": "HIDE"
      },
      "returnUrl": "https://www.abcd.lk"
    },
    "order": {
      "id": `ORD${Date.now()}`,
      "currency": "LKR",
      "description": "Test Order",
      "amount": "15.00"
    }
  };
  
  console.log('📝 Request Data:', JSON.stringify(requestData, null, 2));
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'cbcmpgs.gateway.mastercard.com',
      port: 443,
      path: `/api/rest/version/100/merchant/${merchantId}/session`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      console.log(`📡 Response Status: ${res.statusCode}`);
      console.log(`📡 Response Headers:`, res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Response Data:', JSON.stringify(response, null, 2));
          
          if (response.session && response.session.id) {
            console.log('🎉 SUCCESS: Payment session created!');
            console.log(`Session ID: ${response.session.id}`);
            resolve(response);
          } else {
            console.log('❌ FAILED: No session ID in response');
            resolve(response);
          }
        } catch (error) {
          console.log('❌ JSON Parse Error:', error.message);
          console.log('Raw Response:', data);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request Error:', error.message);
      reject(error);
    });
    
    // Write data to request body
    req.write(JSON.stringify(requestData));
    req.end();
  });
};

// Test function
const runTest = async () => {
  try {
    console.log('🚀 Starting Commercial Bank PayDPI Test...');
    await testCommercialBankPayDPI();
    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
runTest();

module.exports = { testCommercialBankPayDPI };
