const mongoose = require('mongoose');
const Disaster = require('./models/Disaster');

// Test disaster creation
async function testDisasterCreation() {
  try {
    console.log('Testing Disaster model creation...');

    const testDisaster = new Disaster({
      type: 'flood',
      severity: 'medium',
      title: 'Test Disaster',
      description: 'Test disaster for resource allocation',
      location: {
        lat: 6.9271,
        lng: 79.8612
      },
      zones: [{
        zone_name: 'Test Zone',
        estimated_population: 1000,
        risk_level: 'medium'
      }],
      resources_required: {
        personnel: 10
      },
      priority_level: 'medium',
      incident_commander: 'Test Commander',
      contact_number: '0771234567',
      reporting_agency: 'Test Agency',
      public_alert: false,
      alert_message: '',
      evacuation_required: false,
      evacuation_zones: [],
      assigned_teams: [],
      estimated_duration: 24,
      status: 'active',
      created_by: 'test_user_id'
    });

    const savedDisaster = await testDisaster.save();
    console.log('✅ Disaster created successfully!');
    console.log('Disaster Code:', savedDisaster.disaster_code);
    console.log('ID:', savedDisaster._id);

    // Clean up
    await Disaster.findByIdAndDelete(savedDisaster._id);
    console.log('✅ Test disaster cleaned up');

  } catch (error) {
    console.error('❌ Disaster creation failed:', error.message);
    console.error('Full error:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  // Connect to MongoDB
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/disaster_platform', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('Connected to MongoDB');
    testDisasterCreation();
  }).catch(err => {
    console.error('MongoDB connection failed:', err);
  });
}

module.exports = { testDisasterCreation };
