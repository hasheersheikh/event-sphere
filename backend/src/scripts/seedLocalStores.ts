import mongoose from 'mongoose';
import dotenv from 'dotenv';
import LocalStore from '../models/LocalStore.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const stores = [
  {
    name: 'Brew & Bite Café',
    address: 'Shop 4, Connaught Place, New Delhi',
    description: 'Artisan coffee and freshly baked snacks crafted daily. Your neighbourhood morning ritual.',
    category: 'Café',
    photos: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop',
    ],
    products: [
      {
        name: 'Cold Brew Coffee',
        description: 'Slow-steeped 18-hour cold brew',
        price: 220,
        discountPercent: 10,
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&auto=format&fit=crop',
        isAvailable: true,
      },
      {
        name: 'Avocado Toast',
        description: 'Sourdough, smashed avo, chilli flakes',
        price: 320,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400&auto=format&fit=crop',
        isAvailable: true,
      },
      {
        name: 'Blueberry Muffin',
        description: 'Freshly baked every morning',
        price: 120,
        discountPercent: 15,
        image: 'https://images.unsplash.com/photo-1558303563-7c4b5b7c3d0e?w=400&auto=format&fit=crop',
        isAvailable: true,
      },
      {
        name: 'Flat White',
        description: 'Double ristretto with steamed micro-foam',
        price: 180,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&auto=format&fit=crop',
        isAvailable: true,
      },
    ],
    isActive: true,
  },
  {
    name: 'The Book Nook',
    address: '12, Khan Market, New Delhi',
    description: 'Curated books, stationery, and indie zines for curious minds.',
    category: 'Books & Stationery',
    photos: [
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&auto=format&fit=crop',
    ],
    products: [
      {
        name: 'Moleskine Notebook',
        description: 'Classic hardcover ruled notebook, A5',
        price: 899,
        discountPercent: 20,
        image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&auto=format&fit=crop',
        isAvailable: true,
      },
      {
        name: 'Illustrated City Maps',
        description: 'Hand-drawn Delhi poster art',
        price: 499,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&auto=format&fit=crop',
        isAvailable: true,
      },
      {
        name: 'Washi Tape Set',
        description: 'Set of 5 botanical print tapes',
        price: 249,
        discountPercent: 10,
        image: 'https://images.unsplash.com/photo-1456428746267-a1756408f782?w=400&auto=format&fit=crop',
        isAvailable: true,
      },
    ],
    isActive: true,
  },
  {
    name: 'Spice Route Kitchen',
    address: '7, Hauz Khas Village, New Delhi',
    description: 'Home-style Indian tiffins, pickles, and ready-to-cook masala kits.',
    category: 'Food & Grocery',
    photos: [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop',
    ],
    products: [
      {
        name: 'Punjabi Dal Makhani Kit',
        description: 'Pre-measured spice & lentil pack for 4',
        price: 349,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1546833998-877b37c2e4c6?w=400&auto=format&fit=crop',
        isAvailable: true,
      },
      {
        name: 'Mango Pickle (500g)',
        description: 'Traditional Rajasthani kachcha aam achar',
        price: 199,
        discountPercent: 5,
        image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&auto=format&fit=crop',
        isAvailable: true,
      },
      {
        name: 'Paneer Tikka Masala Kit',
        description: 'Restaurant-style kit with fresh spice paste',
        price: 299,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&auto=format&fit=crop',
        isAvailable: true,
      },
      {
        name: 'Chai Masala Blend (100g)',
        description: 'Ginger, cardamom, cinnamon, clove blend',
        price: 149,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop',
        isAvailable: true,
      },
    ],
    isActive: true,
  },
  {
    name: 'Handmade Co.',
    address: 'Stall 9, Dilli Haat, INA, New Delhi',
    description: 'Artisan jewellery, pottery, and handwoven textiles by local craftspeople.',
    category: 'Artisan Crafts',
    photos: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop',
    ],
    products: [
      {
        name: 'Terracotta Earrings',
        description: 'Hand-painted floral motif, lightweight',
        price: 450,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&auto=format&fit=crop',
        isAvailable: true,
      },
      {
        name: 'Block Print Tote Bag',
        description: 'Cotton canvas with Rajasthani block print',
        price: 599,
        discountPercent: 15,
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop',
        isAvailable: true,
      },
      {
        name: 'Handthrown Ceramic Mug',
        description: 'Stoneware, glazed in ocean blue',
        price: 750,
        discountPercent: 10,
        image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&auto=format&fit=crop',
        isAvailable: true,
      },
    ],
    isActive: true,
  },
];

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-sphere';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const existing = await LocalStore.countDocuments();
    if (existing > 0) {
      console.log(`${existing} stores already exist. Skipping seed.`);
      process.exit(0);
    }

    await LocalStore.insertMany(stores);
    console.log(`✅ Seeded ${stores.length} local stores successfully.`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
