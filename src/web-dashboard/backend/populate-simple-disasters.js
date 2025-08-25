const mongoose = require('mongoose');

// Simple disaster schema that matches what mobile app expects
const simpleDisasterSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['flood', 'landslide', 'cyclone', 'fire', 'earthquake'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    lat: Number,
    lng: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active'
  }
});

const SimpleDisaster = mongoose.model('Disaster', simpleDisasterSchema);

// MongoDB connection
async function connectDB() {
  try {
    const mongoUri = 'mongodb+srv://3halon:fnQsm550Po5uSTwb@cluster0.ng1rq.mongodb.net/disaster_platform';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Simple disaster data for mobile app
const simpleDisasterData = [
  {
    type: 'flood',
    severity: 'high',
    description: 'Severe flooding in Ratnapura district after continuous rainfall',
    location: { lat: 6.6847, lng: 80.4025 },
    timestamp: new Date('2025-08-20T14:30:00.000Z'),
    status: 'active'
  },
  {
    type: 'landslide',
    severity: 'high',
    description: 'Landslide disaster in Nuwara Eliya district threatening residential areas',
    location: { lat: 6.9497, lng: 80.7718 },
    timestamp: new Date('2025-08-21T08:15:00.000Z'),
    status: 'active'
  },
  {
    type: 'cyclone',
    severity: 'medium',
    description: 'Tropical cyclone approaching the southern coast with strong winds expected',
    location: { lat: 5.9485, lng: 80.5353 },
    timestamp: new Date('2025-08-22T12:00:00.000Z'),
    status: 'active'
  },
  {
    type: 'flood',
    severity: 'medium',
    description: 'Urban flooding in Colombo due to heavy monsoon rains affecting main roads',
    location: { lat: 6.9271, lng: 79.8612 },
    timestamp: new Date('2025-08-19T18:45:00.000Z'),
    status: 'resolved'
  }
];

// Function to clear and populate disasters
async function populateSimpleDisasters() {
  try {
    console.log('🧹 Clearing existing disasters...');
    await SimpleDisaster.deleteMany({});
    console.log('✅ Existing disasters cleared');

    console.log('📝 Inserting simple disaster data...');
    const insertedDisasters = await SimpleDisaster.insertMany(simpleDisasterData);
    console.log(`✅ Successfully inserted ${insertedDisasters.length} disasters`);

    // Display summary
    console.log('\n📊 DISASTER SUMMARY:');
    console.log('==================');
    
    const activeDisasters = insertedDisasters.filter(d => d.status === 'active');
    const resolvedDisasters = insertedDisasters.filter(d => d.status === 'resolved');
    
    console.log(`Total Disasters: ${insertedDisasters.length}`);
    console.log(`Active: ${activeDisasters.length}`);
    console.log(`Resolved: ${resolvedDisasters.length}`);
    
    console.log('\nInserted Disasters:');
    insertedDisasters.forEach(disaster => {
      console.log(`- ${disaster.type} (${disaster.severity}) - ${disaster.status}`);
      console.log(`  Location: ${disaster.location.lat}, ${disaster.location.lng}`);
      console.log(`  Description: ${disaster.description}`);
      console.log(`  ID: ${disaster._id}`);
      console.log('');
    });

    return insertedDisasters;
  } catch (error) {
    console.error('❌ Error populating disasters:', error);
    throw error;
  }
}

// Function to verify disasters were inserted
async function verifyDisasters() {
  try {
    console.log('🔍 Verifying disaster data...');
    const disasters = await SimpleDisaster.find({});
    console.log(`✅ Found ${disasters.length} disasters in database`);
    
    const byType = {};
    const bySeverity = {};
    const byStatus = {};
    
    disasters.forEach(disaster => {
      byType[disaster.type] = (byType[disaster.type] || 0) + 1;
      bySeverity[disaster.severity] = (bySeverity[disaster.severity] || 0) + 1;
      byStatus[disaster.status] = (byStatus[disaster.status] || 0) + 1;
    });
    
    console.log('\n📈 BREAKDOWN:');
    console.log('By Type:', byType);
    console.log('By Severity:', bySeverity);
    console.log('By Status:', byStatus);
    
    return disasters;
  } catch (error) {
    console.error('❌ Error verifying disasters:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    await connectDB();
    await populateSimpleDisasters();
    await verifyDisasters();
    
    console.log('\n✅ Simple disaster population completed successfully!');
    console.log('🔗 You can now test the mobile app - it should show the disasters.');
    console.log('📱 The mobile app should fetch disasters from: /api/mobile/disasters');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
main();
