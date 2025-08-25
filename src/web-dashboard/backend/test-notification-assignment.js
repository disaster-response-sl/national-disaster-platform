const axios = require('axios');
require('dotenv').config();

async function testNotificationSystem() {
    try {
        console.log('🚨 Testing SOS Assignment Notification System\n');
        
        // Get a pending signal
        const authToken = 'mock_token_admin001_1756105124545';
        
        console.log('1. Fetching pending SOS signals...');
        const dashboardResponse = await axios.get('http://localhost:5000/api/admin/sos/dashboard', {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            params: {
                status: 'pending',
                timeRange: '24h'
            }
        });
        
        const pendingSignals = dashboardResponse.data.signals.filter(s => s.status === 'pending');
        console.log(`Found ${pendingSignals.length} pending signals`);
        
        if (pendingSignals.length === 0) {
            console.log('❌ No pending signals found for testing');
            return;
        }
        
        const testSignal = pendingSignals[0];
        console.log(`Selected signal: ${testSignal._id} (Priority: ${testSignal.priority})`);
        console.log(`Message: ${testSignal.message}\n`);
        
        // Test assignment with notification
        console.log('2. Assigning responder (this should trigger notifications)...');
        const assignResponse = await axios.put(
            `http://localhost:5000/api/admin/sos/${testSignal._id}/assign`,
            {
                responder_id: 'responder001',
                notes: 'URGENT: Emergency assignment via notification test - immediate response required!'
            },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Assignment successful!');
        console.log('Response:', assignResponse.data);
        
        // Wait for notification processing
        console.log('\n3. Processing notifications... (check backend logs)\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test status update notification
        console.log('4. Testing status update notification...');
        const statusResponse = await axios.put(
            `http://localhost:5000/api/admin/sos/${testSignal._id}/status`,
            {
                status: 'acknowledged',
                notes: 'Status updated - responder has acknowledged the emergency'
            },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Status update successful!');
        console.log('Response:', statusResponse.data);
        
        console.log('\n🎉 Notification system test completed!');
        console.log('📧 Check the backend logs above for detailed notification messages');
        console.log('📱 Look for [NOTIFICATION] logs showing email, SMS, and push notifications');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testNotificationSystem();
