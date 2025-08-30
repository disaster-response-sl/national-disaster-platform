const mongoose = require('mongoose');
const Report = require('./models/Report');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://3halon:fnQsm550Po5uSTwb@cluster0.ng1rq.mongodb.net/disaster_platform';

async function removeBangladeshData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully');

    // First, let's count Bangladesh reports before deletion
    const bangladeshCount = await Report.countDocuments({ 'location.country': 'Bangladesh' });
    console.log(`Found ${bangladeshCount} Bangladesh reports in the database`);

    // Also count Sri Lankan reports to make sure we don't delete them
    const sriLankanCount = await Report.countDocuments({ 'location.country': 'Sri Lanka' });
    console.log(`Found ${sriLankanCount} Sri Lankan reports in the database`);

    if (bangladeshCount === 0) {
      console.log('No Bangladesh reports found to delete');
      await mongoose.disconnect();
      return;
    }

    // Confirm before deletion
    console.log('\n⚠️  WARNING: This will permanently delete all Bangladesh disaster reports!');
    console.log('Sri Lankan reports will NOT be affected.');

    // Delete all Bangladesh reports
    console.log('\nDeleting Bangladesh reports...');
    const deleteResult = await Report.deleteMany({ 'location.country': 'Bangladesh' });

    console.log(`✅ Successfully deleted ${deleteResult.deletedCount} Bangladesh reports`);

    // Verify the deletion
    const remainingBangladesh = await Report.countDocuments({ 'location.country': 'Bangladesh' });
    const remainingSriLankan = await Report.countDocuments({ 'location.country': 'Sri Lanka' });
    const totalRemaining = await Report.countDocuments();

    console.log('\n=== VERIFICATION ===');
    console.log(`Bangladesh reports remaining: ${remainingBangladesh}`);
    console.log(`Sri Lankan reports remaining: ${remainingSriLankan}`);
    console.log(`Total reports remaining: ${totalRemaining}`);

    if (remainingBangladesh === 0) {
      console.log('✅ All Bangladesh data successfully removed!');
    } else {
      console.log('❌ Some Bangladesh data may still remain');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

removeBangladeshData();
