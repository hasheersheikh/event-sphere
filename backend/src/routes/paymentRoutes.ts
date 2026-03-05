import express from 'express';
import { Response, RequestHandler } from 'express';
import razorpay from '../utils/razorpay.js';
import { protect, AuthRequest } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { generateTicketPDF } from '../utils/pdfGenerator.js';
import { sendTicketEmail } from '../utils/emailService.js';

export const createOrder: RequestHandler = async (req: AuthRequest, res: Response) => {
  const { amount, currency = 'INR', receipt, bookingId } = req.body;

  try {
    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency,
      receipt: receipt || bookingId,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating Razorpay order', error });
  }
};

export const verifyPayment: RequestHandler = async (req: AuthRequest, res: Response) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature,
    bookingId 
  } = req.body;

  try {
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const booking = await Booking.findById(bookingId).populate('event');
      if (booking) {
        booking.status = 'confirmed';
        booking.paymentId = razorpay_payment_id;
        await booking.save();

        // Trigger Email Confirmation (Non-blocking)
        (async () => {
          try {
            const user = await User.findById(booking.user);
            const event: any = booking.event;
            if (user && event) {
              const pdfBuffer = await generateTicketPDF(booking, event);
              await sendTicketEmail(user.email, user.name, event, pdfBuffer);
            }
          } catch (err) {
            console.error('Failed to send confirmation email after payment:', err);
          }
        })();

        res.json({ success: true, message: "Payment verified and booking confirmed" });
      } else {
        res.status(404).json({ message: "Booking not found" });
      }
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    res.status(500).json({ message: "Verification failed", error });
  }
};

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

export default router;
