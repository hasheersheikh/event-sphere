import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';
import EventManager from '../models/EventManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-sphere';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // 1. Clear existing events
    await Event.deleteMany({});
    console.log('Cleared all existing events');

    // 2. Fetch managers for creators
    const managers = await EventManager.find({ role: 'event_manager' });
    if (managers.length === 0) {
      console.error('No managers found. Please run seedAdmin or seedUsers first.');
      process.exit(1);
    }
    const creatorId = managers[0]._id;

    const ytShort = 'https://www.youtube.com/shorts/qL-N-a7L_0o';
    const igReel = 'https://www.instagram.com/reel/C5_8Q9-x_5_/';

    const events = [
      // 1. SINGLE EVENT - Napoli
      {
        title: 'BUNNY CLUB | NAPOLI',
        description: 'SERATA BAD BUNNY A NAPOLI 🔥\n\nÈ passato quasi un anno ed è finalmente il ritorno del BUNNY CLUB a Napoli. 🌋🔥\n\nGiovedì 30 aprile (pre-festivo), il RIVA CLUB si prepara a riaccendersi con una notte tutta dedicata a Bad Bunny 🌴',
        scheduleType: 'single',
        date: new Date('2026-04-30'),
        time: '23:00',
        endTime: '04:00',
        city: 'Napoli',
        location: {
          address: 'Via Coroglio 154, 80124 Naples',
          venueName: 'Riva Club',
          googleMapUrl: 'https://maps.google.com/?q=Riva+Club+Napoli',
          coordinates: { lat: 40.8197, lng: 14.1856 },
        },
        category: 'Party',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=2070',
        videoUrl: 'https://www.youtube.com/watch?v=fS6uAtAbH2Q',
        reels: [ytShort, igReel],
        creator: creatorId,
        ticketTypes: [
          { name: 'Early Bird', description: 'Limited availability', price: 13.80, capacity: 100, sold: 85 },
          { name: 'General Admission', description: 'Standard entry', price: 20.00, capacity: 500, sold: 120 },
        ],
        vouchers: [
          { code: 'BUNNY10', discountType: 'percentage', discountAmount: 10, isActive: true },
        ],
        status: 'published',
        isApproved: true,
        isSponsored: true,
        viewCount: 1250,
      },

      // 2. MULTI-DAY EVENT - Milan
      {
        title: 'Milan Design Week Expo',
        description: 'A prestigious 3-day exhibition showcasing the future of sustainable furniture and interior architecture.',
        scheduleType: 'multi_day',
        date: new Date('2026-05-15'),
        time: '09:00',
        endTime: '18:00',
        isMultiDay: true,
        days: [
          { date: new Date('2026-05-15'), startTime: '09:00', endTime: '18:00', title: 'Industrial Design Day' },
          { date: new Date('2026-05-16'), startTime: '09:00', endTime: '18:00', title: 'Tech & Smart Homes' },
          { date: new Date('2026-05-17'), startTime: '10:00', endTime: '17:00', title: 'Sustainable Future' },
        ],
        city: 'Milan',
        location: {
          address: 'Rho Fiera Milano, Strada Statale del Sempione, 28, 20017 Rho MI',
          venueName: 'Fiera Milano',
          googleMapUrl: 'https://maps.google.com/?q=Fiera+Milano',
          coordinates: { lat: 45.5204, lng: 9.0768 },
        },
        category: 'Business',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069',
        reels: [igReel],
        creator: creatorId,
        ticketTypes: [
          { name: 'Day Pass', description: 'Valid for any single day', price: 45.00, capacity: 5000, sold: 1200, isFullPass: false, dayWisePrices: [{dayIndex: 0, price: 45}, {dayIndex: 1, price: 45}, {dayIndex: 2, price: 35}] },
          { name: 'Festival Pass', description: 'Access to all 3 days', price: 99.00, capacity: 1000, sold: 450, isFullPass: true, fullPassPrice: 99.00 },
        ],
        status: 'published',
        isApproved: true,
        isSponsored: false,
        viewCount: 5400,
      },

      // 3. MULTI-SLOT EVENT - Rome
      {
        title: 'Colosseum Under the Stars',
        description: 'Experience the magic of the Colosseum with guided night tours. Choose your preferred time slot.',
        scheduleType: 'multi_slot',
        date: new Date('2026-06-10'),
        time: '20:00',
        slots: [
          { startTime: '20:00', endTime: '21:30', label: 'Sunset Tour', capacity: 30, sold: 28 },
          { startTime: '21:30', endTime: '23:00', label: 'Night Owl Tour', capacity: 30, sold: 15 },
          { startTime: '23:00', endTime: '00:30', label: 'Midnight Mystery', capacity: 30, sold: 5 },
        ],
        city: 'Rome',
        location: {
          address: 'Piazza del Colosseo, 1, 00184 Roma RM',
          venueName: 'The Colosseum',
          googleMapUrl: 'https://maps.google.com/?q=Colosseum+Rome',
          coordinates: { lat: 41.8902, lng: 12.4922 },
        },
        category: 'Culture',
        image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1996',
        videoUrl: 'https://www.youtube.com/watch?v=gY6398OaD18',
        creator: creatorId,
        ticketTypes: [
          { name: 'Guided Tour', description: 'Professional historian guide included', price: 75.00, capacity: 90, sold: 48 },
        ],
        status: 'published',
        isApproved: true,
        isSponsored: true,
      },

      // 4. RECURRING EVENT - Florence
      {
        title: 'Uffizi Gallery Morning Yoga',
        description: 'Start your week with mindfulness. Weekly yoga sessions overlooking the historical Uffizi courtyard.',
        scheduleType: 'recurring',
        date: new Date('2026-04-06'), // First session
        time: '08:00',
        endTime: '09:30',
        recurrence: {
          frequency: 'weekly',
          daysOfWeek: [1], // Mondays
          endDate: new Date('2026-12-28'),
          isActive: true,
        },
        city: 'Florence',
        location: {
          address: 'Piazzale degli Uffizi, 6, 50122 Firenze FI',
          venueName: 'Uffizi Gallery Courtyard',
          googleMapUrl: 'https://maps.google.com/?q=Uffizi+Gallery',
          coordinates: { lat: 43.7678, lng: 11.2553 },
        },
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=2020',
        creator: creatorId,
        ticketTypes: [
          { name: 'Session Drop-in', description: 'Single session access', price: 15.00, capacity: 25, sold: 10 },
          { name: 'Monthly Pass', description: '4 consecutive sessions', price: 45.00, capacity: 10, sold: 2 },
        ],
        status: 'published',
        isApproved: true,
      },

      // 5. UNDER REVIEW - Venice
      {
        title: 'Venice Film Festival Opening',
        description: 'The glitz and glamour of international cinema on the Lido di Venezia. A highly anticipated red carpet event.',
        scheduleType: 'single',
        date: new Date('2026-08-28'),
        time: '18:00',
        city: 'Venice',
        location: {
          address: 'Lungomare Marconi, 30126 Lido di Venezia VE',
          venueName: 'Palazzo del Cinema',
          coordinates: { lat: 45.4058, lng: 12.3676 },
        },
        category: 'Entertainment',
        image: 'https://images.unsplash.com/photo-1512100356956-c1227c330289?auto=format&fit=crop&q=80&w=2070',
        creator: creatorId,
        ticketTypes: [
          { name: 'Standard Entry', price: 120.00, capacity: 1000, sold: 0 },
          { name: 'VIP Gala', price: 500.00, capacity: 100, sold: 0 },
        ],
        status: 'under_review',
        isApproved: false,
      }
    ];

    const inserted = await Event.insertMany(events);
    console.log(`Successfully seeded ${inserted.length} new events.`);
    
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
