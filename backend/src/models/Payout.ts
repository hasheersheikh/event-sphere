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

// Prevent duplicate/concurrent payouts for the same event — only one
// pending/processing/completed payout may exist per event at a time. 'pending'
// must be included so this also works as the concurrency lock two simultaneous
// admin requests race against (not just a post-hoc uniqueness check).
// Scoped to `event: { $exists: true }` so manager-level payouts (processPayout,
// which has no event field at all) are never subject to this constraint —
// otherwise every event-less payout would collide with every other manager's.
PayoutSchema.index(
  { event: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { event: { $exists: true }, status: { $in: ['pending', 'processing', 'completed'] } },
  }
);

export default mongoose.model<IPayout>('Payout', PayoutSchema);
