/**
 * City Pulse Email Service — Resend transport
 *
 * Delivery only: every subject + HTML body comes from emailTemplates.ts
 * (shared with the MSG91 transport). Test mode routing is applied by
 * applyTestMode() before each send.
 */

import { Resend } from 'resend';
import dotenv from 'dotenv';
import winston from 'winston';
import { getCachedManagerTermsPdf } from './managerTermsPdf.js';
import {
  applyTestMode,
  ticketEmail,
  cancellationEmail,
  reminderEmail,
  reviewEmail,
  passwordResetEmail,
  welcomeEmail,
  managerWelcome,
  eventApproval,
  eventDecline,
  storeOrder,
  customerOrder,
  accountSetup,
  storeOwnerWelcome,
  marketingBoost,
  otpEmail,
} from './emailTemplates.js';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@citypulse.in';

/** Send via Resend with test-mode applied. Throws on API error. */
const send = async (
  from: string,
  to: string | string[],
  content: { subject: string; html: string },
  attachments?: Array<{ filename: string; content: Buffer }>
) => {
  const final = applyTestMode(to, content);
  const { data, error } = await resend.emails.send({
    from,
    to: final.to.split(',').map((t) => t.trim()),
    subject: final.subject,
    html: final.html,
    ...(attachments?.length ? { attachments } : {}),
  });
  if (error) throw error;
  return data?.id;
};

/** Result contract for sendTicketEmail — the delivery tracker stores this in
 *  Booking.ticketEmail and decides retries from it. */
export type TicketEmailResult =
  | { ok: true; messageId?: string }
  | { ok: false; reason: string };

export const sendTicketEmail = async (
  email: string,
  userName: string,
  event: any,
  pdfBuffer: Buffer
): Promise<TicketEmailResult> => {
  if (!process.env.RESEND_API_KEY) {
    logger.warn('RESEND_API_KEY not found. Skipping email sending.');
    return { ok: false, reason: 'RESEND_API_KEY not configured' };
  }

  try {
    const id = await send(
      'City Pulse <tickets@citypulse.in>',
      email,
      ticketEmail(userName, event),
      [{ filename: `Ticket-${event.title.replace(/\s+/g, '-')}.pdf`, content: pdfBuffer }]
    );
    logger.info('Ticket email sent successfully', { id });
    return { ok: true, messageId: id };
  } catch (err: any) {
    logger.error('Failed to send ticket email', err);
    return { ok: false, reason: err?.message || String(err) };
  }
};

export const sendCancellationEmail = async (
  email: string,
  userName: string,
  eventTitle: string,
  eventDate: string,
  eventTime: string,
  refundAmount: number,
  refunded: boolean
) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await send(
      'City Pulse <bookings@citypulse.in>',
      email,
      cancellationEmail(userName, eventTitle, eventDate, eventTime, refundAmount, refunded)
    );
    logger.info(`Cancellation email sent to ${email}`);
  } catch (err) {
    logger.error('Failed to send cancellation email', err);
  }
};

export const sendReminderEmail = async (
  email: string,
  userName: string,
  eventTitle: string,
  eventDate: string,
  eventTime: string
) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await send('City Pulse <reminders@citypulse.in>', email, reminderEmail(userName, eventTitle, eventDate, eventTime));
    logger.info(`Reminder email sent to ${email}`);
  } catch (err) {
    logger.error('Failed to send reminder email', err);
  }
};

export const sendReviewEmail = async (email: string, userName: string, eventTitle: string) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await send('City Pulse <reviews@citypulse.in>', email, reviewEmail(userName, eventTitle));
    logger.info(`Review email sent to ${email}`);
  } catch (err) {
    logger.error('Failed to send review email', err);
  }
};

export const sendPasswordResetEmail = async (email: string, userName: string, resetUrl: string) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await send('City Pulse <security@citypulse.in>', email, passwordResetEmail(userName, resetUrl));
    logger.info(`Password reset email sent to ${email}`);
  } catch (err) {
    logger.error('Failed to send password reset email', err);
  }
};

export const sendWelcomeEmail = async (email: string, userName: string) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await send('City Pulse <welcome@citypulse.in>', email, welcomeEmail(userName));
    logger.info(`Welcome email sent to ${email}`);
  } catch (err) {
    logger.error('Failed to send welcome email', err);
  }
};

export const sendManagerWelcomeEmail = async (email: string, userName: string) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    const pdfBuffer = await getCachedManagerTermsPdf();
    const id = await send(
      'City Pulse <portal@citypulse.in>',
      email,
      managerWelcome(userName),
      [{ filename: 'City-Pulse-Manager-Agreement.pdf', content: pdfBuffer }]
    );
    logger.info(`Manager welcome email sent to ${email}`, { id });
  } catch (err) {
    logger.error('Failed to send manager welcome email', err);
  }
};

export const sendEventApprovalEmail = async (email: string, userName: string, eventTitle: string) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await send('City Pulse <moderation@citypulse.in>', email, eventApproval(userName, eventTitle));
    logger.info(`Event approval email sent to ${email}`);
  } catch (err) {
    logger.error('Failed to send event approval email', err);
  }
};

export const sendEventDeclineEmail = async (email: string, userName: string, eventTitle: string, reason: string) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await send('City Pulse <moderation@citypulse.in>', email, eventDecline(userName, eventTitle, reason));
    logger.info(`Event decline email sent to ${email}`);
  } catch (err) {
    logger.error('Failed to send event decline email', err);
  }
};

export const sendStoreOrderEmail = async (storeEmail: string, storeName: string, order: any) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await send('City Pulse <orders@citypulse.in>', storeEmail, storeOrder(storeName, order));
    logger.info(`Store order email sent to ${storeEmail}`);
  } catch (err) {
    logger.error('Failed to send store order email', err);
  }
};

export const sendCustomerOrderEmail = async (email: string, customerName: string, storeName: string, order: any) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await send('City Pulse <orders@citypulse.in>', email, customerOrder(customerName, storeName, order));
    logger.info(`Customer order email sent to ${email}`);
  } catch (err) {
    logger.error('Failed to send customer order email', err);
  }
};

export const sendAccountSetupEmail = async (email: string, userName: string, setupUrl: string) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await send('City Pulse <welcome@citypulse.in>', email, accountSetup(userName, setupUrl));
    logger.info(`Account setup email sent to ${email}`);
  } catch (err) {
    logger.error('Failed to send account setup email', err);
  }
};

export const sendStoreOwnerWelcomeEmail = async (
  email: string,
  ownerName: string,
  storeName: string,
  loginUrl: string,
  tempPassword: string
) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await send('City Pulse <noreply@citypulse.in>', email, storeOwnerWelcome(email, ownerName, storeName, loginUrl, tempPassword));
    logger.info(`Store owner welcome email sent to ${email}`);
  } catch (err) {
    logger.error('Failed to send store owner welcome email', err);
  }
};

export const sendMarketingBoostRequestEmail = async (managerName: string, managerEmail: string, requestData: any) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await send(
      'City Pulse Marketing <marketing@citypulse.in>',
      ADMIN_EMAIL,
      marketingBoost(managerName, managerEmail, requestData)
    );
    logger.info(`Marketing boost request sent to admin for: ${managerEmail}`);
  } catch (err) {
    logger.error('Failed to send marketing boost request email', err);
  }
};

// Unlike the other functions above, this one throws on failure — callers
// (OTP send endpoints) need to surface the error to the user rather than
// silently pretend an OTP went out when it didn't.
export const sendOtpVerificationEmail = async (email: string, otp: string) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const final = applyTestMode(email, otpEmail(otp));

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'City Pulse <noreply@citypulse.in>',
    to: Array.isArray(final.to) ? final.to : [final.to],
    subject: final.subject,
    html: final.html,
  });

  if (error) {
    throw new Error(`Resend error: ${JSON.stringify(error)}`);
  }

  logger.info(`OTP email sent to ${email}`);
};
