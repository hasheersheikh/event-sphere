import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import OtpToken from '../models/OtpToken.js';
import { sendWelcomeEmail } from '../utils/emailProvider.js';

const OTP_ENABLED = process.env.ENABLE_OTP_AUTH === 'true';
const MAX_ATTEMPTS = 3;
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

const jwtSecret = (): string => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not configured');
  return process.env.JWT_SECRET;
};

const generateToken = (id: string, role: string) =>
  jwt.sign({ id, role }, jwtSecret(), { expiresIn: '30d' });

// ---------------------------------------------------------------------------
// When a user authenticates (any method), claim bookings made as a guest
// using the same email or phone. Guest checkout creates a shadow User record
// (no password, no googleId). We merge by transferring their bookings and
// deleting the shadow account.
// ---------------------------------------------------------------------------
export const claimGuestBookings = async (
  authenticatedUserId: string,
  email?: string,
  phoneNumber?: string
) => {
  const orConditions: any[] = [];
  if (email) orConditions.push({ email: email.toLowerCase() });
  if (phoneNumber) orConditions.push({ phoneNumber });
  if (!orConditions.length) return;

  // Find shadow users — same identifier, no password, no googleId, not the current user
  const shadowUsers = await User.find({
    $or: orConditions,
    _id: { $ne: authenticatedUserId },
    password: { $exists: false },
    googleId: { $exists: false },
  }).select('_id');

  if (!shadowUsers.length) return;

  const shadowIds = shadowUsers.map((u) => u._id);

  // Move all their bookings to the authenticated user
  await Booking.updateMany(
    { user: { $in: shadowIds } },
    { $set: { user: authenticatedUserId } }
  );

  // Remove shadow user records
  await User.deleteMany({ _id: { $in: shadowIds } });
};

// ---------------------------------------------------------------------------
// Send OTP  POST /api/auth/otp/send
// Body: { identifier: string, type: 'email' | 'phone' }
// ---------------------------------------------------------------------------
export const sendOtp = async (req: Request, res: Response) => {
  if (!OTP_ENABLED) {
    return res.status(503).json({ message: 'OTP authentication is currently disabled.' });
  }

  const { identifier, type } = req.body as { identifier: string; type: 'email' | 'phone' };

  if (!identifier || !['email', 'phone'].includes(type)) {
    return res.status(400).json({ message: 'identifier and type (email|phone) are required.' });
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await OtpToken.findOneAndUpdate(
    { identifier },
    { identifier, identifierType: type, otp, attempts: 0, expiresAt },
    { upsert: true, new: true }
  );

  try {
    if (type === 'email') {
      await sendOtpEmail(identifier, otp);
    } else {
      await sendOtpSms(identifier, otp);
    }
  } catch (err) {
    console.error('OTP send failed:', err);
    return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }

  res.json({ message: 'OTP sent successfully.' });
};

// ---------------------------------------------------------------------------
// Verify OTP  POST /api/auth/otp/verify
// Body: { identifier, type, otp, name? }
// ---------------------------------------------------------------------------
export const verifyOtp = async (req: Request, res: Response) => {
  if (!OTP_ENABLED) {
    return res.status(503).json({ message: 'OTP authentication is currently disabled.' });
  }

  const { identifier, type, otp, name } = req.body as {
    identifier: string;
    type: 'email' | 'phone';
    otp: string;
    name?: string;
  };

  if (!identifier || !type || !otp) {
    return res.status(400).json({ message: 'identifier, type, and otp are required.' });
  }

  const record = await OtpToken.findOne({ identifier, identifierType: type });

  if (!record) {
    return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
  }
  if (record.expiresAt < new Date()) {
    await OtpToken.deleteOne({ _id: record._id });
    return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    return res.status(400).json({ message: 'Too many attempts. Please request a new OTP.' });
  }
  if (record.otp !== otp) {
    await OtpToken.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
    return res.status(400).json({ message: 'Invalid OTP.' });
  }

  // Valid — clean up
  await OtpToken.deleteOne({ _id: record._id });

  // Find or create user
  const query = type === 'email'
    ? { email: identifier.toLowerCase() }
    : { phoneNumber: identifier };

  let user: any = await User.findOne(query);
  let isNew = false;

  if (!user) {
    isNew = true;
    const userData: any = { role: 'user', name: name || 'User' };
    if (type === 'email') {
      userData.email = identifier.toLowerCase();
    } else {
      userData.phoneNumber = identifier;
      // email is required+unique in schema; use a placeholder for phone-only users
      userData.email = `phone_${identifier}@otp.citypulse.in`;
    }
    user = await User.create(userData);
    sendWelcomeEmail(user.email, user.name).catch(() => {});
  }

  // Claim any guest bookings made with this email/phone
  await claimGuestBookings(
    user._id.toString(),
    type === 'email' ? identifier : undefined,
    type === 'phone' ? identifier : undefined
  );

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    avatar: user.avatar,
    isNew,
    token: generateToken(user._id.toString(), user.role),
  });
};

// ---------------------------------------------------------------------------
// Provider helpers — swap out the implementation when ready
// ---------------------------------------------------------------------------
async function sendOtpEmail(email: string, otp: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY not set');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'City Pulse <noreply@citypulse.in>',
      to: email,
      subject: `${otp} — your City Pulse verification code`,
      html: `<p>Your City Pulse verification code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error: ${body}`);
  }
}

async function sendOtpSms(phone: string, otp: string) {
  const apiKey = process.env.MSG91_API_KEY;
  const senderId = process.env.MSG91_SENDER_ID || 'CPULSE';
  const templateId = process.env.MSG91_TEMPLATE_ID;

  if (!apiKey) throw new Error('MSG91_API_KEY not set');

  // MSG91 OTP API
  const res = await fetch('https://api.msg91.com/api/v5/otp', {
    method: 'POST',
    headers: { authkey: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      template_id: templateId,
      mobile: phone.startsWith('+') ? phone : `91${phone}`,
      otp,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`MSG91 error: ${body}`);
  }
}
