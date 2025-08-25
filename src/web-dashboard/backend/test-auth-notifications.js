const axios = require('axios');

async function testAuthAndNotifications() {
    console.log('🔐 TESTING AUTHENTICATION AND NOTIFICATION ROUTES 🔐\n');
    
    try {
        // Test 1: Login as responder
        console.log('1. Testing responder login...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            individualId: 'responder001',
            otp: '123456'
        }, {
            timeout: 5000
        });
        
        console.log('✅ Login response received');
        console.log('📋 Response:', {
            success: loginResponse.data.success,
            hasToken: !!loginResponse.data.token,
            user: loginResponse.data.user
        });
        
        if (!loginResponse.data.success) {
            throw new Error('Login failed: ' + loginResponse.data.message);
        }
        
        const token = loginResponse.data.token;
        
        // Test 2: Test notification endpoint with authentication
        console.log('\n2. Testing notification endpoint...');
        const notificationsResponse = await axios.get(
            'http://localhost:5000/api/responder/notifications',
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            }
        );
        
        console.log('✅ Notifications endpoint responded');
        console.log('📋 Response:', {
            success: notificationsResponse.data.success,
            notificationCount: notificationsResponse.data.data?.length || 0,
            unreadCount: notificationsResponse.data.unreadCount || 0
        });
        
        // Test 3: Check if notification store has data (debugging)
        console.log('\n3. Checking notification store status...');
        console.log('📦 Notifications found:', notificationsResponse.data.data?.length || 0);
        
        if (notificationsResponse.data.data && notificationsResponse.data.data.length > 0) {
            console.log('🎉 SUCCESS: Notifications are accessible via API!');
            notificationsResponse.data.data.forEach((notif, i) => {
                console.log(`   ${i+1}. ${notif.title} (${notif.read ? 'Read' : 'Unread'})`);
            });
        } else {
            console.log('ℹ️  No notifications found. This could be expected if none have been created.');
        }
        
        console.log('\n✅ ALL TESTS PASSED - Authentication and API routes are working!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('📋 Error response:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
        }
        if (error.code === 'ECONNREFUSED') {
            console.error('🔌 Connection refused - backend may not be running on port 5000');
        }
    }
}

testAuthAndNotifications();
