const mongoose = require('mongoose');
const Report = require('./models/Report');
require('dotenv').config();

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://3halon:fnQsm550Po5uSTwb@cluster0.ng1rq.mongodb.net/disaster_platform';

async function seedSriLankanReports() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully');

    // Sri Lankan disaster reports with realistic coordinates
    const sriLankanReports = [
      {
        user_id: 'citizen_sl001',
        type: 'water',
        description: 'Heavy flooding in Colombo area, water levels rising rapidly',
        location: {
          lat: 6.9271,
          lng: 79.8612,
          address: 'Colombo Central',
          city: 'Colombo',
          state: 'Western Province',
          country: 'Sri Lanka'
        },
        status: 'pending',
        priority: 'high',
        affected_people: 150,
        resource_requirements: {
          food: 50,
          water: 75,
          shelter: 30,
          medical_supplies: 20,
          transportation: 10,
          personnel: 15
        },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        user_id: 'citizen_sl002',
        type: 'medical',
        description: 'Medical emergency in Kandy district',
        location: {
          lat: 7.2906,
          lng: 80.6337,
          address: 'Kandy City Center',
          city: 'Kandy',
          state: 'Central Province',
          country: 'Sri Lanka'
        },
        status: 'in_progress',
        priority: 'critical',
        affected_people: 25,
        resource_requirements: {
          medical_supplies: 40,
          personnel: 8,
          transportation: 5
        },
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      },
      {
        user_id: 'citizen_sl003',
        type: 'food',
        description: 'Food shortage in Galle due to transportation issues',
        location: {
          lat: 6.0329,
          lng: 80.2168,
          address: 'Galle Fort',
          city: 'Galle',
          state: 'Southern Province',
          country: 'Sri Lanka'
        },
        status: 'pending',
        priority: 'medium',
        affected_people: 80,
        resource_requirements: {
          food: 60,
          water: 30,
          transportation: 8
        },
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      },
      {
        user_id: 'citizen_sl004',
        type: 'shelter',
        description: 'Homes damaged by landslide in Nuwara Eliya',
        location: {
          lat: 6.9497,
          lng: 80.7891,
          address: 'Nuwara Eliya Town',
          city: 'Nuwara Eliya',
          state: 'Central Province',
          country: 'Sri Lanka'
        },
        status: 'addressed',
        priority: 'high',
        affected_people: 45,
        resource_requirements: {
          shelter: 25,
          food: 20,
          medical_supplies: 15
        },
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      },
      {
        user_id: 'citizen_sl005',
        type: 'water',
        description: 'Water contamination in Jaffna area',
        location: {
          lat: 9.6615,
          lng: 80.0255,
          address: 'Jaffna City',
          city: 'Jaffna',
          state: 'Northern Province',
          country: 'Sri Lanka'
        },
        status: 'pending',
        priority: 'high',
        affected_people: 120,
        resource_requirements: {
          water: 100,
          medical_supplies: 25,
          personnel: 12
        },
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      {
        user_id: 'citizen_sl006',
        type: 'communication',
        description: 'Communication breakdown after storm in Batticaloa',
        location: {
          lat: 7.7102,
          lng: 81.6924,
          address: 'Batticaloa Town',
          city: 'Batticaloa',
          state: 'Eastern Province',
          country: 'Sri Lanka'
        },
        status: 'in_progress',
        priority: 'medium',
        affected_people: 200,
        resource_requirements: {
          communication: 15,
          personnel: 10,
          transportation: 12
        },
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
      },
      {
        user_id: 'citizen_sl007',
        type: 'danger',
        description: 'Building collapse in Negombo',
        location: {
          lat: 7.2083,
          lng: 79.8358,
          address: 'Negombo Beach',
          city: 'Negombo',
          state: 'Western Province',
          country: 'Sri Lanka'
        },
        status: 'pending',
        priority: 'critical',
        affected_people: 35,
        resource_requirements: {
          personnel: 20,
          medical_supplies: 30,
          transportation: 8,
          shelter: 15
        },
        timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      },
      {
        user_id: 'citizen_sl008',
        type: 'transportation',
        description: 'Road blocked by fallen trees in Matara',
        location: {
          lat: 5.9485,
          lng: 80.5353,
          address: 'Matara Town',
          city: 'Matara',
          state: 'Southern Province',
          country: 'Sri Lanka'
        },
        status: 'addressed',
        priority: 'low',
        affected_people: 60,
        resource_requirements: {
          transportation: 6,
          personnel: 4
        },
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
      }
    ];

    console.log('Creating Sri Lankan disaster reports...');
    const createdReports = await Report.insertMany(sriLankanReports);
    console.log(`✅ Successfully created ${createdReports.length} Sri Lankan disaster reports!`);

    // Verify the data
    const sriLankanCount = await Report.countDocuments({
      'location.country': 'Sri Lanka'
    });
    console.log(`📊 Total Sri Lankan reports in database: ${sriLankanCount}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedSriLankanReports();
