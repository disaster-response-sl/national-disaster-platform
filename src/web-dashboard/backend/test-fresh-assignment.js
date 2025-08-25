const axios = require('axios');

async function testFreshAssignment() {
    console.log('🆕 TESTING FRESH ASSIGNMENT WITH NOTIFICATION LOGGING 🆕\n');
    
    try {
        // Admin login
        console.log('1. Admin login...');
        const adminLogin = await axios.post('http://localhost:5000/api/auth/login', {
            individualId: 'admin001',
            otp: '123456'
        });
        
        const adminToken = adminLogin.data.token;
        console.log('✅ Admin logged in');
        
        // Get SOS signals
        console.log('\n2. Fetching SOS signals...');
        const sosResponse = await axios.get(
            'http://localhost:5000/api/admin/sos/dashboard',
            { headers: { 'Authorization': `Bearer ${adminToken}` } }
        );
        
        const signals = sosResponse.data.data.signals;
        console.log(`✅ Found ${signals.length} SOS signals`);
        
        // Find an unassigned signal or assign to different responder
        let targetSignal = signals.find(s => !s.assigned_responder);
        let targetResponder = 'responder001';
        
        if (!targetSignal) {
            // If no unassigned signal, use first signal and assign to different responder
            targetSignal = signals[0];
            targetResponder = targetSignal.assigned_responder === 'responder001' ? 'responder002' : 'responder001';
            console.log(`📋 No unassigned signals found, reassigning ${targetSignal._id} to ${targetResponder}`);
        } else {
            console.log(`📋 Found unassigned signal: ${targetSignal._id}`);
        }
        
        console.log(`   Current assigned: ${targetSignal.assigned_responder || 'None'}`);
        console.log(`   Will assign to: ${targetResponder}`);
        
        // Perform assignment
        console.log(`\n3. Assigning ${targetResponder} to SOS ${targetSignal._id}...`);
        console.log('⏳ Watch backend console for notification logs...');
        
        const assignmentResponse = await axios.put(
            `http://localhost:5000/api/admin/sos/${targetSignal._id}/assign`,
            {
                responder_id: targetResponder,
                notes: `FRESH ASSIGNMENT TEST: This should trigger notifications for ${targetResponder}`
            },
            { headers: { 'Authorization': `Bearer ${adminToken}` } }
        );
        
        console.log('✅ Assignment API completed');
        console.log('📋 Response channels:', assignmentResponse.data.notifications?.channels || 'None');
        
        // Wait and check for notifications
        console.log('\n4. Checking notifications after 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Login as target responder
        const responderLogin = await axios.post('http://localhost:5000/api/auth/login', {
            individualId: targetResponder,
            otp: '123456'
        });
        
        const responderToken = responderLogin.data.token;
        
        // Check notifications
        const notificationsResponse = await axios.get(
            'http://localhost:5000/api/responder/notifications',
            { headers: { 'Authorization': `Bearer ${responderToken}` } }
        );
        
        const notifications = notificationsResponse.data.data;
        console.log(`📱 Found ${notifications.length} notifications for ${targetResponder}`);
        
        if (notifications.length > 0) {
            console.log('\n🎉 SUCCESS! Fresh assignment created notifications!');
            notifications.slice(0, 3).forEach((notif, i) => {
                console.log(`   ${i+1}. ${notif.title} - SOS: ${notif.sosId} (${notif.read ? 'Read' : 'Unread'})`);
            });
        } else {
            console.log('\n❌ ISSUE: Fresh assignment did not create notifications');
            console.log('🔍 Check backend console for any error messages or missing logs');
        }
        
    } catch (error) {
        console.error('❌ Fresh assignment test failed:', error.message);
        if (error.response?.data) {
            console.error('📋 Error details:', error.response.data);
        }
    }
}

testFreshAssignment();
