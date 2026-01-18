import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketType {
  name: string;
  description?: string;
  price: number;
  capacity: number;
  sold: number;
}

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  time: string;
  endTime?: string;
  location: {
    address: string;
    venueName?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  category: string;
  image?: string;
  creator: mongoose.Types.ObjectId;
  ticketTypes: ITicketType[];
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
    location: {
      address: { type: String, required: true },
      venueName: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    category: { type: String, required: true },
    image: { type: String },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ticketTypes: [
      {
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        capacity: { type: Number, required: true },
        sold: { type: Number, default: 0 },
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'blocked', 'past'],
      default: 'published',
    },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IEvent>('Event', EventSchema);
