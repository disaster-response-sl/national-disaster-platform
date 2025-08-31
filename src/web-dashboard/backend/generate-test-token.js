const jwt = require('jsonwebtoken');

// Generate a test JWT token for development
const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

const payload = {
  individualId: 'admin001',
  role: 'admin',
  name: 'Test Admin',
  email: 'admin@test.com'
};

const token = jwt.sign(payload, jwtSecret, { expiresIn: '24h' });

console.log('Test JWT Token:');
console.log(token);
console.log('\nUse this token in your API requests:');
console.log('Authorization: Bearer ' + token);
