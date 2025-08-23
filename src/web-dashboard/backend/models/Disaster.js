const mongoose = require('mongoose');

const DisasterSchema = new mongoose.Schema({
  // Basic disaster info (existing + enhanced)
  type: {
    type: String,
    enum: ['flood', 'landslide', 'cyclone', 'fire', 'earthquake', 'drought', 'tsunami'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    lat: Number,
    lng: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'monitoring', 'resolved', 'archived'],
    default: 'active'
  },
  
  // New admin fields
  title: {
    type: String,
    required: true,
    trim: true
  },
  disaster_code: {
    type: String,
    unique: true,
    required: true,
    match: /^DIS-\d{4}-\d{6}$/
  },
  zones: [{
    zone_name: {
      type: String,
      required: true
    },
    boundary_coordinates: {
      type: [[Number]], // Array of [lat, lng] pairs for polygon
      validate: {
        validator: function(coords) {
          return coords.length >= 3; // Minimum 3 points for a polygon
        },
        message: 'Zone must have at least 3 coordinate points'
      }
    },
    estimated_population: {
      type: Number,
      min: 0,
      default: 0
    },
    area_km2: {
      type: Number,
      min: 0,
      default: 0
    },
    risk_level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  }],
  
  // Resource management
  resources_required: {
    personnel: { type: Number, min: 0, default: 0 },
    rescue_teams: { type: Number, min: 0, default: 0 },
    medical_units: { type: Number, min: 0, default: 0 },
    vehicles: { type: Number, min: 0, default: 0 },
    boats: { type: Number, min: 0, default: 0 },
    helicopters: { type: Number, min: 0, default: 0 },
    food_supplies: { type: Number, min: 0, default: 0 }, // in kg
    water_supplies: { type: Number, min: 0, default: 0 }, // in liters
    medical_supplies: { type: Number, min: 0, default: 0 },
    temporary_shelters: { type: Number, min: 0, default: 0 }
  },
  
  // Response management
  priority_level: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical', 'emergency'],
    default: 'medium'
  },
  response_status: {
    type: String,
    enum: ['preparing', 'responding', 'recovery', 'completed'],
    default: 'preparing'
  },
  assigned_teams: [{
    type: String,
    trim: true
  }],
  estimated_duration: {
    type: Number, // in hours
    min: 0
  },
  actual_duration: {
    type: Number, // in hours
    min: 0
  },
  
  // Contact & administrative
  incident_commander: {
    type: String,
    trim: true
  },
  contact_number: {
    type: String,
    match: /^[+]?[\d\s\-\(\)]+$/
  },
  reporting_agency: {
    type: String,
    trim: true
  },
  
  // Alert settings
  public_alert: {
    type: Boolean,
    default: true
  },
  alert_message: {
    type: String,
    maxlength: 500
  },
  evacuation_required: {
    type: Boolean,
    default: false
  },
  evacuation_zones: [{
    type: String,
    trim: true
  }],
  
  // Metadata
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Indexes for performance
DisasterSchema.index({ "zones.boundary_coordinates": "2dsphere" });
DisasterSchema.index({ "location": "2dsphere" });
DisasterSchema.index({ status: 1, priority_level: 1 });
DisasterSchema.index({ type: 1, severity: 1 });
DisasterSchema.index({ timestamp: -1 });
DisasterSchema.index({ created_by: 1 });

// Pre-save middleware to generate disaster code
DisasterSchema.pre('save', async function(next) {
  if (this.isNew && !this.disaster_code) {
    try {
      const year = new Date().getFullYear();
      const count = await mongoose.model('Disaster').countDocuments({
        disaster_code: { $regex: `^DIS-${year}-` }
      });
      this.disaster_code = `DIS-${year}-${String(count + 1).padStart(6, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Virtual for total affected population
DisasterSchema.virtual('total_affected_population').get(function() {
  return this.zones.reduce((total, zone) => total + (zone.estimated_population || 0), 0);
});

// Virtual for total area
DisasterSchema.virtual('total_area_km2').get(function() {
  return this.zones.reduce((total, zone) => total + (zone.area_km2 || 0), 0);
});

// Method to check if disaster is critical
DisasterSchema.methods.isCritical = function() {
  return this.severity === 'critical' || this.priority_level === 'critical' || this.priority_level === 'emergency';
};

module.exports = mongoose.model('Disaster', DisasterSchema); 