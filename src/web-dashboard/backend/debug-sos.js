const mongoose = require('mongoose');
const SosSignal = require('./models/SosSignal');
require('dotenv').config();

async function debugSos() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Test the exact query from the dashboard route
    const timeRange = '24h';
    const now = new Date();
    let timeFilter = new Date();
    timeFilter.setDate(now.getDate() - 1); // 24h ago
    
    const query = {
      created_at: { $gte: timeFilter }
    };
    
    console.log('Query filter:', query);
    console.log('Time filter (24h ago):', timeFilter.toISOString());
    console.log('Current time:', now.toISOString());
    
    const totalCount = await SosSignal.countDocuments(query);
    console.log('Filtered count (24h):', totalCount);
    
    const allCount = await SosSignal.countDocuments({});
    console.log('Total count (no filter):', allCount);
    
    // Check the creation dates of signals
    const allSignals = await SosSignal.find({}).limit(5);
    console.log('\nSample signal dates:');
    allSignals.forEach(signal => {
      console.log(`- Created: ${signal.created_at.toISOString()}, User: ${signal.user_id}, Status: ${signal.status}`);
    });
    
    // Test with no time filter
    const noTimeQuery = {};
    const stats = await SosSignal.aggregate([
      { $match: noTimeQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          acknowledged: { $sum: { $cond: [{ $eq: ['$status', 'acknowledged'] }, 1, 0] } },
          responding: { $sum: { $cond: [{ $eq: ['$status', 'responding'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          critical: { $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          escalated: { $sum: { $cond: [{ $gt: ['$escalation_level', 0] }, 1, 0] } }
        }
      }
    ]);
    
    console.log('\nStats (no time filter):', stats[0]);
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

debugSos();
