const mongoose = require('mongoose');
const SosSignal = require('./models/SosSignal');
require('dotenv').config();

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://3halon:fnQsm550Po5uSTwb@cluster0.ng1rq.mongodb.net/disaster_platform';

async function seedSosData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully');

    // Clear existing SOS signals
    console.log('Clearing existing SOS signals...');
    await SosSignal.deleteMany({});

    // Sample SOS signals data
    const sosSignals = [
      {
        user_id: 'citizen001',
        location: {
          lat: 6.9271,
          lng: 79.8612,
          address: 'Colombo, Sri Lanka'
        },
        message: 'Emergency flood situation, need immediate help',
        priority: 'critical',
        status: 'pending',
        created_at: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        updated_at: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        user_id: 'citizen002',
        location: {
          lat: 6.9344,
          lng: 79.8428,
          address: 'Pettah, Colombo'
        },
        message: 'Building collapse, people trapped',
        priority: 'critical',
        status: 'acknowledged',
        assigned_responder: 'responder001',
        created_at: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        updated_at: new Date(Date.now() - 15 * 60 * 1000),
        response_time: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        user_id: 'citizen003',
        location: {
          lat: 6.9167,
          lng: 79.8500,
          address: 'Galle Face, Colombo'
        },
        message: 'Medical emergency - heart attack',
        priority: 'high',
        status: 'responding',
        assigned_responder: 'responder002',
        created_at: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        updated_at: new Date(Date.now() - 10 * 60 * 1000),
        response_time: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        user_id: 'citizen004',
        location: {
          lat: 6.9319,
          lng: 79.8478,
          address: 'Fort, Colombo'
        },
        message: 'Fire outbreak in residential area',
        priority: 'high',
        status: 'responding',
        assigned_responder: 'responder003',
        escalation_level: 1,
        created_at: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
        updated_at: new Date(Date.now() - 20 * 60 * 1000),
        response_time: new Date(Date.now() - 45 * 60 * 1000)
      },
      {
        user_id: 'citizen005',
        location: {
          lat: 6.9198,
          lng: 79.8556,
          address: 'Bambalapitiya, Colombo'
        },
        message: 'Car accident on main road',
        priority: 'medium',
        status: 'resolved',
        assigned_responder: 'responder001',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updated_at: new Date(Date.now() - 30 * 60 * 1000),
        response_time: new Date(Date.now() - 90 * 60 * 1000),
        resolution_time: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        user_id: 'citizen006',
        location: {
          lat: 6.9147,
          lng: 79.8731,
          address: 'Wellawatta, Colombo'
        },
        message: 'Suspicious activity reported',
        priority: 'low',
        status: 'false_alarm',
        assigned_responder: 'responder002',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        updated_at: new Date(Date.now() - 60 * 60 * 1000),
        response_time: new Date(Date.now() - 2 * 60 * 60 * 1000),
        resolution_time: new Date(Date.now() - 60 * 60 * 1000)
      },
      {
        user_id: 'citizen007',
        location: {
          lat: 6.9080,
          lng: 79.8653,
          address: 'Mount Lavinia, Colombo'
        },
        message: 'Gas leak detected in neighborhood',
        priority: 'high',
        status: 'pending',
        created_at: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        updated_at: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        user_id: 'citizen008',
        location: {
          lat: 6.9402,
          lng: 79.8492,
          address: 'Maradana, Colombo'
        },
        message: 'Water contamination in local well',
        priority: 'medium',
        status: 'acknowledged',
        assigned_responder: 'responder003',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000),
        response_time: new Date(Date.now() - 3 * 60 * 60 * 1000)
      },
      {
        user_id: 'citizen009',
        location: {
          lat: 6.8887,
          lng: 79.8590,
          address: 'Dehiwala, Colombo'
        },
        message: 'Elderly person missing',
        priority: 'medium',
        status: 'responding',
        assigned_responder: 'responder001',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        response_time: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        user_id: 'citizen010',
        location: {
          lat: 6.9595,
          lng: 79.8738,
          address: 'Kotahena, Colombo'
        },
        message: 'Road blockage due to fallen tree',
        priority: 'low',
        status: 'resolved',
        assigned_responder: 'responder002',
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000),
        response_time: new Date(Date.now() - 10 * 60 * 60 * 1000),
        resolution_time: new Date(Date.now() - 8 * 60 * 60 * 1000)
      }
    ];

    console.log('Inserting SOS signals...');
    await SosSignal.insertMany(sosSignals);

    console.log(`Successfully seeded ${sosSignals.length} SOS signals`);
    
    // Display summary
    const stats = await SosSignal.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          acknowledged: { $sum: { $cond: [{ $eq: ['$status', 'acknowledged'] }, 1, 0] } },
          responding: { $sum: { $cond: [{ $eq: ['$status', 'responding'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          false_alarm: { $sum: { $cond: [{ $eq: ['$status', 'false_alarm'] }, 1, 0] } },
          critical: { $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } }
        }
      }
    ]);

    console.log('\nSOS Signals Summary:');
    console.log('===================');
    if (stats.length > 0) {
      const summary = stats[0];
      console.log(`Total Signals: ${summary.total}`);
      console.log(`By Status:`);
      console.log(`  - Pending: ${summary.pending}`);
      console.log(`  - Acknowledged: ${summary.acknowledged}`);
      console.log(`  - Responding: ${summary.responding}`);
      console.log(`  - Resolved: ${summary.resolved}`);
      console.log(`  - False Alarm: ${summary.false_alarm}`);
      console.log(`By Priority:`);
      console.log(`  - Critical: ${summary.critical}`);
      console.log(`  - High: ${summary.high}`);
      console.log(`  - Medium: ${summary.medium}`);
      console.log(`  - Low: ${summary.low}`);
    }

  } catch (error) {
    console.error('Error seeding SOS data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the seeding function
seedSosData();
