import mongoose, { Schema } from 'mongoose';

const OtpTokenSchema = new Schema({
  identifier: { type: String, required: true, index: true }, // email or phone
  identifierType: { type: String, enum: ['email', 'phone'], required: true },
  otp: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});

// TTL index — MongoDB auto-deletes expired docs
OtpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('OtpToken', OtpTokenSchema);
