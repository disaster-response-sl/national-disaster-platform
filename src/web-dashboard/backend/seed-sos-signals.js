const mongoose = require('mongoose');
const SosSignal = require('./models/SosSignal');
require('dotenv').config();

// Sri Lankan SOS signals seed data
const sosSignalsData = [
  {
    user_id: 'user_001',
    location: {
      lat: 6.9271,
      lng: 79.8612,
      address: 'Colombo Fort, Colombo'
    },
    message: 'Medical emergency - heart attack in progress at Colombo Fort',
    priority: 'critical',
    status: 'acknowledged',
    emergency_type: 'medical',
    contact_info: {
      phone: '+94-77-1234567',
      alternate_contact: '+94-77-7654321'
    },
    assigned_responder: 'responder_001',
    response_time: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    notes: [{
      responder_id: 'responder_001',
      note: 'Ambulance dispatched. ETA 5 minutes.',
      timestamp: new Date(Date.now() - 10 * 60 * 1000)
    }]
  },
  {
    user_id: 'user_002',
    location: {
      lat: 7.2931,
      lng: 80.6350,
      address: 'Kandy Lake, Kandy'
    },
    message: 'Fire in residential building near Kandy Lake',
    priority: 'high',
    status: 'responding',
    emergency_type: 'fire',
    contact_info: {
      phone: '+94-77-2345678'
    },
    assigned_responder: 'responder_002',
    response_time: new Date(Date.now() - 8 * 60 * 1000),
    escalation_level: 1
  },
  {
    user_id: 'user_003',
    location: {
      lat: 6.0329,
      lng: 80.2168,
      address: 'Galle Fort, Galle'
    },
    message: 'Car accident on Galle Road - multiple injuries',
    priority: 'high',
    status: 'pending',
    emergency_type: 'accident',
    contact_info: {
      phone: '+94-77-3456789'
    }
  },
  {
    user_id: 'user_004',
    location: {
      lat: 9.6615,
      lng: 80.0255,
      address: 'Jaffna City Center'
    },
    message: 'Flooding in Jaffna - water entering homes',
    priority: 'medium',
    status: 'acknowledged',
    emergency_type: 'natural_disaster',
    contact_info: {
      phone: '+94-77-4567890'
    },
    assigned_responder: 'responder_003',
    response_time: new Date(Date.now() - 25 * 60 * 1000)
  },
  {
    user_id: 'user_005',
    location: {
      lat: 8.5874,
      lng: 81.2152,
      address: 'Trincomalee Harbor'
    },
    message: 'Boat capsized in Trincomalee harbor - 3 people in water',
    priority: 'critical',
    status: 'responding',
    emergency_type: 'accident',
    contact_info: {
      phone: '+94-77-5678901'
    },
    assigned_responder: 'responder_004',
    response_time: new Date(Date.now() - 5 * 60 * 1000),
    escalation_level: 2
  },
  {
    user_id: 'user_006',
    location: {
      lat: 7.7174,
      lng: 81.6952,
      address: 'Batticaloa Town'
    },
    message: 'Medical emergency - diabetic patient unconscious',
    priority: 'high',
    status: 'resolved',
    emergency_type: 'medical',
    contact_info: {
      phone: '+94-77-6789012'
    },
    assigned_responder: 'responder_005',
    response_time: new Date(Date.now() - 45 * 60 * 1000),
    resolution_time: new Date(Date.now() - 20 * 60 * 1000)
  },
  {
    user_id: 'user_007',
    location: {
      lat: 8.3114,
      lng: 80.4037,
      address: 'Anuradhapura Sacred City'
    },
    message: 'Suspicious activity near ancient ruins',
    priority: 'medium',
    status: 'acknowledged',
    emergency_type: 'crime',
    contact_info: {
      phone: '+94-77-7890123'
    },
    assigned_responder: 'responder_006',
    response_time: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    user_id: 'user_008',
    location: {
      lat: 6.7056,
      lng: 80.3847,
      address: 'Ratnapura Gem City'
    },
    message: 'Landslide blocking main road to Ratnapura',
    priority: 'medium',
    status: 'pending',
    emergency_type: 'natural_disaster',
    contact_info: {
      phone: '+94-77-8901234'
    }
  },
  {
    user_id: 'user_009',
    location: {
      lat: 6.9894,
      lng: 81.0557,
      address: 'Badulla Town'
    },
    message: 'Power outage affecting entire neighborhood',
    priority: 'low',
    status: 'acknowledged',
    emergency_type: 'other',
    contact_info: {
      phone: '+94-77-9012345'
    },
    assigned_responder: 'responder_007',
    response_time: new Date(Date.now() - 60 * 60 * 1000)
  },
  {
    user_id: 'user_010',
    location: {
      lat: 5.9482,
      lng: 80.5353,
      address: 'Matara Beach'
    },
    message: 'Strong currents pulling swimmers out to sea',
    priority: 'high',
    status: 'responding',
    emergency_type: 'accident',
    contact_info: {
      phone: '+94-77-0123456'
    },
    assigned_responder: 'responder_008',
    response_time: new Date(Date.now() - 12 * 60 * 1000)
  }
];

// Generate 40 more SOS signals with varied data
const generateAdditionalSosSignals = () => {
  const additionalSignals = [];
  const cities = [
    { name: 'Colombo', lat: 6.9271, lng: 79.8612 },
    { name: 'Kandy', lat: 7.2931, lng: 80.6350 },
    { name: 'Galle', lat: 6.0329, lng: 80.2168 },
    { name: 'Jaffna', lat: 9.6615, lng: 80.0255 },
    { name: 'Trincomalee', lat: 8.5874, lng: 81.2152 },
    { name: 'Batticaloa', lat: 7.7174, lng: 81.6952 },
    { name: 'Anuradhapura', lat: 8.3114, lng: 80.4037 },
    { name: 'Ratnapura', lat: 6.7056, lng: 80.3847 },
    { name: 'Badulla', lat: 6.9894, lng: 81.0557 },
    { name: 'Matara', lat: 5.9482, lng: 80.5353 },
    { name: 'Kurunegala', lat: 7.4863, lng: 80.3647 },
    { name: 'Puttalam', lat: 8.0362, lng: 79.8282 },
    { name: 'Ampara', lat: 7.2975, lng: 81.6747 },
    { name: 'Polonnaruwa', lat: 7.9403, lng: 81.0188 },
    { name: 'Hambantota', lat: 6.1246, lng: 81.1185 }
  ];

  const emergencyTypes = ['medical', 'fire', 'accident', 'crime', 'natural_disaster', 'other'];
  const priorities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['pending', 'acknowledged', 'responding', 'resolved', 'false_alarm'];

  const messages = {
    medical: [
      'Severe chest pain - possible heart attack',
      'Unconscious person found on street',
      'Child having difficulty breathing',
      'Elderly person fallen and injured',
      'Diabetic emergency - blood sugar issues'
    ],
    fire: [
      'Building fire - smoke visible',
      'Electrical fire in residential area',
      'Forest fire spreading rapidly',
      'Car fire on highway',
      'Kitchen fire in apartment'
    ],
    accident: [
      'Car accident with injuries',
      'Motorcycle accident on main road',
      'Pedestrian hit by vehicle',
      'Bus accident - multiple casualties',
      'Construction site accident'
    ],
    crime: [
      'Suspicious person in neighborhood',
      'Theft in progress',
      'Assault reported',
      'Burglary alarm triggered',
      'Vandalism in public area'
    ],
    natural_disaster: [
      'Flooding in residential area',
      'Landslide blocking road',
      'Strong winds damaging property',
      'Heavy rain causing water accumulation',
      'Earthquake tremors felt'
    ],
    other: [
      'Power outage affecting community',
      'Water main break - flooding streets',
      'Gas leak reported',
      'Chemical spill in industrial area',
      'Structural damage to building'
    ]
  };

  for (let i = 10; i < 100; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const emergencyType = emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const messageOptions = messages[emergencyType];
    const message = messageOptions[Math.floor(Math.random() * messageOptions.length)];

    const signal = {
      user_id: `user_${String(i + 1).padStart(3, '0')}`,
      location: {
        lat: city.lat + (Math.random() - 0.5) * 0.05,
        lng: city.lng + (Math.random() - 0.5) * 0.05,
        address: `${city.name} area`
      },
      message: `${message} in ${city.name}`,
      priority,
      status,
      emergency_type: emergencyType,
      contact_info: {
        phone: `+94-77-${Math.floor(Math.random() * 9000000) + 1000000}`
      },
      assigned_responder: status !== 'pending' ? `responder_${Math.floor(Math.random() * 10) + 1}` : null,
      response_time: status !== 'pending' ? new Date(Date.now() - Math.floor(Math.random() * 120) * 60 * 1000) : null,
      resolution_time: status === 'resolved' ? new Date(Date.now() - Math.floor(Math.random() * 60) * 60 * 1000) : null,
      escalation_level: priority === 'critical' ? Math.floor(Math.random() * 3) : 0,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 7 * 24) * 60 * 60 * 1000) // Random time within last week
    };

    additionalSignals.push(signal);
  }

  return additionalSignals;
};

const seedSosSignals = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/disaster_platform');

    // Clear existing data
    await SosSignal.deleteMany({});

    // Combine base signals with generated ones
    const allSignals = [...sosSignalsData, ...generateAdditionalSosSignals()];

    // Insert all signals
    const insertedSignals = await SosSignal.insertMany(allSignals);

    console.log(`✅ Successfully seeded ${insertedSignals.length} SOS signals`);
    console.log('Sample SOS signals:');
    insertedSignals.slice(0, 5).forEach(signal => {
      console.log(`- ${signal.emergency_type.toUpperCase()}: ${signal.message.substring(0, 50)}...`);
    });

  } catch (error) {
    console.error('❌ Error seeding SOS signals:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run the seed function
if (require.main === module) {
  seedSosSignals();
}

module.exports = seedSosSignals;
