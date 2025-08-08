const mongoose = require('mongoose');

const SosSignalSchema = new mongoose.Schema({
  user_id: {
    type: String, //Use String instead of ObjectId
    required: true
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
    address: {
      type: String,
      default: ''
    }
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'responding', 'resolved', 'false_alarm'],
    default: 'pending'
  },
  assigned_responder: {
    type: String, // Admin/Responder user ID
    default: null
  },
  response_time: {
    type: Date,
    default: null
  },
  resolution_time: {
    type: Date,
    default: null
  },
  cluster_id: {
    type: String,
    default: null
  },
  proximity_signals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SosSignal'
  }],
  escalation_level: {
    type: Number,
    default: 0, // 0=normal, 1=escalated, 2=critical escalation
    min: 0,
    max: 2
  },
  auto_escalated_at: {
    type: Date,
    default: null
  },
  notes: [{
    responder_id: String,
    note: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  contact_info: {
    phone: String,
    alternate_contact: String
  },
  emergency_type: {
    type: String,
    enum: ['medical', 'fire', 'accident', 'crime', 'natural_disaster', 'other'],
    default: 'other'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries (clustering)
SosSignalSchema.index({ "location.lat": 1, "location.lng": 1 });

// Index for efficient querying
SosSignalSchema.index({ status: 1, priority: 1, created_at: -1 });
SosSignalSchema.index({ cluster_id: 1 });
SosSignalSchema.index({ assigned_responder: 1 });

// Auto-update timestamp on save
SosSignalSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('SosSignal', SosSignalSchema, 'sos_signals');
