const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  user_id: {
    type: String, // Use String for now, or mongoose.Schema.Types.ObjectId if referencing users
    required: true
  },
  disaster_id: {
    type: String, // Use String for now, or mongoose.Schema.Types.ObjectId if referencing disasters
    required: true
  },
  type: {
    type: String,
    enum: ['food', 'shelter', 'danger', 'medical', 'water', 'transportation', 'communication'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image_url: String,
  status: {
    type: String,
    enum: ['pending', 'addressed', 'in_progress'],
    default: 'pending'
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
    city: String,
    state: String,
    country: {
      type: String,
      default: 'Bangladesh'
    }
  },
  resource_requirements: {
    food: { type: Number, default: 0 },
    water: { type: Number, default: 0 },
    medical_supplies: { type: Number, default: 0 },
    shelter: { type: Number, default: 0 },
    transportation: { type: Number, default: 0 },
    personnel: { type: Number, default: 0 }
  },
  affected_people: {
    type: Number,
    default: 1
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
ReportSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Report', ReportSchema); 