const notificationService = require('./services/NotificationService');

// Direct notification test - bypassing API authentication
async function testNotificationsDirect() {
    console.log('🚨 TESTING NOTIFICATION SERVICE DIRECTLY 🚨\n');
    
    // Mock SOS signal data
    const mockSignal = {
        _id: '68ac006c4acc27883d2d3906',
        user_id: 'citizen001',
        message: 'URGENT: Building collapse on 4th floor, multiple people trapped, need immediate rescue',
        priority: 'critical',
        location: { lat: 6.9271, lng: 79.8612 }, // Colombo coordinates
        status: 'pending',
        created_at: new Date(),
        emergency_type: 'building_collapse'
    };
    
    console.log('📋 Mock Emergency Signal:');
    console.log(`   ID: ${mockSignal._id}`);
    console.log(`   Priority: ${mockSignal.priority}`);
    console.log(`   Location: ${mockSignal.location.lat}, ${mockSignal.location.lng}`);
    console.log(`   Message: ${mockSignal.message}\n`);
    
    console.log('🔔 TRIGGERING ASSIGNMENT NOTIFICATIONS...\n');
    
    try {
        // Test assignment notification
        await notificationService.notifyResponderAssignment(
            mockSignal,
            'responder001',
            'URGENT EMERGENCY ASSIGNMENT: Building collapse with multiple casualties. Immediate response required!'
        );
        
        console.log('✅ Assignment notifications sent successfully!\n');
        
        // Test status update notification
        console.log('🔄 TESTING STATUS UPDATE NOTIFICATION...\n');
        
        await notificationService.notifyStatusUpdate(
            mockSignal,
            'responder001',
            'pending',
            'acknowledged',
            'Emergency responder is en route to location'
        );
        
        console.log('✅ Status update notifications sent successfully!\n');
        
        // Test escalation notification
        console.log('🚨 TESTING ESCALATION NOTIFICATION...\n');
        
        await notificationService.notifyEscalation(
            mockSignal,
            'responder001',
            2,
            'Escalated to priority level 2 - additional resources dispatched'
        );
        
        console.log('✅ Escalation notifications sent successfully!\n');
        
        console.log('🎉 ALL NOTIFICATION TESTS COMPLETED SUCCESSFULLY!\n');
        console.log('📧 Check the console logs above for detailed notification content');
        console.log('📱 Email, SMS, and Push notification details should be visible');
        console.log('🔔 Each notification type was tested with realistic emergency data\n');
        
        console.log('🏗️  PRODUCTION SETUP:');
        console.log('   • Add real SMTP credentials to .env for email notifications');
        console.log('   • Configure Twilio or AWS SNS for SMS notifications');
        console.log('   • Set up Firebase Cloud Messaging for push notifications');
        console.log('   • Update responder contact database with real information');
        
    } catch (error) {
        console.error('❌ Notification test failed:', error.message);
    }
}

testNotificationsDirect();
