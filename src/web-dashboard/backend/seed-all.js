require('dotenv').config();
const seedDisasters = require('./seed-disasters');
const seedSosSignals = require('./seed-sos-signals');
const seedReports = require('./seed-reports');

const seedAllData = async () => {
  console.log('🌱 Starting database seeding process...');
  console.log('=====================================');

  try {
    console.log('1️⃣ Seeding disasters...');
    await seedDisasters();

    console.log('\n2️⃣ Seeding SOS signals...');
    await seedSosSignals();

    console.log('\n3️⃣ Seeding reports...');
    await seedReports();

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('=====================================');
    console.log('📊 Summary:');
    console.log('   • 100 Disasters');
    console.log('   • 100 SOS Signals');
    console.log('   • 100 Reports');
    console.log('   Total: 300 records');
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Error during seeding process:', error);
    process.exit(1);
  }
};

// Run the master seed function
if (require.main === module) {
  seedAllData();
}

module.exports = seedAllData;
