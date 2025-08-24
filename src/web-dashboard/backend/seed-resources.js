const mongoose = require('mongoose');
const Resource = require('./models/Resource');
require('dotenv').config();

const testResources = [
  {
    name: 'Emergency Medical Kit',
    type: 'medical',
    category: 'equipment',
    description: 'Comprehensive medical emergency kit with basic supplies',
    quantity: 50,
    available_quantity: 45,
    status: 'available',
    priority: 'high',
    location: {
      lat: 23.7937,
      lng: 90.4066,
      address: 'Dhaka Medical College Hospital, Dhaka'
    },
    vendor: {
      name: 'MedSupply Bangladesh',
      contact: '+880-1234-567890',
      email: 'contact@medsupply.bd'
    }
  },
  {
    name: 'Water Purification Tablets',
    type: 'water',
    category: 'consumable',
    description: 'Water purification tablets for emergency water treatment',
    quantity: 1000,
    available_quantity: 800,
    status: 'available',
    priority: 'critical',
    location: {
      lat: 22.3569,
      lng: 91.7832,
      address: 'Chittagong Port Area, Chittagong'
    },
    vendor: {
      name: 'AquaCare Ltd',
      contact: '+880-1234-567891',
      email: 'info@aquacare.bd'
    }
  },
  {
    name: 'Emergency Tents',
    type: 'shelter',
    category: 'equipment',
    description: 'Waterproof emergency tents for disaster victims',
    quantity: 25,
    available_quantity: 20,
    status: 'available',
    priority: 'high',
    location: {
      lat: 24.3745,
      lng: 88.6042,
      address: 'Rajshahi Division HQ, Rajshahi'
    },
    vendor: {
      name: 'Shelter Solutions',
      contact: '+880-1234-567892',
      email: 'shelter@solutions.bd'
    }
  },
  {
    name: 'Emergency Food Packets',
    type: 'food',
    category: 'consumable',
    description: 'Ready-to-eat emergency food packets',
    quantity: 500,
    available_quantity: 350,
    status: 'available',
    priority: 'medium',
    location: {
      lat: 23.1793,
      lng: 89.2126,
      address: 'Khulna District Relief Office, Khulna'
    },
    vendor: {
      name: 'FoodAid Bangladesh',
      contact: '+880-1234-567893',
      email: 'aid@foodaid.bd'
    }
  },
  {
    name: 'Rescue Boats',
    type: 'transportation',
    category: 'equipment',
    description: 'Small rescue boats for flood evacuation',
    quantity: 8,
    available_quantity: 6,
    status: 'available',
    priority: 'critical',
    location: {
      lat: 22.7010,
      lng: 90.3535,
      address: 'Barisal River Port, Barisal'
    },
    vendor: {
      name: 'Marine Rescue Co.',
      contact: '+880-1234-567894',
      email: 'rescue@marine.bd'
    }
  }
];

async function seedResources() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
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
