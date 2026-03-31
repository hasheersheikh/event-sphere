import mongoose, { Schema, Document } from 'mongoose';

export interface IPayout extends Document {
  manager: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod?: string;
  referenceId?: string;
  fundAccountId?: string;
  razorpayPayoutId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

  const PayoutSchema: Schema = new Schema(
  {
    manager: { type: Schema.Types.ObjectId, ref: 'EventManager', required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event' },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    paymentMethod: { type: String },
    referenceId: { type: String },
    fundAccountId: { type: String },
    razorpayPayoutId: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IPayout>('Payout', PayoutSchema);
