import mongoose from 'mongoose';
import dotenv from 'dotenv';
import LocalStore from './src/models/LocalStore.js';
import path from 'path';

dotenv.config();

const checkStores = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-sphere';
    await mongoose.connect(mongoUri);
    const stores = await LocalStore.find({});
    console.log(`Found ${stores.length} stores:`);
    stores.forEach(s => {
      console.log(`- ${s.name}: isActive=${s.isActive}, category=${s.category}`);
    });
    
    if (stores.some(s => !s.isActive)) {
      console.log('Activating all stores...');
      await LocalStore.updateMany({}, { isActive: true });
      console.log('All stores activated.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkStores();
