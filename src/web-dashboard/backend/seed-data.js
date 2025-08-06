const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Disaster = require('./models/Disaster');
const Report = require('./models/Report');
const SosSignal = require('./models/SosSignal');
const Resource = require('./models/Resource');
const ChatLog = require('./models/ChatLog');

// Sample data
const sampleDisasters = [
  {
    type: 'flood',
    severity: 'high',
    description: 'Heavy rainfall causing flooding in Colombo district',
    location: { lat: 6.9271, lng: 79.8612 },
    status: 'active'
  },
  {
    type: 'landslide',
    severity: 'medium',
    description: 'Landslide warning in Kandy district due to heavy rains',
    location: { lat: 7.2906, lng: 80.6337 },
    status: 'active'
  },
  {
    type: 'cyclone',
    severity: 'high',
    description: 'Cyclone approaching eastern coast',
    location: { lat: 7.8731, lng: 81.0588 },
    status: 'active'
  }
];

const sampleReports = [
  {
    user_id: 'citizen001',
    type: 'food',
    description: 'Food shortage in our area due to flood',
    status: 'pending'
  },
  {
    user_id: 'citizen001',
    type: 'shelter',
    description: 'Need emergency shelter for displaced families',
    status: 'pending'
  },
  {
    user_id: 'responder001',
    type: 'medical',
    description: 'Medical supplies needed for injured people',
    status: 'addressed'
  }
];

const sampleSosSignals = [
  {
    user_id: 'citizen001',
    location: { lat: 6.9271, lng: 79.8612 },
    message: 'Emergency! Trapped in flood water',
    priority: 'high'
  },
  {
    user_id: 'citizen001',
    location: { lat: 7.2906, lng: 80.6337 },
    message: 'Need immediate rescue from landslide area',
    priority: 'high'
  }
];

const sampleResources = [
  {
    type: 'food',
    quantity: 500,
    status: 'available',
    location: { lat: 6.9271, lng: 79.8612 }
  },
  {
    type: 'medicine',
    quantity: 200,
    status: 'available',
    location: { lat: 7.2906, lng: 80.6337 }
  },
  {
    type: 'shelter',
    quantity: 50,
    status: 'available',
    location: { lat: 7.8731, lng: 81.0588 }
  }
];

const sampleChatLogs = [
  {
    user_id: 'citizen001',
    query: 'How do I report a flood in my area?',
    response: 'You can use the Report button in the app to submit an incident report. Make sure to include your location and details.'
  },
  {
    user_id: 'citizen001',
    query: 'Where can I find emergency shelter?',
    response: 'Emergency shelters are available at designated locations. Check the Resources section for nearby shelter information.'
  }
];

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Disaster.deleteMany({});
    await Report.deleteMany({});
    await SosSignal.deleteMany({});
    await Resource.deleteMany({});
    await ChatLog.deleteMany({});
    console.log('Cleared existing data');

    // Insert sample data
    await Disaster.insertMany(sampleDisasters);
    await Report.insertMany(sampleReports);
    await SosSignal.insertMany(sampleSosSignals);
    await Resource.insertMany(sampleResources);
    await ChatLog.insertMany(sampleChatLogs);
    console.log('Sample data inserted successfully');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData(); 