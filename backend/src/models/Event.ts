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

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  time: string;
  endTime?: string;
  days?: IEventDay[];
  isMultiDay?: boolean;
  location: {
    address: string;
    venueName?: string;
    googleMapUrl?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  category: string;
  image?: string;
  videoUrl?: string;
  reels?: string[];
  creator: mongoose.Types.ObjectId;
  ticketTypes: ITicketType[];
  vouchers?: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountAmount: number;
    isActive: boolean;
  }[];
  status: 'draft' | 'published' | 'cancelled' | 'blocked' | 'past';
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    endTime: { type: String },
    isMultiDay: { type: Boolean, default: false },
    days: [
      {
        date: { type: Date, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String },
        title: { type: String },
      },
    ],
    location: {
      address: { type: String, required: true },
      venueName: { type: String },
      googleMapUrl: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    category: { type: String, required: true },
    image: { type: String },
    videoUrl: { type: String },
    reels: [{ type: String }],
    creator: { type: Schema.Types.ObjectId, ref: 'EventManager', required: true },
    ticketTypes: [
      {
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        dayWisePrices: [
          {
            dayIndex: { type: Number },
            price: { type: Number },
          },
        ],
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
    vouchers: [
      {
        code: { type: String, required: true },
        discountType: {
          type: String,
          enum: ['percentage', 'fixed'],
          default: 'percentage',
        },
        discountAmount: { type: Number, required: true },
        isActive: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IEvent>('Event', EventSchema);
