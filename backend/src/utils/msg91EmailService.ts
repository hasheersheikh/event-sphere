/**
 * City Pulse Email Service — MSG91 transport
 *
 * Delivery only: every subject + HTML body comes from emailTemplates.ts
 * (shared with the Resend transport). Test mode routing is applied by
 * applyTestMode() before each send.
 */

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

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

// MSG91 configuration
const MSG91_API_KEY = process.env.MSG91_API_KEY;
const MSG91_EMAIL_FROM = process.env.MSG91_EMAIL_FROM || 'noreply@eventsphere.dev';
const MSG91_EMAIL_FROM_NAME = process.env.MSG91_EMAIL_FROM_NAME || 'City Pulse';
// The mailer91 sending domain shown in MSG91 → Email → Domains (e.g. "yourcompany.mailer91.com"
// or your own verified custom domain).
const MSG91_EMAIL_DOMAIN = process.env.MSG91_EMAIL_DOMAIN;
// A single "pass-through" template created in MSG91 (Email → Templates, HTML & Text
// Editor) with one variable named "body", whose content is JUST `{{{body}}}`
// (triple-brace — MSG91 templates use Handlebars, and double-brace {{body}} would
// HTML-escape our markup instead of rendering it). Try setting the template's
// Subject field to `{{subject}}` too so per-email subjects come through; if MSG91's
// editor won't accept a variable there, the template's static subject is used instead
// and the `subject` variable below is sent but ignored.
// Lets every email type below keep generating its own dynamic HTML instead of
// needing a separate MSG91 template per email type.
const MSG91_EMAIL_TEMPLATE_ID = process.env.MSG91_EMAIL_TEMPLATE_ID;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@citypulse.in';

/**
 * Helper to send email via MSG91's v5 email/send API.
 * MSG91 email sending is template-based: the actual HTML lives in a MSG91
 * template, and each call passes template_id + variables to merge into it.
 * Applies test mode, so the recipient/subject may be intercepted here.
 */
async function sendMsg91Email(options: {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
  from?: string;
}) {
  if (!MSG91_API_KEY) {
    throw new Error('MSG91_API_KEY not configured');
  }
  if (!MSG91_EMAIL_DOMAIN) {
    throw new Error('MSG91_EMAIL_DOMAIN not configured');
  }
  if (!MSG91_EMAIL_TEMPLATE_ID) {
    throw new Error('MSG91_EMAIL_TEMPLATE_ID not configured');
  }

  const final = applyTestMode(options.to, { subject: options.subject, html: options.html });

  const recipients = final.to.split(',').map((email) => ({
    to: [{ email: email.trim() }],
    variables: {
      subject: final.subject,
      body: final.html,
    },
  }));

  const payload: Record<string, unknown> = {
    recipients,
    from: { email: options.from || MSG91_EMAIL_FROM, name: MSG91_EMAIL_FROM_NAME },
    domain: MSG91_EMAIL_DOMAIN,
    template_id: MSG91_EMAIL_TEMPLATE_ID,
  };

  if (options.attachments?.length) {
    payload.attachments = options.attachments.map((att) => ({
      fileName: att.filename,
      file: `data:application/pdf;base64,${att.content.toString('base64')}`,
    }));
  }

  const response = await fetch('https://control.msg91.com/api/v5/email/send', {
    method: 'POST',
    headers: {
      authkey: MSG91_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MSG91 Email API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  logger.info('MSG91 Email sent successfully', { data });
  return data;
}

// ===========================================================================
// Email functions — same names/signatures as emailService.ts (Resend) for
// drop-in switching via emailProvider.ts. Bodies come from emailTemplates.ts.
// Notification emails log-and-swallow errors; only the OTP email throws
// (its callers must surface failures to the user).
// ===========================================================================

export const sendTicketEmail = async (
  email: string,
  userName: string,
  event: any,
  pdfBuffer: Buffer
) => {
  if (!MSG91_API_KEY) {
    logger.warn('MSG91_API_KEY not found. Skipping email sending.');
    return;
  }

  try {
    const content = ticketEmail(userName, event);
    await sendMsg91Email({
      to: email,
      subject: content.subject,
      html: content.html,
      attachments: [
        {
          filename: `Ticket-${event.title.replace(/\s+/g, '-')}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
  } catch (err) {
    logger.error('Failed to send ticket email via MSG91', err);
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
  if (!MSG91_API_KEY) return;

  try {
    const content = cancellationEmail(userName, eventTitle, eventDate, eventTime, refundAmount, refunded);
    await sendMsg91Email({ to: email, subject: content.subject, html: content.html });
    logger.info(`Cancellation email sent via MSG91 to ${email}`);
  } catch (err) {
    logger.error('Failed to send cancellation email via MSG91', err);
  }
};

export const sendReminderEmail = async (
  email: string,
  userName: string,
  eventTitle: string,
  eventDate: string,
  eventTime: string
) => {
  if (!MSG91_API_KEY) return;

  try {
    const content = reminderEmail(userName, eventTitle, eventDate, eventTime);
    await sendMsg91Email({ to: email, subject: content.subject, html: content.html });
    logger.info(`Reminder email sent via MSG91 to ${email}`);
  } catch (err) {
    logger.error('Failed to send reminder email via MSG91', err);
  }
};

export const sendReviewEmail = async (email: string, userName: string, eventTitle: string) => {
  if (!MSG91_API_KEY) return;

  try {
    const content = reviewEmail(userName, eventTitle);
    await sendMsg91Email({ to: email, subject: content.subject, html: content.html });
    logger.info(`Review request email sent via MSG91 to ${email}`);
  } catch (err) {
    logger.error('Failed to send review email via MSG91', err);
  }
};

export const sendPasswordResetEmail = async (email: string, userName: string, resetUrl: string) => {
  if (!MSG91_API_KEY) return;

  try {
    const content = passwordResetEmail(userName, resetUrl);
    await sendMsg91Email({ to: email, subject: content.subject, html: content.html });
    logger.info(`Password reset email sent via MSG91 to ${email}`);
  } catch (err) {
    logger.error('Failed to send password reset email via MSG91', err);
  }
};

export const sendWelcomeEmail = async (email: string, userName: string) => {
  if (!MSG91_API_KEY) return;

  try {
    const content = welcomeEmail(userName);
    await sendMsg91Email({ to: email, subject: content.subject, html: content.html });
    logger.info(`Welcome email sent via MSG91 to ${email}`);
  } catch (err) {
    logger.error('Failed to send welcome email via MSG91', err);
  }
};

export const sendManagerWelcomeEmail = async (email: string, userName: string) => {
  if (!MSG91_API_KEY) return;

  try {
    const content = managerWelcome(userName);
    // Attach the manager agreement PDF (cached, 24h)
    const pdfBuffer = await getCachedManagerTermsPdf();
    await sendMsg91Email({
      to: email,
      subject: content.subject,
      html: content.html,
      attachments: [
        {
          filename: 'City-Pulse-Manager-Agreement.pdf',
          content: pdfBuffer,
        },
      ],
    });
    logger.info(`Manager welcome email sent via MSG91 to ${email}`);
  } catch (err) {
    logger.error('Failed to send manager welcome email via MSG91', err);
  }
};

export const sendEventApprovalEmail = async (email: string, userName: string, eventTitle: string) => {
  if (!MSG91_API_KEY) return;

  try {
    const content = eventApproval(userName, eventTitle);
    await sendMsg91Email({ to: email, subject: content.subject, html: content.html });
    logger.info(`Event approval email sent via MSG91 to ${email}`);
  } catch (err) {
    logger.error('Failed to send event approval email via MSG91', err);
  }
};

export const sendEventDeclineEmail = async (email: string, userName: string, eventTitle: string, reason: string) => {
  if (!MSG91_API_KEY) return;

  try {
    const content = eventDecline(userName, eventTitle, reason);
    await sendMsg91Email({ to: email, subject: content.subject, html: content.html });
    logger.info(`Event decline email sent via MSG91 to ${email}`);
  } catch (err) {
    logger.error('Failed to send event decline email via MSG91', err);
  }
};

export const sendStoreOrderEmail = async (storeEmail: string, storeName: string, order: any) => {
  if (!MSG91_API_KEY) return;

  try {
    const content = storeOrder(storeName, order);
    await sendMsg91Email({ to: storeEmail, subject: content.subject, html: content.html });
    logger.info(`Store order email sent via MSG91 to ${storeEmail}`);
  } catch (err) {
    logger.error('Failed to send store order email via MSG91', err);
  }
};

export const sendCustomerOrderEmail = async (email: string, customerName: string, storeName: string, order: any) => {
  if (!MSG91_API_KEY) return;

  try {
    const content = customerOrder(customerName, storeName, order);
    await sendMsg91Email({ to: email, subject: content.subject, html: content.html });
    logger.info(`Customer order email sent via MSG91 to ${email}`);
  } catch (err) {
    logger.error('Failed to send customer order email via MSG91', err);
  }
};

export const sendAccountSetupEmail = async (email: string, userName: string, setupUrl: string) => {
  if (!MSG91_API_KEY) return;

  try {
    const content = accountSetup(userName, setupUrl);
    await sendMsg91Email({ to: email, subject: content.subject, html: content.html });
    logger.info(`Account setup email sent via MSG91 to ${email}`);
  } catch (err) {
    logger.error('Failed to send account setup email via MSG91', err);
  }
};

export const sendStoreOwnerWelcomeEmail = async (
  email: string,
  ownerName: string,
  storeName: string,
  loginUrl: string,
  tempPassword: string
) => {
  if (!MSG91_API_KEY) return;

  try {
    const content = storeOwnerWelcome(email, ownerName, storeName, loginUrl, tempPassword);
    await sendMsg91Email({ to: email, subject: content.subject, html: content.html });
    logger.info(`Store owner welcome email sent via MSG91 to ${email}`);
  } catch (err) {
    logger.error('Failed to send store owner welcome email via MSG91', err);
  }
};

export const sendMarketingBoostRequestEmail = async (managerName: string, managerEmail: string, requestData: any) => {
  if (!MSG91_API_KEY) return;

  try {
    const content = marketingBoost(managerName, managerEmail, requestData);
    await sendMsg91Email({ to: ADMIN_EMAIL, subject: content.subject, html: content.html });
    logger.info(`Marketing boost request sent via MSG91 to admin for: ${managerEmail}`);
  } catch (err) {
    logger.error('Failed to send marketing boost request email via MSG91', err);
  }
};

// Unlike the other functions above, this one lets errors from sendMsg91Email
// propagate — callers (OTP send endpoints) need to surface the failure to the
// user rather than silently pretend an OTP went out when it didn't.
export const sendOtpVerificationEmail = async (email: string, otp: string) => {
  const content = otpEmail(otp);
  await sendMsg91Email({ to: email, subject: content.subject, html: content.html });
  logger.info(`OTP verification email sent via MSG91 to ${email}`);
};
