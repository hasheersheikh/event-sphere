import mongoose, { Schema, Document } from 'mongoose';

interface IProduct {
  _id?: any;
  name: string;
  description?: string;
  price: number;
  discountPercent?: number;
  image?: string;
  isAvailable: boolean;
}

export interface ILocalStore extends Document {
  name: string;
  address: string;
  description?: string;
  photos: string[];
  category: string;
  products: IProduct[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, min: 0, max: 100, default: 0 },
  image: { type: String },
  isAvailable: { type: Boolean, default: true },
});

const LocalStoreSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    description: { type: String },
    photos: [{ type: String }],
    category: { type: String, default: 'General' },
    products: [ProductSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ILocalStore>('LocalStore', LocalStoreSchema);
