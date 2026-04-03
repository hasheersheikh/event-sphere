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

    // Fetch the 3 existing managers
    const managers = await EventManager.find({ role: 'event_manager' }).limit(3);
    if (managers.length < 3) {
      console.error('Need at least 3 managers. Run seedNewData first.');
      process.exit(1);
    }

    const [alex, sarah, marcus] = managers;
    console.log(`Managers: ${alex.name}, ${sarah.name}, ${marcus.name}`);

    const ytShort = 'https://youtube.com/shorts/A0PnI8EgRJc?si=SUz9f39VC6GzrVcC';

    const events = [
      // ─── PUBLISHED (approved) ───────────────────────────────────────────────
      {
        title: 'Indie Beats Open Air',
        description:
          'A one-day outdoor concert celebrating independent musicians from across South Asia. Three stages, food stalls, and an open-mic finale.',
        date: new Date('2026-05-10'),
        time: '14:00',
        endTime: '23:00',
        isMultiDay: false,
        location: {
          address: 'Siri Fort Auditorium, August Kranti Marg, New Delhi',
          venueName: 'Siri Fort Grounds',
          googleMapUrl: 'https://maps.google.com/?q=Siri+Fort+Auditorium+New+Delhi',
          coordinates: { lat: 28.5495, lng: 77.2176 },
        },
        category: 'Music',
        image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=2070',
        videoUrl: 'https://www.youtube.com/watch?v=fS6uAtAbH2Q',
        reels: [ytShort],
        creator: alex._id,
        ticketTypes: [
          { name: 'General Admission', description: 'Standing area access', price: 699, capacity: 2000, sold: 1340 },
          { name: 'VIP Lounge', description: 'Seated area + 2 complimentary drinks', price: 1999, capacity: 200, sold: 87 },
        ],
        status: 'published',
        isApproved: true,
        vouchers: [
          { code: 'INDIE20', discountType: 'percentage', discountAmount: 20, isActive: true },
        ],
      },
      {
        title: 'Mumbai Marathon Classic',
        description:
          'The city\'s flagship road race — choose from 5K, 10K, or Full Marathon. Chip-timed with medals and finisher t-shirts for all participants.',
        date: new Date('2026-06-07'),
        time: '05:30',
        endTime: '12:00',
        isMultiDay: false,
        location: {
          address: 'Marine Lines, Mumbai, Maharashtra',
          venueName: 'Marine Drive Start Line',
          googleMapUrl: 'https://maps.google.com/?q=Marine+Drive+Mumbai',
          coordinates: { lat: 18.9438, lng: 72.8235 },
        },
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&q=80&w=2070',
        reels: [ytShort],
        creator: sarah._id,
        ticketTypes: [
          { name: '5K Run', description: 'Chip-timed 5K with medal', price: 499, capacity: 3000, sold: 2100 },
          { name: '10K Run', description: 'Chip-timed 10K with medal + tee', price: 799, capacity: 2000, sold: 1800 },
          { name: 'Full Marathon', description: '42.2 km chip-timed with finisher gear', price: 1499, capacity: 500, sold: 480, isSoldOut: true },
        ],
        status: 'published',
        isApproved: true,
      },
      {
        title: 'Street Food Carnival',
        description:
          'Celebrating the diversity of Indian street food. 60+ vendors, live cooking demos, and a spice challenge competition.',
        date: new Date('2026-04-19'),
        time: '11:00',
        endTime: '22:00',
        isMultiDay: false,
        location: {
          address: 'Sector 29, Gurugram, Haryana',
          venueName: 'Leisure Valley Park',
          googleMapUrl: 'https://maps.google.com/?q=Leisure+Valley+Gurugram',
          coordinates: { lat: 28.4689, lng: 77.0547 },
        },
        category: 'Food',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=2070',
        videoUrl: ytShort,
        creator: marcus._id,
        ticketTypes: [
          { name: 'Entry Pass', description: 'Gate entry + tasting tokens worth ₹200', price: 299, capacity: 5000, sold: 3200 },
          { name: 'Foodie VIP', description: 'Skip-queue + ₹600 tokens + cookbook', price: 899, capacity: 300, sold: 142 },
        ],
        status: 'published',
        isApproved: true,
        vouchers: [
          { code: 'FOODFEST10', discountType: 'fixed', discountAmount: 50, isActive: true },
        ],
      },

      // ─── UNDER REVIEW (pending approval) ────────────────────────────────────
      {
        title: 'UX Design Intensive — Bangalore',
        description:
          'A full-day workshop on user research, prototyping, and usability testing. Taught by senior designers from top product companies.',
        date: new Date('2026-07-05'),
        time: '09:00',
        endTime: '18:00',
        isMultiDay: false,
        location: {
          address: 'Koramangala, Bengaluru, Karnataka 560034',
          venueName: 'The Design Studio',
          googleMapUrl: 'https://maps.google.com/?q=Koramangala+Bangalore',
          coordinates: { lat: 12.9352, lng: 77.6244 },
        },
        category: 'Education',
        image: 'https://images.unsplash.com/photo-1558403194-611308249627?auto=format&fit=crop&q=80&w=2070',
        creator: alex._id,
        ticketTypes: [
          { name: 'Early Bird', description: 'Limited early access tickets', price: 2499, capacity: 50, sold: 22 },
          { name: 'Standard', description: 'Full workshop access with materials', price: 3499, capacity: 100, sold: 8 },
        ],
        status: 'under_review',
        isApproved: false,
      },
      {
        title: 'Crypto & Web3 Summit India',
        description:
          'India\'s largest Web3 gathering with keynotes from DeFi founders, NFT artists, and Layer-2 protocol builders.',
        date: new Date('2026-08-22'),
        time: '10:00',
        endTime: '20:00',
        isMultiDay: false,
        location: {
          address: 'Hyderabad International Convention Centre, Hyderabad',
          venueName: 'HICC Hall A',
          googleMapUrl: 'https://maps.google.com/?q=HICC+Hyderabad',
          coordinates: { lat: 17.4291, lng: 78.3974 },
        },
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2070',
        reels: [ytShort],
        creator: sarah._id,
        ticketTypes: [
          { name: 'Delegate', description: 'Full-day access + lunch', price: 4999, capacity: 800, sold: 0 },
          { name: 'Builder Pass', description: 'Hackathon zone + workshops + dinner', price: 8999, capacity: 100, sold: 0 },
        ],
        status: 'under_review',
        isApproved: false,
      },
      {
        title: 'Kathak & Contemporary Fusion Night',
        description:
          'An evening of dance where classical Kathak meets contemporary movement. Featuring top performers and a live tabla-electronic fusion set.',
        date: new Date('2026-09-13'),
        time: '19:30',
        endTime: '22:30',
        isMultiDay: false,
        location: {
          address: 'Kamani Auditorium, Mandi House, New Delhi',
          venueName: 'Kamani Auditorium',
          googleMapUrl: 'https://maps.google.com/?q=Kamani+Auditorium+New+Delhi',
          coordinates: { lat: 28.6276, lng: 77.2384 },
        },
        category: 'Art',
        image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=2070',
        creator: marcus._id,
        ticketTypes: [
          { name: 'Balcony', description: 'Upper balcony seating', price: 599, capacity: 150, sold: 0 },
          { name: 'Stalls', description: 'Ground floor seating', price: 999, capacity: 250, sold: 0 },
          { name: 'Front Row', description: 'First 3 rows with programme booklet', price: 1999, capacity: 30, sold: 0 },
        ],
        status: 'under_review',
        isApproved: false,
      },

      // ─── MULTI-DAY EVENTS ────────────────────────────────────────────────────
      {
        title: 'Jaipur Literature Festival 2026',
        description:
          'Five days of ideas, books, and conversations. Over 250 speakers, 100+ sessions, poetry slams, and cultural evenings in the Pink City.',
        date: new Date('2026-01-21'),
        time: '09:00',
        endTime: '21:00',
        isMultiDay: true,
        days: [
          { date: new Date('2026-01-21'), startTime: '09:00', endTime: '21:00', title: 'Opening Ceremony & Keynotes' },
          { date: new Date('2026-01-22'), startTime: '09:00', endTime: '21:00', title: 'Fiction & Poetry Day' },
          { date: new Date('2026-01-23'), startTime: '09:00', endTime: '21:00', title: 'Non-fiction & Journalism' },
          { date: new Date('2026-01-24'), startTime: '09:00', endTime: '21:00', title: 'Young Adult & Children\'s Lit' },
          { date: new Date('2026-01-25'), startTime: '09:00', endTime: '20:00', title: 'Grand Finale & Closing Night' },
        ],
        location: {
          address: 'Diggi Palace Hotel, Shivaji Nagar, Jaipur, Rajasthan',
          venueName: 'Diggi Palace',
          googleMapUrl: 'https://maps.google.com/?q=Diggi+Palace+Jaipur',
          coordinates: { lat: 26.9124, lng: 75.7873 },
        },
        category: 'Education',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=2070',
        videoUrl: 'https://www.youtube.com/watch?v=9No-FiE946s',
        reels: [ytShort],
        creator: alex._id,
        ticketTypes: [
          {
            name: 'Day Pass',
            description: 'Access for one day of your choice',
            price: 0,
            capacity: 10000,
            sold: 7500,
            isFullPass: false,
            dayWisePrices: [
              { dayIndex: 0, price: 0 },
              { dayIndex: 1, price: 0 },
              { dayIndex: 2, price: 0 },
              { dayIndex: 3, price: 0 },
              { dayIndex: 4, price: 0 },
            ],
          },
          {
            name: 'Full Festival Pass',
            description: 'All 5 days + exclusive author dinners',
            price: 4999,
            capacity: 500,
            sold: 312,
            isFullPass: true,
            fullPassPrice: 4999,
          },
        ],
        status: 'published',
        isApproved: true,
        vouchers: [
          { code: 'JLF2026', discountType: 'percentage', discountAmount: 15, isActive: true },
        ],
      },
      {
        title: 'India Game Developers Conference',
        description:
          'Three-day conference for game developers, artists, and publishers. Workshops on Unreal Engine, Unity, and indie monetisation strategies.',
        date: new Date('2026-11-06'),
        time: '09:30',
        endTime: '18:30',
        isMultiDay: true,
        days: [
          { date: new Date('2026-11-06'), startTime: '09:30', endTime: '18:30', title: 'Engine & Tools Track' },
          { date: new Date('2026-11-07'), startTime: '09:30', endTime: '18:30', title: 'Art, Audio & Narrative' },
          { date: new Date('2026-11-08'), startTime: '10:00', endTime: '17:00', title: 'Business, Publishing & Expo' },
        ],
        location: {
          address: 'Bombay Exhibition Centre, Goregaon, Mumbai',
          venueName: 'BEC Hall 5',
          googleMapUrl: 'https://maps.google.com/?q=Bombay+Exhibition+Centre',
          coordinates: { lat: 19.1547, lng: 72.8495 },
        },
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070',
        videoUrl: 'https://www.youtube.com/watch?v=7_W0XG9c54k',
        reels: [ytShort],
        creator: sarah._id,
        ticketTypes: [
          {
            name: 'Indie Dev Pass',
            description: 'All 3 days — workshops + expo floor',
            price: 3999,
            capacity: 1000,
            sold: 0,
            isFullPass: true,
            fullPassPrice: 3999,
          },
          {
            name: 'Single Day',
            description: 'Pick any one conference day',
            price: 1799,
            capacity: 600,
            sold: 0,
            isFullPass: false,
            dayWisePrices: [
              { dayIndex: 0, price: 1799 },
              { dayIndex: 1, price: 1799 },
              { dayIndex: 2, price: 999 },
            ],
          },
          {
            name: 'Studio Pass',
            description: 'All 3 days + private networking dinner for studios',
            price: 12000,
            capacity: 50,
            sold: 0,
            isFullPass: true,
            fullPassPrice: 12000,
          },
        ],
        status: 'under_review',
        isApproved: false,
      },
      {
        title: 'Yoga & Wellness Retreat — Rishikesh',
        description:
          'A 4-day immersive retreat on the banks of the Ganges. Morning yoga, pranayama, sound healing, Ayurvedic meals, and evening meditations.',
        date: new Date('2026-10-01'),
        time: '06:00',
        endTime: '20:00',
        isMultiDay: true,
        days: [
          { date: new Date('2026-10-01'), startTime: '06:00', endTime: '20:00', title: 'Arrival & Grounding' },
          { date: new Date('2026-10-02'), startTime: '06:00', endTime: '20:00', title: 'Deep Practice Day' },
          { date: new Date('2026-10-03'), startTime: '06:00', endTime: '20:00', title: 'Sound Healing & River Ceremony' },
          { date: new Date('2026-10-04'), startTime: '06:00', endTime: '14:00', title: 'Integration & Departure' },
        ],
        location: {
          address: 'Swarg Ashram Road, Rishikesh, Uttarakhand',
          venueName: 'Ananda on the Ganges',
          googleMapUrl: 'https://maps.google.com/?q=Swarg+Ashram+Rishikesh',
          coordinates: { lat: 30.1158, lng: 78.3182 },
        },
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&q=80&w=2070',
        reels: [ytShort],
        creator: marcus._id,
        ticketTypes: [
          {
            name: 'Shared Accommodation',
            description: '4 days / 3 nights, shared room, all meals included',
            price: 18999,
            capacity: 30,
            sold: 12,
            isFullPass: true,
            fullPassPrice: 18999,
          },
          {
            name: 'Private Cottage',
            description: '4 days / 3 nights, private cottage, all meals + spa credit',
            price: 34999,
            capacity: 10,
            sold: 7,
            isFullPass: true,
            fullPassPrice: 34999,
          },
        ],
        status: 'published',
        isApproved: true,
        vouchers: [
          { code: 'WELLNESS15', discountType: 'percentage', discountAmount: 15, isActive: true },
          { code: 'EARLYBIRD', discountType: 'fixed', discountAmount: 2000, isActive: false },
        ],
      },

      // ─── DRAFT ───────────────────────────────────────────────────────────────
      {
        title: 'Neon Night Market — Pune',
        description:
          'An after-dark bazaar featuring independent fashion labels, vinyl record sellers, electronic food carts, and a rooftop DJ.',
        date: new Date('2026-12-12'),
        time: '18:00',
        endTime: '01:00',
        isMultiDay: false,
        location: {
          address: 'Koregaon Park, Pune, Maharashtra',
          venueName: 'The Pavilion Grounds',
          coordinates: { lat: 18.5362, lng: 73.8956 },
        },
        category: 'Festival',
        image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=2070',
        creator: alex._id,
        ticketTypes: [
          { name: 'Market Entry', description: 'Gate access + welcome drink', price: 349, capacity: 1500, sold: 0 },
          { name: 'Rooftop VIP', description: 'Rooftop DJ access + open bar', price: 1499, capacity: 100, sold: 0 },
        ],
        status: 'draft',
        isApproved: false,
      },

      // ─── CANCELLED ───────────────────────────────────────────────────────────
      {
        title: 'Delhi Comedy Fest (Cancelled)',
        description:
          'Stand-up marathon featuring 12 comedians across 6 hours. Unfortunately cancelled due to venue permit issues.',
        date: new Date('2026-03-15'),
        time: '17:00',
        endTime: '23:00',
        isMultiDay: false,
        location: {
          address: 'Select CITYWALK, Saket, New Delhi',
          venueName: 'Amphitheatre Stage',
          coordinates: { lat: 28.5274, lng: 77.2192 },
        },
        category: 'Music',
        image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&q=80&w=2070',
        creator: sarah._id,
        ticketTypes: [
          { name: 'Standard', price: 799, capacity: 400, sold: 310 },
        ],
        status: 'cancelled',
        isApproved: true,
      },
    ];

    // Insert without wiping existing data
    const inserted = await Event.insertMany(events);
    console.log(`\n✅ Seeded ${inserted.length} events:`);
    inserted.forEach(e => console.log(`  • [${e.status}] ${e.title}  → creator: ${e.creator}`));
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
