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

// Import routes
const authRoutes = require('./routes/auth');
const mobileAuthRoutes = require('./routes/mobileAuth.routes');
const mapRoutes = require('./routes/map.routes');
const resourceRoutes = require('./routes/resources.routes');
const ndxRoutes = require('./routes/ndx.routes');

// Import admin routes
const adminDisastersRoutes = require('./routes/admin/disasters.routes');
const adminAnalyticsRoutes = require('./routes/admin/analytics.routes');
const adminZonesRoutes = require('./routes/admin/zones.routes');
const adminImportExportRoutes = require('./routes/admin/import-export.routes');

// Import test routes (NO AUTH - for Postman testing)
const testCrudRoutes = require('./routes/test-crud.routes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/mobile', mobileAuthRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/ndx', ndxRoutes);

// Use admin routes with proper path separation to avoid conflicts
app.use('/api/admin/disasters', adminDisastersRoutes);           // Main CRUD: /, /:id, /bulk-status
app.use('/api/admin/analytics', adminAnalyticsRoutes);           // /statistics, /timeline, etc.
app.use('/api/admin/disasters', adminZonesRoutes);               // /:id/zones routes
app.use('/api/admin/import-export', adminImportExportRoutes);    // /import, /export, /template

// Use test routes (NO AUTH - for easy Postman testing)
app.use('/api/test', testCrudRoutes);

const PORT = process.env.PORT || 5000;

// Database connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/disaster-platform';
console.log('Attempting to connect to MongoDB:', mongoUri);

mongoose.connect(mongoUri)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    console.log("Using MONGO_URI:", process.env.MONGO_URI ? 'Set' : 'Not set');
    console.log("Falling back to default URI:", mongoUri);
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
