import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Blog from '../models/Blog.js';

dotenv.config();

const BLOGS = [
  {
    title: "How City Pulse Is Redefining Local Event Discovery",
    slug: "how-city-pulse-redefines-local-event-discovery",
    excerpt: "From underground music nights to food festivals, City Pulse brings the heartbeat of your city to your fingertips. Here's how we do it.",
    content: `# How City Pulse Is Redefining Local Event Discovery

Every city has a pulse — a rhythm of events, gatherings, and experiences that make it alive. But finding those moments? That's always been harder than it should be.

## The Problem We Set Out to Solve

Before City Pulse, discovering local events meant scrolling through a dozen different social media pages, checking posters on notice boards, or relying on word of mouth. Good events were often invisible to the people who'd love them most.

We built City Pulse to change that.

## What Makes Us Different

### Hyperlocal Focus
We don't just list events — we surface the ones happening in *your* neighborhood, on *your* schedule. Our filters let you find events by category, date, and distance, so you're always seeing what's actually relevant to you.

### Verified Organizers
Every event on our platform goes through a moderation layer. We verify event managers before they can publish, which means fewer fake events and more trust for attendees.

### Seamless Ticketing
From browsing to booking, everything happens in one place. Buy your ticket, get it sent to your email and WhatsApp, and walk in with a QR code. No printing required.

## What's Next

We're constantly adding new features — from multi-day event support to local store integrations. City Pulse isn't just an events app; it's becoming the complete local discovery platform your city deserves.

**Stay tuned. Your city has a lot more to offer than you think.**`,
    coverImage: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80",
    status: "published",
    isPublic: true,
    author: "City Pulse Team",
    tags: ["platform", "events", "community"],
    metaTitle: "How City Pulse Redefines Local Event Discovery",
    metaDescription: "From underground music nights to food festivals, City Pulse brings the heartbeat of your city to your fingertips.",
  },
  {
    title: "5 Tips for Hosting a Successful Local Event",
    slug: "5-tips-for-hosting-a-successful-local-event",
    excerpt: "Whether it's your first workshop or your tenth concert, these five proven strategies will help you sell more tickets and create better experiences.",
    content: `# 5 Tips for Hosting a Successful Local Event

Planning a local event is equal parts exciting and overwhelming. Between logistics, promotion, and actually delivering a great experience, there's a lot to juggle. Here are five tips that work.

## 1. Start with a Clear Value Proposition

Why should someone spend their Saturday evening at your event instead of staying home? Answer that question before you write a single word of your event description.

*"Live Jazz + Rooftop Views + Unlimited Chai"* beats *"Jazz Night"* every time.

## 2. Price Tickets Strategically

Don't just pick a number. Research what similar events charge. Consider:
- **Early bird pricing** to reward loyal fans
- **Tiered tickets** (General, VIP, Full Pass) to capture different budgets
- **Free events** with optional donations or merchandise

## 3. Promote Early, Promote Often

- Share on all your social channels **3–4 weeks** before the event
- Partner with local cafes, colleges, and community groups
- Use WhatsApp groups — they're still the most effective channel in India for local outreach

## 4. Streamline Entry with QR Codes

Manual check-in creates queues and kills vibes. With City Pulse, every attendee gets a unique QR code — scan it at the door in under two seconds.

## 5. Collect Feedback After

Send a quick 3-question survey within 24 hours. The data shapes your next event and shows attendees you care.

---

*Ready to host your next event? [List it on City Pulse](#) and reach thousands of people in your city.*`,
    coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
    status: "published",
    isPublic: true,
    author: "City Pulse Team",
    tags: ["events", "tips", "organizers"],
    metaTitle: "5 Tips for Hosting a Successful Local Event",
    metaDescription: "Whether it's your first workshop or your tenth concert, these five proven strategies will help you sell more tickets.",
  },
  {
    title: "The Rise of Local Stores: Why Buying Local Matters More Than Ever",
    slug: "rise-of-local-stores-why-buying-local-matters",
    excerpt: "Big e-commerce platforms are convenient, but local stores offer something they can't — community, character, and a real human connection.",
    content: `# The Rise of Local Stores: Why Buying Local Matters More Than Ever

There's a bakery down the street that makes the best almond croissants you've ever had. The owner knows your name. She remembers that you prefer them without icing. And she sources her almonds from a farm two hours away.

You'll never get that from a delivery app.

## Why Local Stores Are Thriving

Despite the dominance of e-commerce giants, local stores are making a comeback — and for good reason.

### 1. Community Connection
When you buy from a local store, your money stays in your neighborhood. It pays a neighbor's salary. It funds a child's education. The economic multiplier effect of local spending is **2–3x higher** than spending at large chains.

### 2. Authenticity and Curation
Local store owners are passionate about what they sell. You won't find generic mass-produced products — you'll find things that have been hand-picked, tested, and genuinely believed in.

### 3. Personal Service
Got a question? The person behind the counter actually knows the answer. They can tell you which variant of their product is best for you — because they've used it themselves.

## How City Pulse Supports Local Stores

We've built a dedicated local stores section on City Pulse where you can:

- **Browse** neighborhood stores by category
- **Order online** with COD or Razorpay payment
- **Track your order** from placement to delivery
- **Contact the store** directly via WhatsApp or phone

The goal is simple: make it as easy to buy from your local bakery as it is to order from any big platform.

## Start Exploring

Next time you need something, check City Pulse first. You might be surprised at what's available right around the corner.

*Your city's best-kept secrets are waiting to be discovered.*`,
    coverImage: "https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=1200&q=80",
    status: "published",
    isPublic: true,
    author: "City Pulse Team",
    tags: ["local stores", "community", "shopping"],
    metaTitle: "Why Buying from Local Stores Matters More Than Ever",
    metaDescription: "Big e-commerce platforms are convenient, but local stores offer something they can't — community, character, and a real human connection.",
  },
  {
    title: "City Pulse's New Multi-Day Event Feature: Everything You Need to Know",
    slug: "multi-day-event-feature-announcement",
    excerpt: "Multi-day events like festivals and workshops are now fully supported on City Pulse — with day-wise pricing, full passes, and more.",
    content: `# City Pulse's New Multi-Day Event Feature: Everything You Need to Know

Great events don't always fit into a single afternoon. Festivals, boot camps, conferences, and cultural gatherings often span multiple days — and now City Pulse fully supports them.

## What's New

### Day-Wise Scheduling
You can now create events with multiple days, each with its own:
- **Start and end time**
- **Custom title** (e.g., "Day 1: Opening Night", "Day 2: Workshops")

### Flexible Ticket Types
We've introduced two powerful ticket configurations:

**Day-Pass Pricing** — Set different prices for each day. Let attendees choose exactly which days they attend.

**Full-Pass Option** — Offer a bundled ticket at a special price for attendees who want to experience all days.

### Smart Ticket Validation
Our QR scanner now understands multi-day events. Each ticket is tied to specific days, so validation at the gate is still just a single scan.

## Who Is This For?

- **Music festivals** running over a weekend
- **Educational boot camps** spanning multiple sessions
- **Cultural events** like literary festivals or film screenings
- **Corporate conferences** with multi-day agendas

## Getting Started

Creating a multi-day event is simple:
1. Toggle "Multi-Day Event" when creating your event
2. Add each day with its schedule
3. Set ticket types with day-wise or full-pass pricing
4. Publish and start selling

Questions? Reach us at [contact@citypulse.in](#).`,
    coverImage: "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=1200&q=80",
    status: "published",
    isPublic: true,
    author: "City Pulse Team",
    tags: ["features", "events", "announcement"],
    metaTitle: "Multi-Day Events Are Now Live on City Pulse",
    metaDescription: "Multi-day events like festivals and workshops are now fully supported — with day-wise pricing, full passes, and more.",
  },
  {
    title: "A Guide to Attending Your First Live Event",
    slug: "guide-to-attending-your-first-live-event",
    excerpt: "New to live events? Here's everything you need to know — from booking your ticket to making the most of the experience.",
    content: `# A Guide to Attending Your First Live Event

There's nothing quite like the energy of a live event. The crowd, the atmosphere, the shared experience — it's something a screen can never fully replicate. If you've never been to one, here's how to make your first time count.

## Step 1: Find the Right Event

Start with what you love. Music? Comedy? Food? Browse by category on City Pulse and filter by your city. Don't overthink it — pick something that sounds even slightly interesting.

## Step 2: Check the Details

Before booking, verify:
- **Date and time** — obvious, but double-check
- **Venue** — look it up on Google Maps so you know how to get there
- **Dress code** — some events have one
- **What's included** — is food/drinks included in the ticket price?

## Step 3: Book Early

Good events sell out. If you're interested, book as soon as you're sure. Most platforms (including City Pulse) offer early-bird pricing that rewards people who plan ahead.

## Step 4: Your Ticket

After booking on City Pulse, you'll receive:
- A confirmation email with your QR code ticket
- A WhatsApp message with the same ticket

Save both. You'll scan the QR code at the gate — no printing required.

## Step 5: On the Day

- Arrive 15–20 minutes early
- Have your QR code ready (screenshot it so you don't need internet)
- Check if the event has a social media hashtag and use it

## Step 6: After the Event

- Leave a review if the platform supports it
- Follow the organizer for future events
- Tell a friend — the best events grow through word of mouth

---

*Ready to experience your first live event? [Browse events near you](#) on City Pulse.*`,
    coverImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80",
    status: "published",
    isPublic: true,
    author: "City Pulse Team",
    tags: ["guide", "events", "beginners"],
    metaTitle: "A Beginner's Guide to Attending Your First Live Event",
    metaDescription: "New to live events? Here's everything you need to know — from booking your ticket to making the most of the experience.",
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-sphere');
    console.log('Connected to MongoDB');

    await Blog.deleteMany({});
    console.log('Cleared existing blogs');

    const created = await Blog.insertMany(BLOGS);
    console.log(`✅ Seeded ${created.length} blog posts`);

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
