const express = require('express');
const router = express.Router();
const Disaster = require('../../models/Disaster');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');

// Utility function to calculate resource requirements
const calculateResourceRequirements = (zones, disasterType, severity) => {
  const totalPopulation = zones.reduce((sum, zone) => sum + (zone.estimated_population || 0), 0);
  
  // Base multipliers based on disaster type and severity
  const typeMultiplier = {
    'flood': 1.0,
    'landslide': 1.2,
    'cyclone': 1.3,
    'fire': 1.1,
    'earthquake': 1.5,
    'drought': 0.8,
    'tsunami': 1.8
  };
  
  const severityMultiplier = {
    'low': 0.7,
    'medium': 1.0,
    'high': 1.4,
    'critical': 2.0
  };
  
  const multiplier = (typeMultiplier[disasterType] || 1.0) * (severityMultiplier[severity] || 1.0);
  
  return {
    personnel: Math.ceil(totalPopulation / 500 * multiplier),
    rescue_teams: Math.ceil(totalPopulation / 2000 * multiplier),
    medical_units: Math.ceil(totalPopulation / 1000 * multiplier),
    vehicles: Math.ceil(totalPopulation / 800 * multiplier),
    boats: disasterType === 'flood' || disasterType === 'tsunami' ? Math.ceil(totalPopulation / 3000 * multiplier) : 0,
    helicopters: Math.ceil(totalPopulation / 5000 * multiplier),
    food_supplies: Math.ceil(totalPopulation * 2.5 * multiplier), // kg per day
    water_supplies: Math.ceil(totalPopulation * 15 * multiplier), // liters per day
    medical_supplies: Math.ceil(totalPopulation / 100 * multiplier),
    temporary_shelters: Math.ceil(totalPopulation / 10 * multiplier)
  };
};

// Utility function to validate zone overlaps
const validateZoneOverlap = (zones) => {
  const warnings = [];
  
  // Simple overlap detection (can be enhanced with proper geometric algorithms)
  for (let i = 0; i < zones.length; i++) {
    for (let j = i + 1; j < zones.length; j++) {
      const zone1 = zones[i];
      const zone2 = zones[j];
      
      // Check if zones have overlapping high-risk levels
      if ((zone1.risk_level === 'critical' || zone1.risk_level === 'high') &&
          (zone2.risk_level === 'critical' || zone2.risk_level === 'high')) {
        warnings.push(`High-risk zones '${zone1.zone_name}' and '${zone2.zone_name}' may require coordinated response`);
      }
    }
  }
  
  return { warnings };
};

// POST /api/admin/disasters - Create new disaster
router.post('/', async (req, res) => {
  try {
    const {
      type, severity, title, description, location,
      zones = [], resources_required, priority_level,
      incident_commander, contact_number, reporting_agency,
      public_alert, alert_message, evacuation_required, evacuation_zones = [],
      assigned_teams = [], estimated_duration
    } = req.body;

    // Validation
    if (!title || !type || !severity || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, type, severity, and description are required'
      });
    }

    // Validate zones
    const zoneValidation = validateZoneOverlap(zones);
    
    // Auto-calculate resources if not provided
    const calculatedResources = resources_required && Object.keys(resources_required).length > 0
      ? resources_required 
      : calculateResourceRequirements(zones, type, severity);

    // Generate disaster code
    const year = new Date().getFullYear();
    const count = await Disaster.countDocuments({}) + 1;
    const disaster_code = `DIS-${year}-${count.toString().padStart(6, '0')}`;

    const disaster = new Disaster({
      type, severity, title, description, location,
      zones, resources_required: calculatedResources,
      priority_level: priority_level || (severity === 'critical' ? 'emergency' : 'medium'),
      incident_commander, contact_number, reporting_agency,
      public_alert: public_alert !== undefined ? public_alert : true,
      alert_message, evacuation_required: evacuation_required || false,
      evacuation_zones, assigned_teams, estimated_duration,
      disaster_code: disaster_code,
      status: 'active'
      // Remove created_by for now during testing
    });

    await disaster.save();

    res.status(201).json({
      success: true,
      data: disaster,
      warnings: zoneValidation.warnings,
      message: 'Disaster created successfully'
    });
  } catch (error) {
    console.error('Create disaster error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Disaster code already exists'
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/admin/disasters - List all disasters with advanced filtering
router.get('/', async (req, res) => {
  try {
    const {
      status, type, severity, priority_level,
      startDate, endDate, zone, search,
      sortBy = 'createdAt', sortOrder = 'desc',
      page = 1, limit = 20,
      includeArchived = 'false'
    } = req.query;

    let query = {};
    
    // Build filter query
    if (status) {
      query.status = { $in: status.split(',') };
    } else if (includeArchived === 'false') {
      query.status = { $ne: 'archived' }; // Exclude archived by default
    }
    
    if (type) query.type = { $in: type.split(',') };
    if (severity) query.severity = { $in: severity.split(',') };
    if (priority_level) query.priority_level = { $in: priority_level.split(',') };
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Zone-based filter
    if (zone) {
      query['zones.zone_name'] = { $regex: zone, $options: 'i' };
    }

    // Text search across multiple fields
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { disaster_code: { $regex: search, $options: 'i' } },
        { incident_commander: { $regex: search, $options: 'i' } },
        { reporting_agency: { $regex: search, $options: 'i' } }
      ];
    }

    const disasters = await Disaster.find(query)
      .populate('created_by', 'name role')
      .populate('updated_by', 'name role')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Disaster.countDocuments(query);

    res.json({
      success: true,
      data: disasters,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      },
      summary: {
        total_disasters: total,
        active: await Disaster.countDocuments({ ...query, status: 'active' }),
        resolved: await Disaster.countDocuments({ ...query, status: 'resolved' }),
        critical: await Disaster.countDocuments({ ...query, priority_level: { $in: ['critical', 'emergency'] } })
      }
    });
  } catch (error) {
    console.error('List disasters error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/admin/disasters/:id - Get specific disaster
router.get('/:id', async (req, res) => {
  try {
    const disaster = await Disaster.findById(req.params.id)
      .populate('created_by', 'name role email')
      .populate('updated_by', 'name role email');

    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }

    res.json({
      success: true,
      data: disaster,
      computed: {
        total_affected_population: disaster.total_affected_population,
        total_area_km2: disaster.total_area_km2,
        is_critical: disaster.isCritical(),
        duration_hours: disaster.actual_duration || 
          (disaster.status === 'completed' ? Math.floor((new Date() - disaster.createdAt) / (1000 * 60 * 60)) : null)
      }
    });
  } catch (error) {
    console.error('Get disaster error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/admin/disasters/:id - Update disaster
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData._id; // Remove _id from update data
    
    // Add updated_by field (mock for testing)
    // updateData.updated_by = 'test-admin-user'; // Temporarily commented out

    // If zones are updated, validate overlaps
    if (updateData.zones) {
      const zoneValidation = validateZoneOverlap(updateData.zones);
      
      // If resources not provided but zones changed, recalculate
      if (!updateData.resources_required && updateData.zones.length > 0) {
        const disaster = await Disaster.findById(req.params.id);
        updateData.resources_required = calculateResourceRequirements(
          updateData.zones, 
          updateData.type || disaster.type, 
          updateData.severity || disaster.severity
        );
      }
    }

    const disaster = await Disaster.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('created_by updated_by', 'name role');

    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }

    res.json({
      success: true,
      data: disaster,
      message: 'Disaster updated successfully'
    });
  } catch (error) {
    console.error('Update disaster error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// PATCH /api/admin/disasters/:id/status - Update status only
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, response_status, actual_duration } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const updateData = { 
      status,
      updated_by: req.user._id || req.user.individualId
    };

    if (response_status) updateData.response_status = response_status;
    if (actual_duration) updateData.actual_duration = actual_duration;

    // If marking as completed, set actual duration if not provided
    if (status === 'resolved' && !actual_duration) {
      const disaster = await Disaster.findById(req.params.id);
      if (disaster) {
        updateData.actual_duration = Math.floor((new Date() - disaster.createdAt) / (1000 * 60 * 60));
      }
    }

    const disaster = await Disaster.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('updated_by', 'name role');

    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }

    res.json({
      success: true,
      data: disaster,
      message: `Disaster status updated to ${status}`
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/admin/disasters/:id - Delete disaster (soft delete to archived)
router.delete('/:id', async (req, res) => {
  try {
    const { permanent = false } = req.query;

    if (permanent === 'true') {
      // Permanent delete (use with caution)
      const disaster = await Disaster.findByIdAndDelete(req.params.id);
      if (!disaster) {
        return res.status(404).json({
          success: false,
          message: 'Disaster not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Disaster permanently deleted'
      });
    } else {
      // Soft delete - archive the disaster
      const disaster = await Disaster.findByIdAndUpdate(
        req.params.id,
        { 
          status: 'archived',
          updated_by: req.user._id || req.user.individualId
        },
        { new: true }
      );

      if (!disaster) {
        return res.status(404).json({
          success: false,
          message: 'Disaster not found'
        });
      }

      res.json({
        success: true,
        data: disaster,
        message: 'Disaster archived successfully'
      });
    }
  } catch (error) {
    console.error('Delete disaster error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
