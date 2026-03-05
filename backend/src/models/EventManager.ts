import mongoose, { Schema, Document } from 'mongoose';

export interface IEventManager extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'event_manager';
  isApproved: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EventManagerSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      default: 'event_manager',
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

export default mongoose.model<IEventManager>('EventManager', EventManagerSchema);
