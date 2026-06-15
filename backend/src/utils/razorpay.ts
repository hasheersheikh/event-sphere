import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.RAZORPAY_KEY_ID) {
  console.error('RAZORPAY_KEY_ID not configured — payment features will fail');
}
if (!process.env.RAZORPAY_KEY_SECRET) {
  console.error('RAZORPAY_KEY_SECRET not configured — payment features will fail');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'missing',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'missing',
});

export default razorpay;
