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
 * Provider: MSG91 WhatsApp Business API
 * Docs: https://docs.msg91.com/whatsapp
 *
 * Required env vars:
 *   MSG91_API_KEY                 — authkey from control.msg91.com (same key used for SMS OTP)
 *   MSG91_WHATSAPP_NUMBER         — WhatsApp Business number integrated in the MSG91 panel
 *   MSG91_WHATSAPP_TEMPLATE_NAME  — name of the approved template used for ticket delivery
 *   MSG91_WHATSAPP_NAMESPACE      — template namespace, shown next to the template in the MSG91 panel
 *
 * Also requires Cloudinary env vars for PDF hosting (WhatsApp needs a public media URL):
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *
 * IMPORTANT: the `components` keys below (header_1, body_1, body_2, ...) depend on
 * how the approved template is structured. Before going live, open the template in
 * MSG91 → WhatsApp → Templates → "Code" tab, copy the exact `to_and_components`
 * shape it generates, and adjust the payload below to match — variable count/order
 * must line up with the template or the send will be rejected.
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
  const {
    MSG91_API_KEY,
    MSG91_WHATSAPP_NUMBER,
    MSG91_WHATSAPP_TEMPLATE_NAME,
    MSG91_WHATSAPP_NAMESPACE,
  } = process.env;

  if (!MSG91_API_KEY || !MSG91_WHATSAPP_NUMBER || !MSG91_WHATSAPP_TEMPLATE_NAME) {
    logger.warn('[WHATSAPP] MSG91 WhatsApp env vars not set — skipping WhatsApp notification', {
      phoneNumber,
      event: event?.title,
    });
    return { success: false, error: 'MSG91 WhatsApp not configured' };
  }

  // Normalise phone: MSG91 expects the country code with no leading '+', e.g. 919876543210
  const normalised = phoneNumber.startsWith('+')
    ? phoneNumber.slice(1)
    : phoneNumber.startsWith('91')
      ? phoneNumber
      : `91${phoneNumber}`;

  try {
    // 1. Upload PDF to Cloudinary to get a public URL
    const pdfUrl = await uploadPdfToCloudinary(pdfBuffer, event?._id?.toString() || Date.now().toString());

    const eventDate = event?.date
      ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : '';
    const venue = event?.location?.venueName || event?.location?.address || '';

    // 2. Send via MSG91 WhatsApp API
    const res = await fetch('https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/', {
      method: 'POST',
      headers: { authkey: MSG91_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        integrated_number: MSG91_WHATSAPP_NUMBER,
        content_type: 'template',
        payload: {
          messaging_product: 'whatsapp',
          type: 'template',
          template: {
            name: MSG91_WHATSAPP_TEMPLATE_NAME,
            language: { code: 'en', policy: 'deterministic' },
            namespace: MSG91_WHATSAPP_NAMESPACE,
            to_and_components: [
              {
                to: [normalised],
                components: {
                  header_1: { type: 'document', value: pdfUrl, filename: `ticket_${event?._id || Date.now()}.pdf` },
                  body_1: { type: 'text', value: userName },
                  body_2: { type: 'text', value: event?.title || 'the event' },
                  body_3: { type: 'text', value: eventDate },
                  body_4: { type: 'text', value: venue },
                },
              },
            ],
          },
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`MSG91 WhatsApp error: ${body}`);
    }

    const data: any = await res.json();
    logger.info('[WHATSAPP] Ticket sent', { to: normalised, event: event?.title, response: data });
    return { success: true, messageId: data?.request_id || data?.data?.message_id };
  } catch (error: any) {
    logger.error('[WHATSAPP] Failed to send ticket', {
      phoneNumber: normalised,
      event: event?.title,
      error: error?.message,
    });
    return { success: false, error };
  }
};
