const jwt = require('jsonwebtoken');
require('dotenv').config();

// Create a test JWT token similar to what the mobile login creates
const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

const testUser = {
  _id: 'test-user-123',
  individualId: 'test-user-123',
  role: 'Citizen',
  name: 'Test User'
};

const testToken = jwt.sign(testUser, jwtSecret, { expiresIn: '24h' });

console.log('Test JWT Token:');
console.log(testToken);
console.log('');
console.log('Use this token to test mobile API endpoints:');
console.log(`Authorization: Bearer ${testToken}`);
