import mongoose, { Schema, Document } from 'mongoose';

export interface IPayout extends Document {
  manager: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
  referenceId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema: Schema = new Schema(
  {
    manager: { type: Schema.Types.ObjectId, ref: 'EventManager', required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
    paymentMethod: { type: String },
    referenceId: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IPayout>('Payout', PayoutSchema);
