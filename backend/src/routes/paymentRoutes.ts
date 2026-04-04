import express from 'express';
import { Response, RequestHandler } from 'express';
import razorpay from '../utils/razorpay.js';
import { optionalProtect, AuthRequest } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

import Booking from '../models/Booking.js';
import StoreOrder from '../models/StoreOrder.js';
import Payout from '../models/Payout.js';
import { generateTicketPDF } from '../utils/pdfGenerator.js';
import { sendTicketEmail, sendStoreOrderEmail, sendCustomerOrderEmail } from '../utils/emailService.js';

export const createPaymentLink: RequestHandler = async (req: AuthRequest, res: Response) => {
  const { bookingId, amount, currency = 'INR', customerName, customerEmail, customerPhone, eventTitle } = req.body;

  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const callbackUrl = `${frontendUrl}/payment/callback?bookingId=${bookingId}`;

    const paymentLink = await (razorpay as any).paymentLink.create({
      amount: Math.round(amount * 100), // paise
      currency,
      accept_partial: false,
      description: `Booking for ${eventTitle || 'Event'}`,
      customer: {
        name: customerName || 'Guest',
        email: customerEmail,
        contact: customerPhone,
      },
      notify: { sms: false, email: false },
      reminder_enable: false,
      callback_url: callbackUrl,
      callback_method: 'get',
    });

    res.json({ payment_url: paymentLink.short_url });
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment link', error });
  }
};

export const verifyPaymentLink: RequestHandler = async (req: AuthRequest, res: Response) => {
  const {
    razorpay_payment_id,
    razorpay_payment_link_id,
    razorpay_payment_link_reference_id,
    razorpay_payment_link_status,
    razorpay_signature,
    bookingId,
  } = req.body;

  try {
    if (razorpay_payment_link_status !== 'paid') {
      res.status(400).json({ success: false, message: 'Payment not completed' });
      return;
    }

    const sign = `${razorpay_payment_link_id}|${razorpay_payment_link_reference_id}|${razorpay_payment_link_status}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
      .update(sign)
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      res.status(400).json({ success: false, message: 'Invalid signature' });
      return;
    }

    const booking = await Booking.findById(bookingId).populate('event');
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    booking.status = 'confirmed';
    booking.paymentId = razorpay_payment_id;
    await booking.save();

    // Send ticket (non-blocking)
    (async () => {
      try {
        const event: any = booking.event;
        const pdfBuffer = await generateTicketPDF(booking, event);
        if (booking.email) await sendTicketEmail(booking.email, (booking as any).user?.name || 'Guest', event, pdfBuffer);
        if (booking.phoneNumber) {
          const { sendTicketWhatsApp } = await import('../utils/whatsappService.js');
          await sendTicketWhatsApp(booking.phoneNumber, booking.phoneNumber, event, pdfBuffer);
        }
      } catch (err) {
        console.error('Failed to send confirmation after payment link:', err);
      }
    })();

    res.json({ success: true, message: 'Payment verified and booking confirmed' });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error });
  }
};


export const handleRazorpayWebhook: RequestHandler = async (req: express.Request, res: Response) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';
  const signature = req.headers['x-razorpay-signature'] as string;

  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (expectedSignature !== signature) {
      res.status(400).json({ message: "Invalid signature" });
      return;
    }

    const { event, payload } = req.body;
    if (event && event.startsWith('payout.')) {
      const payoutData = payload.payout.entity;
      const razorpayPayoutId = payoutData.id;
      const status = payoutData.status;

      const payout = await Payout.findOne({ razorpayPayoutId });
      if (payout) {
        if (status === 'processed') payout.status = 'completed';
        else if (status === 'reversed' || status === 'failed') payout.status = 'failed';
        await payout.save();
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ message: 'Webhook failed', error: err });
  }
};

export const createStoreOrderPaymentLink: RequestHandler = async (req: AuthRequest, res: Response) => {
  const { orderId, amount, currency = 'INR', customerName, customerEmail, customerPhone, storeName } = req.body;
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const callbackUrl = `${frontendUrl}/payment/callback?orderId=${orderId}`;

    const paymentLink = await (razorpay as any).paymentLink.create({
      amount: Math.round(amount * 100),
      currency,
      accept_partial: false,
      description: `Order from ${storeName || 'Local Store'}`,
      customer: { name: customerName || 'Guest', email: customerEmail, contact: customerPhone },
      notify: { sms: false, email: false },
      reminder_enable: false,
      callback_url: callbackUrl,
      callback_method: 'get',
    });

    res.json({ payment_url: paymentLink.short_url });
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment link', error });
  }
};

export const verifyStoreOrderPayment: RequestHandler = async (req: AuthRequest, res: Response) => {
  const {
    razorpay_payment_id,
    razorpay_payment_link_id,
    razorpay_payment_link_reference_id,
    razorpay_payment_link_status,
    razorpay_signature,
    orderId,
  } = req.body;

  try {
    if (razorpay_payment_link_status !== 'paid') {
      res.status(400).json({ success: false, message: 'Payment not completed' });
      return;
    }

    const sign = `${razorpay_payment_link_id}|${razorpay_payment_link_reference_id}|${razorpay_payment_link_status}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
      .update(sign)
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      res.status(400).json({ success: false, message: 'Invalid signature' });
      return;
    }

    const order = await StoreOrder.findById(orderId);
    if (!order) { res.status(404).json({ message: 'Order not found' }); return; }

    order.status = 'confirmed';
    order.paymentId = razorpay_payment_id;
    await order.save();

    // Send confirmation emails (non-blocking)
    (async () => {
      try {
        if (order.storeEmail) await sendStoreOrderEmail(order.storeEmail, order.storeName, order);
        await sendCustomerOrderEmail(order.customer.email, order.customer.name, order.storeName, order);
      } catch (err) {
        console.error('Failed to send store order confirmation emails:', err);
      }
    })();

    res.json({ success: true, message: 'Payment verified and order confirmed' });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error });
  }
};

router.post('/create-payment-link', optionalProtect, createPaymentLink);
router.post('/verify-link', optionalProtect, verifyPaymentLink);
router.post('/create-store-order-payment-link', optionalProtect, createStoreOrderPaymentLink);
router.post('/verify-store-order', optionalProtect, verifyStoreOrderPayment);
router.post('/webhook', handleRazorpayWebhook);

export default router;
