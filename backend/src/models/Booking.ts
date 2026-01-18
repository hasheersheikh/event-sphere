import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  tickets: {
    type: string;
    quantity: number;
    price: number;
    checkedInCount?: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'expired';
  paymentId?: string;
  reminderSent: boolean;
  reviewEmailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    tickets: [
      {
        type: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        checkedInCount: { type: Number, default: 0 },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'refunded', 'expired'],
      default: 'confirmed',
    },
    paymentId: { type: String },
    reminderSent: { type: Boolean, default: false },
    reviewEmailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>('Booking', BookingSchema);
