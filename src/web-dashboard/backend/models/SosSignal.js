const mongoose = require('mongoose');

const SosSignalSchema = new mongoose.Schema({
  user_id: {
    type: String, //Use String instead of ObjectId
    required: true
  },
  location: {
    lat: Number,
    lng: Number
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SosSignal', SosSignalSchema, 'sos_signals');
