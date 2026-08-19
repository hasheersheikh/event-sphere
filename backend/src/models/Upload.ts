import mongoose, { Document, Schema } from 'mongoose';

/**
 * Ledger of every file stored via the /api/upload routes.
 *
 * The event wizard uploads media at step 1, but the event document that
 * would reference it may never be created (user abandons the form, refreshes,
 * navigates away). Without this ledger those files live on disk forever.
 * Each upload gets a row here so that:
 *  - DELETE /api/upload/unused can verify the caller actually owns a file
 *    before deleting it, and
 *  - the orphan sweep cron can find uploads that were never referenced by
 *    any document and delete them after a grace period.
 */
export interface IUpload extends Document {
  /** Full URL exactly as returned to the client at upload time. */
  url: string;
  /**
   * Domain-independent asset identifier — the local filename or the
   * Cloudinary path. Reference checks match on this, not the full URL,
   * because BACKEND_URL is derived from the request host and can change
   * between deploys.
   */
  key: string;
  uploader: mongoose.Types.ObjectId;
  createdAt: Date;
}

const UploadSchema: Schema = new Schema(
  {
    url: { type: String, required: true, index: true },
    key: { type: String, required: true, index: true },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IUpload>('Upload', UploadSchema);
