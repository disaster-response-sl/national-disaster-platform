const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['medicine', 'food', 'shelter'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'dispatched', 'depleted'],
    default: 'available'
  },
  location: {
    lat: Number,
    lng: Number
  }
});

module.exports = mongoose.model('Resource', ResourceSchema); 