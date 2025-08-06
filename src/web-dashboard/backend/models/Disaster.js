const mongoose = require('mongoose');

const DisasterSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['flood', 'landslide', 'cyclone'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
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
    enum: ['active', 'resolved'],
    default: 'active'
  }
});

module.exports = mongoose.model('Disaster', DisasterSchema); 