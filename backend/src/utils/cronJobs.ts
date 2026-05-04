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
  const nowIST = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
  logger.info(`Running cleanup job at ${nowIST.toISOString()} (IST)`);

  try {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const today = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate()));

    // 1. Move non-recurring events to 'past' if their date is before 'today' (shifted)
    const nonRecurringResult = await Event.updateMany(
      { 
        scheduleType: { $ne: 'recurring' },
        date: { $lt: today },
        status: { $ne: 'past' }
      },
      { $set: { status: 'past' } }
    );
    logger.info(`Updated ${nonRecurringResult.modifiedCount} non-recurring events to 'past' status`);

    // 2. Move recurring events to 'past' status ONLY if they have an end date and it has passed
    const recurringResult = await Event.updateMany(
      { 
        scheduleType: 'recurring',
        'recurrence.endDate': { $lt: today, $ne: null },
        status: { $ne: 'past' }
      },
      { $set: { status: 'past' } }
    );
    logger.info(`Updated ${recurringResult.modifiedCount} recurring events to 'past' status`);

    // 3. Fix recurring events that were incorrectly marked as 'past' (Self-healing for previous bug)
    const fixResult = await Event.updateMany(
      { 
        scheduleType: 'recurring',
        status: 'past',
        $or: [
          { 'recurrence.endDate': { $gte: nowIST } },
          { 'recurrence.endDate': null }
        ]
      },
      { $set: { status: 'published' } }
    );
    if (fixResult.modifiedCount > 0) {
      logger.info(`Restored ${fixResult.modifiedCount} recurring events from 'past' to 'published' status`);
    }

    // 4. Identify all 'past' events
    const pastEvents = await Event.find({ status: 'past' }).select('_id');
    const pastEventIds = pastEvents.map(event => event._id);

    // 5. Move associated bookings to 'expired' status
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
  const nowIST = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
  const tomorrow = new Date(nowIST);
  tomorrow.setUTCHours(0, 0, 0, 0);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setUTCHours(23, 59, 59, 999);

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
  // Hourly cleanup to move past events to 'past' status
  cron.schedule('0 * * * *', () => {
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
