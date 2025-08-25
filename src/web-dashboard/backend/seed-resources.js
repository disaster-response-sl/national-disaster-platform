const mongoose = require('mongoose');
const Resource = require('./models/Resource');
require('dotenv').config();

const testResources = [
  {
    name: 'Emergency Medical Kit',
    type: 'medicine',
    category: 'medical',
    description: 'Comprehensive medical emergency kit with basic supplies',
    quantity: { current: 100, allocated: 10, reserved: 5, unit: 'pieces' },
    status: 'available',
    priority: 'high',
    location: { lat: 6.9271, lng: 79.8612, address: 'Colombo General Hospital' },
    created_by: 'admin001',
    updated_by: 'admin001'
  },
  {
    name: 'Water Bottles',
    type: 'water',
    category: 'basic_needs',
    description: 'Packaged drinking water bottles',
    quantity: { current: 500, allocated: 50, reserved: 20, unit: 'liters' },
    status: 'available',
    priority: 'medium',
    location: { lat: 7.2906, lng: 80.6337, address: 'Kandy Relief Center' },
    created_by: 'admin001',
    updated_by: 'admin001'
  },
  {
    name: 'Temporary Shelter Tents',
    type: 'shelter',
    category: 'infrastructure',
    description: 'Waterproof emergency tents for disaster victims',
    quantity: { current: 40, allocated: 5, reserved: 2, unit: 'sets' },
    status: 'available',
    priority: 'high',
    location: { lat: 6.0535, lng: 80.221, address: 'Galle District Storage' },
    created_by: 'admin001',
    updated_by: 'admin001'
  },
  {
    name: 'Rice Bags',
    type: 'food',
    category: 'basic_needs',
    description: 'Bags of rice for food relief',
    quantity: { current: 200, allocated: 30, reserved: 10, unit: 'kg' },
    status: 'available',
    priority: 'medium',
    location: { lat: 8.3114, lng: 80.4037, address: 'Anuradhapura Food Depot' },
    created_by: 'admin001',
    updated_by: 'admin001'
  },
  {
    name: 'Ambulance',
    type: 'transportation',
    category: 'logistics',
    description: 'Emergency ambulance vehicle',
    quantity: { current: 5, allocated: 1, reserved: 1, unit: 'vehicles' },
    status: 'available',
    priority: 'critical',
    location: { lat: 7.8731, lng: 80.7718, address: 'Central Vehicle Pool' },
    created_by: 'admin001',
    updated_by: 'admin001'
  },
  {
    name: 'Blankets',
    type: 'clothing',
    category: 'basic_needs',
    description: 'Warm blankets for displaced persons',
    quantity: { current: 300, allocated: 20, reserved: 10, unit: 'pieces' },
    status: 'available',
    priority: 'medium',
    location: { lat: 6.0329, lng: 80.217, address: 'Matara Relief Center' },
    created_by: 'admin001',
    updated_by: 'admin001'
  },
  {
    name: 'Satellite Phones',
    type: 'communication',
    category: 'logistics',
    description: 'Satellite phones for emergency communication',
    quantity: { current: 15, allocated: 2, reserved: 1, unit: 'pieces' },
    status: 'available',
    priority: 'high',
    location: { lat: 9.6615, lng: 80.0255, address: 'Jaffna Command Center' },
    created_by: 'admin001',
    updated_by: 'admin001'
  },
  {
    name: 'Medical Gloves',
    type: 'medical_supplies',
    category: 'medical',
    description: 'Disposable medical gloves',
    quantity: { current: 1000, allocated: 100, reserved: 50, unit: 'boxes' },
    status: 'available',
    priority: 'medium',
    location: { lat: 7.8731, lng: 80.7718, address: 'Central Medical Store' },
    created_by: 'admin001',
    updated_by: 'admin001'
  },
  {
    name: 'Rescue Team',
    type: 'personnel',
    category: 'emergency',
    description: 'Trained rescue personnel',
    quantity: { current: 20, allocated: 5, reserved: 2, unit: 'people' },
    status: 'available',
    priority: 'critical',
    location: { lat: 6.9271, lng: 79.8612, address: 'Colombo HQ' },
    created_by: 'admin001',
    updated_by: 'admin001'
  },
  {
    name: 'Excavators',
    type: 'equipment',
    category: 'infrastructure',
    description: 'Heavy-duty excavators for debris removal',
    quantity: { current: 3, allocated: 1, reserved: 0, unit: 'sets' },
    status: 'available',
    priority: 'high',
    location: { lat: 7.2906, lng: 80.6337, address: 'Kandy Equipment Yard' },
    created_by: 'admin001',
    updated_by: 'admin001'
  }
];

async function seedResources() {
  try {
    console.log('Connecting to MongoDB...');
  // Use MONGODB_URI or fallback to MONGO_URI for compatibility
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('MongoDB URI not set in environment variables.');
  await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Clear existing resources
    console.log('Clearing existing resources...');
    await Resource.deleteMany({});

    // Insert test resources
    console.log('Inserting test resources...');
    const insertedResources = await Resource.insertMany(testResources);
    
    console.log(`Successfully inserted ${insertedResources.length} test resources:`);
    insertedResources.forEach(resource => {
      console.log(`- ${resource.name} (${resource.type}) - ${resource.available_quantity} available`);
    });

    console.log('Resource seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding resources:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedResources();
