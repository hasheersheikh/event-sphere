import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TrendingVenue from '../models/TrendingVenue.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const venues = [
  {
    name: 'Madison Square Garden',
    location: 'New York, USA',
    description: 'The world\'s most famous arena, hosting legendary concerts and sporting events.',
    image: 'https://images.unsplash.com/photo-1577030553030-246f748fa240?auto=format&fit=crop&q=80&w=1000',
    order: 1,
    isActive: true,
  },
  {
    name: 'Sydney Opera House',
    location: 'Sydney, Australia',
    description: 'An iconic performing arts center known for its unique shell-like design.',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=1000',
    order: 2,
    isActive: true,
  },
  {
    name: 'The O2 Arena',
    location: 'London, UK',
    description: 'One of the busiest music arenas in the world, located in the heart of London.',
    image: 'https://images.unsplash.com/photo-1563811771046-ba984ff30900?auto=format&fit=crop&q=80&w=1000',
    order: 3,
    isActive: true,
  },
  {
    name: 'Marina Bay Sands',
    location: 'Singapore',
    description: 'Luxury resort and event space with the world\'s largest rooftop infinity pool.',
    image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&q=80&w=1000',
    order: 4,
    isActive: true,
  },
  {
    name: 'Red Rocks Amphitheatre',
    location: 'Morrison, Colorado',
    description: 'A geologically spectacular open-air amphitheatre carved into rock.',
    image: 'https://images.unsplash.com/photo-1599739291060-4578e77dac5d?auto=format&fit=crop&q=80&w=1000',
    order: 5,
    isActive: true,
  },
  {
    name: 'Burj Al Arab',
    location: 'Dubai, UAE',
    description: 'The world\'s only 7-star hotel and a landmark of modern architectural luxury.',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=1000',
    order: 6,
    isActive: true,
  }
];

const seedTrendingVenues = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-sphere';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing trending venues
    await TrendingVenue.deleteMany({});
    console.log('Cleared existing trending venues');

    // Insert dummy venues
    await TrendingVenue.insertMany(venues);
    console.log('Successfully seeded dummy trending venues');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding trending venues:', error);
    process.exit(1);
  }
};

seedTrendingVenues();
