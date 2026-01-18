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
