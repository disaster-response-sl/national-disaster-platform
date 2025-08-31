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
    const responderId = req.user.individualId;
    
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
    const responderId = req.user.individualId;
    
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
    const responderId = req.user.individualId;
    
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
    const responderId = req.user.individualId;
    
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

// GET /api/responder/assignments - Get all assigned SOS signals for logged-in responder
router.get('/assignments', async (req, res) => {
  try {
    const responderId = req.user.individualId;
    const SosSignal = require('../../models/SosSignal');
    
    // Get all SOS signals assigned to this responder
    const assignedSignals = await SosSignal.find({
      assigned_responder: responderId
    })
    .populate('proximity_signals', 'location priority status')
    .sort({ updated_at: -1 })
    .lean();
    
    // Calculate stats
    const stats = {
      totalAssigned: assignedSignals.length,
      active: assignedSignals.filter(s => ['acknowledged', 'responding'].includes(s.status)).length,
      resolved: assignedSignals.filter(s => s.status === 'resolved').length,
      resolvedToday: assignedSignals.filter(s => {
        const today = new Date().toDateString();
        const resolvedDate = new Date(s.updated_at).toDateString();
        return s.status === 'resolved' && resolvedDate === today;
      }).length
    };
    
    res.json({
      success: true,
      data: {
        signals: assignedSignals,
        stats: stats
      }
    });

  } catch (error) {
    console.error('[RESPONDER ASSIGNMENTS ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error fetching assignments",
      error: error.message
    });
  }
});

// PUT /api/responder/assignments/:id/status - Update status of assigned SOS signal
router.put('/assignments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const responderId = req.user.individualId;
    const SosSignal = require('../../models/SosSignal');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SOS signal ID"
      });
    }

    if (!['acknowledged', 'responding', 'resolved', 'false_alarm'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    // Find signal and verify it's assigned to this responder
    const sosSignal = await SosSignal.findOne({
      _id: id,
      assigned_responder: responderId
    });

    if (!sosSignal) {
      return res.status(404).json({
        success: false,
        message: "SOS signal not found or not assigned to you"
      });
    }

    // Update status and timestamps
    const previousStatus = sosSignal.status;
    sosSignal.status = status;

    if (status === 'responding' && !sosSignal.response_time) {
      sosSignal.response_time = new Date();
    }

    if (status === 'resolved' && !sosSignal.resolution_time) {
      sosSignal.resolution_time = new Date();
    }

    // Add status change note
    sosSignal.notes.push({
      responder_id: responderId,
      note: `Status changed from "${previousStatus}" to "${status}" by responder. ${notes || ''}`,
      timestamp: new Date()
    });

    await sosSignal.save();

    res.json({
      success: true,
      message: "SOS signal status updated successfully",
      data: sosSignal
    });

  } catch (error) {
    console.error('[RESPONDER STATUS UPDATE ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error updating SOS signal status",
      error: error.message
    });
  }
});

module.exports = router;
