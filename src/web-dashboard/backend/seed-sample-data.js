const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import models
const Resource = require('./models/Resource');
const Disaster = require('./models/Disaster');
const SosSignal = require('./models/SosSignal');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/disaster-platform';

const sampleResources = [
  {
    name: 'Emergency Medical Kit',
    type: 'medical_supplies',
    category: 'emergency',
    quantity: {
      current: 100,
      allocated: 15,
      reserved: 10,
      unit: 'units'
    },
    status: 'available',
    priority: 'high',
    location: {
      lat: 6.9271,
      lng: 79.8612,
      address: 'Colombo General Hospital'
    },
    supplier: 'MedSupply Lanka',
    created_by: new mongoose.Types.ObjectId(),
    updated_by: new mongoose.Types.ObjectId()
  },
  {
    name: 'Water Purification Tablets',
    type: 'water',
    category: 'emergency',
    quantity: {
      current: 500,
      allocated: 50,
      reserved: 25,
      unit: 'tablets'
    },
    status: 'available',
    priority: 'critical',
    location: {
      lat: 7.2906,
      lng: 80.6337,
      address: 'Kandy District Office'
    },
    supplier: 'AquaClean Ltd',
    created_by: new mongoose.Types.ObjectId(),
    updated_by: new mongoose.Types.ObjectId()
  },
  {
    name: 'Emergency Food Rations',
    type: 'food',
    category: 'emergency',
    quantity: {
      current: 200,
      allocated: 80,
      reserved: 20,
      unit: 'packets'
    },
    status: 'dispatched',
    priority: 'high',
    location: {
      lat: 6.0535,
      lng: 80.2210,
      address: 'Galle Distribution Center'
    },
    supplier: 'FoodAid Sri Lanka',
    created_by: new mongoose.Types.ObjectId(),
    updated_by: new mongoose.Types.ObjectId()
  },
  {
    name: 'Rescue Boats',
    type: 'vehicles',
    category: 'rescue',
    quantity: {
      current: 5,
      allocated: 2,
      reserved: 1,
      unit: 'units'
    },
    status: 'available',
    priority: 'critical',
    location: {
      lat: 6.8259,
      lng: 79.8612,
      address: 'Kelaniya River Station'
    },
    supplier: 'Marine Rescue Lanka',
    created_by: new mongoose.Types.ObjectId(),
    updated_by: new mongoose.Types.ObjectId()
  },
  {
    name: 'Temporary Shelters',
    type: 'shelter',
    category: 'housing',
    quantity: {
      current: 50,
      allocated: 30,
      reserved: 5,
      unit: 'tents'
    },
    status: 'reserved',
    priority: 'medium',
    location: {
      lat: 7.8731,
      lng: 80.7718,
      address: 'Central Province Warehouse'
    },
    supplier: 'ShelterTech Lanka',
    created_by: new mongoose.Types.ObjectId(),
    updated_by: new mongoose.Types.ObjectId()
  }
];

const sampleDisasters = [
  {
    type: 'flood',
    severity: 'high',
    title: 'Severe Flooding in Colombo District',
    description: 'Heavy rainfall has caused severe flooding in several areas of Colombo District affecting thousands of residents.',
    location: {
      lat: 6.9271,
      lng: 79.8612
    },
    status: 'active',
    disaster_code: 'DIS-2025-000001',
    priority_level: 'high',
    incident_commander: 'Major Perera',
    contact_number: '+94771234567',
    reporting_agency: 'Disaster Management Centre',
    public_alert: true,
    alert_message: 'Severe flood warning for Colombo District. Residents in low-lying areas should evacuate immediately.',
    evacuation_required: true,
    affected_population: 15000,
    estimated_duration: 72,
    created_by: new mongoose.Types.ObjectId()
  },
  {
    type: 'landslide',
    severity: 'critical',
    title: 'Landslide Risk in Nuwara Eliya',
    description: 'High risk of landslides in hill country due to continuous rainfall over the past 48 hours.',
    location: {
      lat: 6.9497,
      lng: 80.7891
    },
    status: 'monitoring',
    disaster_code: 'DIS-2025-000002',
    priority_level: 'critical',
    incident_commander: 'Captain Silva',
    contact_number: '+94771234568',
    reporting_agency: 'Geological Survey Department',
    public_alert: true,
    alert_message: 'Landslide warning for Nuwara Eliya district. Avoid travel in hilly areas.',
    evacuation_required: false,
    affected_population: 5000,
    estimated_duration: 48,
    created_by: new mongoose.Types.ObjectId()
  }
];

const sampleSosSignals = [
  {
    user_id: new mongoose.Types.ObjectId(),
    location: {
      lat: 6.9271,
      lng: 79.8612,
      address: 'Pettah, Colombo'
    },
    message: 'Trapped in flooded building, need immediate rescue',
    priority: 'critical',
    status: 'pending',
    urgency_level: 'critical',
    contact_method: 'mobile',
    contact_details: '+94771234569',
    verified: false
  },
  {
    user_id: new mongoose.Types.ObjectId(),
    location: {
      lat: 7.2906,
      lng: 80.6337,
      address: 'Kandy City Center'
    },
    message: 'Medical emergency - need ambulance',
    priority: 'high',
    status: 'responded',
    urgency_level: 'high',
    contact_method: 'mobile',
    contact_details: '+94771234570',
    verified: true,
    response_notes: 'Ambulance dispatched, ETA 15 minutes'
  }
];

async function seedData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Resource.deleteMany({});
    await Disaster.deleteMany({});
    await SosSignal.deleteMany({});

    // Insert sample data
    console.log('Inserting sample resources...');
    await Resource.insertMany(sampleResources);
    console.log(`✅ Inserted ${sampleResources.length} sample resources`);

    console.log('Inserting sample disasters...');
    await Disaster.insertMany(sampleDisasters);
    console.log(`✅ Inserted ${sampleDisasters.length} sample disasters`);

    console.log('Inserting sample SOS signals...');
    await SosSignal.insertMany(sampleSosSignals);
    console.log(`✅ Inserted ${sampleSosSignals.length} sample SOS signals`);

    console.log('🎉 Sample data seeded successfully!');
    
    // Display summary
    const resourceCount = await Resource.countDocuments();
    const disasterCount = await Disaster.countDocuments();
    const sosCount = await SosSignal.countDocuments();
    
    console.log('\n📊 Database Summary:');
    console.log(`- Resources: ${resourceCount}`);
    console.log(`- Disasters: ${disasterCount}`);
    console.log(`- SOS Signals: ${sosCount}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeding
seedData();
