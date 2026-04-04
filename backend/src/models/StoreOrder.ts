import mongoose, { Schema, Document } from 'mongoose';

interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  discountPercent: number;
  quantity: number;
  image?: string;
}

export interface IStoreOrder extends Document {
  storeId: mongoose.Types.ObjectId;
  storeName: string;
  storeEmail?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  userId?: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  paymentMethod: 'cod' | 'online';
  paymentId?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const StoreOrderSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'LocalStore', required: true },
    storeName: { type: String, required: true },
    storeEmail: { type: String },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        discountPercent: { type: Number, default: 0 },
        quantity: { type: Number, required: true },
        image: { type: String },
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['cod', 'online'],
      default: 'cod',
    },
    paymentId: { type: String },
    notes: { type: String },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IStoreOrder>('StoreOrder', StoreOrderSchema);
