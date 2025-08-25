const { storeNotificationForResponder } = require('./services/NotificationStore');
const axios = require('axios');

// Manual test: Store notification directly and fetch via API
async function testManualNotificationFlow() {
    console.log('🧪 MANUAL NOTIFICATION TEST 🧪\n');
    
    // Step 1: Store notification directly using the store
    console.log('1. Storing notification directly in store...');
    
    const testNotification = {
        type: 'SOS_ASSIGNMENT',
        title: '🚨 Manual Test Assignment',
        message: 'You have been assigned to emergency SOS #test123',
        priority: 'critical',
        sosId: 'test123',
        data: {
            location: { lat: 6.9271, lng: 79.8612, address: 'Colombo, Sri Lanka' },
            emergencyType: 'test_emergency',
            citizenMessage: 'Manual test emergency assignment',
            assignedBy: 'admin001',
            notes: 'This is a manual test notification',
            assignmentTime: new Date()
        }
    };
    
    storeNotificationForResponder('responder001', testNotification);
    console.log('✅ Notification stored manually\n');
    
    // Step 2: Login as responder and fetch via API
    console.log('2. Testing responder login...');
    
    try {
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            individualId: 'responder001',
            otp: '123456'
        });
        
        if (!loginResponse.data.success) {
            throw new Error('Login failed: ' + loginResponse.data.message);
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Responder logged in successfully\n');
        
        // Step 3: Fetch notifications via API
        console.log('3. Fetching notifications via API...');
        
        const notificationsResponse = await axios.get(
            'http://localhost:5000/api/responder/notifications',
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!notificationsResponse.data.success) {
            throw new Error('API fetch failed: ' + notificationsResponse.data.message);
        }
        
        const notifications = notificationsResponse.data.data;
        const unreadCount = notificationsResponse.data.unreadCount;
        
        console.log('📱 API RESULTS:');
        console.log('='.repeat(40));
        console.log(`📊 Total notifications: ${notifications.length}`);
        console.log(`🔴 Unread notifications: ${unreadCount}`);
        
        if (notifications.length > 0) {
            console.log('\n📬 NOTIFICATION DETAILS:');
            notifications.forEach((notification, index) => {
                console.log(`\n🔔 Notification ${index + 1}:`);
                console.log(`   ID: ${notification.id}`);
                console.log(`   Title: ${notification.title}`);
                console.log(`   Priority: ${notification.priority}`);
                console.log(`   SOS ID: ${notification.sosId}`);
                console.log(`   Read: ${notification.read ? 'Yes' : 'No'}`);
                console.log(`   Location: ${notification.data?.location?.address || 'N/A'}`);
            });
            
            console.log('\n🎉 SUCCESS! Manual notification is retrievable via API!');
            console.log('🔍 This means the issue is in the assignment integration, not the notification system itself.');
        } else {
            console.log('\n❌ ISSUE: Manually stored notification not found via API');
            console.log('🔍 This suggests there may be an issue with the API routes or shared store.');
        }
        
    } catch (error) {
        console.error('❌ API test failed:', error.message);
    }
}

testManualNotificationFlow();
