// Simple in-memory notification storage
// In production, this would be a database collection

const notificationStore = new Map();

/**
 * Store notification for responder
 */
function storeNotificationForResponder(responderId, notification) {
  if (!notificationStore.has(responderId)) {
    notificationStore.set(responderId, []);
  }
  
  const responderNotifications = notificationStore.get(responderId);
  const mongoose = require('mongoose');
  
  responderNotifications.push({
    id: new mongoose.Types.ObjectId().toString(),
    ...notification,
    timestamp: new Date(),
    read: false
  });
  
  // Keep only last 50 notifications per responder
  if (responderNotifications.length > 50) {
    responderNotifications.splice(0, responderNotifications.length - 50);
  }
  
  console.log(`[IN-APP NOTIFICATION] Stored for responder ${responderId}:`, notification.title);
}

/**
 * Get notifications for responder
 */
function getNotificationsForResponder(responderId) {
  return notificationStore.get(responderId) || [];
}

/**
 * Mark notification as read
 */
function markNotificationAsRead(responderId, notificationId) {
  const notifications = notificationStore.get(responderId) || [];
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    return true;
  }
  return false;
}

/**
 * Mark all notifications as read for responder
 */
function markAllNotificationsAsRead(responderId) {
  const notifications = notificationStore.get(responderId) || [];
  notifications.forEach(notification => {
    notification.read = true;
  });
  return notifications.length;
}

/**
 * Delete notification
 */
function deleteNotification(responderId, notificationId) {
  const notifications = notificationStore.get(responderId) || [];
  const notificationIndex = notifications.findIndex(n => n.id === notificationId);
  if (notificationIndex !== -1) {
    const deletedNotification = notifications.splice(notificationIndex, 1)[0];
    return deletedNotification;
  }
  return null;
}

module.exports = {
  storeNotificationForResponder,
  getNotificationsForResponder,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
};
