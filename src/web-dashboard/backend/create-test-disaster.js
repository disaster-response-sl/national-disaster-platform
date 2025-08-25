const Disaster = require('./models/Disaster');
const mongoose = require('mongoose');
require('dotenv').config();

async function createTestDisaster() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/disaster-platform';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Create test disaster
    const testDisaster = new Disaster({
      title: "Flash Flood in Colombo",
      type: "flood",
      severity: "high",
      description: "Heavy rainfall has caused flash flooding in several areas of Colombo. Water levels are rising rapidly and evacuation may be required for low-lying areas.",
      location: {
        lat: 6.9271,
        lng: 79.8612
      },
      priority_level: "high",
      incident_commander: "John Silva",
      contact_number: "+94 11 234 5678",
      reporting_agency: "Disaster Management Centre",
      public_alert: true,
      alert_message: "Flash flood warning: Avoid travel to Colombo Central area. Seek higher ground if in affected zones.",
      evacuation_required: true,
      evacuation_zones: ["Colombo Central"],
      estimated_duration: 12,
      status: 'active'
      // created_by will be set by the pre-save middleware
      // disaster_code will be auto-generated
    });

    await testDisaster.save();
    console.log('✅ Test disaster created successfully!');
    console.log('Disaster Code:', testDisaster.disaster_code);
    console.log('ID:', testDisaster._id);

    // List all disasters
    const disasters = await Disaster.find({});
    console.log(`📊 Total disasters in database: ${disasters.length}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestDisaster();
