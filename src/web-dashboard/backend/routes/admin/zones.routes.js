const express = require('express');
const router = express.Router();
const Disaster = require('../../models/Disaster');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');

// POST /api/admin/disasters/:id/zones - Add zone to disaster
router.post('/:id/zones', async (req, res) => {
  try {
    const { zone_name, boundary_coordinates, estimated_population, area_km2, risk_level } = req.body;

    if (!zone_name || !boundary_coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Zone name and boundary coordinates are required'
      });
    }

    // Validate boundary coordinates
    if (!Array.isArray(boundary_coordinates) || boundary_coordinates.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Boundary coordinates must be an array with at least 3 coordinate pairs'
      });
    }

    // Validate coordinate format
    const validCoordinates = boundary_coordinates.every(coord => 
      Array.isArray(coord) && coord.length === 2 && 
      typeof coord[0] === 'number' && typeof coord[1] === 'number'
    );

    if (!validCoordinates) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinate format. Each coordinate must be [lat, lng]'
      });
    }

    const disaster = await Disaster.findById(req.params.id);
    
    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }

    // Check for duplicate zone names within the same disaster
    const existingZone = disaster.zones.find(zone => 
      zone.zone_name.toLowerCase() === zone_name.toLowerCase()
    );

    if (existingZone) {
      return res.status(400).json({
        success: false,
        message: 'Zone name already exists for this disaster'
      });
    }

    // Calculate area if not provided (simple polygon area calculation)
    const calculatedArea = area_km2 || calculatePolygonArea(boundary_coordinates);

    const newZone = {
      zone_name,
      boundary_coordinates,
      estimated_population: estimated_population || 0,
      area_km2: calculatedArea,
      risk_level: risk_level || 'medium'
    };

    disaster.zones.push(newZone);
    disaster.updated_by = req.user._id || req.user.individualId;
    
    await disaster.save();

    res.status(201).json({
      success: true,
      data: {
        disaster_id: disaster._id,
        zone: disaster.zones[disaster.zones.length - 1], // Get the newly added zone
        total_zones: disaster.zones.length
      },
      message: 'Zone added successfully'
    });
  } catch (error) {
    console.error('Add zone error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/admin/disasters/:id/zones/:zoneId - Update specific zone
router.put('/:id/zones/:zoneId', async (req, res) => {
  try {
    const { zone_name, boundary_coordinates, estimated_population, area_km2, risk_level } = req.body;

    const disaster = await Disaster.findById(req.params.id);
    
    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }

    const zoneIndex = disaster.zones.findIndex(zone => 
      zone._id.toString() === req.params.zoneId
    );

    if (zoneIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found'
      });
    }

    // Check for duplicate zone names (excluding current zone)
    if (zone_name) {
      const duplicateZone = disaster.zones.find((zone, index) => 
        index !== zoneIndex && zone.zone_name.toLowerCase() === zone_name.toLowerCase()
      );

      if (duplicateZone) {
        return res.status(400).json({
          success: false,
          message: 'Zone name already exists for this disaster'
        });
      }
    }

    // Validate boundary coordinates if provided
    if (boundary_coordinates) {
      if (!Array.isArray(boundary_coordinates) || boundary_coordinates.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Boundary coordinates must be an array with at least 3 coordinate pairs'
        });
      }

      const validCoordinates = boundary_coordinates.every(coord => 
        Array.isArray(coord) && coord.length === 2 && 
        typeof coord[0] === 'number' && typeof coord[1] === 'number'
      );

      if (!validCoordinates) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinate format. Each coordinate must be [lat, lng]'
        });
      }
    }

    // Update zone fields
    if (zone_name !== undefined) disaster.zones[zoneIndex].zone_name = zone_name;
    if (boundary_coordinates !== undefined) {
      disaster.zones[zoneIndex].boundary_coordinates = boundary_coordinates;
      // Recalculate area if coordinates changed and area not provided
      if (area_km2 === undefined) {
        disaster.zones[zoneIndex].area_km2 = calculatePolygonArea(boundary_coordinates);
      }
    }
    if (estimated_population !== undefined) disaster.zones[zoneIndex].estimated_population = estimated_population;
    if (area_km2 !== undefined) disaster.zones[zoneIndex].area_km2 = area_km2;
    if (risk_level !== undefined) disaster.zones[zoneIndex].risk_level = risk_level;

    disaster.updated_by = req.user._id || req.user.individualId;
    await disaster.save();

    res.json({
      success: true,
      data: {
        disaster_id: disaster._id,
        zone: disaster.zones[zoneIndex],
        total_zones: disaster.zones.length
      },
      message: 'Zone updated successfully'
    });
  } catch (error) {
    console.error('Update zone error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/admin/disasters/:id/zones/:zoneId - Remove zone
router.delete('/:id/zones/:zoneId', async (req, res) => {
  try {
    const disaster = await Disaster.findById(req.params.id);
    
    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }

    const zoneIndex = disaster.zones.findIndex(zone => 
      zone._id.toString() === req.params.zoneId
    );

    if (zoneIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found'
      });
    }

    const removedZone = disaster.zones[zoneIndex];
    disaster.zones.splice(zoneIndex, 1);
    disaster.updated_by = req.user._id || req.user.individualId;
    
    await disaster.save();

    res.json({
      success: true,
      data: {
        disaster_id: disaster._id,
        removed_zone: removedZone,
        remaining_zones: disaster.zones.length
      },
      message: 'Zone removed successfully'
    });
  } catch (error) {
    console.error('Remove zone error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/admin/disasters/:id/zones - Get all zones for a disaster
router.get('/:id/zones', async (req, res) => {
  try {
    const disaster = await Disaster.findById(req.params.id).select('zones disaster_code title');
    
    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }

    // Calculate summary statistics
    const totalPopulation = disaster.zones.reduce((sum, zone) => sum + (zone.estimated_population || 0), 0);
    const totalArea = disaster.zones.reduce((sum, zone) => sum + (zone.area_km2 || 0), 0);
    const riskLevelCounts = disaster.zones.reduce((counts, zone) => {
      counts[zone.risk_level] = (counts[zone.risk_level] || 0) + 1;
      return counts;
    }, {});

    res.json({
      success: true,
      data: {
        disaster: {
          id: disaster._id,
          disaster_code: disaster.disaster_code,
          title: disaster.title
        },
        zones: disaster.zones,
        summary: {
          total_zones: disaster.zones.length,
          total_estimated_population: totalPopulation,
          total_area_km2: Math.round(totalArea * 100) / 100,
          risk_level_breakdown: riskLevelCounts
        }
      }
    });
  } catch (error) {
    console.error('Get zones error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/admin/disasters/:id/zones/:zoneId - Get specific zone
router.get('/:id/zones/:zoneId', async (req, res) => {
  try {
    const disaster = await Disaster.findById(req.params.id).select('zones disaster_code title');
    
    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }

    const zone = disaster.zones.find(zone => 
      zone._id.toString() === req.params.zoneId
    );

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found'
      });
    }

    res.json({
      success: true,
      data: {
        disaster: {
          id: disaster._id,
          disaster_code: disaster.disaster_code,
          title: disaster.title
        },
        zone: zone,
        computed: {
          perimeter_km: calculatePolygonPerimeter(zone.boundary_coordinates),
          population_density: zone.area_km2 > 0 ? Math.round((zone.estimated_population / zone.area_km2) * 100) / 100 : 0
        }
      }
    });
  } catch (error) {
    console.error('Get zone error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Utility function to calculate polygon area (simplified version)
// In production, you might want to use a proper GIS library like turf.js
function calculatePolygonArea(coordinates) {
  if (coordinates.length < 3) return 0;
  
  let area = 0;
  const n = coordinates.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coordinates[i][0] * coordinates[j][1];
    area -= coordinates[j][0] * coordinates[i][1];
  }
  
  // Convert to approximate km² (very rough approximation)
  // In production, use proper geodesic calculations
  area = Math.abs(area) / 2;
  const km2 = area * 12364.0; // Rough conversion factor
  
  return Math.round(km2 * 100) / 100;
}

// Utility function to calculate polygon perimeter (simplified version)
function calculatePolygonPerimeter(coordinates) {
  if (coordinates.length < 2) return 0;
  
  let perimeter = 0;
  
  for (let i = 0; i < coordinates.length; i++) {
    const current = coordinates[i];
    const next = coordinates[(i + 1) % coordinates.length];
    
    // Simple distance calculation (not geodesic)
    const dx = next[0] - current[0];
    const dy = next[1] - current[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    perimeter += distance;
  }
  
  // Convert to approximate km (very rough)
  const km = perimeter * 111.32; // Rough conversion factor
  
  return Math.round(km * 100) / 100;
}

module.exports = router;
