const express = require('express');
const router = express.Router();
const Disaster = require('../../models/Disaster');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');
const csv = require('csv-parser');
const { Readable } = require('stream');

// POST /api/admin/disasters/import - Import disasters from CSV/JSON
router.post('/import', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, format = 'json', overwrite = false } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Data is required for import'
      });
    }

    let disasters = [];
    
    if (format === 'json') {
      disasters = Array.isArray(data) ? data : [data];
    } else if (format === 'csv') {
      // Parse CSV data
      disasters = await parseCsvData(data);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported format. Use "json" or "csv"'
      });
    }

    const results = {
      total: disasters.length,
      successful: 0,
      failed: 0,
      errors: [],
      warnings: []
    };

    const userId = req.user._id || req.user.individualId;

    for (let i = 0; i < disasters.length; i++) {
      try {
        const disasterData = disasters[i];
        
        // Add metadata
        disasterData.created_by = userId;
        
        // Check for existing disaster by code if overwrite is false
        if (!overwrite && disasterData.disaster_code) {
          const existing = await Disaster.findOne({ disaster_code: disasterData.disaster_code });
          if (existing) {
            results.warnings.push(`Disaster ${disasterData.disaster_code} already exists (skipped)`);
            continue;
          }
        }

        // Validate required fields
        if (!disasterData.title || !disasterData.type || !disasterData.severity || !disasterData.description) {
          results.errors.push(`Row ${i + 1}: Missing required fields (title, type, severity, description)`);
          results.failed++;
          continue;
        }

        // Create or update disaster
        let disaster;
        if (overwrite && disasterData.disaster_code) {
          disaster = await Disaster.findOneAndUpdate(
            { disaster_code: disasterData.disaster_code },
            disasterData,
            { new: true, upsert: true, runValidators: true }
          );
        } else {
          disaster = new Disaster(disasterData);
          await disaster.save();
        }

        results.successful++;
      } catch (error) {
        results.errors.push(`Row ${i + 1}: ${error.message}`);
        results.failed++;
      }
    }

    res.status(results.failed > 0 ? 207 : 201).json({
      success: results.failed === 0,
      message: `Import completed: ${results.successful} successful, ${results.failed} failed`,
      data: results
    });
  } catch (error) {
    console.error('Import disasters error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/admin/disasters/export - Export disasters to JSON/CSV
router.get('/export', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      format = 'json',
      status, 
      type, 
      severity,
      startDate,
      endDate,
      includeZones = 'true',
      includeResources = 'true'
    } = req.query;

    let query = {};
    
    // Build query filters
    if (status) query.status = { $in: status.split(',') };
    if (type) query.type = { $in: type.split(',') };
    if (severity) query.severity = { $in: severity.split(',') };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Select fields based on options
    let selectFields = 'disaster_code title type severity description location status priority_level timestamp incident_commander contact_number reporting_agency public_alert evacuation_required assigned_teams estimated_duration actual_duration createdAt updatedAt';
    
    if (includeZones === 'true') selectFields += ' zones';
    if (includeResources === 'true') selectFields += ' resources_required';

    const disasters = await Disaster.find(query)
      .select(selectFields)
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(disasters, includeZones === 'true', includeResources === 'true');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=disasters-export-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvData);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=disasters-export-${new Date().toISOString().split('T')[0]}.json`);
      
      res.json({
        success: true,
        exported_at: new Date().toISOString(),
        total_records: disasters.length,
        data: disasters
      });
    }
  } catch (error) {
    console.error('Export disasters error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/admin/disasters/template - Download import template
router.get('/template', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { format = 'csv' } = req.query;

    const template = {
      title: 'Sample Disaster Title',
      type: 'flood', // flood, landslide, cyclone, fire, earthquake, drought, tsunami
      severity: 'high', // low, medium, high, critical
      description: 'Detailed description of the disaster event',
      'location.lat': 6.9271,
      'location.lng': 79.8612,
      status: 'active', // active, monitoring, resolved, archived
      priority_level: 'high', // low, medium, high, critical, emergency
      incident_commander: 'Commander Name',
      contact_number: '+94771234567',
      reporting_agency: 'Agency Name',
      public_alert: true,
      alert_message: 'Public alert message',
      evacuation_required: false,
      'assigned_teams[0]': 'Rescue Team Alpha',
      'assigned_teams[1]': 'Medical Team Beta',
      estimated_duration: 48,
      'zones[0].zone_name': 'Zone 1',
      'zones[0].estimated_population': 10000,
      'zones[0].area_km2': 5.5,
      'zones[0].risk_level': 'high',
      'resources_required.personnel': 50,
      'resources_required.vehicles': 10,
      'resources_required.food_supplies': 1000,
      'resources_required.water_supplies': 5000
    };

    if (format === 'csv') {
      const csvTemplate = convertTemplateToCSV(template);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=disaster-import-template.csv');
      res.send(csvTemplate);
    } else {
      res.json({
        success: true,
        message: 'Import template',
        template: template,
        instructions: {
          title: 'Required field - Name of the disaster',
          type: 'Required field - One of: flood, landslide, cyclone, fire, earthquake, drought, tsunami',
          severity: 'Required field - One of: low, medium, high, critical',
          description: 'Required field - Detailed description',
          zones: 'Optional - Array of zone objects with zone_name, estimated_population, area_km2, risk_level',
          resources_required: 'Optional - Object with personnel, vehicles, supplies counts',
          assigned_teams: 'Optional - Array of team names'
        }
      });
    }
  } catch (error) {
    console.error('Template error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Helper function to parse CSV data
async function parseCsvData(csvString) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from([csvString]);
    
    stream
      .pipe(csv())
      .on('data', (data) => {
        // Convert flat CSV structure to nested objects
        const disaster = {};
        
        Object.keys(data).forEach(key => {
          if (key.includes('.') || key.includes('[')) {
            // Handle nested properties like "location.lat" or "zones[0].zone_name"
            setNestedProperty(disaster, key, data[key]);
          } else {
            disaster[key] = data[key];
          }
        });
        
        results.push(disaster);
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Helper function to set nested properties
function setNestedProperty(obj, path, value) {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      current[key] = isNaN(keys[i + 1]) ? {} : [];
    }
    current = current[key];
  }
  
  const finalKey = keys[keys.length - 1];
  current[finalKey] = value;
}

// Helper function to convert disasters to CSV
function convertToCSV(disasters, includeZones, includeResources) {
  if (disasters.length === 0) return '';
  
  const headers = ['disaster_code', 'title', 'type', 'severity', 'description', 'status', 'priority_level', 'location_lat', 'location_lng', 'incident_commander', 'contact_number', 'created_at'];
  
  if (includeZones) {
    headers.push('total_zones', 'total_population', 'total_area_km2');
  }
  
  if (includeResources) {
    headers.push('personnel_required', 'vehicles_required', 'food_supplies_kg', 'water_supplies_liters');
  }
  
  const rows = disasters.map(disaster => {
    const row = [
      disaster.disaster_code || '',
      disaster.title || '',
      disaster.type || '',
      disaster.severity || '',
      disaster.description || '',
      disaster.status || '',
      disaster.priority_level || '',
      disaster.location?.lat || '',
      disaster.location?.lng || '',
      disaster.incident_commander || '',
      disaster.contact_number || '',
      disaster.createdAt ? new Date(disaster.createdAt).toISOString() : ''
    ];
    
    if (includeZones) {
      const totalPopulation = disaster.zones?.reduce((sum, zone) => sum + (zone.estimated_population || 0), 0) || 0;
      const totalArea = disaster.zones?.reduce((sum, zone) => sum + (zone.area_km2 || 0), 0) || 0;
      row.push(disaster.zones?.length || 0, totalPopulation, totalArea);
    }
    
    if (includeResources) {
      row.push(
        disaster.resources_required?.personnel || 0,
        disaster.resources_required?.vehicles || 0,
        disaster.resources_required?.food_supplies || 0,
        disaster.resources_required?.water_supplies || 0
      );
    }
    
    return row;
  });
  
  return [headers, ...rows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

// Helper function to convert template to CSV
function convertTemplateToCSV(template) {
  const headers = Object.keys(template);
  const values = Object.values(template);
  
  const headerRow = headers.map(h => `"${h}"`).join(',');
  const valueRow = values.map(v => `"${v}"`).join(',');
  
  return `${headerRow}\n${valueRow}`;
}

module.exports = router;
