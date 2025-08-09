const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Disaster = require('../models/Disaster');
const SosSignal = require('../models/SosSignal');
const Resource = require('../models/Resource');

// Get all SOS signals with geographic data for map visualization
router.get('/sos', async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      startDate, 
      endDate,
      bounds, // { north, south, east, west }
      limit = 1000 
    } = req.query;

    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.created_at = {};
      if (startDate) query.created_at.$gte = new Date(startDate);
      if (endDate) query.created_at.$lte = new Date(endDate);
    }

    // Filter by geographic bounds
    if (bounds) {
      const [south, west, north, east] = bounds.split(',').map(parseFloat);
      query['location.lat'] = { $gte: south, $lte: north };
      query['location.lng'] = { $gte: west, $lte: east };
    }

    const sosSignals = await SosSignal.find(query)
      .select('location status priority message created_at user_info')
      .limit(parseInt(limit))
      .sort({ created_at: -1 });

    res.json({
      success: true,
      data: sosSignals,
      count: sosSignals.length
    });

  } catch (error) {
    console.error('Error fetching SOS signals for map:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching SOS signals for map visualization',
      error: error.message
    });
  }
});

// Get safe zones for map visualization
router.get('/safe-zones', async (req, res) => {
  try {
    const { 
      status, 
      capacity_min,
      bounds
    } = req.query;

    // Mock safe zones data - in production, you'd fetch from database
    let safeZones = [
      {
        id: 'sz001',
        name: 'Colombo Community Center',
        location: {
          lat: 6.9271,
          lng: 79.8612,
          address: 'Colombo Community Center, Colombo 01'
        },
        capacity: 500,
        current_occupancy: 45,
        status: 'active',
        facilities: ['shelter', 'water', 'food', 'medical'],
        contact: '+94112345678'
      },
      {
        id: 'sz002',
        name: 'Kandy Sports Complex',
        location: {
          lat: 7.2906,
          lng: 80.6337,
          address: 'Kandy Sports Complex, Kandy'
        },
        capacity: 300,
        current_occupancy: 120,
        status: 'active',
        facilities: ['shelter', 'water', 'medical'],
        contact: '+94812345678'
      },
      {
        id: 'sz003',
        name: 'Galle Emergency Center',
        location: {
          lat: 6.0535,
          lng: 80.2210,
          address: 'Galle Emergency Center, Galle'
        },
        capacity: 200,
        current_occupancy: 0,
        status: 'maintenance',
        facilities: ['shelter', 'water'],
        contact: '+94912345678'
      },
      {
        id: 'sz004',
        name: 'Jaffna Relief Station',
        location: {
          lat: 9.6615,
          lng: 80.0255,
          address: 'Jaffna Relief Station, Jaffna'
        },
        capacity: 400,
        current_occupancy: 30,
        status: 'active',
        facilities: ['shelter', 'water', 'food'],
        contact: '+94212345678'
      }
    ];

    // Apply filters
    if (status) {
      safeZones = safeZones.filter(zone => zone.status === status);
    }

    if (capacity_min) {
      safeZones = safeZones.filter(zone => zone.capacity >= parseInt(capacity_min));
    }

    if (bounds) {
      const [south, west, north, east] = bounds.split(',').map(parseFloat);
      safeZones = safeZones.filter(zone => 
        zone.location.lat >= south && zone.location.lat <= north &&
        zone.location.lng >= west && zone.location.lng <= east
      );
    }

    res.json({
      success: true,
      data: safeZones,
      count: safeZones.length,
      summary: {
        total_capacity: safeZones.reduce((sum, zone) => sum + zone.capacity, 0),
        total_occupancy: safeZones.reduce((sum, zone) => sum + zone.current_occupancy, 0),
        available_spaces: safeZones.reduce((sum, zone) => sum + (zone.capacity - zone.current_occupancy), 0)
      }
    });

  } catch (error) {
    console.error('Error fetching safe zones for map:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching safe zones for map visualization',
      error: error.message
    });
  }
});

// Get resources with geographic data for map visualization
router.get('/resources', async (req, res) => {
  try {
    const { 
      type, 
      status, 
      availability,
      bounds,
      limit = 1000 
    } = req.query;

    let query = {};

    // Filter by resource type
    if (type) {
      query.type = type;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by availability
    if (availability) {
      if (availability === 'available') {
        query.quantity = { $gt: 0 };
      } else if (availability === 'depleted') {
        query.quantity = 0;
      }
    }

    // Filter by geographic bounds
    if (bounds) {
      const [south, west, north, east] = bounds.split(',').map(parseFloat);
      query['location.lat'] = { $gte: south, $lte: north };
      query['location.lng'] = { $gte: west, $lte: east };
    }

    const resources = await Resource.find(query)
      .select('name type quantity location status supplier priority expiry_date created_at')
      .limit(parseInt(limit))
      .sort({ priority: -1, created_at: -1 });

    // Group resources by location for better map visualization
    const locationGroups = {};
    resources.forEach(resource => {
      if (resource.location && resource.location.lat && resource.location.lng) {
        const key = `${resource.location.lat.toFixed(4)},${resource.location.lng.toFixed(4)}`;
        if (!locationGroups[key]) {
          locationGroups[key] = {
            location: resource.location,
            resources: [],
            total_items: 0,
            types: new Set(),
            priorities: new Set()
          };
        }
        locationGroups[key].resources.push(resource);
        locationGroups[key].total_items += resource.quantity || 0;
        locationGroups[key].types.add(resource.type);
        locationGroups[key].priorities.add(resource.priority);
      }
    });

    // Convert sets to arrays for JSON response
    const locationData = Object.values(locationGroups).map(group => ({
      ...group,
      types: Array.from(group.types),
      priorities: Array.from(group.priorities),
      resource_count: group.resources.length
    }));

    res.json({
      success: true,
      data: {
        individual_resources: resources,
        location_groups: locationData
      },
      count: resources.length,
      summary: {
        total_resources: resources.length,
        total_quantity: resources.reduce((sum, r) => sum + (r.quantity || 0), 0),
        locations: locationData.length,
        available_items: resources.filter(r => r.quantity > 0).length
      }
    });

  } catch (error) {
    console.error('Error fetching resources for map:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resources for map visualization',
      error: error.message
    });
  }
});

// Get all reports with geographic data for map visualization
router.get('/reports', async (req, res) => {
  try {
    const { 
      status, 
      type, 
      priority, 
      startDate, 
      endDate,
      bounds, // { north, south, east, west }
      limit = 1000 
    } = req.query;

    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by report type
    if (type) {
      query.type = type;
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Filter by geographic bounds
    if (bounds) {
      query['location.lat'] = { $gte: parseFloat(bounds.south), $lte: parseFloat(bounds.north) };
      query['location.lng'] = { $gte: parseFloat(bounds.west), $lte: parseFloat(bounds.east) };
    }

    const reports = await Report.find(query)
      .select('location type status priority description timestamp affected_people resource_requirements')
      .limit(parseInt(limit))
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      data: reports,
      count: reports.length
    });

  } catch (error) {
    console.error('Error fetching reports for map:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports for map visualization',
      error: error.message
    });
  }
});

// Get heatmap data aggregated by geographic areas
router.get('/heatmap', async (req, res) => {
  try {
    const { 
      type, 
      status, 
      priority,
      startDate, 
      endDate,
      gridSize = 0.01 // Default grid size for aggregation
    } = req.query;

    let matchQuery = {};
    const numericGridSize = parseFloat(gridSize);

    // Apply filters
    if (type) matchQuery.type = type;
    if (status) matchQuery.status = status;
    if (priority) matchQuery.priority = priority;
    if (startDate || endDate) {
      matchQuery.timestamp = {};
      if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
      if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
    }

    const heatmapData = await Report.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            lat: { $round: [{ $multiply: ['$location.lat', 1/numericGridSize] }, 0] },
            lng: { $round: [{ $multiply: ['$location.lng', 1/numericGridSize] }, 0] }
          },
          count: { $sum: 1 },
          totalAffected: { $sum: '$affected_people' },
          avgPriority: { $avg: { $cond: [
            { $eq: ['$priority', 'critical'] }, 4,
            { $cond: [{ $eq: ['$priority', 'high'] }, 3,
            { $cond: [{ $eq: ['$priority', 'medium'] }, 2, 1] }] }
          ]}},
          types: { $addToSet: '$type' },
          statuses: { $addToSet: '$status' },
          centerLat: { $avg: '$location.lat' },
          centerLng: { $avg: '$location.lng' }
        }
      },
      {
        $project: {
          _id: 0,
          lat: '$centerLat',
          lng: '$centerLng',
          count: 1,
          totalAffected: 1,
          avgPriority: 1,
          types: 1,
          statuses: 1,
          intensity: { $multiply: ['$count', '$avgPriority'] }
        }
      },
      { $sort: { intensity: -1 } }
    ]);

    res.json({
      success: true,
      data: heatmapData,
      gridSize: parseFloat(gridSize)
    });

  } catch (error) {
    console.error('Error generating heatmap data:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating heatmap data',
      error: error.message
    });
  }
});

// Get resource requirement analysis by geographic areas
router.get('/resource-analysis', async (req, res) => {
  try {
    const { 
      type, 
      status, 
      startDate, 
      endDate,
      bounds 
    } = req.query;

    let matchQuery = {};

    // Apply filters
    if (type) matchQuery.type = type;
    if (status) matchQuery.status = status;
    if (startDate || endDate) {
      matchQuery.timestamp = {};
      if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
      if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
    }

    // Filter by geographic bounds
    if (bounds) {
      matchQuery['location.lat'] = { $gte: parseFloat(bounds.south), $lte: parseFloat(bounds.north) };
      matchQuery['location.lng'] = { $gte: parseFloat(bounds.west), $lte: parseFloat(bounds.east) };
    }

    const resourceAnalysis = await Report.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            lat: { $round: ['$location.lat', 2] },
            lng: { $round: ['$location.lng', 2] }
          },
          totalReports: { $sum: 1 },
          totalAffected: { $sum: '$affected_people' },
          foodRequired: { $sum: '$resource_requirements.food' },
          waterRequired: { $sum: '$resource_requirements.water' },
          medicalSuppliesRequired: { $sum: '$resource_requirements.medical_supplies' },
          shelterRequired: { $sum: '$resource_requirements.shelter' },
          transportationRequired: { $sum: '$resource_requirements.transportation' },
          personnelRequired: { $sum: '$resource_requirements.personnel' },
          pendingReports: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          addressedReports: { $sum: { $cond: [{ $eq: ['$status', 'addressed'] }, 1, 0] } },
          criticalReports: { $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] } },
          centerLat: { $avg: '$location.lat' },
          centerLng: { $avg: '$location.lng' }
        }
      },
      {
        $project: {
          _id: 0,
          lat: '$centerLat',
          lng: '$centerLng',
          totalReports: 1,
          totalAffected: 1,
          resources: {
            food: '$foodRequired',
            water: '$waterRequired',
            medicalSupplies: '$medicalSuppliesRequired',
            shelter: '$shelterRequired',
            transportation: '$transportationRequired',
            personnel: '$personnelRequired'
          },
          status: {
            pending: '$pendingReports',
            addressed: '$addressedReports'
          },
          criticalReports: 1,
          urgencyScore: { 
            $add: [
              { $multiply: ['$criticalReports', 10] },
              { $multiply: ['$pendingReports', 5] },
              '$totalAffected'
            ]
          }
        }
      },
      { $sort: { urgencyScore: -1 } }
    ]);

    res.json({
      success: true,
      data: resourceAnalysis,
      summary: {
        totalAreas: resourceAnalysis.length,
        totalReports: resourceAnalysis.reduce((sum, area) => sum + area.totalReports, 0),
        totalAffected: resourceAnalysis.reduce((sum, area) => sum + area.totalAffected, 0),
        totalCritical: resourceAnalysis.reduce((sum, area) => sum + area.criticalReports, 0)
      }
    });

  } catch (error) {
    console.error('Error generating resource analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating resource analysis',
      error: error.message
    });
  }
});

// Get statistics for dashboard filters
router.get('/statistics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    const stats = await Report.aggregate([
      { $match: dateFilter },
      {
        $facet: {
          byType: [
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          byPriority: [
            { $group: { _id: '$priority', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          totalReports: [{ $count: 'count' }],
          totalAffected: [{ $group: { _id: null, total: { $sum: '$affected_people' } } }],
          geographicSpread: [
            { $group: { _id: { lat: { $round: ['$location.lat', 1] }, lng: { $round: ['$location.lng', 1] } }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byType: stats[0].byType,
        byStatus: stats[0].byStatus,
        byPriority: stats[0].byPriority,
        totalReports: stats[0].totalReports[0]?.count || 0,
        totalAffected: stats[0].totalAffected[0]?.total || 0,
        geographicSpread: stats[0].geographicSpread
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// Get disasters with geographic data
router.get('/disasters', async (req, res) => {
  try {
    const { status, type, severity } = req.query;

    let query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (severity) query.severity = severity;

    const disasters = await Disaster.find(query)
      .select('location type severity description timestamp status')
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      data: disasters,
      count: disasters.length
    });

  } catch (error) {
    console.error('Error fetching disasters:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching disasters',
      error: error.message
    });
  }
});

module.exports = router;

