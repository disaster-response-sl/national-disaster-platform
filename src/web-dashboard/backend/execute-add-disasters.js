const mongoose = require('mongoose');

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

// Disaster data to insert
const newDisasters = [
  {
    disaster_code: "NGB-FLD-20250827-01",
    type: "flood",
    severity: "medium",
    description: "Flooding in Negombo due to heavy rains, causing roadblocks in low-lying areas.",
    location: { lat: 7.2008, lng: 79.8737 },
    timestamp: new Date("2025-08-27T08:30:00Z"),
    status: "active"
  },
  {
    disaster_code: "COL-CYC-20250827-01",
    type: "cyclone",
    severity: "high",
    description: "Cyclone winds in Colombo disrupted electricity and uprooted several trees.",
    location: { lat: 6.9271, lng: 79.8612 },
    timestamp: new Date("2025-08-27T12:00:00Z"),
    status: "active"
  },
  {
    disaster_code: "MLB-LND-20250827-01",
    type: "landslide",
    severity: "high",
    description: "A landslide in Malabe blocked key roads and damaged nearby houses.",
    location: { lat: 6.9056, lng: 79.9580 },
    timestamp: new Date("2025-08-27T15:00:00Z"),
    status: "active"
  }
];

// Function to add disasters
async function addDisasters() {
  try {
    const db = mongoose.connection.db;
    const disastersCollection = db.collection('disasters');
    
    // Check current count
    const currentCount = await disastersCollection.countDocuments();
    console.log(`📊 Current disasters count: ${currentCount}`);
    
    console.log('\n🛠️  Adding new disasters...');
    
    for (const disaster of newDisasters) {
      try {
        const result = await disastersCollection.insertOne(disaster);
        console.log(`✅ Added: ${disaster.type} in ${disaster.description.split(' ')[2]} (${disaster.severity}) - ID: ${result.insertedId}`);
      } catch (insertError) {
        if (insertError.code === 11000) {
          console.log(`⚠️  Duplicate disaster_code: ${disaster.disaster_code} - skipping`);
        } else {
          console.log(`❌ Failed to add ${disaster.type}:`, insertError.message);
        }
      }
    }
    
    // Final verification
    const finalCount = await disastersCollection.countDocuments();
    console.log(`\n📈 Final disasters count: ${finalCount}`);
    
    // Show all disasters
    console.log('\n📋 All disasters in database:');
    const allDisasters = await disastersCollection.find({}).sort({ timestamp: -1 }).toArray();
    allDisasters.forEach((disaster, index) => {
      console.log(`${index + 1}. ${disaster.type} (${disaster.severity}) - ${disaster.status}`);
      console.log(`   Code: ${disaster.disaster_code || 'N/A'}`);
      console.log(`   Description: ${disaster.description}`);
      console.log(`   Location: ${disaster.location?.lat}, ${disaster.location?.lng}`);
      console.log(`   Timestamp: ${disaster.timestamp}`);
      console.log(`   ID: ${disaster._id}`);
      console.log('');
    });
    
    return finalCount;
    
  } catch (error) {
    console.error('❌ Error adding disasters:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    await connectDB();
    const count = await addDisasters();
    
    console.log(`✅ Database population completed! Total disasters: ${count}`);
    console.log('📱 The mobile app should now display these disasters.');
    
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
