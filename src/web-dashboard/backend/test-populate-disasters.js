const mongoose = require('mongoose');
const Disaster = require('./models/Disaster');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/disaster-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function populateTestDisasters() {
  try {
    // Clear existing disasters
    await Disaster.deleteMany({});
    console.log('Cleared existing disasters');
    
    // Create test disasters with proper coordinates in Sri Lanka
    const testDisasters = [
      {
        type: 'flood',
        severity: 'high',
        description: 'Sample flood disaster in Colombo area',
        location: { lat: 6.9271, lng: 79.8612 },
        timestamp: new Date('2025-08-08T11:47:28.000Z'),
        status: 'active'
      },
      {
        type: 'landslide',
        severity: 'medium',
        description: 'Sample landslide disaster in Kandy area',
        location: { lat: 7.2906, lng: 80.6337 },
        timestamp: new Date('2025-08-08T10:30:00.000Z'),
        status: 'active'
      },
      {
        type: 'cyclone',
        severity: 'low',
        description: 'Sample cyclone disaster in Galle area',
        location: { lat: 6.0535, lng: 80.2210 },
        timestamp: new Date('2025-08-08T09:15:00.000Z'),
        status: 'active'
      },
      {
        type: 'flood',
        severity: 'high',
        description: 'Sample flood disaster in Jaffna area',
        location: { lat: 9.6615, lng: 80.0255 },
        timestamp: new Date('2025-08-07T14:20:00.000Z'),
        status: 'resolved'
      },
      {
        type: 'landslide',
        severity: 'medium',
        description: 'Sample landslide disaster in Nuwara Eliya area',
        location: { lat: 6.9497, lng: 80.7891 },
        timestamp: new Date('2025-08-07T12:45:00.000Z'),
        status: 'resolved'
      },
      {
        type: 'cyclone',
        severity: 'low',
        description: 'Sample cyclone disaster in Trincomalee area',
        location: { lat: 8.5711, lng: 81.2335 },
        timestamp: new Date('2025-08-07T11:30:00.000Z'),
        status: 'resolved'
      },
      {
        type: 'flood',
        severity: 'medium',
        description: 'Sample flood disaster in Batticaloa area',
        location: { lat: 7.7167, lng: 81.7000 },
        timestamp: new Date('2025-08-07T10:15:00.000Z'),
        status: 'active'
      },
      {
        type: 'landslide',
        severity: 'high',
        description: 'Sample landslide disaster in Ratnapura area',
        location: { lat: 6.6828, lng: 80.3992 },
        timestamp: new Date('2025-08-07T09:00:00.000Z'),
        status: 'active'
      },
      {
        type: 'cyclone',
        severity: 'medium',
        description: 'Sample cyclone disaster in Matara area',
        location: { lat: 5.9483, lng: 80.5353 },
        timestamp: new Date('2025-08-07T08:45:00.000Z'),
        status: 'resolved'
      },
      {
        type: 'flood',
        severity: 'low',
        description: 'Sample flood disaster in Anuradhapura area',
        location: { lat: 8.3354, lng: 80.4108 },
        timestamp: new Date('2025-08-07T07:30:00.000Z'),
        status: 'resolved'
      }
    ];
    
    const createdDisasters = await Disaster.insertMany(testDisasters);
    console.log('Successfully created', createdDisasters.length, 'test disasters');
    
    // Verify the data
    const allDisasters = await Disaster.find({});
    console.log('Total disasters in database:', allDisasters.length);
    console.log('Disaster details:', allDisasters.map(d => ({
      id: d._id,
      type: d.type,
      severity: d.severity,
      status: d.status,
      location: d.location
    })));
    
  } catch (error) {
    console.error('Error populating test disasters:', error);
  } finally {
    mongoose.connection.close();
  }
}

populateTestDisasters();
