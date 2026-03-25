import mongoose, { Schema, Document } from 'mongoose';

export interface IVolunteer extends Document {
  name: string;
  email: string;
  password?: string;
  event: mongoose.Types.ObjectId;
  manager: mongoose.Types.ObjectId;
  gate: string;
  role: 'volunteer';
  createdAt: Date;
  updatedAt: Date;
}

const VolunteerSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    manager: { type: Schema.Types.ObjectId, ref: 'EventManager', required: true },
    gate: { type: String, required: true },
    role: { type: String, default: 'volunteer' },
  },
  { timestamps: true }
);

export default mongoose.model<IVolunteer>('Volunteer', VolunteerSchema);
