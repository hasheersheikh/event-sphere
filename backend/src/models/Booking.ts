import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  tickets: {
    type: string;
    quantity: number;
    price: number;
    selectedDays?: number[];
    isFullPass?: boolean;
    checkedInCount?: number;
  }[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  email: string;
  phoneNumber: string;
  contactName?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'expired';
  paymentId?: string;
  isOffline?: boolean;
  offlineNote?: string;
  reminderSent: boolean;
  reviewEmailSent: boolean;
  /** Set exactly once by the user self-cancel claim — idempotency + audit trail. */
  selfCancel?: {
    claimedAt: Date;
    /** 'initiated' is the crash-recovery sentinel (reconciled by cron). */
    refundStatus: 'initiated' | 'succeeded' | 'failed' | 'not_required';
    refundId?: string; // Razorpay rfnd_...
    refundAmount?: number;
    failureReason?: string;
    source?: string; // 'user'
  };
  /** Ticket-email delivery tracking. Absent on bookings created before this
   *  field existed — the retry sweep deliberately skips those (no delivery
   *  record means we can't tell success from failure, and re-sending would
   *  duplicate tickets for buyers who already got theirs). */
  ticketEmail?: {
    /** pending → sent (provider accepted) → delivered (webhook-confirmed).
     *  'bounced' stops retries; 'failed' retries hourly until the attempt cap. */
    status: 'pending' | 'sent' | 'delivered' | 'bounced' | 'failed';
    messageId?: string; // Resend email id / MSG91 id — webhook correlation
    attempts?: number;
    lastAttemptAt?: Date;
    lastStatusAt?: Date;
    failureReason?: string;
    nextRetryAt?: Date;
  };
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
        selectedDays: [{ type: Number }],
        isFullPass: { type: Boolean, default: false },
        checkedInCount: { type: Number, default: 0 },
      },
    ],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    contactName: { type: String },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'refunded', 'expired'],
      default: 'confirmed',
    },
    paymentId: { type: String },
    isOffline: { type: Boolean, default: false },
    offlineNote: { type: String },
    reminderSent: { type: Boolean, default: false },
    reviewEmailSent: { type: Boolean, default: false },
    selfCancel: {
      // No `required` on inner fields — Mongoose fires nested-path validation
      // on every create even when selfCancel is absent. Completeness is
      // guaranteed by the atomic claim in selfCancelBooking instead.
      claimedAt: { type: Date },
      refundStatus: {
        type: String,
        enum: ['initiated', 'succeeded', 'failed', 'not_required'],
      },
      refundId: { type: String },
      refundAmount: { type: Number },
      failureReason: { type: String },
      source: { type: String },
    },
    ticketEmail: {
      // Same no-required convention as selfCancel. Only written by
      // ticketEmailDelivery — its presence is what opts a booking into the
      // hourly retry sweep (legacy bookings without it are skipped).
      status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'bounced', 'failed'],
      },
      messageId: { type: String },
      attempts: { type: Number },
      lastAttemptAt: { type: Date },
      lastStatusAt: { type: Date },
      failureReason: { type: String },
      nextRetryAt: { type: Date },
    },
  },
  { timestamps: true }
);

// "My bookings" and per-event capacity/attendee lookups are the hot queries.
BookingSchema.index({ user: 1, createdAt: -1 });
BookingSchema.index({ event: 1 });
// Hourly ticket-email retry sweep scans by delivery status + due time.
BookingSchema.index({ status: 1, 'ticketEmail.status': 1, 'ticketEmail.nextRetryAt': 1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);
