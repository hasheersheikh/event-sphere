/**
 * Ticket email delivery tracking + retry engine.
 *
 * Every confirmed booking opts itself in here (the mere presence of the
 * Booking.ticketEmail record is the opt-in — legacy bookings without it are
 * excluded on purpose, see the model). Call sites fire-and-forget
 * deliverTicketEmail(bookingId); everything below — PDF generation, sending,
 * status transitions, immediate retries, attempt accounting — is self-contained
 * so the hourly sweep in cronJobs.ts can re-run the exact same function.
 */

import Booking from '../models/Booking.js';
import { generateTicketPDF } from './pdfGenerator.js';
import { sendTicketEmail } from './emailProvider.js';

const logger = {
  info: (...args: unknown[]) => console.log('[ticketEmail]', ...args),
  error: (...args: unknown[]) => console.error('[ticketEmail]', ...args),
};

/** Delays for the immediate retries after a real failure (attempt 1 fails →
 *  retry in 30s, attempt 2 fails → retry in 2min, then hand off to the sweep). */
const IMMEDIATE_RETRY_DELAYS_MS = [30_000, 120_000];

/** How long a booking waits before the hourly sweep may pick it up again. */
const SWEEP_RETRY_DELAY_MS = 60 * 60 * 1000; // 1h

/** Hard cap on total attempts per booking. Config problems don't count toward
 *  it (see below); at cap the record is left failed with no nextRetryAt so
 *  every retry path stops — staff fall back to the portal download button. */
const MAX_ATTEMPTS = parseInt(process.env.TICKET_EMAIL_MAX_ATTEMPTS || '10', 10);

/** Statuses that mean "an email already left the building" — never re-send. */
const TERMINAL_SEND_STATUSES = ['sent', 'delivered', 'bounced'];

const isConfigProblem = (reason: string) => /not configured/i.test(reason);

export const deliverTicketEmail = async (bookingId: string): Promise<void> => {
  try {
    const booking = await Booking.findById(bookingId).populate('event').populate('user', 'name');
    if (!booking || !booking.event) return;
    if (booking.status !== 'confirmed') return;
    if (!booking.email) return;
    if (TERMINAL_SEND_STATUSES.includes(booking.ticketEmail?.status || '')) return;
    if ((booking.ticketEmail?.attempts || 0) >= MAX_ATTEMPTS) return;

    const event: any = booking.event;
    const recipientName = booking.contactName || (booking as any).user?.name || 'Guest';
    const result = await sendTicketEmail(booking.email, recipientName, event, await generateTicketPDF(booking, event));

    if (result.ok) {
      await Booking.updateOne(
        { _id: booking._id },
        {
          $set: {
            'ticketEmail.status': 'sent',
            ...(result.messageId ? { 'ticketEmail.messageId': result.messageId } : {}),
            'ticketEmail.lastStatusAt': new Date(),
            'ticketEmail.lastAttemptAt': new Date(),
            'ticketEmail.attempts': (booking.ticketEmail?.attempts || 0) + 1,
            'ticketEmail.failureReason': '',
          },
          $unset: { 'ticketEmail.nextRetryAt': 1 },
        }
      );
      return;
    }

    // ---- failure ----
    const reason = result.reason || 'unknown error';

    // Provider not configured: a VPS/config problem, not a booking problem.
    // Keep it pending without burning attempts — once the key is fixed the
    // sweep delivers everything that queued up.
    if (isConfigProblem(reason)) {
      await Booking.updateOne(
        { _id: booking._id },
        {
          $set: {
            'ticketEmail.status': 'pending',
            'ticketEmail.failureReason': reason,
            'ticketEmail.lastStatusAt': new Date(),
            'ticketEmail.nextRetryAt': new Date(Date.now() + SWEEP_RETRY_DELAY_MS),
          },
        }
      );
      return;
    }

    // Real send failure: count the attempt, retry fast a couple of times,
    // then let the hourly sweep take over.
    const attempts = (booking.ticketEmail?.attempts || 0) + 1;
    const atCap = attempts >= MAX_ATTEMPTS;

    await Booking.updateOne(
      { _id: booking._id },
      {
        $set: {
          'ticketEmail.status': 'failed',
          'ticketEmail.attempts': attempts,
          'ticketEmail.failureReason': reason,
          'ticketEmail.lastAttemptAt': new Date(),
          'ticketEmail.lastStatusAt': new Date(),
          ...(atCap ? {} : { 'ticketEmail.nextRetryAt': new Date(Date.now() + SWEEP_RETRY_DELAY_MS) }),
        },
        ...(atCap ? { $unset: { 'ticketEmail.nextRetryAt': 1 } } : {}),
      }
    );

    if (attempts <= IMMEDIATE_RETRY_DELAYS_MS.length && !atCap) {
      const delay = IMMEDIATE_RETRY_DELAYS_MS[attempts - 1];
      // Keep nextRetryAt in the future while the timer is pending (set above
      // to +1h) so the sweep doesn't race the timer; the timer overwrites it
      // with its own outcome when it fires.
      setTimeout(() => {
        deliverTicketEmail(bookingId).catch((err) =>
          logger.error(`scheduled retry crashed for booking ${bookingId}:`, err)
        );
      }, delay);
    } else {
      logger.info(
        `ticket email for booking ${bookingId} failed (attempt ${attempts}/${MAX_ATTEMPTS}): ${reason}`
      );
    }
  } catch (err) {
    logger.error(`deliverTicketEmail crashed for booking ${bookingId}:`, err);
    // Leave whatever state is on the doc — if this crashed before any update,
    // there is no ticketEmail record yet and the next confirmation/sweep pass
    // will initialize it.
  }
};
