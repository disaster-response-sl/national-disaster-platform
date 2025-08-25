const notificationService = require('./services/NotificationService');

async function testNotificationServiceDirectly() {
    console.log('🧪 TESTING NOTIFICATION SERVICE DIRECTLY 🧪\n');
    
    try {
        // Create a mock SOS signal
        const mockSosSignal = {
            _id: 'test123',
            message: 'Test emergency message',
            priority: 'critical',
            location: { lat: 6.9271, lng: 79.8612, address: 'Test Location' },
            emergency_type: 'test_emergency',
            user_id: 'citizen001'
        };
        
        console.log('📋 Calling notificationService.notifyResponderAssignment...');
        
        // Call the notification service directly
        const result = await notificationService.notifyResponderAssignment(
            mockSosSignal,
            'responder001',
            'admin001',
            'Direct test of notification service'
        );
        
        console.log('✅ NotificationService call completed');
        console.log('📋 Result:', result);
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Now check if notification was stored
        const { getNotificationsForResponder } = require('./services/NotificationStore');
        const notifications = getNotificationsForResponder('responder001');
        
        console.log('\n📦 Stored notifications check:');
        console.log(`   Total notifications for responder001: ${notifications.length}`);
        
        if (notifications.length > 0) {
            notifications.forEach((notif, i) => {
                console.log(`   ${i+1}. ${notif.title} (${notif.read ? 'Read' : 'Unread'})`);
            });
            console.log('\n🎉 SUCCESS: NotificationService is working correctly!');
        } else {
            console.log('\n❌ ISSUE: NotificationService did not store any notifications');
        }
        
    } catch (error) {
        console.error('❌ NotificationService test failed:', error);
    }
}

testNotificationServiceDirectly();
