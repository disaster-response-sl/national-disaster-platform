const axios = require('axios');

async function testDisasterAPI() {
  try {
    console.log('Testing disaster API endpoints...');
    
    // Test the test endpoint (no auth required)
    const testResponse = await axios.get('http://localhost:5000/api/test/test-read');
    console.log('✅ Test endpoint works:');
    console.log(`Found ${testResponse.data.data.length} disasters`);
    console.log(`Total count: ${testResponse.data.totalCount}`);
    
    if (testResponse.data.data.length > 0) {
      console.log('First disaster:');
      console.log('- Title:', testResponse.data.data[0].title);
      console.log('- Type:', testResponse.data.data[0].type);
      console.log('- Severity:', testResponse.data.data[0].severity);
      console.log('- Status:', testResponse.data.data[0].status);
      console.log('- Code:', testResponse.data.data[0].disaster_code);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testDisasterAPI();
