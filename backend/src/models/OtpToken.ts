import mongoose, { Schema } from 'mongoose';

const OtpTokenSchema = new Schema({
  identifier: { type: String, required: true, index: true }, // email or phone
  identifierType: { type: String, enum: ['email', 'phone'], required: true },
  otp: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  // Only set when purpose is 'register' — holds the submitted signup details so
  // the account is created only after the OTP is verified, never before.
  purpose: { type: String, enum: ['login', 'register'], default: 'login' },
  pendingName: { type: String },
  pendingPasswordHash: { type: String },
  pendingRole: { type: String },
});

// TTL index — MongoDB auto-deletes expired docs
OtpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('OtpToken', OtpTokenSchema);
