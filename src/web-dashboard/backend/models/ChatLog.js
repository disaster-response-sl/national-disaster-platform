const mongoose = require('mongoose');

const ChatLogSchema = new mongoose.Schema({
  user_id: {
    type: String, // Use String for now, or mongoose.Schema.Types.ObjectId if referencing users
    required: true
  },
  query: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ChatLog', ChatLogSchema, 'chat_logs'); 