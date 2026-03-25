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
          venueName: 'McEnery Convention Center',
          coordinates: { lat: 40.7577, lng: -74.0022 }
        },
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1540575861501-7ad0582371f3?auto=format&fit=crop&q=80',
        videoUrl: 'https://www.youtube.com/watch?v=9No-FiE946s',
        reels: [
          'https://www.instagram.com/reels/DA87_87S_87/',
          'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        ],
        creator: manager._id,
        ticketTypes: [
          { name: 'Regular', description: 'Access to all main sessions and workshops.', price: 299, capacity: 1000, sold: 120 },
          { name: 'VIP', description: 'Front-row seating and dinner with speakers.', price: 899, capacity: 100, sold: 45 }
        ],
        status: 'published',
        isApproved: true
      },
      {
        title: 'Neon Night Runners',
        description: 'A glowing 5K run through the heart of the city at night, followed by a live DJ set.',
        date: new Date('2026-05-12'),
        time: '08:00 PM',
        location: {
          address: 'Brooklyn Bridge Park, NY 11201',
          venueName: 'Pier 6 Stadium',
          coordinates: { lat: 40.6922, lng: -73.9991 }
        },
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1533443194171-89b6c483ac9c?auto=format&fit=crop&q=80',
        videoUrl: 'https://www.youtube.com/watch?v=7_W0XG9c54k',
        reels: ['https://www.instagram.com/reels/C5_87_87S_87/'],
        creator: manager._id,
        ticketTypes: [
          { name: 'Entry Only', description: 'Standard entry with neon kit.', price: 35, capacity: 2000, sold: 1500 }
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
          venueName: 'Central Park Main Stage',
          coordinates: { lat: 40.7829, lng: -73.9654 }
        },
        category: 'Music',
        image: 'https://images.unsplash.com/photo-1459749411177-042180ceea72?auto=format&fit=crop&q=80',
        videoUrl: 'https://www.youtube.com/watch?v=fS6uAtAbH2Q',
        reels: [
          'https://www.instagram.com/reels/C5_87_87S_87/',
          'https://www.youtube.com/watch?v=fS6uAtAbH2Q'
        ],
        creator: manager._id,
        ticketTypes: [
          { name: 'GA', description: 'General admission access.', price: 95, capacity: 5000, sold: 4200 },
          { name: 'Backstage', description: 'Backstage tour and artist meet-up.', price: 450, capacity: 50, sold: 12 }
        ],
        status: 'published',
        isApproved: true
      },
      {
        title: 'The Art of Silence',
        description: 'An immersive gallery experience exploring the power of minimalism and silence in modern art.',
        date: new Date('2026-04-05'),
        time: '11:00 AM',
        location: {
          address: 'Modern Art Museum, NY 10019',
          venueName: 'The Grand Gallery',
          coordinates: { lat: 40.7614, lng: -73.9776 }
        },
        category: 'Art',
        image: 'https://images.unsplash.com/photo-1492037766660-2a56f9eb3fcb?auto=format&fit=crop&q=80',
        creator: manager._id,
        ticketTypes: [
          { name: 'Standard', description: 'Full access to the exhibit.', price: 25, capacity: 200, sold: 180 }
        ],
        status: 'published',
        isApproved: true
      },
      {
        title: 'Startup Pitch Night',
        description: 'Watch the next generation of tech unicorns pitch to top-tier VCs in an intense, live setting.',
        date: new Date('2026-03-30'),
        time: '06:30 PM',
        location: {
          address: 'Chelsea Tech Lab, NY 10011',
          venueName: 'Innovation Hall',
          coordinates: { lat: 40.7424, lng: -74.0044 }
        },
        category: 'Business',
        image: 'https://images.unsplash.com/photo-1475721027187-4024733923f0?auto=format&fit=crop&q=80',
        creator: manager._id,
        ticketTypes: [
          { name: 'Attendee', description: 'Standard attendance.', price: 45, capacity: 150, sold: 60 },
          { name: 'Founder Pass', description: 'Networking lunch included.', price: 125, capacity: 30, sold: 15 }
        ],
        status: 'published',
        isApproved: true
      },
      {
        title: 'Chef\'s Table: Fusion Souls',
        description: 'An exclusive 7-course dinner featuring a fusion of Japanese and Mediterranean cuisines.',
        date: new Date('2026-05-25'),
        time: '07:30 PM',
        location: {
          address: 'Penthouse Dining, NY 10001',
          venueName: 'Skyline Terrace',
          coordinates: { lat: 40.7512, lng: -73.9897 }
        },
        category: 'Education',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80',
        creator: manager._id,
        ticketTypes: [
          { name: 'Dinner Pass', description: '7-course dinner with wine pairing.', price: 195, capacity: 40, sold: 38 }
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
