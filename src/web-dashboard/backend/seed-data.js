const mongoose = require('mongoose');
const Report = require('./models/Report');
const Disaster = require('./models/Disaster');
require('dotenv').config();

// Sample data for Bangladesh coordinates
const bangladeshCoordinates = [
  { lat: 23.7937, lng: 90.4066, city: 'Dhaka' },
  { lat: 22.3569, lng: 91.7832, city: 'Chittagong' },
  { lat: 23.7289, lng: 90.3854, city: 'Dhaka' },
  { lat: 24.3745, lng: 88.6042, city: 'Rajshahi' },
  { lat: 22.7010, lng: 90.3535, city: 'Barisal' },
  { lat: 23.1793, lng: 89.2126, city: 'Khulna' },
  { lat: 24.8918, lng: 91.8720, city: 'Sylhet' },
  { lat: 25.7439, lng: 89.2752, city: 'Rangpur' },
  { lat: 22.8456, lng: 89.5403, city: 'Khulna' },
  { lat: 23.4607, lng: 91.1809, city: 'Comilla' },
  { lat: 24.7471, lng: 90.4203, city: 'Mymensingh' },
  { lat: 22.1987, lng: 92.2974, city: 'Chittagong' },
  { lat: 23.6228, lng: 90.4996, city: 'Dhaka' },
  { lat: 24.3636, lng: 88.6241, city: 'Rajshahi' },
  { lat: 22.7010, lng: 90.3535, city: 'Barisal' }
];

const reportTypes = ['food', 'shelter', 'danger', 'medical', 'water', 'transportation', 'communication'];
const priorities = ['low', 'medium', 'high', 'critical'];
const statuses = ['pending', 'addressed', 'in_progress'];

const disasterTypes = ['flood', 'landslide', 'cyclone'];
const severities = ['low', 'medium', 'high'];

async function seedReports() {
  try {
    // Clear existing reports
    await Report.deleteMany({});
    console.log('Cleared existing reports');

    const reports = [];
    const now = new Date();

    // Generate 50 sample reports
    for (let i = 0; i < 50; i++) {
      const coord = bangladeshCoordinates[Math.floor(Math.random() * bangladeshCoordinates.length)];
      const type = reportTypes[Math.floor(Math.random() * reportTypes.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Add some random variation to coordinates for clustering effect
      const lat = coord.lat + (Math.random() - 0.5) * 0.1;
      const lng = coord.lng + (Math.random() - 0.5) * 0.1;
      
      const report = {
        user_id: `user_${Math.floor(Math.random() * 1000)}`,
        disaster_id: `disaster_${Math.floor(Math.random() * 10)}`,
        type,
        description: `Sample ${type} report in ${coord.city} area`,
        status,
        priority,
        location: {
          lat,
          lng,
          address: `${coord.city} area`,
          city: coord.city,
          state: 'Bangladesh',
          country: 'Bangladesh'
        },
        resource_requirements: {
          food: type === 'food' ? Math.floor(Math.random() * 100) : 0,
          water: type === 'water' ? Math.floor(Math.random() * 50) : 0,
          medical_supplies: type === 'medical' ? Math.floor(Math.random() * 20) : 0,
          shelter: type === 'shelter' ? Math.floor(Math.random() * 10) : 0,
          transportation: type === 'transportation' ? Math.floor(Math.random() * 5) : 0,
          personnel: Math.floor(Math.random() * 10)
        },
        affected_people: Math.floor(Math.random() * 50) + 1,
        timestamp: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
      };
      
      reports.push(report);
    }

    await Report.insertMany(reports);
    console.log(`Seeded ${reports.length} reports`);
  } catch (error) {
    console.error('Error seeding reports:', error);
  }
}

async function seedDisasters() {
  try {
    // Clear existing disasters
    await Disaster.deleteMany({});
    console.log('Cleared existing disasters');

    const disasters = [];
    const now = new Date();

    // Generate 10 sample disasters
    for (let i = 0; i < 10; i++) {
      const coord = bangladeshCoordinates[Math.floor(Math.random() * bangladeshCoordinates.length)];
      const type = disasterTypes[Math.floor(Math.random() * disasterTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      
      const disaster = {
        type,
        severity,
        description: `Sample ${type} disaster in ${coord.city} area`,
        location: {
          lat: coord.lat + (Math.random() - 0.5) * 0.05,
          lng: coord.lng + (Math.random() - 0.5) * 0.05
        },
        status: Math.random() > 0.3 ? 'active' : 'resolved',
        timestamp: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random time in last 30 days
      };
      
      disasters.push(disaster);
    }

    await Disaster.insertMany(disasters);
    console.log(`Seeded ${disasters.length} disasters`);
  } catch (error) {
    console.error('Error seeding disasters:', error);
  }
}

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Seed data
    await seedDisasters();
    await seedReports();

    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = { seedReports, seedDisasters, seedData };

