#!/usr/bin/env node

// Quick test script to verify authentication flow
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow...\n');

  try {
    // Test 1: Login
    console.log('1️⃣ Testing Login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      individualId: 'citizen001',
      otp: '123456'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful!');
      console.log('📄 Login Response:', JSON.stringify(loginResponse.data, null, 2));
      
      const token = loginResponse.data.token;
      
      // Test 2: Profile
      console.log('\n2️⃣ Testing Profile Fetch...');
      const profileResponse = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (profileResponse.data.success) {
        console.log('✅ Profile fetch successful!');
        console.log('👤 Profile Data:', JSON.stringify(profileResponse.data, null, 2));

        // Test 3: Token decode
        console.log('\n3️⃣ Testing Token Decode...');
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        console.log('🔑 Token Payload:', JSON.stringify(payload, null, 2));

        // Test 4: Logout
        console.log('\n4️⃣ Testing Logout...');
        const logoutResponse = await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (logoutResponse.data.success) {
          console.log('✅ Logout successful!');
          console.log('🚪 Logout Response:', JSON.stringify(logoutResponse.data, null, 2));
        } else {
          console.log('❌ Logout failed:', logoutResponse.data);
        }

      } else {
        console.log('❌ Profile fetch failed:', profileResponse.data);
      }

    } else {
      console.log('❌ Login failed:', loginResponse.data);
    }

  } catch (error) {
    console.error('💥 Test failed:', error.response?.data || error.message);
  }

  console.log('\n🏁 Authentication flow test completed!');
}

// Run the test
testAuthFlow();
