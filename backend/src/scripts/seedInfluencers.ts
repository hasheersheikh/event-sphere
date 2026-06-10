import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Influencer from '../models/Influencer.js';

dotenv.config();

const seedInfluencers = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-sphere';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing influencers to ensure we have a clean list
    await Influencer.deleteMany({});
    console.log('Cleared existing influencers');

    const influencersToSeed = [
      {
        name: 'Aria Chef',
        handle: '@aria_eats',
        category: 'Food',
        niche: 'Gourmet & Street Food',
        reach: '250K+',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
        instagramUrl: 'https://instagram.com',
        isActive: true,
      },
      {
        name: 'Marcus Vibe',
        handle: '@marcus_pulse',
        category: 'Event',
        niche: 'Festivals & Nightlife',
        reach: '1.2M+',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
        instagramUrl: 'https://instagram.com',
        isActive: true,
      },
      {
        name: 'DJ Zephyr',
        handle: '@zephyr_beats',
        category: 'Music',
        niche: 'Electronic & House',
        reach: '480K+',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
        instagramUrl: 'https://instagram.com',
        isActive: true,
      },
      {
        name: 'Sophia Vogue',
        handle: '@sophia_style',
        category: 'Fashion',
        niche: 'Streetwear & Couture',
        reach: '850K+',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800',
        instagramUrl: 'https://instagram.com',
        isActive: true,
      },
      {
        name: 'Leo Wander',
        handle: '@leo_explorer',
        category: 'Lifestyle',
        niche: 'Travel & Wellness',
        reach: '600K+',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
        instagramUrl: 'https://instagram.com',
        isActive: true,
      },
    ];

    await Influencer.insertMany(influencersToSeed);
    console.log('Seeded high-quality influencers successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding influencers:', error);
    process.exit(1);
  }
};

seedInfluencers();
