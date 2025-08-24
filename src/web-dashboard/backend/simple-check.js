require('dotenv').config();
const mongoose = require('mongoose');

console.log('MongoDB URI:', process.env.MONGODB_URI);
console.log('Attempting to connect...');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected successfully!');
    return mongoose.connection.db.listCollections().toArray();
  })
  .then(collections => {
    console.log('Available collections:');
    collections.forEach(col => console.log('  -', col.name));
    
    // Try to count documents in each collection
    return Promise.all(collections.map(async col => {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`${col.name}: ${count} documents`);
      return { name: col.name, count };
    }));
  })
  .then(results => {
    console.log('\nCollection summary:', results);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
