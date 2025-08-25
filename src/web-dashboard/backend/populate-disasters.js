const mongoose = require('mongoose');
const Disaster = require('./models/Disaster');

// MongoDB connection
async function connectDB() {
  try {
    const mongoUri = 'mongodb+srv://3halon:fnQsm550Po5uSTwb@cluster0.ng1rq.mongodb.net/disaster_platform';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Sample disaster data based on the schema
const disasterData = [
  {
    type: 'flood',
    severity: 'high',
    description: 'Severe flooding in Ratnapura district after continuous rainfall',
    location: { lat: 6.6847, lng: 80.4025 },
    timestamp: new Date('2025-08-20T14:30:00.000Z'),
    status: 'active',
    title: 'Ratnapura Flash Flood Emergency',
    disaster_code: 'DIS-2025-082001',
    zones: [{
      zone_name: 'Ratnapura Central',
      boundary_coordinates: [
        [6.6847, 80.4025],
        [6.6947, 80.4025],
        [6.6947, 80.4125],
        [6.6847, 80.4125],
        [6.6847, 80.4025]
      ],
      estimated_population: 25000,
      area_km2: 15.5,
      risk_level: 'high'
    }],
    priority_level: 'high',
    incident_commander: 'Commander Silva',
    contact_number: '+94771234567',
    reporting_agency: 'Sri Lanka Disaster Management Center',
    public_alert: true,
    alert_message: 'FLOOD ALERT: Severe flooding in Ratnapura area. Residents in low-lying areas are advised to evacuate immediately.',
    evacuation_required: true,
    evacuation_zones: ['Ratnapura Central'],
    assigned_teams: ['Rescue Team Alpha', 'Medical Team Beta'],
    estimated_duration: 48,
    resources_required: {
      personnel: 100,
      rescue_teams: 5,
      medical_units: 3,
      vehicles: 15,
      boats: 8,
      helicopters: 2,
      food_supplies: 10000,
      water_supplies: 50000,
      medical_supplies: 150,
      temporary_shelters: 200
    }
  },
  {
    type: 'landslide',
    severity: 'high',
    description: 'Landslide disaster in Nuwara Eliya district threatening residential areas',
    location: { lat: 6.9497, lng: 80.7718 },
    timestamp: new Date('2025-08-21T08:15:00.000Z'),
    status: 'active',
    title: 'Nuwara Eliya Landslide Emergency',
    disaster_code: 'DIS-2025-082101',
    zones: [{
      zone_name: 'Nuwara Eliya Hills',
      boundary_coordinates: [
        [6.9497, 80.7718],
        [6.9597, 80.7718],
        [6.9597, 80.7818],
        [6.9497, 80.7818],
        [6.9497, 80.7718]
      ],
      estimated_population: 12000,
      area_km2: 8.2,
      risk_level: 'critical'
    }],
    priority_level: 'critical',
    incident_commander: 'Commander Perera',
    contact_number: '+94812345678',
    reporting_agency: 'National Building Research Organization',
    public_alert: true,
    alert_message: 'LANDSLIDE EMERGENCY: Critical landslide risk in Nuwara Eliya hills. Immediate evacuation ordered.',
    evacuation_required: true,
    evacuation_zones: ['Nuwara Eliya Hills'],
    assigned_teams: ['Emergency Response Team 1', 'Geological Assessment Team'],
    estimated_duration: 72,
    resources_required: {
      personnel: 80,
      rescue_teams: 6,
      medical_units: 4,
      vehicles: 12,
      boats: 0,
      helicopters: 3,
      food_supplies: 8000,
      water_supplies: 30000,
      medical_supplies: 120,
      temporary_shelters: 150
    }
  },
  {
    type: 'cyclone',
    severity: 'medium',
    description: 'Tropical cyclone approaching the southern coast with strong winds expected',
    location: { lat: 5.9485, lng: 80.5353 },
    timestamp: new Date('2025-08-22T12:00:00.000Z'),
    status: 'active',
    title: 'Southern Coast Cyclone Warning',
    disaster_code: 'DIS-2025-082201',
    zones: [{
      zone_name: 'Galle Coastal Area',
      boundary_coordinates: [
        [5.9485, 80.5353],
        [5.9585, 80.5353],
        [5.9585, 80.5453],
        [5.9485, 80.5453],
        [5.9485, 80.5353]
      ],
      estimated_population: 35000,
      area_km2: 22.1,
      risk_level: 'medium'
    }],
    priority_level: 'medium',
    incident_commander: 'Commander Fernando',
    contact_number: '+94912345678',
    reporting_agency: 'Department of Meteorology',
    public_alert: true,
    alert_message: 'CYCLONE WARNING: Tropical cyclone approaching southern coast. Secure loose objects and stay indoors.',
    evacuation_required: false,
    evacuation_zones: [],
    assigned_teams: ['Weather Monitoring Team', 'Coastal Guard Unit'],
    estimated_duration: 24,
    resources_required: {
      personnel: 60,
      rescue_teams: 4,
      medical_units: 2,
      vehicles: 10,
      boats: 5,
      helicopters: 1,
      food_supplies: 5000,
      water_supplies: 20000,
      medical_supplies: 80,
      temporary_shelters: 100
    }
  },
  {
    type: 'flood',
    severity: 'medium',
    description: 'Urban flooding in Colombo due to heavy monsoon rains affecting main roads',
    location: { lat: 6.9271, lng: 79.8612 },
    timestamp: new Date('2025-08-19T18:45:00.000Z'),
    status: 'resolved',
    title: 'Colombo Urban Flood Response',
    disaster_code: 'DIS-2025-081901',
    zones: [{
      zone_name: 'Colombo CBD',
      boundary_coordinates: [
        [6.9271, 79.8612],
        [6.9371, 79.8612],
        [6.9371, 79.8712],
        [6.9271, 79.8712],
        [6.9271, 79.8612]
      ],
      estimated_population: 45000,
      area_km2: 12.5,
      risk_level: 'medium'
    }],
    priority_level: 'medium',
    incident_commander: 'Commander Rajapakse',
    contact_number: '+94112345678',
    reporting_agency: 'Colombo Municipal Council',
    public_alert: false,
    alert_message: 'Flood situation in Colombo has been resolved. Traffic is returning to normal.',
    evacuation_required: false,
    evacuation_zones: [],
    assigned_teams: ['Urban Response Team', 'Traffic Management Unit'],
    estimated_duration: 12,
    resources_required: {
      personnel: 40,
      rescue_teams: 2,
      medical_units: 1,
      vehicles: 8,
      boats: 3,
      helicopters: 0,
      food_supplies: 2000,
      water_supplies: 8000,
      medical_supplies: 50,
      temporary_shelters: 50
    }
  }
];

// Function to clear existing disasters and populate new ones
async function populateDisasters() {
  try {
    console.log('🧹 Clearing existing disasters...');
    await Disaster.deleteMany({});
    console.log('✅ Existing disasters cleared');

    console.log('📝 Inserting new disaster data...');
    const insertedDisasters = await Disaster.insertMany(disasterData);
    console.log(`✅ Successfully inserted ${insertedDisasters.length} disasters`);

    // Display summary
    console.log('\n📊 DISASTER SUMMARY:');
    console.log('==================');
    
    const activeDisasters = insertedDisasters.filter(d => d.status === 'active');
    const resolvedDisasters = insertedDisasters.filter(d => d.status === 'resolved');
    
    console.log(`Total Disasters: ${insertedDisasters.length}`);
    console.log(`Active: ${activeDisasters.length}`);
    console.log(`Resolved: ${resolvedDisasters.length}`);
    
    console.log('\nActive Disasters:');
    activeDisasters.forEach(disaster => {
      console.log(`- ${disaster.title} (${disaster.type}, ${disaster.severity})`);
      console.log(`  Location: ${disaster.location.lat}, ${disaster.location.lng}`);
      console.log(`  Status: ${disaster.status}`);
      console.log('');
    });

    return insertedDisasters;
  } catch (error) {
    console.error('❌ Error populating disasters:', error);
    throw error;
  }
}

// Function to verify disasters were inserted
async function verifyDisasters() {
  try {
    console.log('🔍 Verifying disaster data...');
    const disasters = await Disaster.find({});
    console.log(`✅ Found ${disasters.length} disasters in database`);
    
    const byType = {};
    const bySeverity = {};
    const byStatus = {};
    
    disasters.forEach(disaster => {
      byType[disaster.type] = (byType[disaster.type] || 0) + 1;
      bySeverity[disaster.severity] = (bySeverity[disaster.severity] || 0) + 1;
      byStatus[disaster.status] = (byStatus[disaster.status] || 0) + 1;
    });
    
    console.log('\n📈 BREAKDOWN:');
    console.log('By Type:', byType);
    console.log('By Severity:', bySeverity);
    console.log('By Status:', byStatus);
    
    return disasters;
  } catch (error) {
    console.error('❌ Error verifying disasters:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    await connectDB();
    await populateDisasters();
    await verifyDisasters();
    
    console.log('\n✅ Disaster population completed successfully!');
    console.log('🔗 You can now test the mobile app or check the database directly.');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
main();
