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
    min: [1, 'Amount must be greater than 0']
  },
  currency: {
    type: String,
    default: 'LKR',
    enum: ['LKR', 'USD', 'EUR']
  },
  orderId: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  transactionId: {
    type: String,
    required: true,
    trim: true
  },
  sessionId: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'],
    default: 'PENDING'
  },
  paymentMethod: {
    type: String,
    default: 'CARD',
    enum: ['CARD', 'BANK_TRANSFER', 'DIGITAL_WALLET']
  },
  description: {
    type: String,
    default: 'Disaster Relief Donation'
  },
  mpgsResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  failureReason: {
    type: String
  },
  processedAt: {
    type: Date
  },
  confirmedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Create indexes for efficient queries
donationSchema.index({ orderId: 1 }, { unique: true });
donationSchema.index({ donor: 1, createdAt: -1 });
donationSchema.index({ status: 1, createdAt: -1 });
donationSchema.index({ createdAt: -1 });

// Static method to get donation statistics
donationSchema.statics.getStats = async function(filters = {}) {
  const pipeline = [
    {
      $match: {
        status: 'SUCCESS',
        ...filters
      }
    },
    {
      $group: {
        _id: null,
        totalDonations: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        averageDonation: { $avg: '$amount' },
        uniqueDonors: { $addToSet: '$donor' }
      }
    },
    {
      $project: {
        _id: 0,
        totalDonations: 1,
        totalAmount: 1,
        averageDonation: { $round: ['$averageDonation', 2] },
        uniqueDonors: { $size: '$uniqueDonors' }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalDonations: 0,
    totalAmount: 0,
    averageDonation: 0,
    uniqueDonors: 0
  };
};

// Static method to get status breakdown
donationSchema.statics.getStatusBreakdown = async function(filters = {}) {
  const pipeline = [
    {
      $match: filters
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  const statusBreakdown = {};
  
  ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'].forEach(status => {
    statusBreakdown[status] = 0;
  });

  result.forEach(item => {
    statusBreakdown[item._id] = item.count;
  });

  return statusBreakdown;
};

// Static method to get recent activity
donationSchema.statics.getRecentActivity = async function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    {
      $match: {
        status: 'SUCCESS',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt'
          }
        },
        count: { $sum: 1 },
        amount: { $sum: '$amount' }
      }
    },
    {
      $sort: { '_id': 1 }
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        count: 1,
        amount: 1
      }
    }
  ];

  return await this.aggregate(pipeline);
};

module.exports = mongoose.model('Donation', donationSchema);
