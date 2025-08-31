// Test script to check network connectivity from React Native app
// You can copy this code into your app temporarily to test connectivity

const testNetworkConnection = async () => {
  console.log('🔄 Testing network connection...');
  
  // Test 1: Basic connectivity to backend
  try {
    console.log('📡 Testing connection to backend...');
    const response = await fetch('http://10.0.2.2:5000/api/health', {
      method: 'GET',
      timeout: 10000, // 10 second timeout
    });
    
    console.log('✅ Backend connection successful!');
    console.log('Response status:', response.status);
    
    const data = await response.text();
    console.log('Response data:', data);
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
    
    // Test alternative URLs
    const alternatives = [
      'http://localhost:5000/api/health',
      'http://127.0.0.1:5000/api/health',
      'http://192.168.1.100:5000/api/health', // Replace with your actual IP
    ];
    
    for (const url of alternatives) {
      try {
        console.log(`📡 Trying alternative URL: ${url}`);
        const altResponse = await fetch(url, { timeout: 5000 });
        console.log(`✅ Alternative URL successful: ${url}`);
        console.log('Response status:', altResponse.status);
        break;
      } catch (altError) {
        console.log(`❌ Alternative URL failed: ${url} - ${altError.message}`);
      }
    }
  }
  
  // Test 2: Internet connectivity
  try {
    console.log('🌐 Testing internet connectivity...');
    const internetResponse = await fetch('https://httpbin.org/get', {
      timeout: 5000,
    });
    console.log('✅ Internet connection working!');
    console.log('Internet response status:', internetResponse.status);
  } catch (internetError) {
    console.log('❌ Internet connection failed:', internetError.message);
  }
};

// Run the test
testNetworkConnection();

// Export for use in React Native components
export default testNetworkConnection;
