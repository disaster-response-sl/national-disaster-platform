const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['medicine', 'food', 'shelter', 'water', 'medical_supplies', 'transportation', 'personnel', 'equipment', 'clothing', 'communication'],
    required: true
  },
  category: {
    type: String,
    enum: ['emergency', 'medical', 'basic_needs', 'infrastructure', 'logistics'],
    required: true
  },
  quantity: {
    current: {
      type: Number,
      required: true,
      min: 0
    },
    allocated: {
      type: Number,
      default: 0,
      min: 0
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      enum: ['pieces', 'kg', 'liters', 'boxes', 'people', 'vehicles', 'sets']
    }
  },
  status: {
    type: String,
    enum: ['available', 'dispatched', 'depleted', 'in_transit', 'maintenance', 'reserved'],
    default: 'available'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    address: String,
    facility_name: String,
    city: String,
    district: String,
    province: String
  },
  supplier: {
    name: String,
    contact: String,
    organization: String
  },
  deployment_history: [{
    deployed_to: {
      disaster_id: String,
      location: {
        lat: Number,
        lng: Number,
        address: String
      }
    },
    quantity_deployed: Number,
    deployed_at: {
      type: Date,
      default: Date.now
    },
    deployed_by: String,
    status: {
      type: String,
      enum: ['deployed', 'completed', 'recalled'],
      default: 'deployed'
    },
    estimated_duration: Number, // in hours
    actual_duration: Number
  }],
  supply_chain: {
    procurement_status: {
      type: String,
      enum: ['ordered', 'in_transit', 'received', 'quality_check', 'approved'],
      default: 'received'
    },
    expected_delivery: Date,
    last_updated: {
      type: Date,
      default: Date.now
    },
    tracking_number: String,
    vendor_id: String
  },
  specifications: {
    description: String,
    expiry_date: Date,
    batch_number: String,
    manufacturer: String,
    model: String,
    storage_requirements: String
  },
  ai_recommendations: {
    optimal_allocation: Number,
    deployment_priority: Number,
    risk_assessment: String,
    alternative_resources: [String],
    last_updated: {
      type: Date,
      default: Date.now
    }
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  created_by: String,
  updated_by: String
});

// Indexes for better query performance
ResourceSchema.index({ type: 1, status: 1 });
ResourceSchema.index({ location: '2dsphere' });
ResourceSchema.index({ priority: -1, created_at: -1 });

// Virtual for available quantity
ResourceSchema.virtual('quantity.available').get(function() {
  return this.quantity.current - this.quantity.allocated - this.quantity.reserved;
});

// Virtual for available_quantity (direct property for frontend compatibility)
ResourceSchema.virtual('available_quantity').get(function() {
  return this.quantity.current - this.quantity.allocated - this.quantity.reserved;
});

// Virtual for allocated_quantity (direct property for frontend compatibility)
ResourceSchema.virtual('allocated_quantity').get(function() {
  return this.quantity.allocated || 0;
});

// Virtual for reserved_quantity (direct property for frontend compatibility)
ResourceSchema.virtual('reserved_quantity').get(function() {
  return this.quantity.reserved || 0;
});

// Ensure virtual fields are serialized
ResourceSchema.set('toJSON', { virtuals: true });
ResourceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Resource', ResourceSchema); 