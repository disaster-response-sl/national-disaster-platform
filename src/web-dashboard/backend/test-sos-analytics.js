const mongoose = require('mongoose');
require('dotenv').config();
const SosSignal = require('./models/SosSignal');

async function testAnalytics() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Test the analytics query directly
    const timeRange = '7d';
    const now = new Date();
    let timeFilter = new Date();

    switch (timeRange) {
      case '1h':
        timeFilter.setHours(now.getHours() - 1);
        break;
      case '6h':
        timeFilter.setHours(now.getHours() - 6);
        break;
      case '24h':
        timeFilter.setDate(now.getDate() - 1);
        break;
      case '7d':
        timeFilter.setDate(now.getDate() - 7);
        break;
      case '30d':
        timeFilter.setMonth(now.getMonth() - 1);
        break;
      default:
        timeFilter = new Date(0);
    }

    console.log('Time filter:', timeFilter);
    console.log('Current time:', now);

    const analytics = await SosSignal.aggregate([
      { $match: { created_at: { $gte: timeFilter } } },
      {
        $group: {
          _id: null,
          totalSignals: { $sum: 1 },
          resolvedSignals: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          escalatedCount: { $sum: { $cond: [{ $gt: ['$escalation_level', 0] }, 1, 0] } }
        }
      }
    ]);

    console.log('Analytics result:', analytics);

    if (analytics.length > 0) {
      const result = analytics[0];
      console.log('Total signals:', result.totalSignals);
      console.log('Resolved signals:', result.resolvedSignals);
      console.log('Escalated count:', result.escalatedCount);

      if (result.totalSignals > 0) {
        const resolutionRate = ((result.resolvedSignals / result.totalSignals) * 100).toFixed(1);
        console.log('Resolution rate:', resolutionRate + '%');
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAnalytics();
