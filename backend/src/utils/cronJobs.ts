import cron from 'node-cron';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import winston from 'winston';
import { sendReminderEmail, sendReviewEmail } from './emailProvider.js';
import { releaseTickets } from './inventory.js';
import { deleteEventAssets } from './cloudinaryService.js';
import { cleanupOrphanUploads } from './orphanUploads.js';
import axios from 'axios';

const MEDIA_RETENTION_DAYS = 30;

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

export const expirePendingBookings = async () => {
  try {
    const cutoff = new Date(Date.now() - 60 * 60 * 1000); // 60 minutes
    const stale = await Booking.find({ status: 'pending', createdAt: { $lt: cutoff } });

    for (const booking of stale) {
      // Release the inventory this pending booking was holding since creation,
      // otherwise abandoned checkouts permanently lock capacity that was never paid for.
      await releaseTickets(booking.event, booking.tickets);
      booking.status = 'expired';
      await booking.save();
    }

    if (stale.length > 0) {
      logger.info(`Expired ${stale.length} stale pending bookings (older than 60 min) and released held inventory`);
    }
  } catch (error) {
    logger.error('Error expiring pending bookings:', error);
  }
};

// Frees VPS disk: an event's banner/reels/video are only useful while it's
// upcoming or recently past (reviews, disputes). Once an event has been over
// for MEDIA_RETENTION_DAYS, delete the media files but keep the event record
// itself (bookings/revenue history still need it).
export const purgeExpiredEventMedia = async () => {
  try {
    const cutoff = new Date(Date.now() - MEDIA_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const candidates = await Event.find({ status: 'past', mediaPurged: { $ne: true } })
      .select('_id scheduleType date recurrence days image reels eventVideo');

    let purgedCount = 0;
    for (const event of candidates) {
      const effectiveEndDate =
        event.scheduleType === 'recurring'
          ? event.recurrence?.endDate
          : event.scheduleType === 'multi_day' && event.days?.length
            ? event.days.reduce((max, d) => (d.date > max ? d.date : max), event.days[0].date)
            : event.date;

      if (!effectiveEndDate || effectiveEndDate > cutoff) continue;
      if (!event.image && !event.eventVideo && !event.reels?.length) {
        // Nothing to delete, just mark so we stop re-checking it every run
        event.mediaPurged = true;
        await event.save();
        continue;
      }

      await deleteEventAssets(event.image, event.reels, event.eventVideo);
      event.image = undefined;
      event.reels = [];
      event.eventVideo = undefined;
      event.mediaPurged = true;
      await event.save();
      purgedCount++;
    }

    if (purgedCount > 0) {
      logger.info(`Purged media for ${purgedCount} events past their ${MEDIA_RETENTION_DAYS}-day retention window`);
    }
  } catch (error) {
    logger.error('Error purging expired event media:', error);
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

  // Expire pending bookings every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    expirePendingBookings();
  });

  // Ping external service every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    logger.info('Running external service ping...');
    pingExternalService();
  });

  // Daily disk-space cleanup: delete media for events past their retention window
  cron.schedule('0 3 * * *', () => {
    logger.info('Running expired event media purge...');
    purgeExpiredEventMedia();
  });

  // Every 6 hours: delete uploaded files that nothing references (e.g. a
  // banner uploaded in the event wizard for an event that was never created)
  cron.schedule('0 */6 * * *', () => {
    cleanupOrphanUploads(logger).catch((err) => logger.error(`Orphan upload sweep crashed: ${err}`));
  });

  logger.info('Cron jobs initialized');
};
