const axios = require('axios');

async function testAssignmentNotificationFlow() {
    console.log('🔄 TESTING ASSIGNMENT -> NOTIFICATION FLOW 🔄\n');
    
    try {
        // Step 1: Admin login
        console.log('1. Admin login...');
        const adminLogin = await axios.post('http://localhost:5000/api/auth/login', {
            individualId: 'admin001',
            otp: '123456'
        });
        
        if (!adminLogin.data.success) {
            throw new Error('Admin login failed');
        }
        
        const adminToken = adminLogin.data.token;
        console.log('✅ Admin logged in successfully');
        
        // Step 2: Get SOS signals
        console.log('\n2. Fetching SOS signals...');
        const sosResponse = await axios.get(
            'http://localhost:5000/api/admin/sos/dashboard',
            {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            }
        );
        
        if (!sosResponse.data.success || sosResponse.data.data.signals.length === 0) {
            throw new Error('No SOS signals available');
        }
        
        const signal = sosResponse.data.data.signals[0];
        console.log(`✅ Found SOS signal: ${signal._id}`);
        console.log(`   Priority: ${signal.priority}`);
        console.log(`   Current assigned: ${signal.assigned_responder || 'None'}`);
        
        // Step 3: Assign responder and capture detailed response
        console.log('\n3. Assigning responder001...');
        const assignmentResponse = await axios.put(
            `http://localhost:5000/api/admin/sos/${signal._id}/assign`,
            {
                responder_id: 'responder001',
                notes: 'Testing notification creation during assignment'
            },
            {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            }
        );
        
        console.log('✅ Assignment API call completed');
        console.log('📋 Assignment response:', {
            success: assignmentResponse.data.success,
            hasNotifications: !!assignmentResponse.data.notifications,
            notificationChannels: assignmentResponse.data.notifications?.channels || 'N/A'
        });
        
        // Step 4: Wait and check for notifications
        console.log('\n4. Waiting 3 seconds then checking for notifications...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Login as responder
        const responderLogin = await axios.post('http://localhost:5000/api/auth/login', {
            individualId: 'responder001',
            otp: '123456'
        });
        
        const responderToken = responderLogin.data.token;
        
        // Check notifications
        const notificationsResponse = await axios.get(
            'http://localhost:5000/api/responder/notifications',
            {
                headers: { 'Authorization': `Bearer ${responderToken}` }
            }
        );
        
        console.log('📱 Notification check results:');
        console.log(`   Total notifications: ${notificationsResponse.data.data.length}`);
        console.log(`   Unread count: ${notificationsResponse.data.unreadCount}`);
        
        if (notificationsResponse.data.data.length > 0) {
            console.log('\n🎉 SUCCESS! Notifications were created during assignment!');
            notificationsResponse.data.data.forEach((notif, i) => {
                console.log(`   ${i+1}. ${notif.title} - SOS: ${notif.sosId}`);
            });
        } else {
            console.log('\n❌ ISSUE: No notifications were created during assignment');
            console.log('🔍 The assignment succeeded but notification creation failed');
        }
        
    } catch (error) {
        console.error('❌ Assignment test failed:', error.message);
        if (error.response?.data) {
            console.error('📋 Error details:', error.response.data);
        }
    }
}

testAssignmentNotificationFlow();
