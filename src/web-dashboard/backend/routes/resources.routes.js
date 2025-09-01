const express = require('express');
const mongoose = require('mongoose');
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

// GET /api/resources/stats - Get resource statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalResources = await Resource.countDocuments();
    const availableResources = await Resource.countDocuments({ status: 'available' });
    const allocatedResources = await Resource.countDocuments({ status: { $in: ['dispatched', 'allocated'] } });
    const reservedResources = await Resource.countDocuments({ status: 'reserved' });
    const depletedResources = await Resource.countDocuments({ status: 'depleted' });

    // Get resources by type
    const resourcesByType = await Resource.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, total_quantity: { $sum: '$quantity.current' } } },
      { $project: { type: '$_id', count: 1, total_quantity: 1, _id: 0 } }
    ]);

    // Get resources by category
    const resourcesByCategory = await Resource.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, total_quantity: { $sum: '$quantity.current' } } },
      { $project: { category: '$_id', count: 1, total_quantity: 1, _id: 0 } }
    ]);

    // Get resources by status
    const resourcesByStatus = await Resource.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, total_quantity: { $sum: '$quantity.current' } } },
      { $project: { status: '$_id', count: 1, total_quantity: 1, _id: 0 } }
    ]);

    // Calculate utilization rate
    const utilizationData = await Resource.aggregate([
      {
        $group: {
          _id: null,
          total_current: { $sum: '$quantity.current' },
          total_allocated: { $sum: '$quantity.allocated' },
          total_reserved: { $sum: '$quantity.reserved' }
        }
      }
    ]);

    const utilization = utilizationData[0] || { total_current: 0, total_allocated: 0, total_reserved: 0 };
    const utilizationRate = utilization.total_current > 0
      ? ((utilization.total_allocated + utilization.total_reserved) / utilization.total_current) * 100
      : 0;

    // Get recent deployments (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentDeployments = await Resource.aggregate([
      { $unwind: '$deployment_history' },
      { $match: { 'deployment_history.deployed_at': { $gte: thirtyDaysAgo } } },
      { $count: 'total_deployments' }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total_resources: totalResources,
          available_resources: availableResources,
          allocated_resources: allocatedResources,
          reserved_resources: reservedResources,
          depleted_resources: depletedResources,
          utilization_rate: utilizationRate,
          recent_deployments: recentDeployments[0]?.total_deployments || 0
        },
        breakdown: {
          by_type: resourcesByType,
          by_category: resourcesByCategory,
          by_status: resourcesByStatus
        },
        utilization: {
          total_current_quantity: utilization.total_current,
          total_allocated_quantity: utilization.total_allocated,
          total_reserved_quantity: utilization.total_reserved,
          available_quantity: utilization.total_current - utilization.total_allocated - utilization.total_reserved
        },
        generated_at: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching resource statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resource statistics',
      error: error.message
    });
  }
});

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

    // Validate required fields
    const requiredFields = ['name', 'type', 'category', 'quantity', 'location'];
    for (const field of requiredFields) {
      if (!resourceData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

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
      error: error.message
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

    // Verify disaster exists - try by ID first, then by disaster_code
    const Disaster = require('../models/Disaster');
    
    let disaster;
    
    // First try to find by ObjectId
    if (mongoose.Types.ObjectId.isValid(disaster_id)) {
      disaster = await Disaster.findById(disaster_id);
    }
    
    // If not found by ID, try to find by disaster_code
    if (!disaster) {
      disaster = await Disaster.findOne({ disaster_code: disaster_id });
    }

    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found. Please check the disaster ID or code.'
      });
    }

    // Update allocation
    resource.quantity.allocated += allocateQuantity;
    
    // Add to deployment history
    resource.deployment_history.push({
      deployed_to: {
        disaster_id: disaster._id.toString(), // Store the actual ObjectId
        location
      },
      quantity_deployed: allocateQuantity,
      deployed_by: req.user.individualId,
      deployed_at: new Date(), // Explicitly set deployment time
      status: 'deployed', // Set initial status
      estimated_duration
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
        deployment_id: resource.deployment_history[resource.deployment_history.length - 1]._id,
        disaster_id: disaster._id.toString(), // Return the actual ObjectId
        disaster_code: disaster.disaster_code
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
});// POST /api/resources/:id/reserve - Reserve resource
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
    // Aggregate by type and category
    const byType = await Resource.aggregate([
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total_quantity: { $sum: '$quantity.current' },
          allocated_quantity: { $sum: '$quantity.allocated' },
          reserved_quantity: { $sum: '$quantity.reserved' },
          count: { $sum: 1 },
          available_quantity: {
            $sum: { $subtract: ['$quantity.current', { $add: ['$quantity.allocated', '$quantity.reserved'] }] }
          }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          categories: {
            $push: {
              category: '$_id.category',
              quantity: '$total_quantity',
              available: '$available_quantity'
            }
          },
          total_quantity: { $sum: '$total_quantity' },
          allocated_quantity: { $sum: '$allocated_quantity' },
          reserved_quantity: { $sum: '$reserved_quantity' },
          available_quantity: { $sum: '$available_quantity' },
          count: { $sum: '$count' }
        }
      },
      {
        $project: {
          _id: 0,
          type: '$_id',
          total_quantity: 1,
          allocated_quantity: 1,
          reserved_quantity: 1,
          available_quantity: 1,
          categories: 1,
          count: 1
        }
      }
    ]);

    // Calculate overall stats
    const overallAgg = await Resource.aggregate([
      {
        $group: {
          _id: null,
          total_resources: { $sum: 1 },
          total_quantity: { $sum: '$quantity.current' },
          allocated_quantity: { $sum: '$quantity.allocated' },
          reserved_quantity: { $sum: '$quantity.reserved' },
          available_quantity: {
            $sum: { $subtract: ['$quantity.current', { $add: ['$quantity.allocated', '$quantity.reserved'] }] }
          }
        }
      }
    ]);
    const overall = overallAgg[0] || {
      total_resources: 0,
      total_quantity: 0,
      allocated_quantity: 0,
      reserved_quantity: 0,
      available_quantity: 0
    };
    // Utilization rate: allocated + reserved / total_quantity
    overall.utilization_rate = overall.total_quantity > 0
      ? ((overall.allocated_quantity + overall.reserved_quantity) / overall.total_quantity) * 100
      : 0;

    res.json({
      success: true,
      data: {
        by_type: byType,
        overall,
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

    // First get all resources with deployment history
    let resources = await Resource.find({
      deployment_history: { $exists: true, $ne: [] }
    });

    // Filter deployments based on query parameters
    let filteredDeployments = [];

    resources.forEach(resource => {
      if (resource.deployment_history && Array.isArray(resource.deployment_history)) {
        resource.deployment_history.forEach(deployment => {
          let include = true;

          // Filter by disaster_id if provided
          if (disaster_id && deployment.deployed_to && deployment.deployed_to.disaster_id !== disaster_id) {
            include = false;
          }

          // Filter by status if provided
          if (status && deployment.status !== status) {
            include = false;
          }

          // Filter by date range if provided
          if (start_date && deployment.deployed_at && new Date(deployment.deployed_at) < new Date(start_date)) {
            include = false;
          }
          if (end_date && deployment.deployed_at && new Date(deployment.deployed_at) > new Date(end_date)) {
            include = false;
          }

          if (include) {
            filteredDeployments.push({
              deployment_id: deployment._id,
              resource_id: resource._id,
              resource_name: resource.name,
              resource_type: resource.type,
              disaster_id: deployment.deployed_to ? deployment.deployed_to.disaster_id : null,
              disaster_title: 'Unknown', // Will be populated below
              allocated_quantity: deployment.quantity_deployed,
              deployment_location: deployment.deployed_to ? deployment.deployed_to.location : null,
              status: deployment.status,
              estimated_duration: deployment.estimated_duration,
              actual_duration: deployment.actual_duration,
              deployed_at: deployment.deployed_at,
              completed_at: deployment.completed_at,
              notes: deployment.notes
            });
          }
        });
      }
    });

    // Get disaster details for each deployment
    const Disaster = require('../models/Disaster');
    const disasterIds = [...new Set(filteredDeployments.map(d => d.disaster_id).filter(id => id))];
    
    let disasterMap = {};
    if (disasterIds.length > 0) {
      try {
        // First try to find disasters by ObjectId (valid ObjectIds only)
        const validObjectIds = disasterIds.filter(id => mongoose.Types.ObjectId.isValid(id));
        const objectIds = validObjectIds.map(id => mongoose.Types.ObjectId(id));
        
        if (objectIds.length > 0) {
          const disasters = await Disaster.find({ _id: { $in: objectIds } });
          
          disasters.forEach(disaster => {
            disasterMap[disaster._id.toString()] = {
              disaster_code: disaster.disaster_code,
              type: disaster.type,
              severity: disaster.severity,
              location: disaster.location
            };
          });
        }
        
        // For invalid ObjectIds, try to find by disaster_code
        const invalidIds = disasterIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
        
        if (invalidIds.length > 0) {
          const disastersByCode = await Disaster.find({ disaster_code: { $in: invalidIds } });
          
          disastersByCode.forEach(disaster => {
            disasterMap[disaster.disaster_code] = {
              disaster_code: disaster.disaster_code,
              type: disaster.type,
              severity: disaster.severity,
              location: disaster.location
            };
          });
        }
      } catch (disasterError) {
        console.warn('Error fetching disaster details:', disasterError.message);
        // Continue without disaster details if there's an error
      }
    }

    // Enrich deployments with disaster information
    const enrichedDeployments = filteredDeployments.map(deployment => {
      let disasterTitle = 'Unknown';
      
      if (deployment.disaster_id) {
        // First try to find by ObjectId (if it's a valid ObjectId)
        if (mongoose.Types.ObjectId.isValid(deployment.disaster_id)) {
          disasterTitle = disasterMap[deployment.disaster_id]?.disaster_code || 'Unknown';
        } else {
          // If not a valid ObjectId, try to find by disaster_code
          disasterTitle = disasterMap[deployment.disaster_id]?.disaster_code || 'Unknown';
        }
      }
      
      return {
        ...deployment,
        disaster_title: disasterTitle
      };
    });

    res.json({
      success: true,
      data: enrichedDeployments,
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
    const { location, radius } = req.body;

    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({
        success: false,
        message: 'Location with lat and lng is required'
      });
    }

    // Analyze demand
    const demandAnalysis = await aiOptimizer.analyzeDemand(location, radius);
    
    // Generate optimal allocation
    const optimization = await aiOptimizer.generateOptimalAllocation(location, demandAnalysis);

    res.json({
      success: true,
      data: {
        target_location: location,
        demand_analysis: demandAnalysis,
        optimization_results: optimization
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

    // Get all resources for calculations
    const allResources = await Resource.find({});
    const totalResources = allResources.length;
    const availableResources = allResources.filter(r => r.status === 'available').length;
    const allocatedResources = allResources.filter(r => r.status === 'dispatched' || r.status === 'allocated').length;
    const reservedResources = allResources.filter(r => r.status === 'reserved').length;
    const totalValue = 0; // Placeholder, add value field if needed

    // Utilization rate: (allocated + reserved) / total current
    let totalCurrent = 0, totalAllocated = 0, totalReserved = 0;
    allResources.forEach(r => {
      totalCurrent += r.quantity.current;
      totalAllocated += r.quantity.allocated;
      totalReserved += r.quantity.reserved;
    });
    const utilizationRate = totalCurrent > 0 ? ((totalAllocated + totalReserved) / totalCurrent) * 100 : 0;

    // Performance metrics calculated from deployment_history
    let totalDeployments = 0;
    let successfulDeployments = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    let totalTurnover = 0;
    let turnoverCount = 0;

    allResources.forEach(r => {
      if (Array.isArray(r.deployment_history)) {
        r.deployment_history.forEach(d => {
          totalDeployments++;
          // Consider deployments with status 'completed' as successful
          if (d.status === 'completed') successfulDeployments++;
          // If actual_duration is present, use for response time
          if (d.actual_duration) {
            totalResponseTime += d.actual_duration;
            responseTimeCount++;
          }
          // If quantity_deployed and current are present, use for turnover
          if (typeof d.quantity_deployed === 'number' && typeof r.quantity.current === 'number' && r.quantity.current > 0) {
            totalTurnover += (d.quantity_deployed / r.quantity.current) * 100;
            turnoverCount++;
          }
        });
      }
    });

    const allocationEfficiency = utilizationRate;
    const responseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;
    const resourceTurnover = turnoverCount > 0 ? totalTurnover / turnoverCount : 0;
    const deploymentSuccessRate = totalDeployments > 0 ? (successfulDeployments / totalDeployments) * 100 : 0;

    // Breakdown by type and status
    const typeCounts = {};
    const statusCounts = {};
    allResources.forEach(r => {
      typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    });
    const byType = Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      available: allResources.filter(r => r.type === type && r.status === 'available').length,
      percentage: totalResources > 0 ? Math.round((count / totalResources) * 100) : 0
    }));
    const byStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: totalResources > 0 ? Math.round((count / totalResources) * 100) : 0
    }));

    res.json({
      success: true,
      data: {
        overview: {
          total_resources: totalResources,
          available_resources: availableResources,
          allocated_resources: allocatedResources,
          reserved_resources: reservedResources,
          total_value: totalValue,
          utilization_rate: utilizationRate
        },
        breakdown: {
          by_type: byType,
          by_status: byStatus
        },
        performance: {
          allocation_efficiency: allocationEfficiency,
          response_time: responseTime,
          resource_turnover: resourceTurnover,
          deployment_success_rate: deploymentSuccessRate
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


    // Free up allocated quantity, but do not allow negative values
    resource.quantity.allocated -= deployment.quantity_deployed;
    if (resource.quantity.allocated < 0) {
      resource.quantity.allocated = 0;
    }

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
