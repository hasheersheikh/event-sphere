import mongoose, { Schema, Document } from 'mongoose';

export interface IShowcaseVideo extends Document {
  platform: 'instagram' | 'youtube';
  videoId: string;
  label?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ShowcaseVideoSchema: Schema = new Schema(
  {
    platform: { type: String, enum: ['instagram', 'youtube'], required: true },
    videoId: { type: String, required: true, trim: true },
    label: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IShowcaseVideo>('ShowcaseVideo', ShowcaseVideoSchema);
