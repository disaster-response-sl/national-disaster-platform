const { storeNotificationForResponder, getNotificationsForResponder } = require('./services/NotificationStore');

// Simple test of notification storage
console.log('🧪 TESTING NOTIFICATION STORE DIRECTLY\n');

// Test data
const testNotification = {
  type: 'SOS_ASSIGNMENT',
  title: '🚨 Test Emergency Assignment',
  message: 'Test notification for responder001',
  priority: 'critical',
  sosId: 'test123',
  data: {
    location: { lat: 6.9271, lng: 79.8612, address: 'Test Location' },
    emergencyType: 'test_emergency',
    citizenMessage: 'Test emergency message',
    assignedBy: 'admin001',
    notes: 'Test assignment notes',
    assignmentTime: new Date()
  }
};

// Store notification
console.log('📦 Storing test notification for responder001...');
storeNotificationForResponder('responder001', testNotification);

// Retrieve notifications
console.log('📥 Retrieving notifications for responder001...');
const notifications = getNotificationsForResponder('responder001');

console.log(`\n📊 Results:`);
console.log(`   Total notifications: ${notifications.length}`);
console.log(`   Unread count: ${notifications.filter(n => !n.read).length}`);

if (notifications.length > 0) {
  notifications.forEach((notification, index) => {
    console.log(`\n📬 Notification ${index + 1}:`);
    console.log(`   ID: ${notification.id}`);
    console.log(`   Title: ${notification.title}`);
    console.log(`   Message: ${notification.message}`);
    console.log(`   Priority: ${notification.priority}`);
    console.log(`   Read: ${notification.read ? 'Yes' : 'No'}`);
    console.log(`   Timestamp: ${new Date(notification.timestamp).toLocaleString()}`);
  });
}

console.log('\n✅ Notification store test completed!');
