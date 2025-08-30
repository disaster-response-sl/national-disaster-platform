const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Amount must be greater than 0']
  },
  currency: {
    type: String,
    default: 'LKR',
    enum: ['LKR', 'USD', 'EUR']
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  sessionId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'],
    default: 'PENDING'
  },
  paymentMethod: {
    type: String,
    default: 'CARD'
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
donationSchema.index({ orderId: 1 });
donationSchema.index({ transactionId: 1 });
donationSchema.index({ sessionId: 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Donation', donationSchema);
