import { Resend } from 'resend';
import dotenv from 'dotenv';
import winston from 'winston';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

const generateGoogleCalendarUrl = (event: { title: string; date: Date; time: string; location: string; description: string }) => {
  const [hours, minutes] = event.time.split(':');
  const startDate = new Date(event.date);
  startDate.setHours(parseInt(hours), parseInt(minutes));
  
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 2); // Default 2 hours event

  const formatToICS = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
  const params = new URLSearchParams({
    text: event.title,
    dates: `${formatToICS(startDate)}/${formatToICS(endDate)}`,
    details: event.description,
    location: event.location,
    sf: 'true',
    output: 'xml'
  });

  return `${baseUrl}&${params.toString()}`;
};

export const sendTicketEmail = async (email: string, userName: string, event: any, pdfBuffer: Buffer) => {
  if (!process.env.RESEND_API_KEY) {
    logger.warn('RESEND_API_KEY not found. Skipping email sending.');
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Event Sphere <tickets@eventsphere.dev>',
      to: [email],
      subject: `Your Tickets for ${event.title}! 🎟️`,
      html: `
        <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #4f46e5; padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0;">Event Sphere</h1>
            <p style="margin: 5px 0 0;">Your tickets are confirmed!</p>
          </div>
          <div style="padding: 30px;">
            <h2>Hello ${userName},</h2>
            <p>Your booking for <strong>${event.title}</strong> is confirmed! We can't wait to see you there.</p>
            
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #64748b; font-weight: bold;">EVENT DETAILS</p>
              <h3 style="margin: 0 0 5px;">${event.title}</h3>
              <p style="margin: 0;">📅 ${new Date(event.date).toLocaleDateString()} at ${event.time}</p>
              <p style="margin: 5px 0 0;">📍 ${event.location.venueName || event.location.address}</p>
            </div>

            <div style="display: flex; gap: 15px; margin-bottom: 30px;">
              <a href="${generateGoogleCalendarUrl({
                title: event.title,
                date: event.date,
                time: event.time,
                location: event.location.address,
                description: event.description
              })}" style="background-color: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Add to Google Calendar
              </a>
            </div>

            <p>We've attached your official PDF ticket to this email. Please have the QR code ready on your phone or print it out for entry.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            <p style="color: #64748b; font-size: 14px;">Questions? Reply to this email or visit our Help Center.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Ticket-${event.title.replace(/\s+/g, '-')}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      logger.error('Resend Error:', error);
      throw error;
    }

    logger.info('Ticket email sent successfully', { id: data?.id });
  } catch (err) {
    logger.error('Failed to send ticket email', err);
  }
};

export const sendReminderEmail = async (email: string, userName: string, eventTitle: string, eventDate: string, eventTime: string) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await resend.emails.send({
      from: 'Event Sphere <reminders@eventsphere.dev>',
      to: [email],
      subject: `Reminder: ${eventTitle} is tomorrow! 🕒`,
      html: `
        <div style="font-family: sans-serif; color: #1e293b;">
          <h2>Hi ${userName},</h2>
          <p>Just a friendly reminder that <strong>${eventTitle}</strong> is happening tomorrow!</p>
          <p>🕒 <strong>Time:</strong> ${eventTime} on ${new Date(eventDate).toLocaleDateString()}</p>
          <p>Don't forget to have your QR code ready for check-in.</p>
          <br/>
          <p>We'll see you there!</p>
        </div>
      `,
    });
    logger.info(`Reminder email sent to ${email}`);
  } catch (err) {
    logger.error('Failed to send reminder email', err);
  }
};

export const sendReviewEmail = async (email: string, userName: string, eventTitle: string) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await resend.emails.send({
      from: 'Event Sphere <reviews@eventsphere.dev>',
      to: [email],
      subject: `How was ${eventTitle}? ✨`,
      html: `
        <div style="font-family: sans-serif; color: #1e293b;">
          <h2>Hi ${userName},</h2>
          <p>We hope you enjoyed <strong>${eventTitle}</strong>!</p>
          <p>Would you mind taking a moment to rate your experience? Your feedback helps us make future events even better.</p>
          <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px;">Leave a Review</a>
          <br/><br/>
          <p>Thank you for being part of our community!</p>
        </div>
      `,
    });
    logger.info(`Review request email sent to ${email}`);
  } catch (err) {
    logger.error('Failed to send review email', err);
  }
};

export const sendPasswordResetEmail = async (email: string, userName: string, resetUrl: string) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await resend.emails.send({
      from: 'Event Sphere <security@eventsphere.dev>',
      to: [email],
      subject: 'Reset Your Password | City Pulse security',
      html: `
        <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #050505; padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-style: italic; font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase;">City Pulse</h1>
            <p style="margin: 5px 0 0; color: #10B981; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; font-size: 12px;">Security Protocol</p>
          </div>
          <div style="padding: 40px; background-color: white;">
            <h2 style="margin-top: 0; font-size: 24px; color: #0f172a;">Password Recovery Request</h2>
            <p style="color: #475569; line-height: 1.6;">Hello ${userName},</p>
            <p style="color: #475569; line-height: 1.6;">We received a request to reset the access credentials for your pulse identity. If you didn't make this request, you can safely ignore this email.</p>
            
            <div style="margin: 35px 0;">
              <a href="${resetUrl}" style="background-color: #10B981; color: black; padding: 18px 32px; text-decoration: none; border-radius: 12px; font-weight: 900; display: inline-block; text-transform: uppercase; letter-spacing: 0.1em; font-size: 14px; box-shadow: 0 10px 20px rgba(16,185,129,0.2);">Reset Keywords</a>
            </div>
            
            <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">This link will expire in 1 hour for security reasons.</p>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
            <p style="color: #64748b; font-size: 12px; font-style: italic;">Stay synced, stay secure.<br/>City Pulse Collective</p>
          </div>
        </div>
      `,
    });
    logger.info(`Password reset email sent to ${email}`);
  } catch (err) {
    logger.error('Failed to send password reset email', err);
  }
};

export const sendWelcomeEmail = async (email: string, userName: string) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await resend.emails.send({
      from: 'Event Sphere <welcome@eventsphere.dev>',
      to: [email],
      subject: 'Welcome to the Pulse! ⚡',
      html: `
        <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #10B981; padding: 40px; text-align: center; color: black;">
            <h1 style="margin: 0; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em;">City Pulse</h1>
          </div>
          <div style="padding: 40px;">
            <h2>Welcome, ${userName}!</h2>
            <p>Your presence has been successfully synced with the City Pulse frequency. Get ready to discover the most exclusive events and connections.</p>
            <p>We're thrilled to have you as part of our collective.</p>
            <div style="margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/events" style="background-color: #050505; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Explore Events</a>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            <p style="color: #64748b; font-size: 14px;">Let the experience unfold.</p>
          </div>
        </div>
      `,
    });
    logger.info(`Welcome email sent to ${email}`);
  } catch (err) {
    logger.error('Failed to send welcome email', err);
  }
};

export const sendManagerSignUpNotificationToAdmin = async (managerName: string, managerEmail: string) => {
  if (!process.env.RESEND_API_KEY) return;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@eventsphere.dev';

  try {
    await resend.emails.send({
      from: 'Event Sphere <system@eventsphere.dev>',
      to: [adminEmail],
      subject: 'New Manager Application Pending 📋',
      html: `
        <div style="font-family: sans-serif; color: #1e293b; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2>New Manager Sign-up</h2>
          <p>A new event manager has initialized their presence and is waiting for your approval.</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Name:</strong> ${managerName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${managerEmail}</p>
          </div>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/portal/users" style="background-color: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Review Application</a>
        </div>
      `,
    });
    logger.info(`Admin notified of new manager: ${managerEmail}`);
  } catch (err) {
    logger.error('Failed to notify admin of manager sign-up', err);
  }
};

export const sendManagerApprovalEmail = async (email: string, userName: string) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await resend.emails.send({
      from: 'Event Sphere <portal@eventsphere.dev>',
      to: [email],
      subject: 'Pulse Manager Access Authorized! ✅',
      html: `
        <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #4f46e5; padding: 40px; text-align: center; color: white;">
            <h1 style="margin: 0;">Access Authorized</h1>
          </div>
          <div style="padding: 40px;">
            <h2>Congratulations ${userName},</h2>
            <p>Your application for manager access has been approved by the City Pulse Collective. You can now host your own productions and view detailed sales analytics.</p>
            <div style="margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/portal/manager" style="background-color: #050505; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Enter Manager Portal</a>
            </div>
            <p>We look forward to seeing your amazing events on the platform.</p>
          </div>
        </div>
      `,
    });
    logger.info(`Approval email sent to manager: ${email}`);
  } catch (err) {
    logger.error('Failed to send manager approval email', err);
  }
};

export const sendEventApprovalEmail = async (email: string, userName: string, eventTitle: string) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await resend.emails.send({
      from: 'Event Sphere <moderation@eventsphere.dev>',
      to: [email],
      subject: `Production Authorized: ${eventTitle} 🚀`,
      html: `
        <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #10B981; padding: 40px; text-align: center; color: black;">
            <h1 style="margin: 0; font-weight: 900; text-transform: uppercase;">AUTHORIZED</h1>
          </div>
          <div style="padding: 40px;">
            <h2>Great news ${userName},</h2>
            <p>Your production <strong>${eventTitle}</strong> has been reviewed and authorized by the City Pulse moderation collective. It is now live and listed on the platform.</p>
            <div style="margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/events" style="background-color: #050505; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Listing</a>
            </div>
            <p>Success with your production!</p>
          </div>
        </div>
      `,
    });
    logger.info(`Event approval email sent to manager: ${email} for ${eventTitle}`);
  } catch (err) {
    logger.error('Failed to send event approval email', err);
  }
};

export const sendStoreOrderEmail = async (storeEmail: string, storeName: string, order: any) => {
  if (!process.env.RESEND_API_KEY) return;
  const itemRows = order.items.map((i: any) => {
    const finalPrice = i.price * (1 - (i.discountPercent || 0) / 100);
    return `<tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">${i.name}</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:center;">${i.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right;">₹${(finalPrice * i.quantity).toFixed(0)}</td></tr>`;
  }).join('');
  const paymentLabel: Record<string, string> = { cash: 'Cash on Delivery', upi: 'UPI', card: 'Card', bank_transfer: 'Bank Transfer' };
  try {
    await resend.emails.send({
      from: 'Event Sphere <orders@eventsphere.dev>',
      to: [storeEmail],
      subject: `New Order #${order._id.toString().slice(-6).toUpperCase()} — ${storeName}`,
      html: `
        <div style="font-family:sans-serif;color:#1e293b;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <div style="background:#f59e0b;padding:30px;text-align:center;color:#000;">
            <h1 style="margin:0;font-weight:900;text-transform:uppercase;letter-spacing:-0.05em;">New Order!</h1>
            <p style="margin:5px 0 0;font-size:12px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;">Order #${order._id.toString().slice(-6).toUpperCase()}</p>
          </div>
          <div style="padding:30px;">
            <h3 style="margin-top:0;">Customer Details</h3>
            <p style="margin:4px 0;"><strong>Name:</strong> ${order.customer.name}</p>
            <p style="margin:4px 0;"><strong>Email:</strong> ${order.customer.email}</p>
            <p style="margin:4px 0;"><strong>Phone:</strong> ${order.customer.phone}</p>
            <p style="margin:4px 0;"><strong>Delivery Address:</strong> ${order.customer.address}</p>
            <p style="margin:4px 0;"><strong>Payment:</strong> ${paymentLabel[order.paymentMethod] || order.paymentMethod}</p>
            ${order.notes ? `<p style="margin:4px 0;"><strong>Notes:</strong> ${order.notes}</p>` : ''}
            <h3 style="margin-top:24px;">Order Items</h3>
            <table style="width:100%;border-collapse:collapse;">
              <thead><tr style="font-size:11px;text-transform:uppercase;color:#64748b;">
                <th style="text-align:left;padding-bottom:8px;">Item</th>
                <th style="text-align:center;padding-bottom:8px;">Qty</th>
                <th style="text-align:right;padding-bottom:8px;">Amount</th>
              </tr></thead>
              <tbody>${itemRows}</tbody>
              <tfoot><tr>
                <td colspan="2" style="padding-top:12px;font-weight:900;font-size:16px;">Total</td>
                <td style="padding-top:12px;font-weight:900;font-size:16px;text-align:right;color:#f59e0b;">₹${order.totalAmount.toFixed(0)}</td>
              </tr></tfoot>
            </table>
          </div>
        </div>`,
    });
  } catch (err) {
    logger.error('Failed to send store order email', err);
  }
};

export const sendCustomerOrderEmail = async (email: string, customerName: string, storeName: string, order: any) => {
  if (!process.env.RESEND_API_KEY) return;
  const itemRows = order.items.map((i: any) => {
    const finalPrice = i.price * (1 - (i.discountPercent || 0) / 100);
    return `<tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">${i.name}</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:center;">${i.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right;">₹${(finalPrice * i.quantity).toFixed(0)}</td></tr>`;
  }).join('');
  try {
    await resend.emails.send({
      from: 'Event Sphere <orders@eventsphere.dev>',
      to: [email],
      subject: `Order Confirmed — ${storeName} 🛍️`,
      html: `
        <div style="font-family:sans-serif;color:#1e293b;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <div style="background:#10B981;padding:30px;text-align:center;color:#000;">
            <h1 style="margin:0;font-weight:900;text-transform:uppercase;letter-spacing:-0.05em;">Order Confirmed!</h1>
            <p style="margin:5px 0 0;font-size:12px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;">Ref #${order._id.toString().slice(-6).toUpperCase()}</p>
          </div>
          <div style="padding:30px;">
            <h2>Hi ${customerName},</h2>
            <p>Your order from <strong>${storeName}</strong> has been received. The store will confirm and contact you shortly.</p>
            <h3>Your Order</h3>
            <table style="width:100%;border-collapse:collapse;">
              <thead><tr style="font-size:11px;text-transform:uppercase;color:#64748b;">
                <th style="text-align:left;padding-bottom:8px;">Item</th>
                <th style="text-align:center;padding-bottom:8px;">Qty</th>
                <th style="text-align:right;padding-bottom:8px;">Amount</th>
              </tr></thead>
              <tbody>${itemRows}</tbody>
              <tfoot><tr>
                <td colspan="2" style="padding-top:12px;font-weight:900;font-size:16px;">Total</td>
                <td style="padding-top:12px;font-weight:900;font-size:16px;text-align:right;color:#10B981;">₹${order.totalAmount.toFixed(0)}</td>
              </tr></tfoot>
            </table>
            <p style="margin-top:24px;color:#64748b;font-size:13px;">Delivery to: ${order.customer.address}</p>
          </div>
        </div>`,
    });
  } catch (err) {
    logger.error('Failed to send customer order email', err);
  }
};

export const sendAccountSetupEmail = async (email: string, userName: string, setupUrl: string) => {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from: 'Event Sphere <welcome@eventsphere.dev>',
      to: [email],
      subject: 'Your tickets are confirmed — set up your account 🎟️',
      html: `
        <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #10B981; padding: 40px; text-align: center; color: black;">
            <h1 style="margin: 0; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em;">City Pulse</h1>
            <p style="margin: 5px 0 0; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; font-size: 12px;">Tickets Confirmed</p>
          </div>
          <div style="padding: 40px;">
            <h2>Welcome, ${userName}!</h2>
            <p>Your ticket purchase was successful and we've created an account for you so you can manage your tickets anytime.</p>
            <p>Set a password to activate your account and view all your bookings:</p>
            <div style="margin: 30px 0;">
              <a href="${setupUrl}" style="background-color: #10B981; color: black; padding: 18px 32px; text-decoration: none; border-radius: 12px; font-weight: 900; display: inline-block; text-transform: uppercase; letter-spacing: 0.1em; font-size: 14px;">Set My Password</a>
            </div>
            <p style="color: #94a3b8; font-size: 13px;">This link expires in 1 hour. If you don't want an account, you can ignore this email — your tickets have already been sent.</p>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
            <p style="color: #64748b; font-size: 12px; font-style: italic;">City Pulse Collective</p>
          </div>
        </div>
      `,
    });
    logger.info(`Account setup email sent to ${email}`);
  } catch (err) {
    logger.error('Failed to send account setup email', err);
  }
};

export const sendStoreOwnerWelcomeEmail = async (email: string, ownerName: string, storeName: string, loginUrl: string, tempPassword: string) => {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from: 'City Pulse <noreply@eventsphere.dev>',
      to: [email],
      subject: `Your Store Owner Account — ${storeName}`,
      html: `
        <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #f59e0b; padding: 40px; text-align: center; color: black;">
            <h1 style="margin: 0; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em;">City Pulse</h1>
            <p style="margin: 5px 0 0; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; font-size: 12px;">Store Owner Portal</p>
          </div>
          <div style="padding: 40px;">
            <h2>Welcome, ${ownerName}!</h2>
            <p>Your store owner account for <strong>${storeName}</strong> has been created. You can now log in to manage orders and update their status.</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 8px; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #64748b;">Your Login Credentials</p>
              <p style="margin: 4px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 4px 0;"><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
            </div>
            <div style="margin: 30px 0;">
              <a href="${loginUrl}" style="background-color: #f59e0b; color: black; padding: 18px 32px; text-decoration: none; border-radius: 12px; font-weight: 900; display: inline-block; text-transform: uppercase; letter-spacing: 0.1em; font-size: 14px;">Log in to Portal</a>
            </div>
            <p style="color: #94a3b8; font-size: 13px;">Please change your password after first login. Keep this email safe.</p>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
            <p style="color: #64748b; font-size: 12px; font-style: italic;">City Pulse Collective</p>
          </div>
        </div>
      `,
    });
    logger.info(`Store owner welcome email sent to ${email}`);
  } catch (err) {
    logger.error('Failed to send store owner welcome email', err);
  }
};

export const sendEventDeclineEmail = async (email: string, userName: string, eventTitle: string, reason: string) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await resend.emails.send({
      from: 'Event Sphere <moderation@eventsphere.dev>',
      to: [email],
      subject: `Moderation Update: ${eventTitle} ⚠️`,
      html: `
        <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #f43f5e; padding: 40px; text-align: center; color: white;">
            <h1 style="margin: 0; font-weight: 900; text-transform: uppercase;">Action Required</h1>
          </div>
          <div style="padding: 40px;">
            <h2>Hello ${userName},</h2>
            <p>Our moderation collective has reviewed your production <strong>${eventTitle}</strong> and determined that it cannot be listed in its current state.</p>
            
            <div style="background-color: #fff1f2; border-left: 4px solid #f43f5e; padding: 20px; margin: 25px 0;">
              <p style="margin: 0; font-weight: bold; color: #e11d48; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em;">Reason for Decline</p>
              <p style="margin: 10px 0 0; color: #475569; font-style: italic;">"${reason}"</p>
            </div>

            <p>Please review our production guidelines and update your event details accordingly from your manager portal.</p>
            <div style="margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/portal" style="background-color: #050505; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Manage Production</a>
            </div>
          </div>
        </div>
      `,
    });
    logger.info(`Event decline email sent to manager: ${email} for ${eventTitle}`);
  } catch (err) {
    logger.error('Failed to send event decline email', err);
  }
};
export const sendMarketingBoostRequestEmail = async (managerName: string, managerEmail: string, requestData: any) => {
  if (!process.env.RESEND_API_KEY) return;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@eventsphere.dev';

  try {
    await resend.emails.send({
      from: 'Event Sphere Marketing <marketing@eventsphere.dev>',
      to: [adminEmail],
      subject: `Marketing Boost Requested: ${requestData.eventTitle} 🚀`,
      html: `
        <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #f59e0b; padding: 40px; text-align: center; color: black;">
            <h1 style="margin: 0; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em;">Marketing Request</h1>
          </div>
          <div style="padding: 40px;">
            <h2>New Boost Request from ${managerName}</h2>
            <p>A manager has requested a marketing boost for their event.</p>
            
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 4px 0;"><strong>Event:</strong> ${requestData.eventTitle}</p>
              <p style="margin: 4px 0;"><strong>Plan:</strong> ${requestData.plan.toUpperCase()}</p>
              <p style="margin: 4px 0;"><strong>Instagram:</strong> ${requestData.igHandle}</p>
              <p style="margin: 4px 0;"><strong>WhatsApp:</strong> ${requestData.phone}</p>
              <p style="margin: 4px 0;"><strong>Manager Email:</strong> ${managerEmail}</p>
            </div>

            ${requestData.message ? `
            <div style="margin: 20px 0;">
              <p style="font-weight: bold; margin-bottom: 5px;">Additional Message:</p>
              <p style="font-style: italic; color: #64748b;">"${requestData.message}"</p>
            </div>` : ''}

            <p style="color: #64748b; font-size: 14px;">Please connect with the manager via WhatsApp or email to finalize the campaign.</p>
          </div>
        </div>
      `,
    });
    logger.info(`Marketing boost request sent to admin for: ${managerEmail}`);
  } catch (err) {
    logger.error('Failed to send marketing boost request email', err);
  }
};
