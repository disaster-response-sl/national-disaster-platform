const express = require('express');
const router = express.Router();
const Disaster = require('../../models/Disaster');
const Report = require('../../models/Report');
const SosSignal = require('../../models/SosSignal');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');

// GET /api/admin/analytics/reports - Reports analytics
router.get('/reports', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { timeframe = 30 } = req.query;
    const cutoffDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);

    const [reportStats, typeDistribution, priorityDistribution] = await Promise.all([
      Report.aggregate([
        { $match: { timestamp: { $gte: cutoffDate } } },
        {
          $group: {
            _id: null,
            total_reports: { $sum: 1 },
            pending_reports: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            addressed_reports: { $sum: { $cond: [{ $eq: ['$status', 'addressed'] }, 1, 0] } },
            average_affected: { $avg: '$affected_people' }
          }
        }
      ]),
      Report.aggregate([
        { $match: { timestamp: { $gte: cutoffDate } } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Report.aggregate([
        { $match: { timestamp: { $gte: cutoffDate } } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: reportStats[0] || {
          total_reports: 0,
          pending_reports: 0,
          addressed_reports: 0,
          average_affected: 0
        },
        type_distribution: typeDistribution,
        priority_distribution: priorityDistribution,
        timeframe_days: timeframe
      }
    });
  } catch (error) {
    console.error('Reports analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/admin/analytics/heatmap - Report heatmap data
router.get('/heatmap', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { timeframe = 30, type } = req.query;
    const cutoffDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);

    let query = { timestamp: { $gte: cutoffDate } };
    if (type) {
      query.type = type;
    }

    const heatmapData = await Report.find(query)
      .select('location.lat location.lng type priority affected_people timestamp')
      .lean();

    // Group by location clusters
    const clusters = {};
    const clusterRadius = 0.01; // ~1km

    heatmapData.forEach(report => {
      if (!report.location || !report.location.lat || !report.location.lng) return;

      const lat = Math.round(report.location.lat / clusterRadius) * clusterRadius;
      const lng = Math.round(report.location.lng / clusterRadius) * clusterRadius;
      const key = `${lat},${lng}`;

      if (!clusters[key]) {
        clusters[key] = {
          lat: lat,
          lng: lng,
          reports: [],
          intensity: 0,
          types: {},
          total_affected: 0
        };
      }

      clusters[key].reports.push(report);
      clusters[key].intensity += 1;
      clusters[key].total_affected += report.affected_people || 0;
      clusters[key].types[report.type] = (clusters[key].types[report.type] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        clusters: Object.values(clusters),
        total_reports: heatmapData.length,
        timeframe_days: timeframe
      }
    });
  } catch (error) {
    console.error('Heatmap error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/admin/analytics/dashboard - Dashboard overview
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [disasters, reports, sosSignals] = await Promise.all([
      Disaster.aggregate([
        {
          $facet: {
            active: [
              { $match: { status: 'active' } },
              { $count: 'count' }
            ],
            recent: [
              { $match: { createdAt: { $gte: last24h } } },
              { $count: 'count' }
            ],
            total: [
              { $count: 'count' }
            ]
          }
        }
      ]),
      Report.aggregate([
        {
          $facet: {
            pending: [
              { $match: { status: 'pending' } },
              { $count: 'count' }
            ],
            recent: [
              { $match: { timestamp: { $gte: last24h } } },
              { $count: 'count' }
            ]
          }
        }
      ]),
      SosSignal.aggregate([
        {
          $facet: {
            active: [
              { $match: { status: { $in: ['pending', 'acknowledged', 'responding'] } } },
              { $count: 'count' }
            ],
            recent: [
              { $match: { created_at: { $gte: last24h } } },
              { $count: 'count' }
            ]
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        disasters: {
          active: disasters[0].active[0]?.count || 0,
          recent_24h: disasters[0].recent[0]?.count || 0,
          total: disasters[0].total[0]?.count || 0
        },
        reports: {
          pending: reports[0].pending[0]?.count || 0,
          recent_24h: reports[0].recent[0]?.count || 0
        },
        sos_signals: {
          active: sosSignals[0].active[0]?.count || 0,
          recent_24h: sosSignals[0].recent[0]?.count || 0
        },
        last_updated: now
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/admin/analytics/predictions - Prediction models
router.get('/predictions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Mock prediction data - in real implementation this would use ML models
    const predictions = {
      disaster_likelihood: {
        next_7_days: {
          flood: { probability: 0.15, confidence: 0.7 },
          landslide: { probability: 0.08, confidence: 0.6 },
          cyclone: { probability: 0.05, confidence: 0.8 }
        },
        next_30_days: {
          flood: { probability: 0.35, confidence: 0.6 },
          landslide: { probability: 0.20, confidence: 0.5 },
          cyclone: { probability: 0.15, confidence: 0.7 }
        }
      },
      resource_demand: {
        medical_supplies: { predicted_need: 850, confidence: 0.75 },
        food: { predicted_need: 2500, confidence: 0.80 },
        water: { predicted_need: 5000, confidence: 0.85 }
      },
      high_risk_areas: [
        { area: 'Colombo District', risk_score: 0.8, primary_threat: 'flood' },
        { area: 'Kandy District', risk_score: 0.6, primary_threat: 'landslide' },
        { area: 'Galle District', risk_score: 0.5, primary_threat: 'cyclone' }
      ]
    };

    res.json({
      success: true,
      data: predictions,
      generated_at: new Date(),
      note: 'Prediction models running in mock mode'
    });
  } catch (error) {
    console.error('Predictions error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/admin/analytics/statistics - Dashboard statistics
router.get('/statistics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get comprehensive statistics
    const stats = await Disaster.aggregate([
      { $match: dateFilter },
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          byType: [
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          bySeverity: [
            { $group: { _id: '$severity', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          byPriority: [
            { $group: { _id: '$priority_level', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          totalStats: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                totalAffectedPopulation: { 
                  $sum: { 
                    $reduce: {
                      input: '$zones',
                      initialValue: 0,
                      in: { $add: ['$$value', '$$this.estimated_population'] }
                    }
                  }
                },
                totalArea: {
                  $sum: { 
                    $reduce: {
                      input: '$zones',
                      initialValue: 0,
                      in: { $add: ['$$value', '$$this.area_km2'] }
                    }
                  }
                },
                avgDuration: { $avg: '$actual_duration' },
                totalResourcePersonnel: { $sum: '$resources_required.personnel' },
                totalResourceVehicles: { $sum: '$resources_required.vehicles' }
              }
            }
          ],
          recentActivity: [
            { $sort: { updatedAt: -1 } },
            { $limit: 10 },
            {
              $project: {
                disaster_code: 1,
                title: 1,
                status: 1,
                priority_level: 1,
                updatedAt: 1
              }
            }
          ],
          monthlyTrend: [
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' }
                },
                count: { $sum: 1 },
                criticalCount: { 
                  $sum: { 
                    $cond: [
                      { $in: ['$priority_level', ['critical', 'emergency']] },
                      1,
                      0
                    ]
                  }
                }
              }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
          ]
        }
      }
    ]);

    const result = stats[0];

    res.json({
      success: true,
      data: {
        overview: {
          total_disasters: result.totalStats[0]?.total || 0,
          total_affected_population: result.totalStats[0]?.totalAffectedPopulation || 0,
          total_area_km2: Math.round((result.totalStats[0]?.totalArea || 0) * 100) / 100,
          average_duration_hours: Math.round((result.totalStats[0]?.avgDuration || 0) * 100) / 100,
          total_personnel_required: result.totalStats[0]?.totalResourcePersonnel || 0,
          total_vehicles_required: result.totalStats[0]?.totalResourceVehicles || 0
        },
        by_status: result.byStatus,
        by_type: result.byType,
        by_severity: result.bySeverity,
        by_priority: result.byPriority,
        recent_activity: result.recentActivity,
        monthly_trend: result.monthlyTrend.reverse() // Show oldest to newest
      }
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/admin/disasters/timeline - Timeline view of disasters
router.get('/timeline', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, status, type, limit = 50 } = req.query;

    let query = {};
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    if (status) query.status = { $in: status.split(',') };
    if (type) query.type = { $in: type.split(',') };

    const timeline = await Disaster.find(query)
      .select('disaster_code title type severity status priority_level createdAt updatedAt total_affected_population')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Group by date for better visualization
    const groupedTimeline = timeline.reduce((acc, disaster) => {
      const date = disaster.createdAt.toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(disaster);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        timeline: groupedTimeline,
        total: timeline.length
      }
    });
  } catch (error) {
    console.error('Timeline error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/admin/disasters/zones-overlap - Check for overlapping zones
router.get('/zones-overlap', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const disasters = await Disaster.find({ 
      status: { $in: ['active', 'monitoring'] },
      zones: { $exists: true, $ne: [] }
    }).select('disaster_code title zones status priority_level');

    const overlaps = [];
    
    // Simple overlap detection - can be enhanced with proper GIS algorithms
    for (let i = 0; i < disasters.length; i++) {
      for (let j = i + 1; j < disasters.length; j++) {
        const disaster1 = disasters[i];
        const disaster2 = disasters[j];
        
        // Check for zone name overlaps or proximity
        for (const zone1 of disaster1.zones) {
          for (const zone2 of disaster2.zones) {
            // Simple name-based overlap detection
            if (zone1.zone_name.toLowerCase().includes(zone2.zone_name.toLowerCase()) ||
                zone2.zone_name.toLowerCase().includes(zone1.zone_name.toLowerCase())) {
              overlaps.push({
                disaster1: {
                  id: disaster1._id,
                  code: disaster1.disaster_code,
                  title: disaster1.title,
                  zone: zone1.zone_name,
                  priority: disaster1.priority_level
                },
                disaster2: {
                  id: disaster2._id,
                  code: disaster2.disaster_code,
                  title: disaster2.title,
                  zone: zone2.zone_name,
                  priority: disaster2.priority_level
                },
                overlap_type: 'zone_name_similarity',
                requires_attention: disaster1.priority_level === 'critical' || disaster2.priority_level === 'critical'
              });
            }
          }
        }
      }
    }

    res.json({
      success: true,
      data: {
        overlaps,
        total_overlaps: overlaps.length,
        critical_overlaps: overlaps.filter(o => o.requires_attention).length
      }
    });
  } catch (error) {
    console.error('Zone overlap check error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/admin/disasters/resource-summary - Resource requirements summary
router.get('/resource-summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status = 'active,monitoring' } = req.query;

    const resourceSummary = await Disaster.aggregate([
      { 
        $match: { 
          status: { $in: status.split(',') }
        }
      },
      {
        $group: {
          _id: null,
          total_disasters: { $sum: 1 },
          total_personnel: { $sum: '$resources_required.personnel' },
          total_rescue_teams: { $sum: '$resources_required.rescue_teams' },
          total_medical_units: { $sum: '$resources_required.medical_units' },
          total_vehicles: { $sum: '$resources_required.vehicles' },
          total_boats: { $sum: '$resources_required.boats' },
          total_helicopters: { $sum: '$resources_required.helicopters' },
          total_food_supplies: { $sum: '$resources_required.food_supplies' },
          total_water_supplies: { $sum: '$resources_required.water_supplies' },
          total_medical_supplies: { $sum: '$resources_required.medical_supplies' },
          total_temporary_shelters: { $sum: '$resources_required.temporary_shelters' },
          critical_disasters: {
            $sum: {
              $cond: [
                { $in: ['$priority_level', ['critical', 'emergency']] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = resourceSummary[0] || {};

    res.json({
      success: true,
      data: {
        summary: {
          total_active_disasters: result.total_disasters || 0,
          critical_disasters: result.critical_disasters || 0
        },
        personnel: {
          total_personnel: result.total_personnel || 0,
          rescue_teams: result.total_rescue_teams || 0,
          medical_units: result.total_medical_units || 0
        },
        equipment: {
          vehicles: result.total_vehicles || 0,
          boats: result.total_boats || 0,
          helicopters: result.total_helicopters || 0
        },
        supplies: {
          food_supplies_kg: result.total_food_supplies || 0,
          water_supplies_liters: result.total_water_supplies || 0,
          medical_supplies: result.total_medical_supplies || 0,
          temporary_shelters: result.total_temporary_shelters || 0
        }
      }
    });
  } catch (error) {
    console.error('Resource summary error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
