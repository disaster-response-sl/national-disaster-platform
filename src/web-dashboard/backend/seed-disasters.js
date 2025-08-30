const mongoose = require('mongoose');
const Disaster = require('./models/Disaster');
require('dotenv').config();

// Sri Lankan disaster seed data
const disasterData = [
  {
    type: 'flood',
    severity: 'high',
    title: 'Kelani River Flooding in Colombo District',
    description: 'Heavy monsoon rains have caused severe flooding along the Kelani River, affecting multiple areas in Colombo district including Colombo city, Dehiwala, and surrounding suburbs.',
    location: { lat: 6.9271, lng: 79.8612 },
    status: 'active',
    priority_level: 'high',
    response_status: 'responding',
    zones: [
      {
        zone_name: 'Colombo Fort Zone',
        zone_boundary: [
          [6.9171, 79.8512],
          [6.9171, 79.8712],
          [6.9371, 79.8712],
          [6.9371, 79.8512]
        ],
        estimated_population: 150000,
        area_km2: 25,
        risk_level: 'high'
      },
      {
        zone_name: 'Colombo Suburban Zone',
        zone_boundary: [
          [6.9071, 79.8412],
          [6.9071, 79.8812],
          [6.9471, 79.8812],
          [6.9471, 79.8412]
        ],
        estimated_population: 200000,
        area_km2: 40,
        risk_level: 'medium'
      }
    ],
    resources_required: {
      personnel: 150,
      rescue_teams: 8,
      medical_units: 5,
      vehicles: 25,
      boats: 12,
      food_supplies: 50000,
      water_supplies: 100000,
      medical_supplies: 2000,
      temporary_shelters: 500
    },
    incident_commander: 'Col. Rajapaksa',
    contact_number: '+94-11-1234567',
    reporting_agency: 'Sri Lanka Disaster Management Centre',
    public_alert: true,
    alert_message: 'Heavy flooding in Colombo district. Avoid low-lying areas. Emergency services are responding.',
    evacuation_required: true,
    evacuation_zones: ['Colombo Fort', 'Pettah', 'Slave Island']
  },
  {
    type: 'landslide',
    severity: 'critical',
    title: 'Landslide in Badulla District',
    description: 'Major landslide triggered by heavy rainfall in the Badulla district, affecting the Haputale and Bandarawela areas with significant property damage and casualties.',
    location: { lat: 6.7681, lng: 80.9572 },
    status: 'active',
    priority_level: 'critical',
    response_status: 'responding',
    zones: [
      {
        zone_name: 'Badulla Central Zone',
        zone_boundary: [
          [6.7581, 80.9472],
          [6.7581, 80.9672],
          [6.7781, 80.9672],
          [6.7781, 80.9472]
        ],
        estimated_population: 80000,
        area_km2: 15,
        risk_level: 'critical'
      },
      {
        zone_name: 'Haputale Zone',
        zone_boundary: [
          [6.7481, 80.9372],
          [6.7481, 80.9772],
          [6.7881, 80.9772],
          [6.7881, 80.9372]
        ],
        estimated_population: 45000,
        area_km2: 20,
        risk_level: 'high'
      }
    ],
    resources_required: {
      personnel: 200,
      rescue_teams: 12,
      medical_units: 8,
      vehicles: 35,
      helicopters: 3,
      food_supplies: 30000,
      water_supplies: 60000,
      medical_supplies: 3000,
      temporary_shelters: 300
    },
    incident_commander: 'Brig. Fernando',
    contact_number: '+94-55-2345678',
    reporting_agency: 'Sri Lanka Army Disaster Response Unit',
    public_alert: true,
    alert_message: 'CRITICAL: Major landslide in Badulla district. Multiple casualties reported. Stay clear of affected areas.',
    evacuation_required: true,
    evacuation_zones: ['Haputale Main Road', 'Bandarawela Bypass']
  },
  {
    type: 'cyclone',
    severity: 'high',
    title: 'Cyclone Warning - Eastern Province',
    description: 'Tropical cyclone approaching Sri Lanka\'s eastern coast, expected to make landfall near Trincomalee with strong winds and heavy rainfall.',
    location: { lat: 8.5874, lng: 81.2152 },
    status: 'active',
    priority_level: 'high',
    response_status: 'preparing',
    zones: [
      {
        zone_name: 'Trincomalee Coastal Zone',
        zone_boundary: [
          [8.5774, 81.2052],
          [8.5774, 81.2252],
          [8.5974, 81.2252],
          [8.5974, 81.2052]
        ],
        estimated_population: 120000,
        area_km2: 30,
        risk_level: 'high'
      },
      {
        zone_name: 'Batticaloa Zone',
        zone_boundary: [
          [7.7074, 81.6852],
          [7.7074, 81.7052],
          [7.7274, 81.7052],
          [7.7274, 81.6852]
        ],
        estimated_population: 95000,
        area_km2: 25,
        risk_level: 'medium'
      }
    ],
    resources_required: {
      personnel: 300,
      rescue_teams: 15,
      medical_units: 12,
      vehicles: 50,
      boats: 20,
      helicopters: 5,
      food_supplies: 100000,
      water_supplies: 200000,
      medical_supplies: 5000,
      temporary_shelters: 1000
    },
    incident_commander: 'Rear Adm. Perera',
    contact_number: '+94-26-3456789',
    reporting_agency: 'Sri Lanka Navy Coastal Command',
    public_alert: true,
    alert_message: 'CYCLONE WARNING: Tropical storm approaching eastern coast. Prepare for high winds and heavy rain.',
    evacuation_required: true,
    evacuation_zones: ['Trincomalee Harbour', 'Batticaloa Lagoon Area']
  },
  {
    type: 'flood',
    severity: 'medium',
    title: 'Flooding in Ratnapura District',
    description: 'Moderate flooding in Ratnapura district due to overflow of Kalu River and its tributaries, affecting agricultural lands and some residential areas.',
    location: { lat: 6.7056, lng: 80.3847 },
    status: 'active',
    priority_level: 'medium',
    response_status: 'responding',
    zones: [
      {
        zone_name: 'Ratnapura Central Zone',
        zone_boundary: [
          [6.6956, 80.3747],
          [6.6956, 80.3947],
          [6.7156, 80.3947],
          [6.7156, 80.3747]
        ],
        estimated_population: 65000,
        area_km2: 18,
        risk_level: 'medium'
      }
    ],
    resources_required: {
      personnel: 80,
      rescue_teams: 5,
      medical_units: 3,
      vehicles: 15,
      boats: 8,
      food_supplies: 25000,
      water_supplies: 50000,
      medical_supplies: 1000,
      temporary_shelters: 200
    },
    incident_commander: 'Maj. Gunawardena',
    contact_number: '+94-45-4567890',
    reporting_agency: 'Sri Lanka Police Disaster Unit',
    public_alert: true,
    alert_message: 'Flooding in Ratnapura district. Exercise caution near rivers and low-lying areas.',
    evacuation_required: false
  },
  {
    type: 'drought',
    severity: 'medium',
    title: 'Drought Conditions in Anuradhapura District',
    description: 'Prolonged dry spell affecting Anuradhapura district with water scarcity issues and impact on agriculture and daily water supply.',
    location: { lat: 8.3114, lng: 80.4037 },
    status: 'active',
    priority_level: 'medium',
    response_status: 'responding',
    zones: [
      {
        zone_name: 'Anuradhapura Central Zone',
        zone_boundary: [
          [8.3014, 80.3937],
          [8.3014, 80.4137],
          [8.3214, 80.4137],
          [8.3214, 80.3937]
        ],
        estimated_population: 75000,
        area_km2: 22,
        risk_level: 'medium'
      }
    ],
    resources_required: {
      personnel: 60,
      vehicles: 20,
      water_supplies: 150000,
      food_supplies: 20000,
      medical_supplies: 800
    },
    incident_commander: 'Dr. Silva',
    contact_number: '+94-25-5678901',
    reporting_agency: 'Sri Lanka Water Board',
    public_alert: true,
    alert_message: 'Water scarcity in Anuradhapura district. Conserve water and follow rationing guidelines.',
    evacuation_required: false
  },
  {
    type: 'fire',
    severity: 'high',
    title: 'Forest Fire in Sinharaja Rainforest',
    description: 'Major forest fire in Sinharaja World Heritage Site affecting biodiversity and requiring immediate firefighting response.',
    location: { lat: 6.4256, lng: 80.3847 },
    status: 'active',
    priority_level: 'high',
    response_status: 'responding',
    zones: [
      {
        zone_name: 'Sinharaja Forest Zone',
        zone_boundary: [
          [6.4156, 80.3747],
          [6.4156, 80.3947],
          [6.4356, 80.3947],
          [6.4356, 80.3747]
        ],
        estimated_population: 15000,
        area_km2: 35,
        risk_level: 'high'
      }
    ],
    resources_required: {
      personnel: 120,
      rescue_teams: 8,
      vehicles: 30,
      helicopters: 4,
      water_supplies: 80000,
      medical_supplies: 1500
    },
    incident_commander: 'Col. Jayawardena',
    contact_number: '+94-45-6789012',
    reporting_agency: 'Sri Lanka Forest Department',
    public_alert: true,
    alert_message: 'Forest fire in Sinharaja. Avoid the area and follow evacuation instructions.',
    evacuation_required: true,
    evacuation_zones: ['Sinharaja Access Roads', 'Nearby Villages']
  },
  {
    type: 'landslide',
    severity: 'medium',
    title: 'Landslide Risk in Nuwara Eliya District',
    description: 'Multiple landslide warnings in Nuwara Eliya district tea plantation areas due to heavy rainfall and unstable terrain.',
    location: { lat: 6.9497, lng: 80.7891 },
    status: 'monitoring',
    priority_level: 'medium',
    response_status: 'preparing',
    zones: [
      {
        zone_name: 'Nuwara Eliya Plantation Zone',
        zone_boundary: [
          [6.9397, 80.7791],
          [6.9397, 80.7991],
          [6.9597, 80.7991],
          [6.9597, 80.7791]
        ],
        estimated_population: 55000,
        area_km2: 28,
        risk_level: 'medium'
      }
    ],
    resources_required: {
      personnel: 40,
      rescue_teams: 3,
      vehicles: 12,
      medical_supplies: 600
    },
    incident_commander: 'Capt. Abeysinghe',
    contact_number: '+94-52-7890123',
    reporting_agency: 'Sri Lanka Geological Survey',
    public_alert: true,
    alert_message: 'Landslide risk in Nuwara Eliya district. Monitor weather conditions.',
    evacuation_required: false
  },
  {
    type: 'flood',
    severity: 'low',
    title: 'Minor Flooding in Galle District',
    description: 'Minor flooding in low-lying areas of Galle town due to high tide and light rainfall.',
    location: { lat: 6.0329, lng: 80.2168 },
    status: 'active',
    priority_level: 'low',
    response_status: 'responding',
    zones: [
      {
        zone_name: 'Galle Coastal Zone',
        zone_boundary: [
          [6.0229, 80.2068],
          [6.0229, 80.2268],
          [6.0429, 80.2268],
          [6.0429, 80.2068]
        ],
        estimated_population: 45000,
        area_km2: 12,
        risk_level: 'low'
      }
    ],
    resources_required: {
      personnel: 25,
      vehicles: 8,
      boats: 3,
      water_supplies: 10000
    },
    incident_commander: 'Sgt. Wijesinghe',
    contact_number: '+94-91-8901234',
    reporting_agency: 'Galle Municipal Council',
    public_alert: false,
    evacuation_required: false
  },
  {
    type: 'cyclone',
    severity: 'low',
    title: 'Cyclone Monitoring - Southern Coast',
    description: 'Monitoring tropical disturbance off Sri Lanka\'s southern coast with potential for development.',
    location: { lat: 5.9482, lng: 80.5353 },
    status: 'monitoring',
    priority_level: 'low',
    response_status: 'preparing',
    zones: [
      {
        zone_name: 'Matara Coastal Zone',
        zone_boundary: [
          [5.9382, 80.5253],
          [5.9382, 80.5453],
          [5.9582, 80.5453],
          [5.9582, 80.5253]
        ],
        estimated_population: 38000,
        area_km2: 16,
        risk_level: 'low'
      }
    ],
    resources_required: {
      personnel: 30,
      vehicles: 10,
      boats: 5
    },
    incident_commander: 'Lt. Cdr. Ratnayake',
    contact_number: '+94-47-9012345',
    reporting_agency: 'Sri Lanka Meteorological Department',
    public_alert: false,
    evacuation_required: false
  },
  {
    type: 'earthquake',
    severity: 'low',
    title: 'Minor Earthquake in Central Province',
    description: 'Minor earthquake (magnitude 3.2) recorded in Kandy district with no reported damage.',
    location: { lat: 7.2931, lng: 80.6350 },
    status: 'resolved',
    priority_level: 'low',
    response_status: 'completed',
    zones: [
      {
        zone_name: 'Kandy Central Zone',
        zone_boundary: [
          [7.2831, 80.6250],
          [7.2831, 80.6450],
          [7.3031, 80.6450],
          [7.3031, 80.6250]
        ],
        estimated_population: 85000,
        area_km2: 20,
        risk_level: 'low'
      }
    ],
    resources_required: {
      personnel: 15,
      medical_units: 2
    },
    incident_commander: 'Dr. Bandara',
    contact_number: '+94-81-0123456',
    reporting_agency: 'Sri Lanka Geological Survey',
    public_alert: false,
    evacuation_required: false
  }
];

// Generate 40 more disasters with varied data
const generateAdditionalDisasters = () => {
  const additionalDisasters = [];
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

  const disasterTypes = ['flood', 'landslide', 'cyclone', 'fire', 'earthquake', 'drought'];
  const severities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['active', 'monitoring', 'resolved', 'archived'];

  for (let i = 10; i < 100; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const type = disasterTypes[Math.floor(Math.random() * disasterTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const disaster = {
      type,
      severity,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Incident in ${city.name}`,
      description: `${severity.charAt(0).toUpperCase() + severity.slice(1)} ${type} affecting ${city.name} area with ${Math.floor(Math.random() * 1000) + 100} people impacted.`,
      location: {
        lat: city.lat + (Math.random() - 0.5) * 0.1,
        lng: city.lng + (Math.random() - 0.5) * 0.1
      },
      status,
      priority_level: severity,
      response_status: status === 'resolved' ? 'completed' : status === 'active' ? 'responding' : 'preparing',
    zones: [
      {
        zone_name: `${city.name} Central Zone`,
        zone_boundary: [
          [city.lat - 0.01, city.lng - 0.01],
          [city.lat - 0.01, city.lng + 0.01],
          [city.lat + 0.01, city.lng + 0.01],
          [city.lat + 0.01, city.lng - 0.01]
        ],
        estimated_population: Math.floor(Math.random() * 50000) + 10000,
        area_km2: Math.floor(Math.random() * 100) + 10,
        risk_level: severity
      },
      {
        zone_name: `${city.name} Suburban Zone`,
        zone_boundary: [
          [city.lat - 0.02, city.lng - 0.02],
          [city.lat - 0.02, city.lng + 0.02],
          [city.lat + 0.02, city.lng + 0.02],
          [city.lat + 0.02, city.lng - 0.02]
        ],
        estimated_population: Math.floor(Math.random() * 30000) + 5000,
        area_km2: Math.floor(Math.random() * 80) + 15,
        risk_level: severity === 'critical' ? 'high' : severity
      }
    ],
      resources_required: {
        personnel: Math.floor(Math.random() * 100) + 20,
        rescue_teams: Math.floor(Math.random() * 10) + 1,
        medical_units: Math.floor(Math.random() * 8) + 1,
        vehicles: Math.floor(Math.random() * 30) + 5,
        boats: Math.floor(Math.random() * 15),
        helicopters: Math.floor(Math.random() * 5),
        food_supplies: Math.floor(Math.random() * 50000) + 5000,
        water_supplies: Math.floor(Math.random() * 100000) + 10000,
        medical_supplies: Math.floor(Math.random() * 2000) + 200,
        temporary_shelters: Math.floor(Math.random() * 500) + 50
      },
      incident_commander: `Officer ${i + 1}`,
      contact_number: `+94-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000000) + 1000000}`,
      reporting_agency: 'Sri Lanka Disaster Management Centre',
      public_alert: Math.random() > 0.3,
      evacuation_required: Math.random() > 0.7
    };

    additionalDisasters.push(disaster);
  }

  return additionalDisasters;
};

const seedDisasters = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/disaster_platform');

    // Clear existing data
    await Disaster.deleteMany({});

    // Combine base disasters with generated ones
    const allDisasters = [...disasterData, ...generateAdditionalDisasters()];

    // Insert all disasters one by one to allow pre-save middleware to generate disaster codes
    const insertedDisasters = [];
    for (const disaster of allDisasters) {
      try {
        const inserted = await Disaster.create(disaster);
        insertedDisasters.push(inserted);
      } catch (error) {
        console.error(`❌ Error inserting disaster "${disaster.title}":`, error.message);
      }
    }

    console.log(`✅ Successfully seeded ${insertedDisasters.length} disasters`);
    console.log('Sample disaster codes generated:');
    insertedDisasters.slice(0, 5).forEach(disaster => {
      console.log(`- ${disaster.title}: ${disaster.disaster_code}`);
    });

  } catch (error) {
    console.error('❌ Error seeding disasters:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run the seed function
if (require.main === module) {
  seedDisasters();
}

module.exports = seedDisasters;
