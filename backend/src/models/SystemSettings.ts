import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
  taxRate: number;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SystemSettingsSchema: Schema = new Schema(
  {
    taxRate: { type: Number, default: 0, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

export default mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);
