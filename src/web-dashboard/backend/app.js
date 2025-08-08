const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

// Initialize app FIRST
const app = express();

// Then use middleware
app.use(cors());
app.use(express.json());

// Import routes after app is initialized
const authRoutes = require('./routes/auth');

// Middleware routes
app.use('/api/auth', authRoutes);
app.use('/api/mobile', require('./routes/mobileAuth.routes'));
app.use('/api/map', require('./routes/map.routes'));

const PORT = process.env.PORT || 5000;

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    console.log("Using MONGO_URI:", process.env.MONGO_URI ? 'Set' : 'Not set');
  });

// Routes
app.get('/', (req, res) => res.send("API is running"));
app.get('/api/mobile/test', (req, res) => {
  res.json({ message: 'API working!' });
});
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is running!',
    timestamp: new Date().toISOString(),
    env: {
      PORT: process.env.PORT,
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set'
    }
  });
});


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
