import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import EventManager from '../models/EventManager.js';
import Event from '../models/Event.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedEvents = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-sphere';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Ensure an event manager exists
    let manager = await EventManager.findOne();
    if (!manager) {
      console.log('No event manager found. Creating test manager...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Password123', salt);
      manager = await EventManager.create({
        name: 'Test Manager',
        email: 'manager@test.com',
        password: hashedPassword,
        role: 'event_manager',
        isApproved: true
      });
      console.log('Test manager created.');
    }

    const events = [
      {
        title: 'Global Tech Summit 2026',
        description: 'Join us for the largest tech conference of the year, featuring world-renowned speakers and cutting-edge innovations.',
        date: new Date('2026-06-15'),
        time: '09:00 AM',
        location: {
          address: '655 W 34th St, New York, NY 10001',
          venueName: 'Convention Center, New York',
          coordinates: { lat: 40.7577, lng: -74.0022 }
        },
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1540575861501-7ad0582371f3?auto=format&fit=crop&q=80',
        creator: manager._id,
        ticketTypes: [
          { name: 'Regular', description: 'Access to all main sessions and workshops.', price: 299, capacity: 1000, sold: 0 },
          { name: 'VIP', description: 'Front-row seating, exclusive lounge access, and dinner with speakers.', price: 899, capacity: 100, sold: 0 }
        ],
        status: 'published',
        isApproved: true
      },
      {
        title: 'City Pulse Music Festival',
        description: 'A multi-genre music festival featuring local and international artists across three stages.',
        date: new Date('2026-07-20'),
        time: '04:00 PM',
        location: {
          address: 'Manhattan, NY 10024',
          venueName: 'Central Park, New York',
          coordinates: { lat: 40.7829, lng: -73.9654 }
        },
        category: 'Music',
        image: 'https://images.unsplash.com/photo-1459749411177-042180ceea72?auto=format&fit=crop&q=80',
        creator: manager._id,
        ticketTypes: [
          { name: 'GA', description: 'General admission access to all stages.', price: 95, capacity: 5000, sold: 0 },
          { name: 'Backstage', description: 'Exclusive backstage access and meet-and-greet opportunities.', price: 450, capacity: 50, sold: 0 }
        ],
        status: 'published',
        isApproved: true
      }
    ];

    await Event.deleteMany({}); // Clear existing events
    await Event.insertMany(events);
    console.log('Sample events seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
};

seedEvents();
