import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import managerRoutes from './routes/managerRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import localStoreRoutes from './routes/localStoreRoutes.js';
import storeOrderRoutes from './routes/storeOrderRoutes.js';
import storeOwnerRoutes from './routes/storeOwnerRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import storePayoutRoutes from './routes/storePayoutRoutes.js';
import heroAssetRoutes from './routes/heroAssetRoutes.js';
import refundRoutes from './routes/refundRoutes.js';
import influencerRoutes from './routes/influencerRoutes.js';
import trendingVenueRoutes from './routes/trendingVenueRoutes.js';
import showcaseVideoRoutes from './routes/showcaseVideoRoutes.js';
import { initCronJobs } from './utils/cronJobs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5001;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.JWT_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET is not set. Refusing to start in production.');
  process.exit(1);
}

// Logger — file transports only carry errors; verbose logs stay on stdout
// (which Docker/journald already capture) so disk usage doesn't grow unbounded.
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

// Trust the reverse proxy (Caddy/Nginx) for correct client IPs — required for
// express-rate-limit and secure cookies to work behind a proxy.
app.set('trust proxy', 1);

app.use(helmet());
app.use(compression({
  threshold: 1024,        // Only compress responses >1KB
  level: 6,              // Balanced compression (default is -1 for adaptive)
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      // Don't compress if client requests it
      return false;
    }
    // Use default filter
    return compression.filter(req, res);
  },
}));

// CORS — restrict to configured frontend origin in production.
// Strip any trailing slash — FRONTEND_URL may be set with or without one, but
// the browser's Origin header never has a trailing slash, so an un-normalized
// comparison here can silently reject every real request.
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:8080').replace(/\/$/, '');
// Derive the www variant (https://example.com -> https://www.example.com) so
// the apex and www origins both work without extra config. Browsers send the
// Origin header on every non-GET request (even same-origin POSTs), so an
// origin missing here turns into a server-side 500 for that host.
const wwwVariant = frontendUrl.replace(/^(https?:\/\/)(?!www\.)/, '$1www.');
const allowedOrigins = [
  frontendUrl,
  wwwVariant,
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow localhost in development
    if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) return callback(null, true);
    // Allow configured origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS not allowed for this origin'));
  },
  credentials: true,
}));

// Rate limiting — protects a small VPS from being overwhelmed by bursts/scrapers.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
});
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later.' },
});
app.use('/api/', generalLimiter);
app.use('/api/auth', strictLimiter);
app.use('/api/payments', strictLimiter);

app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf.toString();
  },
}));

// Serve uploaded files when local storage is enabled
if (process.env.USE_LOCAL_STORAGE === 'true') {
  const uploadsDir = path.resolve(__dirname, '../uploads');
  // Public media is embedded cross-origin: event/store images are stored with
  // absolute apex URLs, so pages served from www.citypulse360.com load them
  // from citypulse360.com. helmet() sets CORP same-origin globally, which
  // makes browsers silently block those images on the www origin — relax it
  // for uploads only.
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  });
  app.use('/uploads', express.static(uploadsDir));
}

// Request logger — console only in production (avoids per-request disk I/O
// growing combined.log unbounded); full logging kept in development.
if (!isProduction) {
  app.use((req, res, next) => {
    logger.info(`Incoming request: ${req.method} ${req.url}`);
    next();
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/local-stores', localStoreRoutes);
app.use('/api/store-orders', storeOrderRoutes);
app.use('/api/store-owner', storeOwnerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/store-payouts', storePayoutRoutes);
app.use('/api/hero-assets', heroAssetRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/influencers', influencerRoutes);
app.use('/api/trending-venues', trendingVenueRoutes);
app.use('/api/showcase-videos', showcaseVideoRoutes);
console.log('✅ Registered /api/hero-assets route');
console.log('Registered /api/local-stores route');

// Health Check API
const getHealthStatus = () => ({
  status: mongoose.connection.readyState === 1 ? 'healthy' : 'degraded',
  service: 'Event Sphere API',
  version: '1.0.0',
  uptime: `${Math.floor(process.uptime())}s`,
  timestamp: new Date().toISOString(),
  database: {
    status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  },
  system: {
    memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
    platform: process.platform
  }
});

app.get('/', (_req, res) => {
  const health = getHealthStatus();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

app.get('/api/config/cloudinary-status', (_req, res) => {
  const isConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
  res.json({ isConfigured });
});

// 404 handler — must come after all routes
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized error handler — must be registered last
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}: ${err?.message}`, { stack: err?.stack });
  if (res.headersSent) return;
  res.status(err?.status || 500).json({ message: err?.message || 'Internal server error' });
});

// Start Server
const startServer = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-sphere';

    if (!process.env.MONGODB_URI) {
      console.warn('⚠️ WARNING: MONGODB_URI is not set in environment variables. Defaulting to localhost.');
    } else {
      console.log('✅ Found MONGODB_URI in environment variables.');
    }

    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB');
    console.log('✅ Connected to MongoDB successfully.');

    // Initialize Cron Jobs
    initCronJobs();

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ CRITICAL ERROR: Failed to start server');
    console.error(error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    logger.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};

startServer();
