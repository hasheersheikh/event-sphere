import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
import { initCronJobs } from './utils/cronJobs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files when local storage is enabled
if (process.env.USE_LOCAL_STORAGE === 'true') {
  const uploadsDir = path.resolve(__dirname, '../uploads');
  app.use('/uploads', express.static(uploadsDir));
}

// Debug Logger
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

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
console.log('Registered /api/local-stores route');

// Basic Route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
