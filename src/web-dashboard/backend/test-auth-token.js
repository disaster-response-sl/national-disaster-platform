require('dotenv').config();
const jwt = require('jsonwebtoken');

console.log('Environment check:');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET value:', process.env.JWT_SECRET);
console.log('');

// Create a test JWT token using the actual environment variable
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.error('No JWT_SECRET found in environment!');
  process.exit(1);
}

const testUser = {
  _id: 'test-user-123',
  individualId: 'test-user-123',
  role: 'Citizen',
  name: 'Test User'
};

const testToken = jwt.sign(testUser, jwtSecret, { expiresIn: '24h' });

console.log('Test JWT Token (with correct secret):');
console.log(testToken);
console.log('');

// Verify the token
try {
  const decoded = jwt.verify(testToken, jwtSecret);
  console.log('Token verification successful:', decoded);
} catch (error) {
  console.error('Token verification failed:', error.message);
}
