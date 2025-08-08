const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  user_id: {
    type: String, // Use String for now, or mongoose.Schema.Types.ObjectId if referencing users
    required: true
  },
  disaster_id: {
    type: String, // Use String for now, or mongoose.Schema.Types.ObjectId if referencing disasters
    required: false
  },
  type: {
    type: String,
    enum: ['food', 'shelter', 'danger', 'medical'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image_url: String,
  location: {
    lat: Number,
    lng: Number
  },
  status: {
    type: String,
    enum: ['pending', 'addressed'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', ReportSchema); 