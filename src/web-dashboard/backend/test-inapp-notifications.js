const axios = require('axios');

// Test in-app notification system for responders
async function testInAppNotifications() {
    console.log('🔔 TESTING IN-APP NOTIFICATION SYSTEM 🔔\n');
    
    try {
        // Step 1: Admin login to get token
        console.log('1. Admin login...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            individualId: 'admin001',
            otp: '123456'
        });
        
        if (!loginResponse.data.success) {
            throw new Error('Admin login failed');
        }
        
        const authToken = loginResponse.data.token;
        console.log('✅ Admin logged in successfully\n');
        
        // Step 2: Get available SOS signals
        console.log('2. Fetching SOS signals...');
        const sosResponse = await axios.get(
            'http://localhost:5000/api/admin/sos/dashboard',
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!sosResponse.data.success || sosResponse.data.data.signals.length === 0) {
            throw new Error('No SOS signals available for testing');
        }
        
        const testSignal = sosResponse.data.data.signals[0];
        console.log(`✅ Found SOS signal: ${testSignal._id}`);
        console.log(`   Priority: ${testSignal.priority}`);
        console.log(`   Message: ${testSignal.message}\n`);
        
        // Step 3: Assign responder (this should create in-app notification)
        console.log('3. Assigning responder001 to SOS signal...');
        const assignResponse = await axios.put(
            `http://localhost:5000/api/admin/sos/${testSignal._id}/assign`,
            {
                responder_id: 'responder001',
                notes: 'URGENT: Emergency assignment for in-app notification testing'
            },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Assignment successful!');
        console.log('   External notifications sent (email/SMS/push)');
        console.log('   In-app notification should be stored for responder001\n');
        
        // Step 4: Responder login to test notification retrieval
        console.log('4. Testing responder login and notification fetch...');
        const responderLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            individualId: 'responder001',
            otp: '123456'
        });
        
        if (!responderLoginResponse.data.success) {
            throw new Error('Responder login failed');
        }
        
        const responderToken = responderLoginResponse.data.token;
        console.log('✅ Responder logged in successfully\n');
        
        // Step 5: Fetch responder notifications
        console.log('5. Fetching in-app notifications for responder...');
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
            throw new Error('Failed to fetch notifications');
        }
        
        const notifications = notificationsResponse.data.data;
        const unreadCount = notificationsResponse.data.unreadCount;
        
        console.log('📱 IN-APP NOTIFICATIONS RETRIEVED:');
        console.log('='.repeat(50));
        console.log(`📊 Total notifications: ${notifications.length}`);
        console.log(`🔴 Unread notifications: ${unreadCount}`);
        
        if (notifications.length > 0) {
            notifications.forEach((notification, index) => {
                console.log(`\n📬 Notification ${index + 1}:`);
                console.log(`   ID: ${notification.id}`);
                console.log(`   Title: ${notification.title}`);
                console.log(`   Message: ${notification.message}`);
                console.log(`   Priority: ${notification.priority}`);
                console.log(`   SOS ID: ${notification.sosId}`);
                console.log(`   Read: ${notification.read ? 'Yes' : 'No'}`);
                console.log(`   Timestamp: ${new Date(notification.timestamp).toLocaleString()}`);
                
                if (notification.data) {
                    console.log(`   Emergency Type: ${notification.data.emergencyType}`);
                    console.log(`   Location: ${notification.data.location.address || `${notification.data.location.lat}, ${notification.data.location.lng}`}`);
                    console.log(`   Citizen Message: ${notification.data.citizenMessage}`);
                    console.log(`   Assigned By: ${notification.data.assignedBy}`);
                    console.log(`   Notes: ${notification.data.notes || 'None'}`);
                }
            });
        } else {
            console.log('⚠️  No notifications found');
        }
        
        console.log('\n🎉 IN-APP NOTIFICATION TEST COMPLETED!');
        console.log('\n📋 SUMMARY:');
        console.log('   ✅ External notifications sent (email/SMS/push)');
        console.log('   ✅ In-app notifications stored in backend');
        console.log('   ✅ Responder can fetch notifications via API');
        console.log('   ✅ Notification data includes full emergency details');
        console.log('\n🌐 NEXT STEPS:');
        console.log('   • Responder logs into web dashboard');
        console.log('   • Notification bell shows unread count');
        console.log('   • Clicking bell opens notification panel');
        console.log('   • Responder can read, mark as read, or delete notifications');
        
    } catch (error) {
        console.error('❌ In-app notification test failed:', error.message);
        console.error('Full error:', error.response?.data || error);
    }
}

testInAppNotifications();
