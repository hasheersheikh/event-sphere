import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedUsers = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-sphere';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const usersToSeed = [
      {
        name: 'Admin User',
        email: 'admin@eventhub.com',
        password: 'admin123',
        role: 'admin',
      },
      {
        name: 'Event Manager',
        email: 'manager@eventhub.com',
        password: 'manager123',
        role: 'event_manager',
      },
    ];

    for (const userData of usersToSeed) {
      const userExists = await User.findOne({ email: userData.email });
      if (userExists) {
        console.log(`User already exists: ${userData.email}`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      await User.create({
        ...userData,
        password: hashedPassword,
      });
      console.log(`User created: ${userData.email}`);
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
