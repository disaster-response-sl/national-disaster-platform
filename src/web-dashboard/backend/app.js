const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

// Initialize app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Import user & mobile routes
const authRoutes = require('./routes/auth');
const mobileAuthRoutes = require('./routes/mobileAuth.routes');
const mapRoutes = require('./routes/map.routes');
const resourceRoutes = require('./routes/resources.routes');
const ndxRoutes = require('./routes/ndx.routes');

// Import donation routes
const paymentRoutes = require('./routes/payment.routes');
const donationRoutes = require('./routes/donation.routes');

// Import admin routes
const adminSosRoutes = require('./routes/admin/sos.routes');
const adminDisastersRoutes = require('./routes/admin/disasters.routes');
const adminAnalyticsRoutes = require('./routes/admin/analytics.routes');
const adminZonesRoutes = require('./routes/admin/zones.routes');
const adminImportExportRoutes = require('./routes/admin/import-export.routes');

// Import responder routes
const responderNotificationsRoutes = require('./routes/responder/notifications.routes');

// Import donation routes
const donationRoutes = require('./routes/donation.routes');

// Import test routes (NO AUTH - for Postman testing)
const testCrudRoutes = require('./routes/test-crud.routes');

// Import services
const SosEscalationService = require('./services/sos-escalation.service');

// Use user & mobile routes
app.use('/api/auth', authRoutes);
app.use('/api/mobile', mobileAuthRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/ndx', ndxRoutes);

// Use donation routes
app.use('/api/payment', paymentRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/donation', donationRoutes);

// Test credentials route
app.use('/api/test-creds', require('./test-credentials'));

// Use admin routes
app.use('/api/admin/sos', adminSosRoutes);
app.use('/api/admin/disasters', adminDisastersRoutes);            // Main CRUD
app.use('/api/admin/analytics', adminAnalyticsRoutes);            // Statistics, Timeline, etc.
app.use('/api/admin/zones', adminZonesRoutes);                    // Avoided conflict by changing path
app.use('/api/admin/import-export', adminImportExportRoutes);     // Import/Export ops

// Use responder routes
app.use('/api/responder/notifications', responderNotificationsRoutes);

// Use donation routes
app.use('/api', donationRoutes);

// Use test routes (NO AUTH - for Postman testing)
app.use('/api/test', testCrudRoutes);

// Health check routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});
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

// MongoDB connection
const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/disaster-platform';
console.log('Attempting to connect to MongoDB:', mongoUri);

mongoose.connect(mongoUri)
  .then(() => {
    console.log("MongoDB connected successfully");

    // Start SOS escalation service after DB connection
    const escalationService = new SosEscalationService();
    escalationService.startScheduler(5); // Check every 5 minutes
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    console.log("Using MONGO_URI:", process.env.MONGO_URI ? 'Set' : 'Not set');
    console.log("Falling back to default URI:", mongoUri);
  });

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server accessible at: http://localhost:${PORT}`);
  console.log(`Server accessible at: http://127.0.0.1:${PORT}`);
});
