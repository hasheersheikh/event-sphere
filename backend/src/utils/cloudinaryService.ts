import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '../../../uploads');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const extractCloudinaryPublicId = (url: string): string | null => {
  // Match: /upload/ then optional /v{digits}/ then capture public_id (with folders) minus extension
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
  return match ? match[1] : null;
};

const isCloudinaryUrl = (url: string) => url.includes('res.cloudinary.com');

const isLocalUploadUrl = (url: string) => url.includes('/uploads/');

const deleteLocalFile = (url: string) => {
  const filename = url.split('/uploads/').pop();
  if (!filename) return;
  const filePath = path.join(uploadsDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const deleteAsset = async (url: string): Promise<void> => {
  if (!url) return;
  try {
    if (isCloudinaryUrl(url)) {
      const publicId = extractCloudinaryPublicId(url);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    } else if (isLocalUploadUrl(url)) {
      deleteLocalFile(url);
    }
  } catch {
    // Non-blocking — log but don't fail the delete operation
    console.error(`Failed to delete asset: ${url}`);
  }
};

// Delete multiple assets (banner + reels) for an event
export const deleteEventAssets = async (imageUrl?: string, reels?: string[]): Promise<void> => {
  const tasks: Promise<void>[] = [];
  if (imageUrl) tasks.push(deleteAsset(imageUrl));
  if (reels?.length) reels.forEach(url => tasks.push(deleteAsset(url)));
  await Promise.allSettled(tasks);
};
