const express = require('express');
const mongoose = require('mongoose');
const SosSignal = require('../../models/SosSignal');
const Disaster = require('../../models/Disaster');
const { authenticateToken, requireResponder } = require('../../middleware/auth');
const notificationService = require('../../services/NotificationService');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireResponder);

// Utility function to calculate distance between two coordinates (in km)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Utility function to generate cluster ID
function generateClusterId() {
  return 'cluster_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// GET /api/admin/sos/dashboard - Real-time SOS dashboard feed
router.get('/dashboard', async (req, res) => {
  try {
    console.log('[SOS DASHBOARD] Request received from user:', req.user?.role, req.user?.individualId);
    console.log('[SOS DASHBOARD] Query params:', req.query);
    
    const {
      status = 'all',
      priority = 'all',
      limit = 50,
      page = 1,
      sortBy = 'created_at',
      sortOrder = 'desc',
      timeRange = '24h'
    } = req.query;

    // Build query filters
    let query = {};
    
    if (status && status !== 'all' && status !== '') {
      query.status = status;
    }
    
    if (priority && priority !== 'all' && priority !== '') {
      query.priority = priority;
    }

    // Time range filter
    if (timeRange !== 'all') {
      const now = new Date();
      let timeFilter = new Date();
      
      switch (timeRange) {
        case '1h':
          timeFilter.setTime(now.getTime() - (1 * 60 * 60 * 1000));
          break;
        case '6h':
          timeFilter.setTime(now.getTime() - (6 * 60 * 60 * 1000));
          break;
        case '24h':
          timeFilter.setTime(now.getTime() - (24 * 60 * 60 * 1000));
          break;
        case '7d':
          timeFilter.setTime(now.getTime() - (7 * 24 * 60 * 60 * 1000));
          break;
        default:
          timeFilter = null;
      }
      
      if (timeFilter) {
        query.created_at = { $gte: timeFilter };
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with population
    const sosSignals = await SosSignal.find(query)
      .populate('proximity_signals', 'location priority status')
      .sort(sortConfig)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalCount = await SosSignal.countDocuments(query);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    // Get summary statistics
    const stats = await SosSignal.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          acknowledged: { $sum: { $cond: [{ $eq: ['$status', 'acknowledged'] }, 1, 0] } },
          responding: { $sum: { $cond: [{ $eq: ['$status', 'responding'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          critical: { $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          escalated: { $sum: { $cond: [{ $gt: ['$escalation_level', 0] }, 1, 0] } }
        }
      }
    ]);

    console.log('[SOS DASHBOARD] Query built:', JSON.stringify(query));
    console.log('[SOS DASHBOARD] Signals found:', sosSignals.length);
    console.log('[SOS DASHBOARD] Total count:', totalCount);
    console.log('[SOS DASHBOARD] Stats:', stats[0]);

    res.json({
      success: true,
      data: {
        signals: sosSignals,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        },
        stats: stats[0] || {
          total: 0, pending: 0, acknowledged: 0, responding: 0, resolved: 0,
          critical: 0, high: 0, escalated: 0
        },
        filters: { status, priority, timeRange, sortBy, sortOrder }
      }
    });

  } catch (error) {
    console.error('[SOS DASHBOARD ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error fetching SOS dashboard data",
      error: error.message
    });
  }
});

// GET /api/admin/sos/clusters - Geographic clusters analysis
router.get('/clusters', async (req, res) => {
  try {
    const { radius = 2 } = req.query; // Default 2km radius
    
    // Get all active SOS signals
    const activeSosSignals = await SosSignal.find({
      status: { $in: ['pending', 'acknowledged', 'responding'] }
    }).lean();

    const clusters = [];
    const processedSignals = new Set();

    for (const signal of activeSosSignals) {
      if (processedSignals.has(signal._id.toString())) continue;

      const cluster = {
        id: generateClusterId(),
        center: signal.location,
        signals: [signal],
        priority: signal.priority,
        status: 'active',
        radius: parseFloat(radius)
      };

      // Find nearby signals
      for (const otherSignal of activeSosSignals) {
        if (signal._id.toString() === otherSignal._id.toString()) continue;
        if (processedSignals.has(otherSignal._id.toString())) continue;

        const distance = calculateDistance(
          signal.location.lat,
          signal.location.lng,
          otherSignal.location.lat,
          otherSignal.location.lng
        );

        if (distance <= parseFloat(radius)) {
          cluster.signals.push(otherSignal);
          processedSignals.add(otherSignal._id.toString());
          
          // Update cluster priority to highest
          const priorities = ['low', 'medium', 'high', 'critical'];
          if (priorities.indexOf(otherSignal.priority) > priorities.indexOf(cluster.priority)) {
            cluster.priority = otherSignal.priority;
          }
        }
      }

      processedSignals.add(signal._id.toString());
      
      // Calculate cluster center if multiple signals
      if (cluster.signals.length > 1) {
        const totalLat = cluster.signals.reduce((sum, s) => sum + s.location.lat, 0);
        const totalLng = cluster.signals.reduce((sum, s) => sum + s.location.lng, 0);
        cluster.center = {
          lat: totalLat / cluster.signals.length,
          lng: totalLng / cluster.signals.length
        };
      }

      clusters.push(cluster);
    }

    // Sort clusters by signal count (descending) and priority
    clusters.sort((a, b) => {
      const priorities = { critical: 4, high: 3, medium: 2, low: 1 };
      if (priorities[b.priority] !== priorities[a.priority]) {
        return priorities[b.priority] - priorities[a.priority];
      }
      return b.signals.length - a.signals.length;
    });

    res.json({
      success: true,
      data: {
        clusters,
        summary: {
          totalClusters: clusters.length,
          totalSignals: activeSosSignals.length,
          clusteredSignals: processedSignals.size,
          averageClusterSize: clusters.length ? 
            (processedSignals.size / clusters.length).toFixed(1) : 0,
          criticalClusters: clusters.filter(c => c.priority === 'critical').length,
          highPriorityClusters: clusters.filter(c => c.priority === 'high').length
        }
      }
    });

  } catch (error) {
    console.error('[SOS CLUSTERS ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error analyzing SOS clusters",
      error: error.message
    });
  }
});

// PUT /api/admin/sos/:id/assign - Assign responder to SOS signal
router.put('/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { responder_id, notes } = req.body;
    const adminId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SOS signal ID"
      });
    }

    const sosSignal = await SosSignal.findById(id);
    if (!sosSignal) {
      return res.status(404).json({
        success: false,
        message: "SOS signal not found"
      });
    }

    // Update signal
    sosSignal.assigned_responder = responder_id;
    sosSignal.status = 'acknowledged';
    sosSignal.updated_at = new Date();
    
    if (notes) {
      sosSignal.notes.push({
        responder_id: adminId,
        note: `Assigned to responder: ${responder_id}. ${notes}`,
        timestamp: new Date()
      });
    }

    await sosSignal.save();

    // Send notifications to the assigned responder
    const notificationResult = await notificationService.notifyResponderAssignment(
      sosSignal,
      responder_id,
      `${req.user.role} ${req.user.userId}`,
      notes
    );

    console.log('[SOS ASSIGN] Notification result:', notificationResult);

    res.json({
      success: true,
      message: "Responder assigned successfully",
      data: sosSignal,
      notifications: notificationResult
    });

  } catch (error) {
    console.error('[SOS ASSIGN ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error assigning responder",
      error: error.message
    });
  }
});

// PUT /api/admin/sos/:id/status - Update SOS signal status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, response_time } = req.body;
    const adminId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SOS signal ID"
      });
    }

    if (!['pending', 'acknowledged', 'responding', 'resolved', 'false_alarm'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    const sosSignal = await SosSignal.findById(id);
    if (!sosSignal) {
      return res.status(404).json({
        success: false,
        message: "SOS signal not found"
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
    const statusNote = `Status changed from "${previousStatus}" to "${status}"`;
    sosSignal.notes.push({
      responder_id: adminId,
      note: notes ? `${statusNote}. ${notes}` : statusNote,
      timestamp: new Date()
    });

    await sosSignal.save();

    // Send status update notification
    await notificationService.notifyStatusUpdate(
      sosSignal,
      previousStatus,
      status,
      `${req.user.role} ${req.user.userId}`
    );

    res.json({
      success: true,
      message: "SOS signal status updated successfully",
      data: sosSignal
    });

  } catch (error) {
    console.error('[SOS STATUS UPDATE ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error updating SOS signal status",
      error: error.message
    });
  }
});

// GET /api/admin/sos/:id/details - Get detailed SOS signal information
router.get('/:id/details', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SOS signal ID"
      });
    }

    const sosSignal = await SosSignal.findById(id)
      .populate('proximity_signals', 'location priority status message created_at')
      .lean();

    if (!sosSignal) {
      return res.status(404).json({
        success: false,
        message: "SOS signal not found"
      });
    }

    // Calculate response metrics
    const metrics = {};
    if (sosSignal.response_time && sosSignal.created_at) {
      metrics.responseTime = Math.round((sosSignal.response_time - sosSignal.created_at) / (1000 * 60)); // minutes
    }
    if (sosSignal.resolution_time && sosSignal.created_at) {
      metrics.resolutionTime = Math.round((sosSignal.resolution_time - sosSignal.created_at) / (1000 * 60)); // minutes
    }

    res.json({
      success: true,
      data: {
        ...sosSignal,
        metrics
      }
    });

  } catch (error) {
    console.error('[SOS DETAILS ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error fetching SOS signal details",
      error: error.message
    });
  }
});

// POST /api/admin/sos/:id/escalate - Manual escalation
router.post('/:id/escalate', async (req, res) => {
  try {
    const { id } = req.params;
    const { escalation_level, reason } = req.body;
    const adminId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SOS signal ID"
      });
    }

    if (!escalation_level || escalation_level < 0 || escalation_level > 2) {
      return res.status(400).json({
        success: false,
        message: "Invalid escalation level (0-2)"
      });
    }

    const sosSignal = await SosSignal.findById(id);
    if (!sosSignal) {
      return res.status(404).json({
        success: false,
        message: "SOS signal not found"
      });
    }

    // Update escalation
    const previousLevel = sosSignal.escalation_level;
    sosSignal.escalation_level = escalation_level;
    if (escalation_level > 0 && !sosSignal.auto_escalated_at) {
      sosSignal.auto_escalated_at = new Date();
    }

    // Auto-upgrade priority for high escalations
    if (escalation_level === 2 && sosSignal.priority !== 'critical') {
      sosSignal.priority = 'critical';
    } else if (escalation_level === 1 && ['low', 'medium'].includes(sosSignal.priority)) {
      sosSignal.priority = 'high';
    }

    // Add escalation note
    sosSignal.notes.push({
      responder_id: adminId,
      note: `Manually escalated to level ${escalation_level}. Reason: ${reason || 'No reason provided'}`,
      timestamp: new Date()
    });

    await sosSignal.save();

    // Send escalation notification
    await notificationService.notifyEscalation(
      sosSignal,
      previousLevel,
      escalation_level,
      `${req.user.role} ${req.user.userId}`
    );

    res.json({
      success: true,
      message: "SOS signal escalated successfully",
      data: sosSignal
    });

  } catch (error) {
    console.error('[SOS ESCALATE ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error escalating SOS signal",
      error: error.message
    });
  }
});

// GET /api/admin/sos/analytics - SOS analytics and metrics
router.get('/analytics', async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    
    // Time range filter
    const now = new Date();
    let timeFilter = new Date();
    
    switch (timeRange) {
      case '1h':
        timeFilter.setHours(now.getHours() - 1);
        break;
      case '6h':
        timeFilter.setHours(now.getHours() - 6);
        break;
      case '24h':
        timeFilter.setDate(now.getDate() - 1);
        break;
      case '7d':
        timeFilter.setDate(now.getDate() - 7);
        break;
      case '30d':
        timeFilter.setMonth(now.getMonth() - 1);
        break;
      default:
        timeFilter = new Date(0); // Beginning of time
    }

    // Aggregate analytics
    const analytics = await SosSignal.aggregate([
      { $match: { created_at: { $gte: timeFilter } } },
      {
        $group: {
          _id: null,
          totalSignals: { $sum: 1 },
          resolvedSignals: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          averageResponseTime: {
            $avg: {
              $cond: [
                { $and: [{ $ne: ['$response_time', null] }, { $ne: ['$created_at', null] }] },
                { $divide: [{ $subtract: ['$response_time', '$created_at'] }, 1000 * 60] }, // minutes
                null
              ]
            }
          },
          averageResolutionTime: {
            $avg: {
              $cond: [
                { $and: [{ $ne: ['$resolution_time', null] }, { $ne: ['$created_at', null] }] },
                { $divide: [{ $subtract: ['$resolution_time', '$created_at'] }, 1000 * 60] }, // minutes
                null
              ]
            }
          },
          priorityBreakdown: {
            $push: '$priority'
          },
          statusBreakdown: {
            $push: '$status'
          },
          escalatedCount: { $sum: { $cond: [{ $gt: ['$escalation_level', 0] }, 1, 0] } }
        }
      }
    ]);

    // Priority distribution
    const priorityStats = await SosSignal.aggregate([
      { $match: { created_at: { $gte: timeFilter } } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Status distribution
    const statusStats = await SosSignal.aggregate([
      { $match: { created_at: { $gte: timeFilter } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Hourly trends
    const hourlyTrends = await SosSignal.aggregate([
      { $match: { created_at: { $gte: timeFilter } } },
      {
        $group: {
          _id: { $hour: '$created_at' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const result = {
      summary: analytics[0] || {
        totalSignals: 0,
        resolvedSignals: 0,
        averageResponseTime: 0,
        averageResolutionTime: 0,
        escalatedCount: 0
      },
      priorityDistribution: priorityStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      statusDistribution: statusStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      hourlyTrends: hourlyTrends.map(item => ({
        hour: item._id,
        count: item.count
      })),
      timeRange
    };

    // Calculate resolution rate
    if (result.summary.totalSignals > 0) {
      result.summary.resolutionRate = (
        (result.summary.resolvedSignals / result.summary.totalSignals) * 100
      ).toFixed(1);
    } else {
      result.summary.resolutionRate = 0;
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('[SOS ANALYTICS ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error generating SOS analytics",
      error: error.message
    });
  }
});

module.exports = router;
