import mongoose, { Schema, Document } from 'mongoose';

export interface ITrendingVenue extends Document {
  name: string;
  location: string;
  description?: string;
  image?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TrendingVenueSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITrendingVenue>('TrendingVenue', TrendingVenueSchema);
