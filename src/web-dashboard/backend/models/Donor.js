const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
donorSchema.index({ email: 1 });

module.exports = mongoose.model('Donor', donorSchema);
