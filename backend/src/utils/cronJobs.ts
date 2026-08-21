import cron from 'node-cron';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import RefundRequest from '../models/RefundRequest.js';
import winston from 'winston';
import { sendReminderEmail, sendReviewEmail } from './emailProvider.js';
import { releaseTickets } from './inventory.js';
import { deleteEventAssets } from './cloudinaryService.js';
import { cleanupOrphanUploads } from './orphanUploads.js';
import { deliverTicketEmail } from './ticketEmailDelivery.js';
import razorpay from './razorpay.js';
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

/**
 * Crash recovery for user self-cancellations. A booking claimed for self-cancel
 * (status 'cancelled') whose refund never left 'initiated' — e.g. the process
 * died between the claim and the Razorpay call — would otherwise sit forever
 * with money neither refunded nor queued for admin retry.
 *
 * Fetch-before-refund keeps this double-refund-safe: we only retry when
 * Razorpay reports nothing refunded for the payment. All state transitions
 * are guarded on 'selfCancel.refundStatus': 'initiated'' so a terminal state
 * can never be clobbered.
 */
export const reconcileStuckSelfCancellations = async () => {
  try {
    const cutoff = new Date(Date.now() - 10 * 60 * 1000); // allow in-flight requests to finish
    const stuck = await Booking.find({
      status: 'cancelled',
      'selfCancel.refundStatus': 'initiated',
      'selfCancel.claimedAt': { $lt: cutoff },
      paymentId: { $exists: true, $ne: 'OFFLINE' },
    });

    for (const booking of stuck) {
      const expectedPaise = Math.round(booking.totalAmount * 100);
      try {
        const payment: any = await razorpay.payments.fetch(booking.paymentId as string);
        if ((payment?.amount_refunded ?? 0) >= expectedPaise) {
          // Refund actually went through (e.g. API call succeeded but the
          // process died before the status update landed).
          await Booking.updateOne(
            { _id: booking._id, 'selfCancel.refundStatus': 'initiated' },
            {
              $set: {
                status: 'refunded',
                'selfCancel.refundStatus': 'succeeded',
                'selfCancel.refundAmount': booking.totalAmount,
              },
            }
          );
          logger.info(`Reconciled booking ${booking._id}: refund already present at Razorpay, marked refunded`);
          continue;
        }

        // Nothing refunded — safe to retry.
        const refund: any = await razorpay.payments.refund(booking.paymentId as string, {
          amount: expectedPaise,
          notes: {
            bookingId: booking._id.toString(),
            reason: 'User self-service cancellation (reconciled retry)',
          },
        });
        await Booking.updateOne(
          { _id: booking._id, 'selfCancel.refundStatus': 'initiated' },
          {
            $set: {
              status: 'refunded',
              'selfCancel.refundStatus': 'succeeded',
              'selfCancel.refundId': refund?.id,
              'selfCancel.refundAmount': booking.totalAmount,
            },
          }
        );
        logger.info(`Reconciled booking ${booking._id}: refund retried successfully`);
      } catch (err: any) {
        logger.error(`Self-cancel reconciliation retry failed for booking ${booking._id}: ${err.message}`);
        await RefundRequest.create({
          booking: booking._id,
          event: booking.event,
          user: booking.user,
          paymentId: booking.paymentId,
          amount: booking.totalAmount,
          reason: `Stuck self-cancel refund (cron retry): ${err.message}`,
          status: 'pending', // retryable from the admin RefundManagementPage
          failureReason: err.message,
        });
        await Booking.updateOne(
          { _id: booking._id, 'selfCancel.refundStatus': 'initiated' },
          { $set: { 'selfCancel.refundStatus': 'failed', 'selfCancel.failureReason': err.message } }
        );
      }
    }

    if (stuck.length > 0) {
      logger.info(`Self-cancel reconciliation processed ${stuck.length} stuck booking(s)`);
    }
  } catch (error) {
    logger.error('Error reconciling stuck self-cancellations:', error);
  }
};

/**
 * Hourly sweep: retry ticket emails that never made it out — real send
 * failures whose immediate retries (30s / 2min inside deliverTicketEmail)
 * were exhausted, and bookings that queued while the email provider was
 * misconfigured (config failures don't burn attempts, so a fixed API key
 * auto-recovers everything waiting here).
 *
 * Bookings whose ticketEmail record is absent — everything created before
 * delivery tracking shipped — never match this query on purpose: with no
 * delivery record we can't tell a success from a failure, and re-sending
 * would duplicate tickets for buyers who already got theirs. Staff can
 * still download/resend those from the attendee portal.
 */
export const retryFailedTicketEmails = async () => {
  try {
    const maxAttempts = parseInt(process.env.TICKET_EMAIL_MAX_ATTEMPTS || '10', 10);
    const due = await Booking.find({
      status: 'confirmed',
      'ticketEmail.status': { $in: ['pending', 'failed'] },
      'ticketEmail.nextRetryAt': { $lte: new Date() },
      'ticketEmail.attempts': { $lt: maxAttempts },
    }).select('_id');

    for (const booking of due) {
      await deliverTicketEmail(booking._id.toString());
    }

    if (due.length > 0) {
      logger.info(`Ticket email retry sweep re-sent ${due.length} booking email(s)`);
    }
  } catch (error) {
    logger.error('Error in ticket email retry sweep:', error);
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

  // Hourly retry of undelivered ticket emails (see retryFailedTicketEmails)
  cron.schedule('0 * * * *', () => {
    retryFailedTicketEmails();
  });

  // Expire pending bookings every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    expirePendingBookings();
  });

  // Crash recovery: finish refunds for self-cancellations stuck in 'initiated'
  cron.schedule('*/15 * * * *', () => {
    reconcileStuckSelfCancellations();
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
