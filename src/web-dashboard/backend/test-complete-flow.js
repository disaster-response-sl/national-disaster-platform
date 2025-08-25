const axios = require('axios');

// Test the complete assignment-to-notification flow
async function testCompleteFlow() {
    console.log('🔄 TESTING COMPLETE ASSIGNMENT-TO-NOTIFICATION FLOW 🔄\n');
    
    try {
        // Step 1: Admin login
        console.log('1. Admin login...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            individualId: 'admin001',
            otp: '123456'
        });
        
        if (!loginResponse.data.success) {
            throw new Error('Admin login failed: ' + loginResponse.data.message);
        }
        
        const authToken = loginResponse.data.token;
        console.log('✅ Admin logged in successfully\n');
        
        // Step 2: Get SOS signals
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
        
        if (!sosResponse.data.success) {
            throw new Error('Failed to fetch SOS signals: ' + sosResponse.data.message);
        }
        
        const signals = sosResponse.data.data.signals;
        console.log(`✅ Found ${signals.length} SOS signals`);
        
        if (signals.length === 0) {
            throw new Error('No SOS signals available for testing');
        }
        
        // Find an unassigned signal or use the first one
        const testSignal = signals.find(s => !s.assigned_responder) || signals[0];
        console.log(`📋 Using signal: ${testSignal._id}`);
        console.log(`   Priority: ${testSignal.priority}`);
        console.log(`   Current status: ${testSignal.status}`);
        console.log(`   Currently assigned: ${testSignal.assigned_responder || 'None'}\n`);
        
        // Step 3: Assign responder001 to the signal
        console.log('3. Assigning responder001 to SOS signal...');
        const assignResponse = await axios.put(
            `http://localhost:5000/api/admin/sos/${testSignal._id}/assign`,
            {
                responder_id: 'responder001',
                notes: 'TEST ASSIGNMENT: Creating in-app notification for responder001'
            },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!assignResponse.data.success) {
            throw new Error('Assignment failed: ' + assignResponse.data.message);
        }
        
        console.log('✅ Assignment successful!');
        console.log('📝 Assignment details:', {
            sosId: testSignal._id,
            responder: 'responder001',
            status: assignResponse.data.data.status,
            assignedAt: assignResponse.data.data.updated_at
        });
        
        // Check if notification channels were triggered
        if (assignResponse.data.notifications) {
            console.log('📬 Notification channels triggered:', assignResponse.data.notifications.channels);
        }
        
        console.log('\n⏳ Waiting 2 seconds for notification processing...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Step 4: Login as responder001 and check notifications
        console.log('4. Testing responder001 login...');
        const responderLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            individualId: 'responder001',
            otp: '123456'
        });
        
        if (!responderLoginResponse.data.success) {
            throw new Error('Responder login failed: ' + responderLoginResponse.data.message);
        }
        
        const responderToken = responderLoginResponse.data.token;
        console.log('✅ Responder logged in successfully\n');
        
        // Step 5: Fetch notifications for responder001
        console.log('5. Fetching in-app notifications...');
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
            throw new Error('Failed to fetch notifications: ' + notificationsResponse.data.message);
        }
        
        const notifications = notificationsResponse.data.data;
        const unreadCount = notificationsResponse.data.unreadCount;
        
        console.log('📱 NOTIFICATION RESULTS:');
        console.log('='.repeat(50));
        console.log(`📊 Total notifications: ${notifications.length}`);
        console.log(`🔴 Unread notifications: ${unreadCount}`);
        
        if (notifications.length > 0) {
            console.log('\n📬 NOTIFICATION DETAILS:');
            notifications.forEach((notification, index) => {
                console.log(`\n🔔 Notification ${index + 1}:`);
                console.log(`   ID: ${notification.id}`);
                console.log(`   Title: ${notification.title}`);
                console.log(`   Message: ${notification.message}`);
                console.log(`   Priority: ${notification.priority}`);
                console.log(`   SOS ID: ${notification.sosId}`);
                console.log(`   Read: ${notification.read ? 'Yes' : 'No'}`);
                console.log(`   Timestamp: ${new Date(notification.timestamp).toLocaleString()}`);
                
                if (notification.data) {
                    console.log(`   📍 Location: ${notification.data.location?.address || `${notification.data.location?.lat}, ${notification.data.location?.lng}`}`);
                    console.log(`   🚨 Emergency Type: ${notification.data.emergencyType || 'Unknown'}`);
                    console.log(`   💬 Citizen Message: ${notification.data.citizenMessage}`);
                    console.log(`   👤 Assigned By: ${notification.data.assignedBy}`);
                    console.log(`   📝 Notes: ${notification.data.notes || 'None'}`);
                }
            });
            
            console.log('\n🎉 SUCCESS! In-app notifications are working correctly!');
        } else {
            console.log('\n❌ ISSUE: No notifications found for responder001');
            console.log('🔍 This suggests the notification storage during assignment is not working');
        }
        
        console.log('\n📋 FLOW SUMMARY:');
        console.log(`   ✅ Admin logged in: ${authToken ? 'Yes' : 'No'}`);
        console.log(`   ✅ SOS signals fetched: ${signals.length} found`);
        console.log(`   ✅ Assignment successful: ${assignResponse.data.success ? 'Yes' : 'No'}`);
        console.log(`   ✅ Responder logged in: ${responderToken ? 'Yes' : 'No'}`);
        console.log(`   📬 Notifications found: ${notifications.length}`);
        console.log(`   🔴 Unread count: ${unreadCount}`);
        
    } catch (error) {
        console.error('❌ Complete flow test failed:', error.message);
        if (error.response?.data) {
            console.error('📋 Error details:', error.response.data);
        }
    }
}

testCompleteFlow();
