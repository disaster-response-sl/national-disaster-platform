const axios = require('axios');

// Test the responder notification API directly
async function testNotificationAPI() {
    console.log('🔗 TESTING RESPONDER NOTIFICATION API 🔗\n');
    
    try {
        // Step 1: Login as responder001
        console.log('1. Logging in as responder001...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            individualId: 'responder001',
            otp: '123456'
        });
        
        if (!loginResponse.data.success) {
            throw new Error('Responder login failed');
        }
        
        const responderToken = loginResponse.data.token;
        console.log('✅ Responder logged in successfully\n');
        
        // Step 2: Test fetching notifications via API
        console.log('2. Fetching notifications via API...');
        const notificationsResponse = await axios.get(
            'http://localhost:5000/api/responder/notifications',
            {
                headers: {
                    'Authorization': `Bearer ${responderToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!notificationsResponse.data.success) {
            throw new Error('Failed to fetch notifications via API');
        }
        
        const notifications = notificationsResponse.data.data;
        const unreadCount = notificationsResponse.data.unreadCount;
        
        console.log('📱 NOTIFICATION API RESPONSE:');
        console.log('='.repeat(40));
        console.log(`📊 Total notifications: ${notifications.length}`);
        console.log(`🔴 Unread notifications: ${unreadCount}`);
        
        if (notifications.length > 0) {
            notifications.forEach((notification, index) => {
                console.log(`\n📬 Notification ${index + 1}:`);
                console.log(`   ID: ${notification.id}`);
                console.log(`   Title: ${notification.title}`);
                console.log(`   Message: ${notification.message}`);
                console.log(`   Priority: ${notification.priority}`);
                console.log(`   Read: ${notification.read ? 'Yes' : 'No'}`);
                console.log(`   Timestamp: ${new Date(notification.timestamp).toLocaleString()}`);
                
                if (notification.data) {
                    console.log(`   Emergency Type: ${notification.data.emergencyType}`);
                    console.log(`   Location: ${notification.data.location.address || `${notification.data.location.lat}, ${notification.data.location.lng}`}`);
                }
            });
            
            // Test marking first notification as read
            if (notifications.length > 0 && !notifications[0].read) {
                console.log(`\n3. Testing mark as read for notification ${notifications[0].id}...`);
                const markReadResponse = await axios.put(
                    `http://localhost:5000/api/responder/notifications/${notifications[0].id}/read`,
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${responderToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                if (markReadResponse.data.success) {
                    console.log('✅ Notification marked as read successfully');
                } else {
                    console.log('❌ Failed to mark notification as read');
                }
            }
        } else {
            console.log('⚠️  No notifications found via API');
        }
        
        console.log('\n🎉 NOTIFICATION API TEST COMPLETED!');
        
    } catch (error) {
        console.error('❌ Notification API test failed:', error.message);
        if (error.response?.data) {
            console.error('Error details:', error.response.data);
        }
    }
}

testNotificationAPI();
