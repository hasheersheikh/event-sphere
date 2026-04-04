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
  // Contact & Info
  contactEmail?: string;
  contactPhone?: string;
  whatsapp?: string;
  openingHours?: string;
  googleMapUrl?: string;
  // Payment
  paymentMethods: string[];
  upiId?: string;
  bankDetails?: {
    accountHolder?: string;
    accountNumber?: string;
    bankName?: string;
    ifscCode?: string;
  };
  // Social
  instagram?: string;
  facebook?: string;
  website?: string;
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
    contactEmail: { type: String },
    contactPhone: { type: String },
    whatsapp: { type: String },
    openingHours: { type: String },
    googleMapUrl: { type: String },
    paymentMethods: [{ type: String }],
    upiId: { type: String },
    bankDetails: {
      accountHolder: { type: String },
      accountNumber: { type: String },
      bankName: { type: String },
      ifscCode: { type: String },
    },
    instagram: { type: String },
    facebook: { type: String },
    website: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ILocalStore>('LocalStore', LocalStoreSchema);
