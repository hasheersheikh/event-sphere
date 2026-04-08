import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import LocalStore from '../models/LocalStore.js';
import StoreOwner from '../models/StoreOwner.js';

dotenv.config();

// ─── Store data ───────────────────────────────────────────────────────────────

const STORES = [
  {
    name: 'The Chai Corner',
    address: 'Shop 4, MG Road, Koramangala, Bengaluru',
    description: 'Authentic masala chai and street snacks crafted from a 50-year-old family recipe. Step in for a cup and stay for the warmth.',
    category: 'Food & Beverage',
    photos: [
      'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=1200&q=80',
    ],
    contactPhone: '+91 98765 43210',
    contactEmail: 'hello@thechaicorner.in',
    whatsapp: '+919876543210',
    openingHours: 'Mon–Sat 7 AM – 10 PM',
    paymentMethods: ['cash', 'upi'],
    upiId: 'chaicorner@upi',
    instagram: '@thechaicorner',
    owner: { name: 'Ravi Sharma', email: 'ravi@thechaicorner.in', password: 'ChaiCorner@123' },
    products: [
      { name: 'Masala Chai', description: 'Classic spiced tea brewed with fresh ginger and cardamom', price: 30, isAvailable: true, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80' },
      { name: 'Cutting Chai', description: 'Half-glass strong brew — the Mumbai way', price: 20, isAvailable: true, image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&q=80' },
      { name: 'Samosa (2 pcs)', description: 'Crispy golden samosas with tamarind chutney', price: 40, isAvailable: true, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80' },
      { name: 'Kanda Poha', description: 'Flattened rice with onions, peas and fresh coriander', price: 60, isAvailable: true, image: 'https://images.unsplash.com/photo-1630383249896-483b1fbdce06?w=600&q=80' },
      { name: 'Bun Maska', description: 'Soft Irani bun with a generous layer of salted butter', price: 35, isAvailable: true, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80' },
      { name: 'Cold Coffee', description: 'Frothy iced coffee with a hint of vanilla', price: 80, discountPercent: 10, isAvailable: true, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80' },
    ],
  },
  {
    name: 'Urban Bakehouse',
    address: '12, Indiranagar 100 Feet Road, Bengaluru',
    description: 'Artisan sourdoughs, flaky croissants, and celebration cakes baked fresh every morning. No preservatives, no compromises.',
    category: 'Bakery',
    photos: [
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200&q=80',
    ],
    contactPhone: '+91 97654 32109',
    contactEmail: 'orders@urbanbakehouse.com',
    whatsapp: '+919765432109',
    openingHours: 'Tue–Sun 8 AM – 8 PM',
    paymentMethods: ['cash', 'upi', 'card'],
    upiId: 'urbanbakehouse@paytm',
    instagram: '@urbanbakehouse',
    website: 'https://urbanbakehouse.com',
    owner: { name: 'Priya Menon', email: 'priya@urbanbakehouse.com', password: 'Bakehouse@123' },
    products: [
      { name: 'Sourdough Loaf', description: '48-hour fermented sourdough with a crispy crust', price: 280, isAvailable: true, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80' },
      { name: 'Butter Croissant', description: 'Laminated French-style croissant, baked to golden perfection', price: 120, isAvailable: true, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80' },
      { name: 'Almond Croissant', description: 'Filled and topped with house-made almond cream', price: 150, discountPercent: 10, isAvailable: true, image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600&q=80' },
      { name: 'Banana Walnut Muffin', description: 'Moist banana muffin with toasted California walnuts', price: 90, isAvailable: true, image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=600&q=80' },
      { name: 'Chocolate Tart', description: 'Rich dark chocolate ganache in a buttery shortcrust shell', price: 180, isAvailable: true, image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80' },
      { name: 'Cinnamon Roll', description: 'Soft brioche roll with brown butter and cinnamon filling', price: 130, isAvailable: false, image: 'https://images.unsplash.com/photo-1583338917451-face2751d8d5?w=600&q=80' },
    ],
  },
  {
    name: 'Green Grocer',
    address: '7, Jayanagar 4th Block, Bengaluru',
    description: 'Farm-to-table vegetables, organic pulses and cold-pressed oils sourced directly from partner farms in Karnataka and Tamil Nadu.',
    category: 'Grocery',
    photos: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80',
    ],
    contactPhone: '+91 96543 21098',
    contactEmail: 'store@greengrocer.in',
    whatsapp: '+919654321098',
    openingHours: 'Mon–Sun 6 AM – 9 PM',
    paymentMethods: ['cash', 'upi'],
    upiId: 'greengrocer@gpay',
    instagram: '@greengrocer.blr',
    owner: { name: 'Ananya Iyer', email: 'ananya@greengrocer.in', password: 'GreenGrocer@123' },
    products: [
      { name: 'Organic Tomatoes (1 kg)', description: 'Vine-ripened, chemical-free tomatoes from Hosur farms', price: 60, isAvailable: true, image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&q=80' },
      { name: 'Baby Spinach (250 g)', description: 'Tender organic baby spinach, pre-washed and ready to use', price: 45, isAvailable: true, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80' },
      { name: 'Cold-Pressed Coconut Oil (500 ml)', description: 'Single-origin, wood-pressed virgin coconut oil', price: 320, discountPercent: 5, isAvailable: true, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80' },
      { name: 'Toor Dal (1 kg)', description: 'Unpolished organic split pigeon peas', price: 140, isAvailable: true, image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&q=80' },
      { name: 'Mixed Seasonal Fruit Basket', description: 'Curated basket of 4–5 seasonal fruits', price: 250, discountPercent: 10, isAvailable: true, image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&q=80' },
    ],
  },
  {
    name: 'The Book Nook',
    address: '23, Church Street, Brigade Road, Bengaluru',
    description: 'An independent bookshop celebrating world literature, regional fiction and rare finds. Our team handpicks every title on the shelf.',
    category: 'Books',
    photos: [
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80',
    ],
    contactPhone: '+91 95432 10987',
    contactEmail: 'hello@thebooknook.in',
    whatsapp: '+919543210987',
    openingHours: 'Mon–Sat 10 AM – 9 PM, Sun 11 AM – 7 PM',
    paymentMethods: ['cash', 'upi', 'card'],
    upiId: 'booknook@razorpay',
    instagram: '@thebooknook.blr',
    website: 'https://thebooknook.in',
    owner: { name: 'Karan Mehta', email: 'karan@thebooknook.in', password: 'BookNook@123' },
    products: [
      { name: 'The God of Small Things', description: 'Arundhati Roy\'s Booker Prize–winning masterpiece', price: 399, discountPercent: 15, isAvailable: true, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80' },
      { name: 'Malgudi Days', description: 'R.K. Narayan\'s timeless collection of short stories', price: 299, isAvailable: true, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80' },
      { name: 'Midnight\'s Children', description: 'Salman Rushdie\'s panoramic saga of post-independence India', price: 449, isAvailable: true, image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80' },
      { name: 'The White Tiger', description: 'Aravind Adiga\'s Booker-winning dark comedy on class in India', price: 349, isAvailable: true, image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80' },
      { name: 'Tuesdays with Morrie', description: 'Mitch Albom\'s unforgettable memoir about life\'s greatest lessons', price: 299, isAvailable: true, image: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=600&q=80' },
      { name: 'Notebook & Pen Set', description: 'Hand-stitched kraft notebook + brass-nib fountain pen', price: 550, discountPercent: 10, isAvailable: true, image: 'https://images.unsplash.com/photo-1517697471339-4aa32003c11a?w=600&q=80' },
    ],
  },
  {
    name: 'Craft & Thread',
    address: '8, Sadashivanagar, Bengaluru',
    description: 'Slow fashion studio making handloom kurtas, block-print dupattas and upcycled accessories. Each piece is made in our in-house workshop.',
    category: 'Fashion',
    photos: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    ],
    contactPhone: '+91 94321 09876',
    contactEmail: 'studio@craftandthread.in',
    whatsapp: '+919432109876',
    openingHours: 'Tue–Sun 11 AM – 7 PM',
    paymentMethods: ['cash', 'upi', 'card', 'bank_transfer'],
    upiId: 'craftthread@upi',
    instagram: '@craftandthread',
    website: 'https://craftandthread.in',
    owner: { name: 'Noor Fatima', email: 'noor@craftandthread.in', password: 'CraftThread@123' },
    products: [
      { name: 'Handloom Kurta (Men)', description: 'Khadi cotton kurta, hand-woven in Dharwad. Available in S–XXL', price: 1200, isAvailable: true, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b5b25?w=600&q=80' },
      { name: 'Block-Print Dupatta', description: 'Ajrakh block-print on pure mul cotton. 2.5 metre length', price: 850, discountPercent: 15, isAvailable: true, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
      { name: 'Upcycled Tote Bag', description: 'Made from deadstock fabric scraps, no two alike', price: 550, isAvailable: true, image: 'https://images.unsplash.com/photo-1614179924047-e1ab49a0a0cf?w=600&q=80' },
      { name: 'Indigo Dyed Scarf', description: 'Hand-dyed in natural indigo using traditional shibori technique', price: 750, isAvailable: true, image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80' },
      { name: 'Crochet Earrings', description: 'Lightweight hand-crocheted hoops in earthy tones', price: 380, discountPercent: 10, isAvailable: true, image: 'https://images.unsplash.com/photo-1630498197116-b3aa43c0c15a?w=600&q=80' },
    ],
  },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-sphere');
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    await LocalStore.deleteMany({});
    await StoreOwner.deleteMany({});
    console.log('🗑️  Cleared all stores and store owners\n');

    const salt = await bcrypt.genSalt(10);
    const results: Array<{ store: string; email: string; password: string }> = [];

    for (const data of STORES) {
      const { owner, products, ...storeData } = data;

      // Create the store
      const store = await LocalStore.create({ ...storeData, products });

      // Hash owner password and create owner linked to this store
      const hashed = await bcrypt.hash(owner.password, salt);
      await StoreOwner.create({
        name: owner.name,
        email: owner.email,
        password: hashed,
        storeId: store._id,
      });

      results.push({ store: store.name, email: owner.email, password: owner.password });
      console.log(`  ✔  ${store.name}`);
    }

    console.log('\n─────────────────────────────────────────────────────────');
    console.log('  STORE OWNER LOGIN CREDENTIALS');
    console.log('─────────────────────────────────────────────────────────');
    results.forEach(({ store, email, password }) => {
      console.log(`\n  🏪 ${store}`);
      console.log(`     Email   : ${email}`);
      console.log(`     Password: ${password}`);
    });
    console.log('\n─────────────────────────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
