import express from 'express';
import { Response, RequestHandler } from 'express';
import razorpay from '../utils/razorpay.js';
import { protect, AuthRequest } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

export const createOrder: RequestHandler = async (req: AuthRequest, res: Response) => {
  const { amount, currency = 'INR', receipt } = req.body;

  try {
    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating Razorpay order', error });
  }
};

export const verifyPayment: RequestHandler = async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body as any;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    res.json({ message: "Payment verified successfully" });
  } else {
    res.status(400).json({ message: "Invalid signature" });
  }
};

router.post('/create-order', protect, createOrder);
router.post('/verify', verifyPayment);

export default router;
