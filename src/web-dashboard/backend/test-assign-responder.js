const mongoose = require('mongoose');
const SosSignal = require('./models/SosSignal');
require('dotenv').config();

async function testAssignResponder() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get a signal to test with
    const signal = await SosSignal.findOne({}).select('_id user_id status assigned_responder');
    if (!signal) {
      console.log('No signals found');
      return;
    }

    console.log('Testing with signal:', {
      id: signal._id.toString(),
      status: signal.status,
      currentResponder: signal.assigned_responder
    });

    // Test the assign responder functionality
    const signalId = signal._id.toString();
    const responderId = 'admin_seed';
    const notes = 'Test assignment via script';

    console.log('\nTesting assign responder...');
    console.log('Signal ID:', signalId);
    console.log('Responder ID:', responderId);
    console.log('Notes:', notes);

    // Simulate the assign responder logic from the backend
    const sosSignal = await SosSignal.findById(signalId);
    if (!sosSignal) {
      console.log('Signal not found');
      return;
    }

    console.log('Signal found:', {
      id: sosSignal._id,
      status: sosSignal.status,
      currentResponder: sosSignal.assigned_responder
    });

    // Update the signal
    sosSignal.assigned_responder = responderId;
    sosSignal.updated_at = new Date();

    // Add note
    sosSignal.notes.push({
      responder_id: responderId,
      note: `Assigned to responder: ${responderId}. ${notes}`,
      timestamp: new Date()
    });

    await sosSignal.save();
    console.log('Signal updated successfully!');

    // Verify the update
    const updatedSignal = await SosSignal.findById(signalId);
    console.log('Verification:', {
      assigned_responder: updatedSignal.assigned_responder,
      notes_count: updatedSignal.notes.length,
      latest_note: updatedSignal.notes[updatedSignal.notes.length - 1]
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAssignResponder();
