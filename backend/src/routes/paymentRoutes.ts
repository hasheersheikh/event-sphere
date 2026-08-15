import express from 'express';
import { Response, RequestHandler } from 'express';
import razorpay from '../utils/razorpay.js';
import { optionalProtect, AuthRequest } from '../middleware/auth.js';
import crypto from 'crypto';

// Timing-safe HMAC comparison helper
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

const router = express.Router();

import Booking from '../models/Booking.js';
import StoreOrder from '../models/StoreOrder.js';
import Payout from '../models/Payout.js';
import { generateTicketPDF } from '../utils/pdfGenerator.js';
import { sendTicketEmail, sendStoreOrderEmail, sendCustomerOrderEmail } from '../utils/emailService.js';
import { reserveTickets } from '../utils/inventory.js';

export const createPaymentLink: RequestHandler = async (req: AuthRequest, res: Response) => {
  const { bookingId, currency = 'INR', customerName, customerEmail, customerPhone, eventTitle } = req.body;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) { res.status(404).json({ message: 'Booking not found' }); return; }
    if (booking.status !== 'pending') {
      res.status(400).json({ message: `Cannot create payment link for booking with status: ${booking.status}` });
      return;
    }

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:8080').replace(/\/$/, '');
    const callbackUrl = `${frontendUrl}/payment/callback?bookingId=${bookingId}`;

    // Amount is derived from the booking's server-computed total — never trust
    // a client-supplied amount, or a client could pay an arbitrary low price.
    const paymentLink = await (razorpay as any).paymentLink.create({
      amount: Math.round(booking.totalAmount * 100), // paise
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

    if (!process.env.RAZORPAY_KEY_SECRET) {
      res.status(500).json({ message: 'Razorpay key secret not configured' });
      return;
    }

    const sign = `${razorpay_payment_link_id}|${razorpay_payment_link_reference_id}|${razorpay_payment_link_status}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (!timingSafeEqual(razorpay_signature, expectedSign)) {
      res.status(400).json({ success: false, message: 'Invalid signature' });
      return;
    }

    const booking = await Booking.findById(bookingId).populate('event');
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Idempotency: if already confirmed, return success without reprocessing
    if (booking.status === 'confirmed') {
      res.json({ success: true, message: 'Booking already confirmed' });
      return;
    }

    if (booking.status === 'expired') {
      // Payment landed after the pending-booking timeout — the expiry cron
      // already released this booking's held inventory. Try to re-reserve it
      // now that we know the payment actually succeeded.
      const reserveOk = await reserveTickets((booking.event as any)._id || booking.event, booking.tickets);
      if (!reserveOk) {
        booking.status = 'refunded';
        booking.paymentId = razorpay_payment_id;
        await booking.save();
        try {
          await (razorpay as any).payments.refund(razorpay_payment_id, {
            notes: { reason: 'Booking expired before payment confirmation and tickets sold out in the interim' },
          });
        } catch (refundErr) {
          console.error('Auto-refund failed for expired-then-paid booking', bookingId, refundErr);
        }
        res.status(409).json({
          success: false,
          message: 'Your payment succeeded but the tickets are no longer available. A refund has been initiated automatically.',
        });
        return;
      }
    } else if (booking.status !== 'pending') {
      res.status(400).json({ success: false, message: `Cannot confirm booking with status: ${booking.status}` });
      return;
    }

    // Inventory was already reserved atomically when the booking was created
    // (or just re-reserved above for the expired-recovery case) — confirming
    // here only needs to flip status, never re-touch sold counts.
    booking.status = 'confirmed';
    booking.paymentId = razorpay_payment_id;
    await booking.save();

    // Send ticket (non-blocking)
    (async () => {
      try {
        const event: any = booking.event;
        const pdfBuffer = await generateTicketPDF(booking, event);
        const recipientName = (booking as any).contactName || (booking as any).user?.name || 'Guest';
        if (booking.email) await sendTicketEmail(booking.email, recipientName, event, pdfBuffer);
        if (booking.phoneNumber) {
          const { sendTicketWhatsApp } = await import('../utils/whatsappService.js');
          await sendTicketWhatsApp(booking.phoneNumber, recipientName, event, pdfBuffer);
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
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    res.status(500).json({ message: 'Webhook secret not configured' });
    return;
  }
  const signature = req.headers['x-razorpay-signature'] as string;

  try {
    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      res.status(400).json({ message: 'Missing raw body' });
      return;
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (!timingSafeEqual(expectedSignature, signature)) {
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
  // Accept either a single orderId (legacy) or orderIds (multi-store cart checkout).
  const { orderId, orderIds, currency = 'INR', customerName, customerEmail, customerPhone, storeName } = req.body;

  try {
    const ids: string[] = Array.isArray(orderIds) ? orderIds : orderId ? [orderId] : [];
    if (ids.length === 0) {
      res.status(400).json({ message: 'orderIds is required' });
      return;
    }

    const orders = await StoreOrder.find({ _id: { $in: ids } });
    if (orders.length !== ids.length) {
      res.status(404).json({ message: 'One or more orders not found' });
      return;
    }
    if (orders.some((o) => o.status !== 'pending')) {
      res.status(400).json({ message: 'One or more orders are not in a payable state' });
      return;
    }

    // Amount is the sum of each order's server-computed total — never trust a
    // client-supplied amount, or a client could pay an arbitrary low price.
    const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:8080').replace(/\/$/, '');
    const callbackUrl = `${frontendUrl}/payment/callback?orderIds=${ids.join(',')}`;

    const paymentLink = await (razorpay as any).paymentLink.create({
      amount: Math.round(totalAmount * 100),
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
    orderIds,
  } = req.body;

  try {
    if (razorpay_payment_link_status !== 'paid') {
      res.status(400).json({ success: false, message: 'Payment not completed' });
      return;
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      res.status(500).json({ message: 'Razorpay key secret not configured' });
      return;
    }

    const sign = `${razorpay_payment_link_id}|${razorpay_payment_link_reference_id}|${razorpay_payment_link_status}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (!timingSafeEqual(razorpay_signature, expectedSign)) {
      res.status(400).json({ success: false, message: 'Invalid signature' });
      return;
    }

    // Accept an array, a comma-joined string (from the callback URL query param), or the legacy single orderId.
    const ids: string[] = Array.isArray(orderIds)
      ? orderIds
      : typeof orderIds === 'string' && orderIds.length > 0
        ? orderIds.split(',').filter(Boolean)
        : orderId
          ? [orderId]
          : [];

    if (ids.length === 0) {
      res.status(400).json({ message: 'Missing order reference' });
      return;
    }

    const orders = await StoreOrder.find({ _id: { $in: ids } });
    if (orders.length === 0) { res.status(404).json({ message: 'Order not found' }); return; }

    // A multi-store cart pays for all orders with a single Razorpay payment link,
    // so every order tied to that payment must be confirmed here — not just one.
    for (const order of orders) {
      if (order.status === 'confirmed') continue; // idempotent — already processed
      order.status = 'confirmed';
      order.paymentId = razorpay_payment_id;
      await order.save();

      (async () => {
        try {
          if (order.storeEmail) await sendStoreOrderEmail(order.storeEmail, order.storeName, order);
          await sendCustomerOrderEmail(order.customer.email, order.customer.name, order.storeName, order);
        } catch (err) {
          console.error('Failed to send store order confirmation emails:', err);
        }
      })();
    }

    res.json({ success: true, message: 'Payment verified and order(s) confirmed' });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error });
  }
};

export const createOrder: RequestHandler = async (req: AuthRequest, res: Response) => {
  const { bookingId, currency = 'INR' } = req.body;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) { res.status(404).json({ message: 'Booking not found' }); return; }
    if (booking.status !== 'pending') {
      res.status(400).json({ message: `Cannot create order for booking with status: ${booking.status}` });
      return;
    }

    // Amount is derived from the booking's server-computed total — never trust
    // a client-supplied amount, or a client could pay an arbitrary low price.
    const order = await (razorpay as any).orders.create({
      amount: Math.round(booking.totalAmount * 100), // paise
      currency,
      receipt: `booking_${bookingId}`,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating Razorpay order', error });
  }
};

export const verifyOrder: RequestHandler = async (req: AuthRequest, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      res.status(500).json({ message: 'Razorpay key secret not configured' });
      return;
    }
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (!timingSafeEqual(razorpay_signature, expectedSign)) {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
      return;
    }

    const booking = await Booking.findById(bookingId).populate('event');
    if (!booking) { res.status(404).json({ message: 'Booking not found' }); return; }

    if (booking.status === 'confirmed') {
      res.json({ success: true, message: 'Booking already confirmed' });
      return;
    }

    if (booking.status === 'expired') {
      // Payment landed after the pending-booking timeout — the expiry cron
      // already released this booking's held inventory. Try to re-reserve it
      // now that we know the payment actually succeeded.
      const reserveOk = await reserveTickets((booking.event as any)._id || booking.event, booking.tickets);
      if (!reserveOk) {
        booking.status = 'refunded';
        booking.paymentId = razorpay_payment_id;
        await booking.save();
        try {
          await (razorpay as any).payments.refund(razorpay_payment_id, {
            notes: { reason: 'Booking expired before payment confirmation and tickets sold out in the interim' },
          });
        } catch (refundErr) {
          console.error('Auto-refund failed for expired-then-paid booking', bookingId, refundErr);
        }
        res.status(409).json({
          success: false,
          message: 'Your payment succeeded but the tickets are no longer available. A refund has been initiated automatically.',
        });
        return;
      }
    } else if (booking.status !== 'pending') {
      res.status(400).json({ success: false, message: `Cannot confirm booking with status: ${booking.status}` });
      return;
    }

    // Inventory was already reserved atomically when the booking was created
    // (or just re-reserved above for the expired-recovery case) — confirming
    // here only needs to flip status, never re-touch sold counts.
    booking.status = 'confirmed';
    booking.paymentId = razorpay_payment_id;
    await booking.save();

    // Send ticket confirmation (non-blocking)
    (async () => {
      try {
        const event: any = booking.event;
        const pdfBuffer = await generateTicketPDF(booking, event);
        const recipientName = (booking as any).contactName || (booking as any).user?.name || 'Guest';
        if (booking.email) await sendTicketEmail(booking.email, recipientName, event, pdfBuffer);
        if (booking.phoneNumber) {
          const { sendTicketWhatsApp } = await import('../utils/whatsappService.js');
          await sendTicketWhatsApp(booking.phoneNumber, recipientName, event, pdfBuffer);
        }
      } catch (err) {
        console.error('Failed to send ticket after order payment:', err);
      }
    })();

    res.json({ success: true, message: 'Payment verified and booking confirmed' });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error });
  }
};

router.post('/create-payment-link', optionalProtect, createPaymentLink);
router.post('/verify-link', optionalProtect, verifyPaymentLink);
router.post('/create-order', optionalProtect, createOrder);
router.post('/verify-order', optionalProtect, verifyOrder);
router.post('/create-store-order-payment-link', optionalProtect, createStoreOrderPaymentLink);
router.post('/verify-store-order', optionalProtect, verifyStoreOrderPayment);
router.post('/webhook', handleRazorpayWebhook);

export default router;
