import mongoose, { Schema, Document } from 'mongoose';

export interface IStoreOwner extends Document {
  name: string;
  email: string;
  password: string;
  storeId: mongoose.Types.ObjectId;
  role: 'store_owner';
  createdAt: Date;
  updatedAt: Date;
}

const StoreOwnerSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'LocalStore', required: true },
    role: { type: String, default: 'store_owner' },
  },
  { timestamps: true }
);

export default mongoose.model<IStoreOwner>('StoreOwner', StoreOwnerSchema);
