const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { authenticateToken, requireResponder } = require('../../middleware/auth');
const { 
  getNotificationsForResponder,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} = require('../../services/NotificationStore');

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireResponder);

// GET /api/responder/notifications - Get all notifications for logged-in responder
router.get('/', async (req, res) => {
  try {
    const responderId = req.user.userId;
    
    // Get notifications for this responder
    const notifications = getNotificationsForResponder(responderId);
    
    // Sort by timestamp (newest first)
    const sortedNotifications = notifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    res.json({
      success: true,
      data: sortedNotifications,
      unreadCount: sortedNotifications.filter(n => !n.read).length
    });

  } catch (error) {
    console.error('[RESPONDER NOTIFICATIONS ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message
    });
  }
});

// PUT /api/responder/notifications/:id/read - Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const responderId = req.user.userId;
    
    const success = markNotificationAsRead(responderId, id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }
    
    res.json({
      success: true,
      message: "Notification marked as read"
    });

  } catch (error) {
    console.error('[MARK NOTIFICATION READ ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error marking notification as read",
      error: error.message
    });
  }
});

// PUT /api/responder/notifications/read-all - Mark all notifications as read
router.put('/read-all', async (req, res) => {
  try {
    const responderId = req.user.userId;
    
    const updatedCount = markAllNotificationsAsRead(responderId);
    
    res.json({
      success: true,
      message: "All notifications marked as read",
      data: { updatedCount }
    });

  } catch (error) {
    console.error('[MARK ALL READ ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error marking all notifications as read",
      error: error.message
    });
  }
});

// DELETE /api/responder/notifications/:id - Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const responderId = req.user.userId;
    
    const deletedNotification = deleteNotification(responderId, id);
    
    if (!deletedNotification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }
    
    res.json({
      success: true,
      message: "Notification deleted",
      data: deletedNotification
    });

  } catch (error) {
    console.error('[DELETE NOTIFICATION ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error deleting notification",
      error: error.message
    });
  }
});

module.exports = router;
