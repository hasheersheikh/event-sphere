import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import Event from '../models/Event.js';
import EventManager from '../models/EventManager.js';
import Booking from '../models/Booking.js';
import Volunteer from '../models/Volunteer.js';

dotenv.config();

const seedNewData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-sphere';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // 1. Clean up
    console.log('Purging legacy production data...');
    await Event.deleteMany({});
    await Booking.deleteMany({});
    await Volunteer.deleteMany({});
    console.log('Purge complete.');

    // 2. Create Managers
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('manager123', salt);

    const managersData = [
      {
        name: 'Alex Rivera',
        email: 'alex@events.com',
        password,
        role: 'event_manager',
        isApproved: true,
        commissionType: 'percentage',
        commissionValue: 12,
      },
      {
        name: 'Sarah Chen',
        email: 'sarah@production.io',
        password,
        role: 'event_manager',
        isApproved: true,
        commissionType: 'flat',
        commissionValue: 500,
      },
      {
        name: 'Marcus Thorne',
        email: 'marcus@global.events',
        password,
        role: 'event_manager',
        isApproved: true,
        commissionType: 'percentage',
        commissionValue: 15,
      }
    ];

    const managers = [];
    for (const mData of managersData) {
      let manager = await EventManager.findOne({ email: mData.email });
      if (!manager) {
        manager = await EventManager.create(mData);
        console.log(`Manager initialized: ${mData.email}`);
      } else {
        console.log(`Manager already exists: ${mData.email}`);
      }
      managers.push(manager);
    }

    const ytShortLink = 'https://youtube.com/shorts/A0PnI8EgRJc?si=SUz9f39VC6GzrVcC';

    // 3. Create Events
    const eventsToSeed = [
      {
        title: 'Neon Slipstream: Tokyo Nights',
        description: 'An immersive cyberpunk experience featuring underground electronic artists and high-fidelity visual displays.',
        date: new Date('2026-06-15'),
        time: '20:00',
        location: {
            address: 'Shibuya Crossing District, Tokyo',
            venueName: 'The Grid Hall'
        },
        category: 'Music',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070',
        reels: [ytShortLink],
        creator: managers[0]._id,
        status: 'under_review',
        isApproved: false,
        ticketTypes: [
          { name: 'Standard Unit', price: 2500, capacity: 500 },
          { name: 'Elite Access', price: 7500, capacity: 50 }
        ]
      },
      {
        title: 'Quantum Horizon Expo',
        description: 'Unveiling the next generation of neural interfaces and quantum computing breakthroughs.',
        date: new Date('2026-07-22'),
        time: '10:00',
        location: {
            address: 'Palo Alto Tech Corridor',
            venueName: 'Neural Research Center'
        },
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2070',
        reels: [ytShortLink],
        creator: managers[1]._id,
        status: 'under_review',
        isApproved: false,
        ticketTypes: [
          { name: 'Delegate Pass', price: 15000, capacity: 200 },
          { name: 'Virtual Sync', price: 5000, capacity: 1000 }
        ]
      },
      {
         title: 'Solaris Beach Festival',
         description: 'Sustainable music and art festival powered entirely by solar energy. Three days of harmony.',
         date: new Date('2026-08-05'),
         time: '16:00',
         location: {
             address: 'Ibiza Coastal Sector 12',
             venueName: 'Solaris Sands'
         },
         category: 'Festival',
         image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=2070',
         reels: [ytShortLink],
         creator: managers[2]._id,
         status: 'under_review',
         isApproved: false,
         ticketTypes: [
           { name: 'Eco Camper', price: 8000, capacity: 300 },
           { name: 'Day Pass', price: 3000, capacity: 1000 }
         ]
      },
      {
         title: 'Abstract Meta Gala',
         description: 'A fusion of digital identity and high fashion. Witness the blurring lines between physical and virtual garments.',
         date: new Date('2026-09-12'),
         time: '19:00',
         location: {
             address: 'Metropolitan Art Network',
             venueName: 'The Void Gallery'
         },
         category: 'Fashion',
         image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=2070',
         creator: managers[0]._id,
         status: 'under_review',
         isApproved: false,
         ticketTypes: [
           { name: 'Registry Seat', price: 20000, capacity: 100 }
         ]
      },
      {
         title: 'Orbital Velocity Race',
         description: 'High-speed drone racing through a zero-G simulated environment. The ultimate skill test.',
         date: new Date('2026-10-10'),
         time: '14:00',
         location: {
             address: 'Cape Canaveral Airfield',
             venueName: 'Hangar X'
         },
         category: 'Sports',
         image: 'https://images.unsplash.com/photo-1524143986875-3b098d78b363?auto=format&fit=crop&q=80&w=2070',
         creator: managers[1]._id,
         status: 'under_review',
         isApproved: false,
         ticketTypes: [
           { name: 'Spectator Node', price: 1200, capacity: 2000 }
         ]
      },
      {
         title: 'Bio-Luminescent Forest Run',
         description: 'A nocturnal 10k through a forest engineered with glowing flora. A truly ethereal marathon.',
         date: new Date('2026-11-20'),
         time: '23:00',
         location: {
             address: 'Pacific Northwest Bio-Reserve',
             venueName: 'Lumen Woods'
         },
         category: 'Sports',
         image: 'https://images.unsplash.com/photo-1541410945376-a78726dd9912?auto=format&fit=crop&q=80&w=2070',
         creator: managers[2]._id,
         status: 'under_review',
         isApproved: false,
         ticketTypes: [
           { name: 'Runner ID', price: 4500, capacity: 500 }
         ]
      },
      {
         title: 'Synth-Wave Architecture Tour',
         description: 'Exploring the retro-futuristic urban design of the Neo-Miami district.',
         date: new Date('2026-12-05'),
         time: '11:00',
         location: {
             address: 'Neo-Miami Financial District',
             venueName: 'Central Spire'
         },
         category: 'Education',
         image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070',
         creator: managers[0]._id,
         status: 'under_review',
         isApproved: false,
         ticketTypes: [
           { name: 'Walking Registry', price: 1500, capacity: 30 }
         ]
      },
      {
         title: 'Deep Space Gastronomy',
         description: 'Molecular dining experience inspired by cosmic phenomena. 12 courses of stardust.',
         date: new Date('2027-01-15'),
         time: '20:30',
         location: {
             address: 'Cloud Nine Atmospheric Station',
             venueName: 'Sky Lounge'
         },
         category: 'Food',
         image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2070',
         creator: managers[1]._id,
         status: 'under_review',
         isApproved: false,
         ticketTypes: [
           { name: 'Table for Two', price: 35000, capacity: 20 }
         ]
      }
    ];

    await Event.create(eventsToSeed);
    console.log(`Seeding complete: ${eventsToSeed.length} productions initialized in review status.`);

    process.exit(0);
  } catch (error) {
    console.error('Seed protocol failure:', error);
    process.exit(1);
  }
};

seedNewData();
