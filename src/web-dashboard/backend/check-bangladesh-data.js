const mongoose = require('mongoose');
const Report = require('./models/Report');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://3halon:fnQsm550Po5uSTwb@cluster0.ng1rq.mongodb.net/disaster_platform';

async function checkBangladeshData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully');

    // Check Bangladesh reports
    const bangladeshReports = await Report.find({ 'location.country': 'Bangladesh' });
    console.log('\n=== BANGLADESH DISASTER REPORTS ===');
    console.log('Total Bangladesh reports in database:', bangladeshReports.length);

    console.log('\nFirst 10 Bangladesh reports:');
    bangladeshReports.slice(0, 10).forEach((report, index) => {
      console.log(`${index + 1}. ${report.type.toUpperCase()} in ${report.location.city} - ${report.status} (${report.priority})`);
      console.log(`   Location: ${report.location.lat}, ${report.location.lng}`);
      console.log(`   Affected people: ${report.affected_people}`);
      console.log('');
    });

    // Get unique cities and types
    const cities = [...new Set(bangladeshReports.map(r => r.location.city))];
    const types = [...new Set(bangladeshReports.map(r => r.type))];

    console.log('=== BANGLADESH DATA SUMMARY ===');
    console.log('Cities with reports:', cities.length);
    console.log('Sample cities:', cities.slice(0, 5).join(', '));
    console.log('Disaster types:', types.join(', '));

    // Status breakdown
    const statusCount = bangladeshReports.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {});
    console.log('Status breakdown:', statusCount);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkBangladeshData();
