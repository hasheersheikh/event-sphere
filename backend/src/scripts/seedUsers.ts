import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import EventManager from '../models/EventManager.js';

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
        Model: Admin,
      },
      {
        name: 'Event Manager',
        email: 'manager@eventhub.com',
        password: 'manager123',
        role: 'event_manager',
        Model: EventManager,
      },
    ];

    for (const userData of usersToSeed) {
      const Model = userData.Model as any;
      const userExists = await Model.findOne({ email: userData.email });
      if (userExists) {
        console.log(`User already exists: ${userData.email}`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      await Model.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
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
