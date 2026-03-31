import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  role: 'user';
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phoneNumber: { type: String },
    password: { type: String, required: true },
    role: {
      type: String,
      default: 'user',
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
