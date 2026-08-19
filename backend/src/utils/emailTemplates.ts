/**
 * City Pulse Email Templates — shared design system
 *
 * Single source of truth for every email's subject + HTML body, used by BOTH
 * transports (emailService.ts → Resend, msg91EmailService.ts → MSG91). The
 * transports only decide HOW an email is delivered; everything the recipient
 * sees is defined here.
 *
 * Design: pure black/white City Pulse branding (no accent colors).
 * Test mode: applyTestMode() routes any email to TEST_EMAIL_RECIPIENT and
 * injects a banner with the original recipient/subject.
 */

import dotenv from 'dotenv';

// Idempotent — never overrides already-set values. Ensures env is available
// at module load regardless of import order (ES imports evaluate before the
// entrypoint's dotenv.config() runs).
dotenv.config();

const TEST_MODE = process.env.EMAIL_TEST_MODE === 'true';
const TEST_EMAIL_RECIPIENT = process.env.TEST_EMAIL_RECIPIENT || 'pacifistatechnologies@gmail.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

const styles = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  colors: {
    black: '#050505',
    white: '#ffffff',
    gray50: '#f8fafc',
    gray100: '#f1f5f9',
    gray200: '#e2e8f0',
    gray400: '#94a3b8',
    gray500: '#64748b',
    gray600: '#475569',
    gray800: '#1e293b',
  },
};

/** Every template builder returns this; transports pass it through applyTestMode. */
export interface EmailContent {
  subject: string;
  html: string;
}

// ============================================================================
// LAYOUT HELPERS
// ============================================================================

const emailWrapper = (content: string) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>City Pulse</title>
</head>
<body style="margin:0;padding:0;background:${styles.colors.gray100};font-family:${styles.fontFamily};">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:${styles.colors.gray100};">
    <tr>
      <td style="padding:40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:${styles.colors.white};border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:${styles.colors.black};padding:40px;text-align:center;">
              <h1 style="margin:0;color:${styles.colors.white};font-size:28px;font-weight:900;letter-spacing:-0.5px;text-transform:uppercase;">CITY PULSE</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;color:${styles.colors.gray800};">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background:${styles.colors.gray50};padding:32px;text-align:center;border-top:1px solid ${styles.colors.gray200};">
              <p style="margin:0 0 8px;color:${styles.colors.gray500};font-size:13px;">© ${new Date().getFullYear()} City Pulse. All rights reserved.</p>
              <p style="margin:0;color:${styles.colors.gray400};font-size:12px;">Questions? Reply to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const button = (text: string, url: string) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background:${styles.colors.black};border-radius:6px;text-align:center;">
      <a href="${url}" style="display:inline-block;padding:14px 28px;color:${styles.colors.white};text-decoration:none;font-weight:600;font-size:14px;">${text}</a>
    </td>
  </tr>
</table>`;

const infoBox = (title: string, content: string) => `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:24px 0;background:${styles.colors.gray50};border:1px solid ${styles.colors.gray200};border-radius:6px;">
  <tr>
    <td style="padding:16px;">
      <p style="margin:0 0 8px;color:${styles.colors.gray500};font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${title}</p>
      <p style="margin:0;color:${styles.colors.gray800};font-size:14px;line-height:1.5;">${content}</p>
    </td>
  </tr>
</table>`;

// Event dates carry IST wall-clock values in their UTC fields; format in UTC
// so emails always show the day the organizer saved, whatever the server TZ.
const formatEventDate = (date: string | Date) =>
  new Date(date).toLocaleDateString('en-IN', { timeZone: 'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const orderRef = (order: any) => `#${order._id.toString().slice(-6).toUpperCase()}`;

// ============================================================================
// TEST MODE
// ============================================================================

/**
 * When EMAIL_TEST_MODE=true, redirect the email to TEST_EMAIL_RECIPIENT,
 * prefix the subject, and inject a banner showing the original recipient.
 * Transports call this right before sending.
 */
export const applyTestMode = (
  to: string | string[],
  content: EmailContent
): { to: string; subject: string; html: string } => {
  if (!TEST_MODE) {
    return {
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: content.subject,
      html: content.html,
    };
  }

  const originalTo = Array.isArray(to) ? to.join(', ') : to;
  const testHtml = content.html.replace(
    '</body>',
    `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:40px;padding:20px;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;">
      <tr>
        <td>
          <p style="margin:0 0 8px;color:#92400e;font-size:11px;font-weight:600;text-transform:uppercase;">⚠️ TEST MODE INTERCEPTED</p>
          <p style="margin:0;color:#78350f;font-size:13px;line-height:1.5;">
            <strong>Original Recipient:</strong> ${originalTo}<br/>
            <strong>Original Subject:</strong> ${content.subject}
          </p>
        </td>
      </tr>
    </table>
    </body>`
  );

  return {
    to: TEST_EMAIL_RECIPIENT,
    subject: `[TEST MODE] ${content.subject}`,
    html: testHtml,
  };
};

// ============================================================================
// TEMPLATES
// ============================================================================

export const ticketEmail = (userName: string, event: any): EmailContent => ({
  subject: `Your Tickets for ${event.title}! 🎟️`,
  html: emailWrapper(`
    <h2 style="margin:0 0 16px;color:${styles.colors.black};font-size:22px;">Hi ${userName},</h2>
    <p style="margin:0 0 24px;color:${styles.colors.gray600};line-height:1.6;">Your booking is confirmed. We've attached your official ticket to this email.</p>
    ${infoBox('EVENT DETAILS', `
      <strong style="color:${styles.colors.black};">${event.title}</strong><br/>
      📅 ${formatEventDate(event.date)}<br/>
      🕐 ${event.time}<br/>
      📍 ${event.location.venueName || event.location.address}
    `)}
    <p style="margin:0 0 8px;color:${styles.colors.gray600};line-height:1.6;">Please have the QR code ready on your phone for entry.</p>
    ${button('View Event Details', `${FRONTEND_URL}/events/${event._id}`)}
  `),
});

export const reminderEmail = (
  userName: string,
  eventTitle: string,
  eventDate: string,
  eventTime: string
): EmailContent => ({
  subject: `Reminder: ${eventTitle} is tomorrow! 🕒`,
  html: emailWrapper(`
    <h2 style="margin:0 0 16px;color:${styles.colors.black};font-size:22px;">Hi ${userName},</h2>
    <p style="margin:0 0 24px;color:${styles.colors.gray600};line-height:1.6;">Friendly reminder: <strong>${eventTitle}</strong> is coming up tomorrow.</p>
    ${infoBox('WHEN & WHERE', `
      📅 ${formatEventDate(eventDate)}<br/>
      🕐 ${eventTime}
    `)}
    <p style="margin:0 0 8px;color:${styles.colors.gray600};line-height:1.6;">Don't forget to have your QR code ready for check-in.</p>
  `),
});

export const reviewEmail = (userName: string, eventTitle: string): EmailContent => ({
  subject: `How was ${eventTitle}? ✨`,
  html: emailWrapper(`
    <h2 style="margin:0 0 16px;color:${styles.colors.black};font-size:22px;">Hi ${userName},</h2>
    <p style="margin:0 0 24px;color:${styles.colors.gray600};line-height:1.6;">How was <strong>${eventTitle}</strong>? Your feedback helps us improve future events.</p>
    ${button('Leave a Review', `${FRONTEND_URL}/dashboard`)}
    <p style="margin:24px 0 0;color:${styles.colors.gray600};line-height:1.6;">Thank you for being part of City Pulse.</p>
  `),
});

export const passwordResetEmail = (userName: string, resetUrl: string): EmailContent => ({
  subject: 'Reset Your Password | City Pulse',
  html: emailWrapper(`
    <p style="margin:0 0 24px;color:${styles.colors.gray600};line-height:1.6;">Hello ${userName},</p>
    <p style="margin:0 0 24px;color:${styles.colors.gray600};line-height:1.6;">We received a request to reset your City Pulse password. If you didn't make this request, you can safely ignore this email.</p>
    ${button('Reset Password', resetUrl)}
    <p style="margin:24px 0 0;color:${styles.colors.gray400};font-size:13px;">This link expires in 1 hour for security.</p>
  `),
});

export const welcomeEmail = (userName: string): EmailContent => ({
  subject: 'Welcome to the Pulse! ⚡',
  html: emailWrapper(`
    <h2 style="margin:0 0 16px;color:${styles.colors.black};font-size:22px;">Welcome, ${userName}!</h2>
    <p style="margin:0 0 24px;color:${styles.colors.gray600};line-height:1.6;">You're now part of City Pulse. Discover exclusive events and connect with your community.</p>
    ${button('Explore Events', `${FRONTEND_URL}/events`)}
    <p style="margin:24px 0 0;color:${styles.colors.gray400};font-size:13px;">Let the experience unfold.</p>
  `),
});

export const managerSignupNotification = (managerName: string, managerEmail: string): EmailContent => ({
  subject: 'New Manager Application Pending 📋',
  html: emailWrapper(`
    <h2 style="margin:0 0 16px;color:${styles.colors.black};font-size:20px;">New Manager Application</h2>
    <p style="margin:0 0 24px;color:${styles.colors.gray600};line-height:1.6;">A new event manager has applied for access.</p>
    ${infoBox('APPLICANT DETAILS', `
      <strong>Name:</strong> ${managerName}<br/>
      <strong>Email:</strong> ${managerEmail}
    `)}
    ${button('Review Application', `${FRONTEND_URL}/portal/users`)}
  `),
});

export const managerApproval = (userName: string): EmailContent => ({
  subject: 'Pulse Manager Access Authorized! ✅',
  html: emailWrapper(`
    <h2 style="margin:0 0 16px;color:${styles.colors.black};font-size:22px;">Welcome Aboard, ${userName}!</h2>
    <p style="margin:0 0 24px;color:${styles.colors.gray600};line-height:1.6;">Your manager application has been approved. You can now create events and manage your presence on City Pulse.</p>
    ${infoBox('GETTING STARTED', `
      • Log in to your dashboard to create your first event<br/>
      • Complete your profile with contact details<br/>
      • Explore analytics to track your performance<br/>
      • Reach out to support anytime
    `)}
    ${button('Go to Manager Portal', `${FRONTEND_URL}/portal/manager`)}
    <p style="margin:24px 0 0;color:${styles.colors.gray600};line-height:1.6;">
      We've attached the City Pulse Manager Agreement to this email. This document outlines the terms, commission structure, and content guidelines for your partnership.
    </p>
  `),
});

export const eventApproval = (userName: string, eventTitle: string): EmailContent => ({
  subject: `Production Authorized: ${eventTitle} 🚀`,
  html: emailWrapper(`
    <h2 style="margin:0 0 16px;color:${styles.colors.black};font-size:22px;">Great News, ${userName}!</h2>
    <p style="margin:0 0 24px;color:${styles.colors.gray600};line-height:1.6;">Your event <strong>${eventTitle}</strong> has been approved and is now live on City Pulse.</p>
    ${button('View Listing', `${FRONTEND_URL}/events`)}
  `),
});

export const eventDecline = (userName: string, eventTitle: string, reason: string): EmailContent => ({
  subject: `Moderation Update: ${eventTitle} ⚠️`,
  html: emailWrapper(`
    <h2 style="margin:0 0 16px;color:${styles.colors.black};font-size:20px;">Update on ${eventTitle}</h2>
    <p style="margin:0 0 24px;color:${styles.colors.gray600};line-height:1.6;">Our team reviewed your event and it cannot be listed in its current state.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:24px 0;background:#fff1f2;border-left:4px solid #e11d48;border-radius:6px;">
      <tr>
        <td style="padding:16px;">
          <p style="margin:0 0 8px;color:#e11d48;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">REASON FOR DECLINE</p>
          <p style="margin:0;color:${styles.colors.gray600};font-style:italic;">"${reason}"</p>
        </td>
      </tr>
    </table>
    ${button('Update Event', `${FRONTEND_URL}/portal/manager`)}
  `),
});

export const storeOrder = (storeName: string, order: any): EmailContent => {
  const itemRows = order.items.map((i: any) => {
    const finalPrice = i.price * (1 - (i.discountPercent || 0) / 100);
    return `<tr style="border-bottom:1px solid ${styles.colors.gray100};">
      <td style="padding:12px 0;color:${styles.colors.gray800};">${i.name}</td>
      <td style="padding:12px 0;color:${styles.colors.gray600};text-align:center;">${i.quantity}</td>
      <td style="padding:12px 0;color:${styles.colors.gray800};text-align:right;">₹${(finalPrice * i.quantity).toFixed(0)}</td>
    </tr>`;
  }).join('');

  return {
    subject: `New Order ${orderRef(order)} — ${storeName}`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:${styles.colors.black};font-size:20px;">New Order</h2>
      <p style="margin:0 0 24px;color:${styles.colors.gray600};line-height:1.6;">Order ${orderRef(order)}</p>
      ${infoBox('CUSTOMER DETAILS', `
        <strong>Name:</strong> ${order.customer.name}<br/>
        <strong>Email:</strong> ${order.customer.email}<br/>
        <strong>Phone:</strong> ${order.customer.phone}<br/>
        <strong>Delivery:</strong> ${order.customer.address}
      `)}
      <h3 style="margin:24px 0 12px;color:${styles.colors.black};font-size:16px;">Order Items</h3>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        <tr style="border-bottom:1px solid ${styles.colors.gray200};">
          <td style="padding:8px 0;color:${styles.colors.gray500};font-size:11px;font-weight:600;text-transform:uppercase;">Item</td>
          <td style="padding:8px 0;color:${styles.colors.gray500};font-size:11px;font-weight:600;text-transform:uppercase;text-align:center;">Qty</td>
          <td style="padding:8px 0;color:${styles.colors.gray500};font-size:11px;font-weight:600;text-transform:uppercase;text-align:right;">Amount</td>
        </tr>
        ${itemRows}
        <tr>
          <td colspan="2" style="padding:16px 0;color:${styles.colors.black};font-weight:600;">Total</td>
          <td style="padding:16px 0;color:${styles.colors.black};font-weight:700;text-align:right;">₹${order.totalAmount.toFixed(0)}</td>
        </tr>
      </table>
    `),
  };
};

export const customerOrder = (customerName: string, storeName: string, order: any): EmailContent => {
  const itemRows = order.items.map((i: any) => {
    const finalPrice = i.price * (1 - (i.discountPercent || 0) / 100);
    return `<tr style="border-bottom:1px solid ${styles.colors.gray100};">
      <td style="padding:12px 0;color:${styles.colors.gray800};">${i.name} × ${i.quantity}</td>
      <td style="padding:12px 0;color:${styles.colors.gray800};text-align:right;">₹${(finalPrice * i.quantity).toFixed(0)}</td>
    </tr>`;
  }).join('');

  return {
    subject: `Order Confirmed — ${storeName} 🛍️`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:${styles.colors.black};font-size:22px;">Hi ${customerName},</h2>
      <p style="margin:0 0 24px;color:${styles.colors.gray600};line-height:1.6;">Your order from <strong>${storeName}</strong> has been received. The store will confirm and contact you shortly.</p>
      <h3 style="margin:24px 0 12px;color:${styles.colors.black};font-size:16px;">Your Order</h3>
      <p style="margin:0 0 8px;color:${styles.colors.gray500};font-size:12px;">Ref ${orderRef(order)}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        ${itemRows}
        <tr>
          <td style="padding:16px 0;color:${styles.colors.black};font-weight:600;">Total</td>
          <td style="padding:16px 0;color:${styles.colors.black};font-weight:700;text-align:right;">₹${order.totalAmount.toFixed(0)}</td>
        </tr>
      </table>
      <p style="margin:16px 0 0;color:${styles.colors.gray500};font-size:13px;">Delivery to: ${order.customer.address}</p>
    `),
  };
};

export const accountSetup = (userName: string, setupUrl: string): EmailContent => ({
  subject: 'Your tickets are confirmed — set up your account 🎟️',
  html: emailWrapper(`
    <h2 style="margin:0 0 16px;color:${styles.colors.black};font-size:22px;">Welcome, ${userName}!</h2>
    <p style="margin:0 0 24px;color:${styles.colors.gray600};line-height:1.6;">Your ticket purchase was successful. We've created an account so you can manage your tickets anytime.</p>
    ${button('Set My Password', setupUrl)}
    <p style="margin:24px 0 0;color:${styles.colors.gray400};font-size:13px;">This link expires in 1 hour. If you don't want an account, you can ignore this email.</p>
  `),
});

export const storeOwnerWelcome = (
  email: string,
  ownerName: string,
  storeName: string,
  loginUrl: string,
  tempPassword: string
): EmailContent => ({
  subject: `Your Store Owner Account — ${storeName}`,
  html: emailWrapper(`
    <h2 style="margin:0 0 16px;color:${styles.colors.black};font-size:22px;">Welcome, ${ownerName}!</h2>
    <p style="margin:0 0 24px;color:${styles.colors.gray600};line-height:1.6;">Your store owner account for <strong>${storeName}</strong> is ready. Log in to manage orders and inventory.</p>
    ${infoBox('LOGIN CREDENTIALS', `
      <strong>Email:</strong> ${email}<br/>
      <strong>Temporary Password:</strong> <code style="background:${styles.colors.gray200};padding:2px 6px;border-radius:3px;font-size:13px;">${tempPassword}</code>
    `)}
    ${button('Log In to Portal', loginUrl)}
    <p style="margin:24px 0 0;color:${styles.colors.gray400};font-size:13px;">Please change your password after first login.</p>
  `),
});

export const marketingBoost = (managerName: string, managerEmail: string, requestData: any): EmailContent => ({
  subject: `Marketing Boost Requested: ${requestData.eventTitle} 🚀`,
  html: emailWrapper(`
    <h2 style="margin:0 0 16px;color:${styles.colors.black};font-size:20px;">Marketing Boost Request</h2>
    <p style="margin:0 0 24px;color:${styles.colors.gray600};line-height:1.6;">From <strong>${managerName}</strong></p>
    ${infoBox('REQUEST DETAILS', `
      <strong>Event:</strong> ${requestData.eventTitle}<br/>
      <strong>Plan:</strong> ${requestData.plan.toUpperCase()}<br/>
      <strong>Instagram:</strong> ${requestData.igHandle}<br/>
      <strong>WhatsApp:</strong> ${requestData.phone}<br/>
      <strong>Email:</strong> ${managerEmail}
    `)}
    ${requestData.message ? `
      <p style="margin:16px 0 0;color:${styles.colors.gray600};line-height:1.6;"><strong>Additional Message:</strong></p>
      <p style="margin:8px 0 0;color:${styles.colors.gray500};font-style:italic;">"${requestData.message}"</p>
    ` : ''}
  `),
});

export const otpEmail = (otp: string): EmailContent => ({
  subject: `${otp} — your City Pulse verification code`,
  html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:40px 20px;background:${styles.colors.gray100};font-family:${styles.fontFamily};">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:400px;margin:0 auto;background:${styles.colors.white};border-radius:8px;padding:40px;text-align:center;">
    <h1 style="margin:0 0 16px;color:${styles.colors.black};font-size:32px;font-weight:900;letter-spacing:-1px;">CITY PULSE</h1>
    <p style="margin:0 0 24px;color:${styles.colors.gray600};line-height:1.6;">Your verification code is</p>
    <p style="margin:0 0 24px;color:${styles.colors.black};font-size:36px;font-weight:700;letter-spacing:4px;">${otp}</p>
    <p style="margin:0;color:${styles.colors.gray400};font-size:13px;">Expires in 10 minutes</p>
  </table>
</body>
</html>`,
});
