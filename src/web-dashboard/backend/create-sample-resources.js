// Create proper sample resources
const mongoose = require('mongoose');
const Resource = require('./models/Resource');
require('dotenv').config();

async function createSampleResources() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing resources with undefined names
    await Resource.deleteMany({ name: { $exists: false } });
    await Resource.deleteMany({ name: undefined });
    console.log('🧹 Cleaned up invalid resources');
    
    // Create sample resources
    const sampleResources = [
      {
        name: 'Emergency Medical Kit',
        type: 'medical_supplies',
        category: 'medical',
        quantity: {
          current: 100,
          allocated: 10,
          reserved: 5,
          unit: 'pieces'
        },
        status: 'available',
        priority: 'high',
        location: {
          lat: 6.9271,
          lng: 79.8612,
          address: 'Colombo Medical Center'
        },
        supplier: {
          name: 'MedSupply Lanka',
          contact: '+94771234567'
        },
        created_by: 'admin',
        updated_by: 'admin'
      },
      {
        name: 'Emergency Food Packets',
        type: 'food',
        category: 'basic_needs',
        quantity: {
          current: 500,
          allocated: 50,
          reserved: 25,
          unit: 'boxes'
        },
        status: 'available',
        priority: 'medium',
        location: {
          lat: 7.2906,
          lng: 80.6337,
          address: 'Kandy Distribution Center'
        },
        supplier: {
          name: 'Food Relief Org',
          contact: '+94712345678'
        },
        created_by: 'admin',
        updated_by: 'admin'
      },
      {
        name: 'Drinking Water Bottles',
        type: 'water',
        category: 'basic_needs',
        quantity: {
          current: 1000,
          allocated: 200,
          reserved: 100,
          unit: 'liters'
        },
        status: 'dispatched',
        priority: 'critical',
        location: {
          lat: 6.0521,
          lng: 80.2217,
          address: 'Galle Emergency Storage'
        },
        supplier: {
          name: 'Pure Water Lanka',
          contact: '+94723456789'
        },
        created_by: 'admin',
        updated_by: 'admin'
      },
      {
        name: 'Emergency Shelter Tents',
        type: 'shelter',
        category: 'basic_needs',
        quantity: {
          current: 50,
          allocated: 15,
          reserved: 5,
          unit: 'pieces'
        },
        status: 'available',
        priority: 'high',
        location: {
          lat: 8.5874,
          lng: 81.2152,
          address: 'Anuradhapura Relief Center'
        },
        supplier: {
          name: 'Shelter Solutions',
          contact: '+94734567890'
        },
        created_by: 'admin',
        updated_by: 'admin'
      },
      {
        name: 'Rescue Vehicles',
        type: 'transportation',
        category: 'logistics',
        quantity: {
          current: 10,
          allocated: 3,
          reserved: 1,
          unit: 'vehicles'
        },
        status: 'available',
        priority: 'high',
        location: {
          lat: 6.9271,
          lng: 79.8612,
          address: 'Colombo Fire Station'
        },
        supplier: {
          name: 'Emergency Transport',
          contact: '+94745678901'
        },
        created_by: 'admin',
        updated_by: 'admin'
      }
    ];
    
    // Clear all resources and create new ones
    await Resource.deleteMany({});
    console.log('🗑️ Cleared existing resources');
    
    const createdResources = await Resource.insertMany(sampleResources);
    console.log(`✅ Created ${createdResources.length} sample resources`);
    
    // Verify creation
    const count = await Resource.countDocuments();
    console.log(`📊 Total resources now: ${count}`);
    
    // List all resources
    const allResources = await Resource.find().select('name type status quantity.current');
    console.log('📦 All resources:');
    allResources.forEach((resource, index) => {
      console.log(`  ${index + 1}. ${resource.name} (${resource.type}) - ${resource.quantity.current} units - Status: ${resource.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📝 Resource creation completed');
  }
}

createSampleResources();
