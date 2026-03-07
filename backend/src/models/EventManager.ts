import mongoose, { Schema, Document } from 'mongoose';

export interface IEventManager extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'event_manager';
  isApproved: boolean;
  totalPaid: number;
  commissionType: 'flat' | 'percentage';
  commissionValue: number;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  bankDetails?: {
    accountHolder: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
  upiId?: string;
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
    commissionType: {
      type: String,
      enum: ['flat', 'percentage'],
      default: 'percentage',
    },
    commissionValue: {
      type: Number,
      default: 10, // Default 10%
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      bankName: String,
      ifscCode: String,
    },
    upiId: String,
  },
  { timestamps: true }
);

export default mongoose.model<IEventManager>('EventManager', EventManagerSchema);
