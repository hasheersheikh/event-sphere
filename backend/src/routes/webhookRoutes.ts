import express, { RequestHandler } from 'express';
import crypto from 'crypto';
import Booking from '../models/Booking.js';

const router = express.Router();

/**
 * Resend delivery-events webhook (Standard Webhooks spec, same scheme Svix uses).
 *
 * Upgrades Booking.ticketEmail.status from 'sent' (provider accepted the send)
 * to 'delivered' / 'bounced' when Resend observes the actual outcome at the
 * recipient's mailbox. Optional until RESEND_WEBHOOK_SECRET is set and a
 * webhook is added in the Resend dashboard — without it, 'sent' is simply the
 * final state, which is fine (the sweep only retries pending/failed).
 */

const SIGNATURE_TOLERANCE_SECONDS = 5 * 60; // replay window

const verifySvixSignature = (
  rawBody: string,
  svixId: string,
  svixTimestamp: string,
  svixSignatures: string,
  secret: string
): boolean => {
  // Reject stale/future timestamps — a captured payload can't be replayed later.
  const age = Math.abs(Date.now() / 1000 - Number(svixTimestamp));
  if (!Number.isFinite(age) || age > SIGNATURE_TOLERANCE_SECONDS) return false;

  const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(signedContent)
    .digest('base64');

  // Header carries one or more "v1,<base64>" entries (comma- or space-
  // separated); any single match is a pass.
  const provided = [...svixSignatures.matchAll(/v1,([A-Za-z0-9+/=]+)/g)].map((m) => m[1]);

  return provided.some(
    (sig) =>
      sig.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  );
};

const handleResendWebhook: RequestHandler = (req, res) => {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    res.status(500).json({ message: 'Webhook secret not configured' });
    return;
  }

  const rawBody = (req as any).rawBody as string | undefined;
  const svixId = req.headers['svix-id'];
  const svixTimestamp = req.headers['svix-timestamp'];
  const svixSignature = req.headers['svix-signature'];

  if (
    !rawBody ||
    typeof svixId !== 'string' ||
    typeof svixTimestamp !== 'string' ||
    typeof svixSignature !== 'string' ||
    !verifySvixSignature(rawBody, svixId, svixTimestamp, svixSignature, secret)
  ) {
    res.status(400).json({ message: 'Invalid signature' });
    return;
  }

  const { type, data } = req.body || {};
  const messageId = data?.email_id as string | undefined;
  if (!messageId) {
    // Not one of ours (or an event shape we don't track) — ack so Resend
    // stops retrying delivery of this notification.
    res.json({ received: true });
    return;
  }

  // Always 200 from here on: the signature is valid, so the event is real —
  // an unknown messageId just means the email wasn't a ticket email.
  switch (type) {
    case 'email.delivered':
      Booking.updateOne(
        { 'ticketEmail.messageId': messageId, 'ticketEmail.status': 'sent' },
        { $set: { 'ticketEmail.status': 'delivered', 'ticketEmail.lastStatusAt': new Date() } }
      )
        .then(() => res.json({ received: true }))
        .catch((err) => {
          console.error('Failed to record ticket email delivery:', err);
          res.json({ received: true }); // DB hiccup — don't make Resend retry
        });
      break;

    case 'email.bounced':
    case 'email.complained':
      // Terminal bad address — stop retrying into it (clears nextRetryAt so
      // the hourly sweep skips the booking). Staff fallback: portal download.
      Booking.updateOne(
        { 'ticketEmail.messageId': messageId, 'ticketEmail.status': { $in: ['sent', 'pending', 'failed'] } },
        {
          $set: {
            'ticketEmail.status': 'bounced',
            'ticketEmail.lastStatusAt': new Date(),
            'ticketEmail.failureReason': type === 'email.bounced'
              ? (data?.bounce?.message || 'Email bounced')
              : 'Recipient marked email as spam',
          },
        }
      )
        .then(() => res.json({ received: true }))
        .catch((err) => {
          console.error('Failed to record ticket email bounce:', err);
          res.json({ received: true });
        });
      break;

    default:
      res.json({ received: true });
  }
};

router.post('/resend', handleResendWebhook);

export default router;
