const axios = require('axios');
require('dotenv').config();

// Test notification system with real assignment
async function testNotificationAssignment() {
    console.log('🚨 TESTING SOS NOTIFICATION SYSTEM 🚨\n');
    
    const baseURL = 'http://localhost:5000';
    const authToken = 'mock_token_admin001_1756105124545';
    
    try {
        console.log('1️⃣ Getting current pending signals...');
        
        // First check server is running
        const healthResponse = await axios.get(`${baseURL}/api/admin/sos/dashboard`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            params: {
                status: 'pending',
                timeRange: '24h',
                limit: 5
            }
        });
        
        console.log(`✅ Server response: ${healthResponse.status}`);
        console.log(`Found ${healthResponse.data.signals.length} signals total`);
        
        const pendingSignals = healthResponse.data.signals.filter(s => s.status === 'pending');
        console.log(`Found ${pendingSignals.length} pending signals\n`);
        
        if (pendingSignals.length === 0) {
            console.log('❌ No pending signals found to test');
            return;
        }
        
        const testSignal = pendingSignals[0];
        console.log(`2️⃣ Selected signal for testing:`);
        console.log(`   ID: ${testSignal._id}`);
        console.log(`   Status: ${testSignal.status}`);
        console.log(`   Priority: ${testSignal.priority}`);
        console.log(`   Message: ${testSignal.message}\n`);
        
        console.log('3️⃣ ASSIGNING RESPONDER (notifications should trigger)...');
        
        const assignResponse = await axios.put(
            `${baseURL}/api/admin/sos/${testSignal._id}/assign`,
            {
                responder_id: 'responder001',
                notes: '🚨 URGENT NOTIFICATION TEST: Emergency responder assignment - immediate response required! Testing email, SMS, and push notifications.'
            },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ ASSIGNMENT SUCCESSFUL!');
        console.log('Response data:', JSON.stringify(assignResponse.data, null, 2));
        
        console.log('\n🔔 CHECK BACKEND LOGS ABOVE FOR:');
        console.log('   [NOTIFICATION] Email notification logs');
        console.log('   [NOTIFICATION] SMS notification logs');
        console.log('   [NOTIFICATION] Push notification logs');
        console.log('   📧 Email content to responder001@emergency.gov');
        console.log('   📱 SMS content to +1-555-0001');
        console.log('   📲 Push notification payload\n');
        
        // Test status update notification too
        console.log('4️⃣ TESTING STATUS UPDATE NOTIFICATION...');
        
        const statusResponse = await axios.put(
            `${baseURL}/api/admin/sos/${testSignal._id}/status`,
            {
                status: 'acknowledged',
                notes: 'Responder has acknowledged the emergency - en route to location'
            },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ STATUS UPDATE SUCCESSFUL!');
        console.log('Response data:', JSON.stringify(statusResponse.data, null, 2));
        
        console.log('\n🎉 NOTIFICATION SYSTEM TEST COMPLETED!');
        console.log('📋 What happened:');
        console.log('   1. Found pending SOS signal');
        console.log('   2. Assigned responder001 → triggered assignment notifications');
        console.log('   3. Updated status to acknowledged → triggered status notifications');
        console.log('   4. All notifications logged with full details');
        
        console.log('\n📧 Production Setup Notes:');
        console.log('   • Configure real SMTP settings in .env for email');
        console.log('   • Add Twilio/AWS SNS credentials for SMS');
        console.log('   • Set up FCM/APNS for push notifications');
        console.log('   • Update responder contact database with real contacts');
        
    } catch (error) {
        console.error('❌ TEST FAILED:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error data:', error.response.data);
            console.error('URL:', error.config.url);
        } else if (error.request) {
            console.error('No response received - is backend running on port 5000?');
            console.error('Request details:', error.request.path);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testNotificationAssignment();
