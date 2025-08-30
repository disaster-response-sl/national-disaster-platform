const mongoose = require('mongoose');
const Report = require('./models/Report');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://3halon:fnQsm550Po5uSTwb@cluster0.ng1rq.mongodb.net/disaster_platform';

async function getBangladeshCities() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully');

    const bangladeshReports = await Report.find({ 'location.country': 'Bangladesh' });
    const cities = [...new Set(bangladeshReports.map(r => r.location.city))];

    console.log('\n=== BANGLADESH CITIES WITH DISASTER REPORTS ===');
    cities.forEach((city, index) => {
      const cityReports = bangladeshReports.filter(r => r.location.city === city);
      console.log(`${index + 1}. ${city} - ${cityReports.length} reports`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getBangladeshCities();
