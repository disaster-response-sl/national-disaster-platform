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
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  donationCount: {
    type: Number,
    default: 0
  },
  totalDonated: {
    type: Number,
    default: 0
  },
  firstDonationDate: {
    type: Date,
    default: Date.now
  },
  lastDonationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index for email uniqueness
donorSchema.index({ email: 1 }, { unique: true });

// Update donor stats
donorSchema.methods.updateStats = async function(donationAmount) {
  this.donationCount += 1;
  this.totalDonated += donationAmount;
  this.lastDonationDate = new Date();
  
  if (this.donationCount === 1) {
    this.firstDonationDate = new Date();
  }
  
  return await this.save();
};

module.exports = mongoose.model('Donor', donorSchema);
