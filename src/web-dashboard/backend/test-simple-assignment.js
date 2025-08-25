const axios = require('axios');

async function testSimpleAssignment() {
    const url = 'http://localhost:5000/api/admin/sos/68ac006c4acc27883d2d390c/assign';
    const token = 'mock_token_admin001_1756105124545';
    
    console.log('🚨 Testing SOS Assignment with Notifications\n');
    console.log('URL:', url);
    console.log('Signal ID: 68ac006c4acc27883d2d390c (Gas leak - pending signal)\n');
    
    try {
        const response = await axios.put(url, {
            responder_id: 'responder001',
            notes: 'URGENT: Emergency assignment with notification test - immediate response required!'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Assignment successful!');
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ Assignment failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testSimpleAssignment();
