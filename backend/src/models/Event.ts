import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketType {
  name: string;
  description?: string;
  price: number;
  dayWisePrices?: { dayIndex: number; price: number }[];
  isFullPass?: boolean;
  fullPassPrice?: number;
  capacity: number;
  sold: number;
  isSoldOut?: boolean;
}

export interface IEventDay {
  date: Date;
  startTime: string;
  endTime?: string;
  title?: string;
}

/** A single time-slot within a multi-slot event (same calendar day). */
export interface ISlot {
  startTime: string;    // "14:00"
  endTime?: string;     // "15:30"
  label?: string;       // "Afternoon Show"
  capacity?: number;    // per-slot seat cap (null = use ticket-type capacity)
  sold?: number;
  isSoldOut?: boolean;
}

/**
 * RRULE-inspired recurrence descriptor.
 * frequency='daily'  → repeats every day (or on daysOfWeek if set).
 * frequency='weekly' → repeats on the selected days each week.
 * endDate absent     → infinite recurrence.
 * exceptions         → specific UTC dates to skip.
 */
export interface IRecurrence {
  frequency: 'daily' | 'weekly';
  daysOfWeek?: number[];   // 0=Sun … 6=Sat
  endDate?: Date;
  isActive: boolean;
  exceptions?: Date[];
}

export interface IEvent extends Document {
  title: string;
  description: string;
  /**
   * scheduleType controls how the event's timing is interpreted:
   *  'single'     – single date + time  (legacy default)
   *  'multi_slot' – same date, N time-slots (slots[])
   *  'recurring'  – repeating via recurrence rule
   *  'multi_day'  – explicit list of dates (days[])
   */
  scheduleType: 'single' | 'multi_slot' | 'recurring' | 'multi_day';
  date: Date;
  time: string;
  endTime?: string;
  slots?: ISlot[];
  recurrence?: IRecurrence;
  days?: IEventDay[];
  isMultiDay?: boolean;
  city?: string;
  location: {
    address: string;
    venueName?: string;
    googleMapUrl?: string;
    coordinates?: { lat: number; lng: number };
  };
  category: string;
  image?: string;
  videoUrl?: string;
  reels?: string[];
  creator: mongoose.Types.ObjectId;
  coordinator?: {
    name: string;
    phone: string;
  };
  ticketTypes: ITicketType[];
  vouchers?: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountAmount: number;
    isActive: boolean;
  }[];
  status: 'draft' | 'under_review' | 'published' | 'cancelled' | 'blocked' | 'past';
  isApproved: boolean;
  isSponsored: boolean;
  viewCount?: number;
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean;
  nextOccurrence?: Date;
}

const EventSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    scheduleType: {
      type: String,
      enum: ['single', 'multi_slot', 'recurring', 'multi_day'],
      default: 'single',
    },
    date: { type: Date, required: true },
    time: { type: String },
    endTime: { type: String },

    // ── Multi-slot: multiple shows on the same day ──────────────────────────
    slots: [
      {
        startTime: { type: String, required: true },
        endTime: { type: String },
        label: { type: String },
        capacity: { type: Number },
        sold: { type: Number, default: 0 },
        isSoldOut: { type: Boolean, default: false },
      },
    ],

    // ── Recurring ────────────────────────────────────────────────────────────
    recurrence: {
      frequency: { type: String, enum: ['daily', 'weekly'] },
      daysOfWeek: [{ type: Number }],
      endDate: { type: Date },
      isActive: { type: Boolean, default: true },
      exceptions: [{ type: Date }],
    },

    // ── Multi-day: arbitrary date list ───────────────────────────────────────
    isMultiDay: { type: Boolean, default: false },
    days: [
      {
        date: { type: Date, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String },
        title: { type: String },
      },
    ],

    city: { type: String, index: true },
    location: {
      address: { type: String, required: true },
      venueName: { type: String },
      googleMapUrl: { type: String },
      coordinates: { lat: { type: Number }, lng: { type: Number } },
    },
    category: { type: String, required: true },
    image: { type: String },
    videoUrl: { type: String },
    reels: [{ type: String }],
    ageRestriction: { type: String, default: "All Ages" },
    creator: { type: Schema.Types.ObjectId, ref: 'EventManager', required: true },
    coordinator: {
      name: { type: String },
      phone: { type: String },
    },
    ticketTypes: [
      {
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        dayWisePrices: [{ dayIndex: { type: Number }, price: { type: Number } }],
        isFullPass: { type: Boolean, default: false },
        fullPassPrice: { type: Number },
        capacity: { type: Number, required: true },
        sold: { type: Number, default: 0 },
        isSoldOut: { type: Boolean, default: false },
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'under_review', 'published', 'cancelled', 'blocked', 'past'],
      default: 'under_review',
    },
    isApproved: { type: Boolean, default: false },
    isSponsored: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    vouchers: [
      {
        code: { type: String, required: true },
        discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
        discountAmount: { type: Number, required: true },
        isActive: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IEvent>('Event', EventSchema);
