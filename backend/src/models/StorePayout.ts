import mongoose, { Schema, Document } from 'mongoose';

export interface IStorePayout extends Document {
  storeId: mongoose.Types.ObjectId;
  storeName: string;
  requestedAmount: number;
  platformFee: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'paid' | 'rejected';
  payoutMethod: 'upi' | 'bank_transfer';
  upiId?: string;
  bankDetails?: {
    accountHolder?: string;
    accountNumber?: string;
    bankName?: string;
    ifscCode?: string;
  };
  adminNote?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StorePayoutSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'LocalStore', required: true },
    storeName: { type: String, required: true },
    requestedAmount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    netAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'rejected'],
      default: 'pending',
    },
    payoutMethod: { type: String, enum: ['upi', 'bank_transfer'], required: true },
    upiId: { type: String },
    bankDetails: {
      accountHolder: { type: String },
      accountNumber: { type: String },
      bankName: { type: String },
      ifscCode: { type: String },
    },
    adminNote: { type: String },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IStorePayout>('StorePayout', StorePayoutSchema);
