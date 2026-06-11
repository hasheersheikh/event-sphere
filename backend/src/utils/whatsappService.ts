import winston from 'winston';
import { v2 as cloudinary } from 'cloudinary';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

/**
 * Upload a PDF buffer to Cloudinary and return a public URL.
 * WhatsApp Business API requires a publicly accessible URL — it cannot accept raw binary.
 * We upload to Cloudinary (raw resource type) and get back a secure URL.
 */
const uploadPdfToCloudinary = async (pdfBuffer: Buffer, bookingId: string): Promise<string> => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'tickets',
        public_id: `ticket_${bookingId}`,
        format: 'pdf',
        // Auto-delete after 24 hours — ticket URLs are short-lived
        invalidate: true,
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Cloudinary upload failed'));
        resolve(result.secure_url);
      }
    );
    uploadStream.end(pdfBuffer);
  });
};

/**
 * Send a WhatsApp message with the ticket PDF attached.
 *
 * Provider: Twilio WhatsApp Business API
 * Docs: https://www.twilio.com/docs/whatsapp/api
 *
 * Required env vars:
 *   TWILIO_ACCOUNT_SID      — from console.twilio.com
 *   TWILIO_AUTH_TOKEN       — from console.twilio.com
 *   TWILIO_WHATSAPP_NUMBER  — format: +14155238886 (sandbox) or your approved number
 *
 * Also requires Cloudinary env vars for PDF hosting:
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *
 * If any of these are missing the function logs a warning and returns without throwing,
 * so a missing config never blocks the booking confirmation response.
 */
export const sendTicketWhatsApp = async (
  phoneNumber: string,
  userName: string,
  event: any,
  pdfBuffer: Buffer
): Promise<{ success: boolean; messageId?: string; error?: any }> => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
    logger.warn('[WHATSAPP] Twilio env vars not set — skipping WhatsApp notification', {
      phoneNumber,
      event: event?.title,
    });
    return { success: false, error: 'Twilio not configured' };
  }

  // Normalise phone: must be E.164 format e.g. +919876543210
  const normalised = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

  try {
    // 1. Upload PDF to Cloudinary to get a public URL
    const pdfUrl = await uploadPdfToCloudinary(pdfBuffer, event?._id?.toString() || Date.now().toString());

    // 2. Send via Twilio
    // Dynamic import so the package is only loaded when the feature is actually used
    const twilio = (await import('twilio')).default;
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    const message = await client.messages.create({
      from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${normalised}`,
      body: `Hi ${userName}! 🎟️ Your tickets for *${event?.title || 'the event'}* are confirmed.\n\n📅 ${event?.date ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''} at ${event?.time || ''}\n📍 ${event?.location?.venueName || event?.location?.address || ''}\n\nYour ticket PDF is attached below. Present the QR code at the venue. See you there! 🚀`,
      mediaUrl: [pdfUrl],
    });

    logger.info('[WHATSAPP] Ticket sent', { to: normalised, event: event?.title, sid: message.sid });
    return { success: true, messageId: message.sid };
  } catch (error: any) {
    logger.error('[WHATSAPP] Failed to send ticket', {
      phoneNumber: normalised,
      event: event?.title,
      error: error?.message,
    });
    return { success: false, error };
  }
};
