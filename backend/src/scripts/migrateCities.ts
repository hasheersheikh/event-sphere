import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

// keyword → canonical city name
const CITY_KEYWORDS: Array<{ keywords: string[]; city: string }> = [
  { keywords: ['nagpur'], city: 'Nagpur' },
  { keywords: ['pune', 'pimpri', 'chinchwad'], city: 'Pune' },
  { keywords: ['mumbai', 'bombay', 'bandra', 'andheri', 'goregaon', 'thane', 'navi mumbai', 'marine lines', 'marine drive'], city: 'Mumbai' },
  { keywords: ['delhi', 'new delhi', 'noida', 'gurugram', 'gurgaon', 'faridabad', 'mandi house', 'connaught'], city: 'Delhi' },
  { keywords: ['hyderabad', 'secunderabad', 'hicc', 'cyberabad', 'gachibowli'], city: 'Hyderabad' },
  { keywords: ['chennai', 'madras', 'adyar', 'velachery', 'nungambakkam'], city: 'Chennai' },
  { keywords: ['bangalore', 'bengaluru', 'koramangala', 'indiranagar', 'whitefield', 'electronic city'], city: 'Bangalore' },
];

const detectCity = (address: string): string | null => {
  const lower = address.toLowerCase();
  for (const { keywords, city } of CITY_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) return city;
  }
  return null;
};

const migrate = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-sphere';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const events = await Event.find({ city: { $in: [null, '', undefined] } });
  console.log(`Found ${events.length} events without a city.`);

  let updated = 0;
  let skipped = 0;

  for (const event of events) {
    const address =
      (event.location as any)?.address ||
      (typeof event.location === 'string' ? event.location : '');

    const city = detectCity(address);
    if (city) {
      event.city = city;
      await event.save();
      console.log(`  ✓ "${event.title}" → ${city}`);
      updated++;
    } else {
      console.log(`  ✗ "${event.title}" — no match for: "${address}"`);
      skipped++;
    }
  }

  console.log(`\nDone. Updated: ${updated}, Skipped (no match): ${skipped}`);
  await mongoose.disconnect();
};

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
