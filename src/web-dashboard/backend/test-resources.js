// Quick test script to check resources
const mongoose = require('mongoose');
const Resource = require('./models/Resource');
require('dotenv').config();

async function testResources() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Count existing resources
    const count = await Resource.countDocuments();
    console.log(`📊 Total resources in database: ${count}`);
    
    // Get sample resources
    const resources = await Resource.find().limit(5);
    console.log('📦 Sample resources:');
    resources.forEach((resource, index) => {
      console.log(`  ${index + 1}. ${resource.name} (${resource.type}) - Status: ${resource.status}`);
    });
    
    if (count === 0) {
      console.log('🔧 Creating sample resource...');
      const sampleResource = new Resource({
        name: 'Emergency Medical Kit',
        type: 'medical_supplies',
        category: 'medical',
        quantity: {
          current: 100,
          allocated: 0,
          reserved: 0,
          unit: 'pieces'
        },
        status: 'available',
        priority: 'high',
        location: {
          lat: 6.9271,
          lng: 79.8612,
          address: 'Colombo Medical Center'
        },
        created_by: 'system',
        updated_by: 'system'
      });
      
      await sampleResource.save();
      console.log('✅ Sample resource created!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📝 Test completed');
  }
}

testResources();
