import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import EventManager from '../models/EventManager.js';
import Booking from '../models/Booking.js';
import OtpToken from '../models/OtpToken.js';
import {
  sendWelcomeEmail,
  sendManagerWelcomeEmail,
  sendOtpVerificationEmail,
} from '../utils/emailProvider.js';
import { isDisposableEmail } from '../utils/emailValidation.js';

const OTP_ENABLED = process.env.ENABLE_OTP_AUTH === 'true';
const MAX_ATTEMPTS = 3;
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const REGISTRATION_OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Roles the public registration-OTP flow may create directly — mirrors
// authController's SELF_REGISTERABLE_ROLES. 'admin' is deliberately excluded.
const SELF_REGISTERABLE_ROLES = ['user', 'event_manager', 'volunteer'];

const getModelByRole = (role: string): any => {
  if (role === 'event_manager') return EventManager;
  return User;
};

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
      await sendOtpVerificationEmail(identifier, otp);
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
// Password signup, gated behind email OTP verification. The account is only
// created once the OTP is confirmed — no unverified account ever exists.
//
// Send OTP  POST /auth/register/send-otp
// Body: { name, email, password, role? }
// ---------------------------------------------------------------------------
export const sendRegistrationOtp = async (req: Request, res: Response) => {
  const { name, password } = req.body as { name: string; password: string };
  const email = (req.body.email as string)?.toLowerCase().trim();
  const role = req.body.role as string;
  const userRole = SELF_REGISTERABLE_ROLES.includes(role) ? role : 'user';

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  if (isDisposableEmail(email)) {
    return res.status(400).json({
      message: 'Please use a real email address. Disposable/temporary email providers are not allowed.',
    });
  }

  // Ghost users (created during guest checkout — no password, no googleId) are
  // allowed to proceed; they'll be upgraded in place once the OTP is verified.
  const ghostUser = userRole === 'user'
    ? await User.findOne({ email, password: { $exists: false }, googleId: { $exists: false } })
    : null;

  if (!ghostUser) {
    const models = [User, Admin, EventManager];
    for (const M of models) {
      const existing = await (M as any).findOne({ email });
      if (existing) {
        return res.status(400).json({ message: 'Identity already exists in platform frequency' });
      }
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + REGISTRATION_OTP_TTL_MS);

  await OtpToken.findOneAndUpdate(
    { identifier: email, identifierType: 'email', purpose: 'register' },
    {
      identifier: email,
      identifierType: 'email',
      purpose: 'register',
      otp,
      attempts: 0,
      expiresAt,
      pendingName: name,
      pendingPasswordHash: passwordHash,
      pendingRole: userRole,
    },
    { upsert: true, new: true }
  );

  try {
    await sendOtpVerificationEmail(email, otp);
  } catch (err) {
    console.error('Registration OTP send failed:', err);
    return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }

  res.json({ message: 'OTP sent successfully.' });
};

// ---------------------------------------------------------------------------
// Verify OTP and create the account  POST /auth/register/verify-otp
// Body: { email, otp }
// ---------------------------------------------------------------------------
export const verifyRegistrationOtp = async (req: Request, res: Response) => {
  const email = (req.body.email as string)?.toLowerCase().trim();
  const { otp } = req.body as { otp: string };

  if (!email || !otp) {
    return res.status(400).json({ message: 'email and otp are required.' });
  }

  const record = await OtpToken.findOne({ identifier: email, identifierType: 'email', purpose: 'register' });

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

  const { pendingName, pendingPasswordHash, pendingRole } = record;
  await OtpToken.deleteOne({ _id: record._id });

  const userRole = pendingRole || 'user';
  const Model = getModelByRole(userRole);

  // Ghost user upgrade (guest checkout account, 'user' role only)
  const ghostUser = userRole === 'user'
    ? await User.findOne({ email, password: { $exists: false }, googleId: { $exists: false } })
    : null;

  if (ghostUser) {
    ghostUser.password = pendingPasswordHash || undefined;
    if (pendingName) ghostUser.name = pendingName;
    await ghostUser.save();
    await claimGuestBookings(ghostUser._id.toString(), email, ghostUser.phoneNumber);
    return res.status(201).json({
      _id: ghostUser._id,
      name: ghostUser.name,
      email: ghostUser.email,
      role: ghostUser.role,
      token: generateToken(ghostUser._id.toString(), ghostUser.role),
    });
  }

  // Re-check uniqueness — the email could have been registered elsewhere
  // between send-otp and verify-otp.
  const models = [User, Admin, EventManager];
  for (const M of models) {
    const existing = await (M as any).findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Identity already exists in platform frequency' });
    }
  }

  const user = await Model.create({
    name: pendingName,
    email,
    password: pendingPasswordHash,
    role: userRole,
  });

  // Event managers get the getting-started email with the manager agreement PDF
  // right away — their events still go through admin moderation before going live.
  (async () => {
    try {
      if (userRole === 'event_manager') {
        await sendManagerWelcomeEmail(user.email, user.name);
      } else {
        await sendWelcomeEmail(user.email, user.name);
      }
    } catch (err) {
      console.error('Failed to send registration emails:', err);
    }
  })();

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id.toString(), user.role),
  });
};

// ---------------------------------------------------------------------------
// Provider helpers — swap out the implementation when ready
// ---------------------------------------------------------------------------
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
