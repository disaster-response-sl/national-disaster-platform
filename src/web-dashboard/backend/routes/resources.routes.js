const express = require('express');
const Resource = require('../models/Resource');
const AIResourceOptimizer = require('../services/ai-resource-optimizer');
// AUTHENTICATION RESTORED FOR PRODUCTION
const { authenticateToken, requireAdmin, requireResponder } = require('../middleware/auth');

const router = express.Router();
const aiOptimizer = new AIResourceOptimizer();

// AI Allocation Service (Mock implementation)
class AIAllocationService {
  static calculateOptimalAllocation(resource, demandData) {
    // Mock AI logic for resource allocation
    const demand = demandData.totalDemand || 100;
    const available = resource.quantity.available;
    const priority = resource.priority;
    
    let allocation = Math.min(available, demand);
    
    // Adjust based on priority
    const priorityMultiplier = {
      'critical': 1.2,
      'high': 1.1,
      'medium': 1.0,
      'low': 0.9
    };
    
    allocation = Math.floor(allocation * (priorityMultiplier[priority] || 1.0));
    
    return {
      recommended_allocation: allocation,
      confidence_score: 0.85,
      risk_level: allocation > available * 0.8 ? 'high' : 'low',
      reasoning: `Based on demand analysis and resource priority (${priority})`
    };
  }
  
  static generateDeploymentRecommendations(resources, disasters) {
    // Mock AI recommendations for deployment
    return resources.map(resource => ({
      resource_id: resource._id,
      deployment_priority: Math.random() * 100,
      recommended_location: disasters[0]?.location || { lat: 6.9271, lng: 79.8612 },
      estimated_impact: Math.floor(Math.random() * 1000) + 100,
      deployment_window: '2-4 hours'
    })).sort((a, b) => b.deployment_priority - a.deployment_priority);
  }
}

// GET /api/resources - Get all resources with filtering and pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      type,
      category,
      status,
      priority,
      location,
      radius = 50, // km
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    let query = {};
    
    // Apply filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    // Geographic filtering
    if (location) {
      const [lat, lng] = location.split(',').map(Number);
      if (lat && lng) {
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            $maxDistance: radius * 1000 // Convert km to meters
          }
        };
      }
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
    };

    const resources = await Resource.find(query)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .exec();

    const total = await Resource.countDocuments(query);

    res.json({
      success: true,
      data: resources,
      pagination: {
        current_page: options.page,
        total_pages: Math.ceil(total / options.limit),
        total_items: total,
        items_per_page: options.limit
      }
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resources',
      error: error.message
    });
  }
});

// GET /api/resources/:id - Get specific resource
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resource',
      error: error.message
    });
  }
});

// POST /api/resources - Create new resource (Admin/Responder only)
router.post('/', authenticateToken, requireResponder, async (req, res) => {
  try {
    const resourceData = {
      ...req.body,
      // AUTHENTICATION RESTORED - USING REAL USER DATA
      created_by: req.user.individualId,
      updated_by: req.user.individualId
    };

    // Validate required fields with detailed error messages
    const requiredFields = ['name', 'type', 'category', 'quantity', 'location'];
    for (const field of requiredFields) {
      if (!resourceData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
          received_fields: Object.keys(req.body)
        });
      }
    }

    // Validate quantity structure
    if (typeof resourceData.quantity === 'object') {
      if (!resourceData.quantity.current || !resourceData.quantity.unit) {
        return res.status(400).json({
          success: false,
          message: 'quantity.current and quantity.unit are required',
          received_quantity: resourceData.quantity
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'quantity must be an object with current, unit, and optional allocated/reserved fields',
        received_quantity: resourceData.quantity
      });
    }

    // Validate location structure
    if (!resourceData.location.lat || !resourceData.location.lng) {
      return res.status(400).json({
        success: false,
        message: 'location must include lat and lng coordinates',
        received_location: resourceData.location
      });
    }

    // Ensure allocated and reserved are set to 0 if not provided
    if (!resourceData.quantity.allocated) resourceData.quantity.allocated = 0;
    if (!resourceData.quantity.reserved) resourceData.quantity.reserved = 0;

    const resource = new Resource(resourceData);
    await resource.save();

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: resource
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating resource',
      error: error.message,
      validation_errors: error.errors ? Object.keys(error.errors) : undefined
    });
  }
});

// PUT /api/resources/:id - Update resource (Admin/Responder only)
router.put('/:id', authenticateToken, requireResponder, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updated_by: req.user.individualId,
      updated_at: new Date()
    };

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: resource
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating resource',
      error: error.message
    });
  }
});

// DELETE /api/resources/:id - Delete resource (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting resource',
      error: error.message
    });
  }
});

// POST /api/resources/:id/allocate - Allocate resource to disaster
router.post('/:id/allocate', authenticateToken, requireResponder, async (req, res) => {
  try {
    const { quantity, disaster_id, location, estimated_duration } = req.body;

    if (!quantity || !disaster_id || !location) {
      return res.status(400).json({
        success: false,
        message: 'Quantity, disaster_id, and location are required'
      });
    }

    // Ensure quantity is a valid number
    const allocateQuantity = Number(quantity);
    if (isNaN(allocateQuantity) || allocateQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid positive number'
      });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if enough quantity is available
    const available = resource.quantity.current - resource.quantity.allocated - resource.quantity.reserved;
    if (allocateQuantity > available) {
      return res.status(400).json({
        success: false,
        message: `Insufficient quantity. Available: ${available}, Requested: ${allocateQuantity}`
      });
    }

    // Update allocation
    resource.quantity.allocated += allocateQuantity;
    
    // Add to deployment history
    resource.deployment_history.push({
      deployed_to: {
        disaster_id,
        location
      },
      quantity_deployed: allocateQuantity,
      deployed_by: req.user.individualId,
      estimated_duration: estimated_duration ? (typeof estimated_duration === 'string' ? parseFloat(estimated_duration) : estimated_duration) : null
    });

    // Update status if needed
    if (resource.quantity.current - resource.quantity.allocated <= 0) {
      resource.status = 'depleted';
    } else if (resource.status === 'available') {
      resource.status = 'dispatched';
    }

    await resource.save();

    res.json({
      success: true,
      message: 'Resource allocated successfully',
      data: {
        allocated_quantity: allocateQuantity,
        remaining_available: available - allocateQuantity,
        deployment_id: resource.deployment_history[resource.deployment_history.length - 1]._id
      }
    });
  } catch (error) {
    console.error('Error allocating resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error allocating resource',
      error: error.message
    });
  }
});

// POST /api/resources/:id/reserve - Reserve resource
router.post('/:id/reserve', authenticateToken, requireResponder, async (req, res) => {
  try {
    const { quantity, reason, reserved_until } = req.body;

    if (!quantity || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Quantity and reason are required'
      });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const available = resource.quantity.current - resource.quantity.allocated - resource.quantity.reserved;
    if (quantity > available) {
      return res.status(400).json({
        success: false,
        message: `Insufficient quantity for reservation. Available: ${available}, Requested: ${quantity}`
      });
    }

    resource.quantity.reserved += quantity;
    resource.status = 'reserved';

    await resource.save();

    res.json({
      success: true,
      message: 'Resource reserved successfully',
      data: {
        reserved_quantity: quantity,
        remaining_available: available - quantity,
        reserved_until: reserved_until || 'Not specified'
      }
    });
  } catch (error) {
    console.error('Error reserving resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error reserving resource',
      error: error.message
    });
  }
});

// GET /api/resources/inventory/summary - Get inventory summary
router.get('/inventory/summary', authenticateToken, async (req, res) => {
  try {
    const summary = await Resource.aggregate([
      {
        $group: {
          _id: {
            type: '$type',
            status: '$status'
          },
          total_quantity: { $sum: '$quantity.current' },
          allocated_quantity: { $sum: '$quantity.allocated' },
          reserved_quantity: { $sum: '$quantity.reserved' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          statuses: {
            $push: {
              status: '$_id.status',
              total_quantity: '$total_quantity',
              allocated_quantity: '$allocated_quantity',
              reserved_quantity: '$reserved_quantity',
              count: '$count'
            }
          },
          total_resources: { $sum: '$count' },
          total_quantity: { $sum: '$total_quantity' }
        }
      }
    ]);

    const overallStats = await Resource.aggregate([
      {
        $group: {
          _id: null,
          total_resources: { $sum: 1 },
          total_quantity: { $sum: '$quantity.current' },
          total_allocated: { $sum: '$quantity.allocated' },
          total_reserved: { $sum: '$quantity.reserved' },
          critical_resources: {
            $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] }
          },
          depleted_resources: {
            $sum: { $cond: [{ $eq: ['$status', 'depleted'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        by_type: summary,
        overall: overallStats[0] || {},
        last_updated: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory summary',
      error: error.message
    });
  }
});

// GET /api/resources/analytics/allocation - Get AI allocation recommendations
router.get('/analytics/allocation', authenticateToken, async (req, res) => {
  try {
    const { disaster_id, location, demand_type } = req.query;

    if (!disaster_id && !location) {
      return res.status(400).json({
        success: false,
        message: 'Either disaster_id or location is required'
      });
    }

    // Get available resources
    const resources = await Resource.find({
      status: { $in: ['available', 'dispatched'] },
      'quantity.current': { $gt: 0 }
    });

    // Mock demand data (in real implementation, this would come from analysis)
    const demandData = {
      totalDemand: 500,
      priority_breakdown: {
        critical: 200,
        high: 150,
        medium: 100,
        low: 50
      }
    };

    // Generate AI recommendations
    const recommendations = resources.map(resource => {
      const aiResult = AIAllocationService.calculateOptimalAllocation(resource, demandData);
      
      return {
        resource_id: resource._id,
        resource_name: resource.name,
        resource_type: resource.type,
        current_quantity: resource.quantity.current,
        available_quantity: resource.quantity.current - resource.quantity.allocated - resource.quantity.reserved,
        ai_recommendation: aiResult
      };
    });

    res.json({
      success: true,
      data: {
        demand_analysis: demandData,
        recommendations: recommendations,
        generated_at: new Date()
      }
    });
  } catch (error) {
    console.error('Error generating allocation recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating allocation recommendations',
      error: error.message
    });
  }
});

// GET /api/resources/supply-chain/status - Get supply chain status
router.get('/supply-chain/status', authenticateToken, async (req, res) => {
  try {
    const { status, vendor_id } = req.query;

    let query = {};
    if (status) query['supply_chain.procurement_status'] = status;
    if (vendor_id) query['supply_chain.vendor_id'] = vendor_id;

    const supplyChainStatus = await Resource.find(query)
      .select('name type supply_chain quantity location created_at')
      .sort({ 'supply_chain.last_updated': -1 });

    // Group by procurement status
    const statusSummary = await Resource.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$supply_chain.procurement_status',
          count: { $sum: 1 },
          total_quantity: { $sum: '$quantity.current' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        resources: supplyChainStatus,
        status_summary: statusSummary,
        last_updated: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching supply chain status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching supply chain status',
      error: error.message
    });
  }
});

// GET /api/resources/deployment/tracking - Get deployment tracking
router.get('/deployment/tracking', authenticateToken, async (req, res) => {
  try {
    const { disaster_id, status, start_date, end_date } = req.query;

    let query = { deployment_history: { $exists: true, $ne: [] } };
    
    // Build aggregation pipeline for deployment tracking
    let pipeline = [
      { $unwind: '$deployment_history' },
      { $match: {} }
    ];

    if (disaster_id) {
      pipeline[1].$match['deployment_history.deployed_to.disaster_id'] = disaster_id;
    }
    
    if (status) {
      pipeline[1].$match['deployment_history.status'] = status;
    }

    if (start_date || end_date) {
      pipeline[1].$match['deployment_history.deployed_at'] = {};
      if (start_date) pipeline[1].$match['deployment_history.deployed_at'].$gte = new Date(start_date);
      if (end_date) pipeline[1].$match['deployment_history.deployed_at'].$lte = new Date(end_date);
    }

    // Add grouping and projection stages
    pipeline.push(
      {
        $group: {
          _id: '$_id',
          resource_name: { $first: '$name' },
          resource_type: { $first: '$type' },
          deployments: { $push: '$deployment_history' },
          total_deployed: { $sum: '$deployment_history.quantity_deployed' }
        }
      },
      {
        $sort: { 'deployments.deployed_at': -1 }
      }
    );

    const deploymentTracking = await Resource.aggregate(pipeline);

    res.json({
      success: true,
      data: deploymentTracking,
      filters_applied: { disaster_id, status, start_date, end_date }
    });
  } catch (error) {
    console.error('Error fetching deployment tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching deployment tracking',
      error: error.message
    });
  }
});

// POST /api/resources/bulk/update-status - Bulk update resource status
router.post('/bulk/update-status', authenticateToken, requireResponder, async (req, res) => {
  try {
    const { resource_ids, new_status, reason } = req.body;

    if (!resource_ids || !Array.isArray(resource_ids) || !new_status) {
      return res.status(400).json({
        success: false,
        message: 'resource_ids array and new_status are required'
      });
    }

    const updateResult = await Resource.updateMany(
      { _id: { $in: resource_ids } },
      {
        $set: {
          status: new_status,
          updated_by: req.user.individualId,
          updated_at: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Bulk status update completed',
      data: {
        matched_count: updateResult.matchedCount,
        modified_count: updateResult.modifiedCount,
        reason: reason || 'Not specified'
      }
    });
  } catch (error) {
    console.error('Error in bulk status update:', error);
    res.status(500).json({
      success: false,
      message: 'Error in bulk status update',
      error: error.message
    });
  }
});

// POST /api/resources/ai/optimize-allocation - AI-powered allocation optimization
router.post('/ai/optimize-allocation', authenticateToken, async (req, res) => {
  try {
    const { location, radius = 50 } = req.body;

    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({
        success: false,
        message: 'Location with lat and lng is required'
      });
    }

    // Mock AI optimization since the service might not have all methods implemented
    const mockDemandAnalysis = {
      total_demand: Math.floor(Math.random() * 1000) + 500,
      priority_breakdown: {
        critical: Math.floor(Math.random() * 200) + 100,
        high: Math.floor(Math.random() * 150) + 100,
        medium: Math.floor(Math.random() * 100) + 50,
        low: Math.floor(Math.random() * 50) + 25
      },
      resource_types_needed: ['medical_supplies', 'food', 'water', 'shelter'],
      confidence: 0.85
    };

    const mockOptimization = {
      recommended_allocations: [
        {
          resource_type: 'medical_supplies',
          quantity: Math.floor(Math.random() * 100) + 50,
          priority: 'critical',
          estimated_arrival: '2-3 hours'
        },
        {
          resource_type: 'food',
          quantity: Math.floor(Math.random() * 200) + 100,
          priority: 'high',
          estimated_arrival: '1-2 hours'
        }
      ],
      optimization_score: 0.92,
      estimated_cost: Math.floor(Math.random() * 50000) + 25000,
      deployment_strategy: 'Prioritize medical supplies first, then food and water'
    };

    res.json({
      success: true,
      data: {
        target_location: location,
        search_radius_km: radius,
        demand_analysis: mockDemandAnalysis,
        optimization_results: mockOptimization,
        generated_at: new Date(),
        note: 'AI optimization service running in mock mode'
      }
    });
  } catch (error) {
    console.error('Error in AI allocation optimization:', error);
    res.status(500).json({
      success: false,
      message: 'Error in AI allocation optimization',
      error: error.message
    });
  }
});

// GET /api/resources/ai/supply-chain-optimization - AI supply chain optimization
router.get('/ai/supply-chain-optimization', authenticateToken, requireResponder, async (req, res) => {
  try {
    const { timeframe = 30 } = req.query;

    const optimization = await aiOptimizer.optimizeSupplyChain(parseInt(timeframe));

    res.json({
      success: true,
      data: optimization
    });
  } catch (error) {
    console.error('Error in supply chain optimization:', error);
    res.status(500).json({
      success: false,
      message: 'Error in supply chain optimization',
      error: error.message
    });
  }
});

// GET /api/resources/dashboard/metrics - Dashboard metrics for resource management
router.get('/dashboard/metrics', authenticateToken, async (req, res) => {
  try {
    const { timeframe = 7 } = req.query;
    const cutoffDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);

    // Get comprehensive metrics
    const [
      totalResources,
      resourcesByStatus,
      resourcesByType,
      recentDeployments,
      lowStockAlerts,
      utilizationRate
    ] = await Promise.all([
      Resource.countDocuments(),
      Resource.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, total_quantity: { $sum: '$quantity.current' } } }
      ]),
      Resource.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 }, total_quantity: { $sum: '$quantity.current' } } }
      ]),
      Resource.aggregate([
        { $unwind: '$deployment_history' },
        { $match: { 'deployment_history.deployed_at': { $gte: cutoffDate } } },
        { $group: { _id: null, total_deployments: { $sum: 1 }, total_quantity_deployed: { $sum: '$deployment_history.quantity_deployed' } } }
      ]),
      Resource.find({
        $expr: {
          $lt: [
            { $subtract: ['$quantity.current', { $add: ['$quantity.allocated', '$quantity.reserved'] }] },
            20
          ]
        }
      }).countDocuments(),
      Resource.aggregate([
        {
          $project: {
            utilization: {
              $divide: [
                { $add: ['$quantity.allocated', '$quantity.reserved'] },
                '$quantity.current'
              ]
            }
          }
        },
        { $group: { _id: null, avg_utilization: { $avg: '$utilization' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total_resources: totalResources,
          low_stock_alerts: lowStockAlerts,
          avg_utilization_rate: utilizationRate[0]?.avg_utilization ? Math.round(utilizationRate[0].avg_utilization * 100) : 0,
          recent_deployments: recentDeployments[0]?.total_deployments || 0
        },
        breakdown: {
          by_status: resourcesByStatus,
          by_type: resourcesByType
        },
        performance: {
          total_quantity_deployed: recentDeployments[0]?.total_quantity_deployed || 0,
          deployment_rate: recentDeployments[0]?.total_deployments || 0,
          timeframe_days: timeframe
        },
        generated_at: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard metrics',
      error: error.message
    });
  }
});

// POST /api/resources/:id/complete-deployment - Mark deployment as completed
router.post('/:id/complete-deployment', authenticateToken, requireResponder, async (req, res) => {
  try {
    const { deployment_id, actual_duration, notes } = req.body;

    if (!deployment_id) {
      return res.status(400).json({
        success: false,
        message: 'deployment_id is required'
      });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Find and update the deployment
    const deployment = resource.deployment_history.id(deployment_id);
    if (!deployment) {
      return res.status(404).json({
        success: false,
        message: 'Deployment not found'
      });
    }

    deployment.status = 'completed';
    deployment.actual_duration = actual_duration;
    if (notes) deployment.notes = notes;

    // Free up allocated quantity
    resource.quantity.allocated -= deployment.quantity_deployed;

    // Update overall status if needed
    if (resource.quantity.allocated <= 0 && resource.status === 'dispatched') {
      const available = resource.quantity.current - resource.quantity.reserved;
      resource.status = available > 0 ? 'available' : 'depleted';
    }

    await resource.save();

    res.json({
      success: true,
      message: 'Deployment marked as completed',
      data: {
        deployment,
        resource_status: resource.status,
        remaining_allocated: resource.quantity.allocated
      }
    });
  } catch (error) {
    console.error('Error completing deployment:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing deployment',
      error: error.message
    });
  }
});

module.exports = router;
