const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const UserSchema = new mongoose.Schema({
  individualId: { type: String, unique: true },
  name: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  password: String,
  email: String
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdminUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const existing = await User.findOne({ individualId: 'admin_seed' });
    if (existing) {
      console.log('Admin user already exists:', existing._id);
      return existing;
    }
    const hash = await bcrypt.hash('adminpass', 10);
    const user = new User({
      individualId: 'admin_seed',
      name: 'Seed Admin',
      role: 'admin',
      password: hash,
      email: 'admin_seed@example.com'
    });
    await user.save();
    console.log('Seeded admin user:', user._id);
    return user;
  } catch (err) {
    console.error('Error seeding admin user:', err);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedAdminUser();
}

module.exports = { seedAdminUser };
