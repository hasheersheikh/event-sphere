import mongoose, { Schema, Document } from 'mongoose';

export interface IEventManager extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'event_manager';
  isApproved: boolean;
  totalPaid: number;
  payoutLock?: boolean;
  commissionType: 'flat' | 'percentage';
  commissionValue: number;
  commissionHistory: Array<{
    changedAt: Date;
    changedBy: string;
    oldType: string;
    oldValue: number;
    newType: string;
    newValue: number;
  }>;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  bankDetails?: {
    accountHolder: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
  upiId?: string;
  payoutCycle: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventManagerSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      default: 'event_manager',
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    totalPaid: {
      type: Number,
      default: 0,
    },
    // Atomic mutex to prevent two concurrent admin requests from both passing
    // the balance check and initiating a duplicate Razorpay payout for this manager.
    payoutLock: {
      type: Boolean,
      default: false,
    },
    commissionType: {
      type: String,
      enum: ['flat', 'percentage'],
      default: 'percentage',
    },
    commissionValue: {
      type: Number,
      default: 10,
    },
    commissionHistory: [{
      changedAt: { type: Date, default: Date.now },
      changedBy: { type: String },
      oldType: { type: String },
      oldValue: { type: Number },
      newType: { type: String },
      newValue: { type: Number },
    }],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      bankName: String,
      ifscCode: String,
    },
    upiId: String,
    payoutCycle: {
      type: String,
      default: 'T+2',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IEventManager>('EventManager', EventManagerSchema);
