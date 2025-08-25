const mongoose = require('mongoose');
const SosSignal = require('./models/SosSignal');
require('dotenv').config();

async function testSosDashboard() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Testing SOS dashboard query...');
    
    // Test the exact query from dashboard route
    const timeRange = '24h';
    const now = new Date();
    let timeFilter = new Date();
    timeFilter.setTime(now.getTime() - (24 * 60 * 60 * 1000));
    
    const query = {
      created_at: { $gte: timeFilter }
    };
    
    console.log('Query:', query);
    console.log('Time filter:', timeFilter.toISOString());
    console.log('Current time:', now.toISOString());
    
    // Test basic find
    const signals = await SosSignal.find(query).limit(5);
    console.log('Found signals:', signals.length);
    
    if (signals.length > 0) {
      console.log('First signal:', {
        id: signals[0]._id,
        user_id: signals[0].user_id,
        status: signals[0].status,
        priority: signals[0].priority,
        created_at: signals[0].created_at
      });
    }
    
    // Test the populate call that might be causing issues
    try {
      const populatedSignals = await SosSignal.find(query)
        .populate('proximity_signals', 'location priority status')
        .limit(5)
        .lean();
      console.log('Populated query worked, found:', populatedSignals.length);
    } catch (populateError) {
      console.error('Populate error:', populateError.message);
    }
    
    // Test aggregation pipeline
    try {
      const stats = await SosSignal.aggregate([
        { $match: query },
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
      
      console.log('Stats result:', stats[0]);
    } catch (aggregateError) {
      console.error('Aggregate error:', aggregateError.message);
    }
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

testSosDashboard();
