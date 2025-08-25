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

// Function to check what's in the database
async function checkDatabase() {
  try {
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📂 Available collections:');
    collections.forEach(coll => console.log(`  - ${coll.name}`));
    
    console.log('\n🔍 Checking disasters collection...');
    
    // Check if disasters collection exists and get its contents
    const disastersCollection = db.collection('disasters');
    const disasterCount = await disastersCollection.countDocuments();
    console.log(`Found ${disasterCount} documents in disasters collection`);
    
    if (disasterCount > 0) {
      console.log('\n📄 Existing disasters:');
      const disasters = await disastersCollection.find({}).toArray();
      disasters.forEach((disaster, index) => {
        console.log(`${index + 1}. ${disaster.type} (${disaster.severity}) - ${disaster.status}`);
        console.log(`   Description: ${disaster.description}`);
        console.log(`   Location: ${disaster.location?.lat}, ${disaster.location?.lng}`);
        console.log(`   Timestamp: ${disaster.timestamp}`);
        console.log(`   ID: ${disaster._id}`);
        console.log('');
      });
    } else {
      console.log('❌ No disasters found in the collection');
      
      // Let's try to insert some simple documents directly
      console.log('\n🛠️  Inserting simple disaster documents...');
      
      const simpleDisasters = [
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
        }
      ];
      
      try {
        // Clear any existing documents first
        await disastersCollection.deleteMany({});
        
        // Insert new simple documents one by one to avoid index issues
        for (const disaster of simpleDisasters) {
          try {
            const result = await disastersCollection.insertOne(disaster);
            console.log(`✅ Inserted: ${disaster.type} - ${disaster.severity} (ID: ${result.insertedId})`);
          } catch (insertError) {
            console.log(`❌ Failed to insert ${disaster.type}:`, insertError.message);
          }
        }
        
        // Verify the insert
        const newCount = await disastersCollection.countDocuments();
        console.log(`\n🎉 Successfully inserted disasters. Total count: ${newCount}`);
        
      } catch (insertError) {
        console.log('❌ Error inserting disasters:', insertError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

// Main function
async function main() {
  try {
    await connectDB();
    await checkDatabase();
    
    console.log('\n✅ Database check completed!');
    
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
