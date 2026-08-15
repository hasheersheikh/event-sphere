	import { v2 as cloudinary } from 'cloudinary';
	import path from 'path';
	import fs from 'fs';

	cloudinary.config({
	  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	  api_key: process.env.CLOUDINARY_API_KEY,
	  api_secret: process.env.CLOUDINARY_API_SECRET,
	  secure: true,
	});

	const uploadsDir = path.resolve(process.cwd(), 'uploads');

	const extractCloudinaryPublicId = (url: string) => {
	  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
	  return match ? match[1] : null;
	};

	const isCloudinaryUrl = (url: string) => url.includes('res.cloudinary.com');

	const isLocalUploadUrl = (url: string) => url.includes('/uploads/');

	const deleteLocalFile = (url: string) => {
	  // Extract only the final filename component and sanitize to prevent path traversal
	  const rawFilename = url.split('/uploads/').pop();
	  if (!rawFilename) return;

	  // Strip any path separators or parent directory references — admin-set URLs
	  // can be arbitrary strings, so we must not trust them blindly.
	  const safeFilename = path.basename(rawFilename).replace(/[/\\]/g, '');
	  if (!safeFilename) return;

	  const filePath = path.join(uploadsDir, safeFilename);
	  const resolvedPath = path.resolve(filePath);

	  // Verify the resolved path is still within uploadsDir — prevent ../ escapes
	  if (!resolvedPath.startsWith(path.resolve(uploadsDir))) {
		console.error(`Path traversal attempt blocked: ${url} -> ${resolvedPath}`);
		return;
	  }

	  if (fs.existsSync(resolvedPath)) {
		fs.unlinkSync(resolvedPath);
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

	export const uploadToCloudinary = async (
	  filePath: string,
	  folder?: string
	): Promise<string> => {
	  if (!process.env.CLOUDINARY_CLOUD_NAME) {
		throw new Error('CLOUDINARY_CLOUD_NAME not configured');
	  }
	  const result = await cloudinary.uploader.upload(filePath, {
		folder: folder || 'event-sphere',
		resource_type: 'auto',
	  });
	  return result.secure_url;
	};
