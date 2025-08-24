// Quick script to check database contents
require('dotenv').config();
const mongoose = require('mongoose');
const Report = require('./models/Report');
const Disaster = require('./models/Disaster');

async function checkDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check Reports collection
        console.log('\n=== CHECKING REPORTS COLLECTION ===');
        const reports = await Report.find({}).limit(10);
        console.log(`Found ${reports.length} reports`);
        
        reports.forEach((report, index) => {
            console.log(`Report ${index + 1}:`);
            console.log(`  - ID: ${report._id}`);
            console.log(`  - Type: ${report.type || 'N/A'}`);
            console.log(`  - Status: ${report.status || 'N/A'}`);
            console.log(`  - Description: ${report.description || 'N/A'}`);
            console.log(`  - Location: ${report.location ? `${report.location.lat}, ${report.location.lng}` : 'No location'}`);
            console.log(`  - Created: ${report.created_at || 'N/A'}`);
            console.log('---');
        });

        // Check total count
        const totalReports = await Report.countDocuments();
        console.log(`\nTotal reports in database: ${totalReports}`);

        // Check Disasters collection
        console.log('\n=== CHECKING DISASTERS COLLECTION ===');
        const disasters = await Disaster.find({}).limit(5);
        console.log(`Found ${disasters.length} disasters`);
        
        disasters.forEach((disaster, index) => {
            console.log(`Disaster ${index + 1}:`);
            console.log(`  - ID: ${disaster._id}`);
            console.log(`  - Type: ${disaster.type || 'N/A'}`);
            console.log(`  - Title: ${disaster.title || 'N/A'}`);
            console.log(`  - Location: ${disaster.location ? `${disaster.location.lat}, ${disaster.location.lng}` : 'No location'}`);
            console.log(`  - Created: ${disaster.created_at || 'N/A'}`);
            console.log('---');
        });

        const totalDisasters = await Disaster.countDocuments();
        console.log(`\nTotal disasters in database: ${totalDisasters}`);

        // Check for any test data or data outside Sri Lanka bounds
        console.log('\n=== CHECKING FOR NON-SRI LANKAN COORDINATES ===');
        const sriLankaBounds = {
            north: 9.8,
            south: 5.9,
            east: 81.9,
            west: 79.6
        };

        const outsideSriLanka = await Report.find({
            $or: [
                { 'location.lat': { $lt: sriLankaBounds.south } },
                { 'location.lat': { $gt: sriLankaBounds.north } },
                { 'location.lng': { $lt: sriLankaBounds.west } },
                { 'location.lng': { $gt: sriLankaBounds.east } }
            ]
        });

        console.log(`Found ${outsideSriLanka.length} reports outside Sri Lanka bounds:`);
        outsideSriLanka.forEach((report, index) => {
            console.log(`  ${index + 1}. ID: ${report._id}, Location: ${report.location.lat}, ${report.location.lng}, Type: ${report.type || 'N/A'}`);
        });

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
        
    } catch (error) {
        console.error('Error checking database:', error);
        process.exit(1);
    }
}

checkDatabase();
