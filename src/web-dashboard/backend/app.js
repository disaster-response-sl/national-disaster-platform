const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

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

const PORT = process.env.PORT || 5000;

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Routes
app.get('/', (req, res) => res.send("API is running"));
app.get('/api/mobile/test', (req, res) => {
  res.json({ message: 'API working!' });
});


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
