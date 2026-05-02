import mongoose, { Schema, Document } from 'mongoose';

export interface IRefundRequest extends Document {
  booking: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  paymentId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'completed' | 'failed' | 'ignored';
  failureReason?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RefundRequestSchema: Schema = new Schema(
  {
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    paymentId: { type: String, required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'ignored'],
      default: 'pending',
    },
    failureReason: { type: String },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IRefundRequest>('RefundRequest', RefundRequestSchema);
