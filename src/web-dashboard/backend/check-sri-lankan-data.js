const mongoose = require('mongoose');
const Report = require('./models/Report');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://3halon:fnQsm550Po5uSTwb@cluster0.ng1rq.mongodb.net/disaster_platform';

async function checkSriLankanData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully');

    // Check Sri Lankan reports
    const sriLankanReports = await Report.find({ 'location.country': 'Sri Lanka' });
    console.log('\n=== SRI LANKAN DISASTER REPORTS ===');
    console.log('Total Sri Lankan reports in database:', sriLankanReports.length);

    sriLankanReports.forEach((report, index) => {
      console.log(`${index + 1}. ${report.type.toUpperCase()} in ${report.location.city} - ${report.status} (${report.priority})`);
      console.log(`   Description: ${report.description}`);
      console.log(`   Location: ${report.location.lat}, ${report.location.lng}`);
      console.log(`   Affected people: ${report.affected_people}`);
      console.log(`   Created: ${report.timestamp}`);
      console.log('');
    });

    // Check total reports
    const totalReports = await Report.countDocuments();
    console.log('=== DATABASE SUMMARY ===');
    console.log('Total reports in database:', totalReports);
    console.log('Sri Lankan reports:', sriLankanReports.length);
    console.log('Bangladesh reports:', totalReports - sriLankanReports.length);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkSriLankanData();
