import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  status: 'draft' | 'published';
  isPublic: boolean;
  author: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, default: '' },
    coverImage: { type: String },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    isPublic: { type: Boolean, default: false },
    author: { type: String, default: 'Admin' },
    tags: [{ type: String }],
    metaTitle: { type: String },
    metaDescription: { type: String },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);


export default mongoose.model<IBlog>('Blog', BlogSchema);
