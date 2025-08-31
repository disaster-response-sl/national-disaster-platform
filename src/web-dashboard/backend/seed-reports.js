const mongoose = require('mongoose');
const Report = require('./models/Report');
require('dotenv').config();

// Sri Lankan reports seed data
const reportsData = [
  {
    user_id: 'user_001',
    type: 'food',
    description: 'Urgent need for food supplies in Colombo flood-affected areas. Families are without food for 2 days.',
    location: {
      lat: 6.9271,
      lng: 79.8612,
      address: 'Colombo Fort',
      city: 'Colombo',
      state: 'Western Province',
      country: 'Sri Lanka'
    },
    status: 'pending',
    priority: 'high',
    resource_requirements: {
      food: 500,
      water: 1000,
      medical_supplies: 50
    },
    affected_people: 150
  },
  {
    user_id: 'user_002',
    type: 'shelter',
    description: 'Homes destroyed by landslide in Badulla. 50 families need immediate shelter.',
    location: {
      lat: 6.9894,
      lng: 81.0557,
      address: 'Badulla Town',
      city: 'Badulla',
      state: 'Uva Province',
      country: 'Sri Lanka'
    },
    status: 'addressed',
    priority: 'critical',
    resource_requirements: {
      shelter: 50,
      food: 250,
      water: 500,
      medical_supplies: 100
    },
    affected_people: 200
  },
  {
    user_id: 'user_003',
    type: 'medical',
    description: 'Medical supplies needed for flood victims in Galle. Many injuries from flood waters.',
    location: {
      lat: 6.0329,
      lng: 80.2168,
      address: 'Galle Fort',
      city: 'Galle',
      state: 'Southern Province',
      country: 'Sri Lanka'
    },
    status: 'in_progress',
    priority: 'high',
    resource_requirements: {
      medical_supplies: 200,
      personnel: 10,
      water: 300
    },
    affected_people: 80
  },
  {
    user_id: 'user_004',
    type: 'water',
    description: 'Clean water shortage in drought-affected Anuradhapura district.',
    location: {
      lat: 8.3114,
      lng: 80.4037,
      address: 'Anuradhapura City',
      city: 'Anuradhapura',
      state: 'North Central Province',
      country: 'Sri Lanka'
    },
    status: 'pending',
    priority: 'medium',
    resource_requirements: {
      water: 2000,
      medical_supplies: 30
    },
    affected_people: 300
  },
  {
    user_id: 'user_005',
    type: 'transportation',
    description: 'Road blocked by landslide in Nuwara Eliya. Transportation assistance needed.',
    location: {
      lat: 6.9497,
      lng: 80.7891,
      address: 'Nuwara Eliya Town',
      city: 'Nuwara Eliya',
      state: 'Central Province',
      country: 'Sri Lanka'
    },
    status: 'addressed',
    priority: 'medium',
    resource_requirements: {
      transportation: 5,
      personnel: 15
    },
    affected_people: 120
  },
  {
    user_id: 'user_006',
    type: 'danger',
    description: 'Unstable building in Jaffna after minor earthquake. Evacuation needed.',
    location: {
      lat: 9.6615,
      lng: 80.0255,
      address: 'Jaffna City Center',
      city: 'Jaffna',
      state: 'Northern Province',
      country: 'Sri Lanka'
    },
    status: 'pending',
    priority: 'high',
    resource_requirements: {
      personnel: 20,
      shelter: 30
    },
    affected_people: 45
  },
  {
    user_id: 'user_007',
    type: 'food',
    description: 'Food distribution needed for cyclone-affected families in Trincomalee.',
    location: {
      lat: 8.5874,
      lng: 81.2152,
      address: 'Trincomalee Town',
      city: 'Trincomalee',
      state: 'Eastern Province',
      country: 'Sri Lanka'
    },
    status: 'in_progress',
    priority: 'medium',
    resource_requirements: {
      food: 300,
      water: 600,
      medical_supplies: 75
    },
    affected_people: 180
  },
  {
    user_id: 'user_008',
    type: 'communication',
    description: 'Communication breakdown in Batticaloa after heavy rains. Internet and phone services down.',
    location: {
      lat: 7.7174,
      lng: 81.6952,
      address: 'Batticaloa Town',
      city: 'Batticaloa',
      state: 'Eastern Province',
      country: 'Sri Lanka'
    },
    status: 'addressed',
    priority: 'low',
    resource_requirements: {
      personnel: 8
    },
    affected_people: 500
  },
  {
    user_id: 'user_009',
    type: 'medical',
    description: 'Medical assistance needed for injured workers at Ratnapura gem mines.',
    location: {
      lat: 6.7056,
      lng: 80.3847,
      address: 'Ratnapura Town',
      city: 'Ratnapura',
      state: 'Sabaragamuwa Province',
      country: 'Sri Lanka'
    },
    status: 'pending',
    priority: 'high',
    resource_requirements: {
      medical_supplies: 150,
      personnel: 12,
      transportation: 3
    },
    affected_people: 25
  },
  {
    user_id: 'user_010',
    type: 'shelter',
    description: 'Temporary shelter needed for families displaced by forest fire in Sinharaja.',
    location: {
      lat: 6.4256,
      lng: 80.3847,
      address: 'Sinharaja Forest Area',
      city: 'Deniyaya',
      state: 'Southern Province',
      country: 'Sri Lanka'
    },
    status: 'in_progress',
    priority: 'medium',
    resource_requirements: {
      shelter: 20,
      food: 100,
      water: 200
    },
    affected_people: 60
  }
];

// Generate 40 more reports with varied data
const generateAdditionalReports = () => {
  const additionalReports = [];
  const cities = [
    { name: 'Colombo', lat: 6.9271, lng: 79.8612, province: 'Western Province' },
    { name: 'Kandy', lat: 7.2931, lng: 80.6350, province: 'Central Province' },
    { name: 'Galle', lat: 6.0329, lng: 80.2168, province: 'Southern Province' },
    { name: 'Jaffna', lat: 9.6615, lng: 80.0255, province: 'Northern Province' },
    { name: 'Trincomalee', lat: 8.5874, lng: 81.2152, province: 'Eastern Province' },
    { name: 'Batticaloa', lat: 7.7174, lng: 81.6952, province: 'Eastern Province' },
    { name: 'Anuradhapura', lat: 8.3114, lng: 80.4037, province: 'North Central Province' },
    { name: 'Ratnapura', lat: 6.7056, lng: 80.3847, province: 'Sabaragamuwa Province' },
    { name: 'Badulla', lat: 6.9894, lng: 81.0557, province: 'Uva Province' },
    { name: 'Matara', lat: 5.9482, lng: 80.5353, province: 'Southern Province' },
    { name: 'Kurunegala', lat: 7.4863, lng: 80.3647, province: 'North Western Province' },
    { name: 'Puttalam', lat: 8.0362, lng: 79.8282, province: 'North Western Province' },
    { name: 'Ampara', lat: 7.2975, lng: 81.6747, province: 'Eastern Province' },
    { name: 'Polonnaruwa', lat: 7.9403, lng: 81.0188, province: 'North Central Province' },
    { name: 'Hambantota', lat: 6.1246, lng: 81.1185, province: 'Southern Province' }
  ];

  const reportTypes = ['food', 'shelter', 'medical', 'water', 'transportation', 'communication', 'danger'];
  const statuses = ['pending', 'addressed', 'in_progress'];
  const priorities = ['low', 'medium', 'high', 'critical'];

  const descriptions = {
    food: [
      'Food supplies urgently needed for families affected by recent disaster',
      'Hunger crisis in community - no food for several days',
      'Food distribution required for displaced families',
      'Emergency food aid needed for vulnerable households'
    ],
    shelter: [
      'Homes destroyed - immediate shelter required',
      'Temporary accommodation needed for displaced families',
      'Roofless families need emergency shelter',
      'Housing assistance required after disaster'
    ],
    medical: [
      'Medical supplies and assistance urgently needed',
      'Injuries from disaster require immediate medical attention',
      'Healthcare support needed for affected community',
      'Medical emergency - supplies running low'
    ],
    water: [
      'Clean drinking water shortage in affected area',
      'Water contamination issues after flooding',
      'Water supply disrupted - emergency water needed',
      'Hydration support required for disaster victims'
    ],
    transportation: [
      'Roads blocked - transportation assistance needed',
      'Evacuation transportation required',
      'Medical transportation for injured persons',
      'Logistics support needed for relief operations'
    ],
    communication: [
      'Communication breakdown - emergency communication needed',
      'Internet and phone services down',
      'Information dissemination support required',
      'Communication equipment needed for coordination'
    ],
    danger: [
      'Immediate danger - evacuation required',
      'Unsafe conditions - emergency response needed',
      'Hazardous situation requiring immediate attention',
      'Safety threat to community - urgent action needed'
    ]
  };

  for (let i = 10; i < 100; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const type = reportTypes[Math.floor(Math.random() * reportTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];

    const descriptionOptions = descriptions[type];
    const description = descriptionOptions[Math.floor(Math.random() * descriptionOptions.length)];

    const report = {
      user_id: `user_${String(i + 1).padStart(3, '0')}`,
      type,
      description: `${description} in ${city.name} area.`,
      location: {
        lat: city.lat + (Math.random() - 0.5) * 0.03,
        lng: city.lng + (Math.random() - 0.5) * 0.03,
        address: `${city.name} area`,
        city: city.name,
        state: city.province,
        country: 'Sri Lanka'
      },
      status,
      priority,
      resource_requirements: {
        food: type === 'food' ? Math.floor(Math.random() * 500) + 50 : 0,
        water: type === 'water' ? Math.floor(Math.random() * 1000) + 100 : Math.floor(Math.random() * 200),
        medical_supplies: type === 'medical' ? Math.floor(Math.random() * 200) + 20 : Math.floor(Math.random() * 50),
        shelter: type === 'shelter' ? Math.floor(Math.random() * 100) + 10 : 0,
        transportation: type === 'transportation' ? Math.floor(Math.random() * 20) + 2 : 0,
        personnel: Math.floor(Math.random() * 30) + 5
      },
      affected_people: Math.floor(Math.random() * 200) + 10,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24) * 60 * 60 * 1000) // Random time within last week
    };

    additionalReports.push(report);
  }

  return additionalReports;
};

const seedReports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/disaster_platform');

    // Clear existing data
    await Report.deleteMany({});

    // Combine base reports with generated ones
    const allReports = [...reportsData, ...generateAdditionalReports()];

    // Insert all reports
    const insertedReports = await Report.insertMany(allReports);

    console.log(`✅ Successfully seeded ${insertedReports.length} reports`);
    console.log('Sample reports:');
    insertedReports.slice(0, 5).forEach(report => {
      console.log(`- ${report.type.toUpperCase()}: ${report.description.substring(0, 50)}...`);
    });

  } catch (error) {
    console.error('❌ Error seeding reports:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run the seed function
if (require.main === module) {
  seedReports();
}

module.exports = seedReports;
