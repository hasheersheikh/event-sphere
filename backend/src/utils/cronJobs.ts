import cron from 'node-cron';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import winston from 'winston';
import { sendReminderEmail, sendReviewEmail } from './emailService.js';
import axios from 'axios';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'cron-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'cron-combined.log' }),
  ],
});

export const cleanupPastEventsAndTickets = async () => {
  const now = new Date();
  logger.info(`Running cleanup job at ${now.toISOString()}`);

  try {
    // 1. Move events to 'past' status if their date has passed
    const eventsResult = await Event.updateMany(
      { 
        date: { $lt: now },
        status: { $ne: 'past' }
      },
      { $set: { status: 'past' } }
    );
    logger.info(`Updated ${eventsResult.modifiedCount} events to 'past' status`);

    // 2. Identify all 'past' events
    const pastEvents = await Event.find({ status: 'past' }).select('_id');
    const pastEventIds = pastEvents.map(event => event._id);

    // 3. Move associated bookings to 'expired' status
    const bookingsResult = await Booking.updateMany(
      {
        event: { $in: pastEventIds },
        status: { $ne: 'expired' }
      },
      { $set: { status: 'expired' } }
    );
    logger.info(`Updated ${bookingsResult.modifiedCount} bookings to 'expired' status`);

  } catch (error) {
    logger.error('Error during cleanup job:', error);
  }
};

export const checkAndSendReminders = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  try {
    // Find events happening tomorrow
    const upcomingEvents = await Event.find({
      date: { $gte: tomorrow, $lte: tomorrowEnd },
      status: 'published'
    });

    for (const event of upcomingEvents) {
      const bookings = await Booking.find({
        event: event._id,
        status: 'confirmed',
        reminderSent: false
      }).populate('user');

      for (const booking of bookings) {
        const user = (booking as any).user;
        if (user) {
          await sendReminderEmail(user.email, user.name, event.title, event.date.toISOString(), event.time);
          booking.reminderSent = true;
          await booking.save();
        }
      }
    }
  } catch (error) {
    logger.error('Error sending reminders:', error);
  }
};

export const checkAndSendReviewRequests = async () => {
  try {
    const pastEvents = await Event.find({ status: 'past' });

    for (const event of pastEvents) {
      const bookings = await Booking.find({
        event: event._id,
        status: 'confirmed', // Should we send for expired too? Probably just confirmed/active ones
        reviewEmailSent: false
      }).populate('user');

      for (const booking of bookings) {
        const user = (booking as any).user;
        if (user) {
          await sendReviewEmail(user.email, user.name, event.title);
          booking.reviewEmailSent = true;
          await booking.save();
        }
      }
    }
  } catch (error) {
    logger.error('Error sending review requests:', error);
  }
};

export const pingExternalService = async () => {
  const serviceUrl = 'https://mnkhan.onrender.com/api/services';
  try {
    const response = await axios.get(serviceUrl, { timeout: 10000 });
    logger.info(`Ping successful: ${response.status} - ${new Date().toISOString()}`);
  } catch (error: any) {
    logger.error(`Ping failed: ${error.message} - ${new Date().toISOString()}`);
  }
};

// Initialize cron jobs:
export const initCronJobs = () => {
  // Weekly cleanup on Sundays
  cron.schedule('0 0 * * 0', () => {
    cleanupPastEventsAndTickets();
  });

  // Hourly check for reminders and reviews
  cron.schedule('0 * * * *', () => {
    logger.info('Running hourly email journey cron...');
    checkAndSendReminders();
    checkAndSendReviewRequests();
  });

  // Ping external service every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    logger.info('Running external service ping...');
    pingExternalService();
  });

  logger.info('Cron jobs initialized');
};
