const https = require('https');

// Direct test of MPGS API
function testMPGSDirectly() {
  const merchantId = 'TESTITCALANKALKR';
  const apiUsername = 'merchant.TESTITCALANKALKR';
  const apiPassword = '0144a33905ebfc5a6d39dd074ce5d40d';
  
  const auth = Buffer.from(`${apiUsername}:${apiPassword}`).toString('base64');
  const path = `/api/rest/version/60/merchant/${merchantId}/session`;
  
  console.log('Testing MPGS directly...');
  console.log('URL:', `https://test-gateway.mastercard.com${path}`);
  console.log('Auth header:', `Basic ${auth.substring(0, 20)}...`);
  
  const requestData = {
    apiOperation: 'CREATE_CHECKOUT_SESSION',
    interaction: {
      operation: 'PURCHASE',
      returnUrl: 'https://your-app.com/payment/return'
    },
    order: {
      id: 'TEST' + Date.now(),
      amount: '10.00',
      currency: 'LKR',
      description: 'Test payment'
    },
    billing: {
      address: {
        city: 'Colombo',
        country: 'LKA',
        postcodeZip: '10100'
      }
    }
  };
  
  const dataString = JSON.stringify(requestData);
  
  const options = {
    hostname: 'test-gateway.mastercard.com',
    port: 443,
    path: path,
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(dataString)
    }
  };
  
  console.log('Request data:', JSON.stringify(requestData, null, 2));
  
  const req = https.request(options, (res) => {
    let responseData = '';
    
    console.log('Response status:', res.statusCode);
    console.log('Response headers:', res.headers);
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('Response body:', responseData);
      try {
        const jsonResponse = JSON.parse(responseData);
        console.log('Parsed response:', JSON.stringify(jsonResponse, null, 2));
      } catch (e) {
        console.log('Could not parse response as JSON');
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Request error:', error);
  });
  
  req.write(dataString);
  req.end();
}

testMPGSDirectly();
