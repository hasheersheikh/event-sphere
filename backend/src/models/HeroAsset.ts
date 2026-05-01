import mongoose, { Schema, Document } from 'mongoose';

export interface IHeroAsset extends Document {
  type: 'image' | 'video';
  url: string;
  duration?: number;
  order: number;
  targetDevice: 'mobile' | 'desktop' | 'all';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HeroAssetSchema: Schema = new Schema(
  {
    type: { type: String, enum: ['image', 'video'], required: true },
    url: { type: String, required: true },
    duration: { type: Number, default: 5000 },
    order: { type: Number, default: 0 },
    targetDevice: { type: String, enum: ['mobile', 'desktop', 'all'], default: 'all' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IHeroAsset>('HeroAsset', HeroAssetSchema);
