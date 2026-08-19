import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect, AuthRequest } from '../middleware/auth.js';
import { uploadToCloudinary } from '../utils/cloudinaryService.js';
import Upload from '../models/Upload.js';
import { uploadKeyFromUrl, deleteUnusedUploads } from '../utils/orphanUploads.js';

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    // Sanitize: only allow alphanumeric, hyphen, underscore, dot in original name,
    // then append unique prefix with safe extension
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
    const safeExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.mov', '.webm', '.avi'];
    const finalExt = safeExts.includes(ext) ? ext : '.bin'; // fallback if suspicious
    cb(null, `${unique}${finalExt}`);
  },
});

const fileFilter = (_req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Whitelist of safe extensions — don't trust client-supplied mimetype
  const ext = path.extname(file.originalname).toLowerCase();
  const safeExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.mov', '.webm', '.avi'];
  if (!safeExts.includes(ext)) {
    cb(new Error(`File type ${ext} is not allowed. Allowed: ${safeExts.join(', ')}`));
    return;
  }
  // Still check mimetype as a basic sanity check (though it can be spoofed)
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'));
  }
};

// Largest legitimate use case is the hero video spec (20MB, see frontend
// uploadSpecs.ts) — capped a bit above that, well below the old 50MB, to
// keep the VPS's limited disk from filling up with oversized uploads.
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

// BACKEND_URL is an explicit override; otherwise derive the public-facing origin
// from the request itself (Caddy sets X-Forwarded-Proto/Host and Express trusts
// it via `trust proxy`), so this works on any domain without per-deploy config.
const getBaseUrl = (req: express.Request) =>
  process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;

// Record every stored file in the Upload ledger so abandoned uploads can be
// identified and cleaned up later (orphanUploads.ts).
const recordUpload = async (url: string, req: AuthRequest) => {
  const key = uploadKeyFromUrl(url);
  if (!key || !req.user?._id) return;
  try {
    await Upload.create({ url, key, uploader: req.user._id });
  } catch (err) {
    // Ledger failure must not fail the upload itself
    console.error('Failed to record upload in ledger:', err);
  }
};

// Explicit opt-in — CLOUDINARY_ENABLED defaults to false, so Cloudinary is only
// used when someone deliberately turns it on, even if leftover keys are present.
const isCloudinaryConfigured = () => {
  if (process.env.CLOUDINARY_ENABLED !== 'true') return false;
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
};

// Base upload route (same as /single)
router.post('/', protect, upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  try {
    if (isCloudinaryConfigured()) {
      const url = await uploadToCloudinary(req.file.path);
      // Delete local file after upload to Cloudinary
      fs.unlinkSync(req.file.path);
      await recordUpload(url, req);
      res.json({ url });
    } else {
      const url = `${getBaseUrl(req)}/uploads/${req.file.filename}`;
      await recordUpload(url, req);
      res.json({ url });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error });
  }
});

// Delete uploads that ended up unused, e.g. a banner uploaded at step 1 of
// the event wizard for an event that was never submitted. Only deletes files
// the caller uploaded (per the ledger) that nothing references.
router.delete('/unused', protect, async (req: AuthRequest, res) => {
  const urls: unknown = req.body?.urls;
  if (!Array.isArray(urls) || urls.length === 0 || urls.length > 50 || !urls.every((u) => typeof u === 'string')) {
    res.status(400).json({ message: 'Provide urls as an array of strings (max 50)' });
    return;
  }
  try {
    const deleted = await deleteUnusedUploads(urls as string[], String(req.user?._id));
    res.json({ deleted });
  } catch (error) {
    console.error('Unused-upload cleanup failed:', error);
    res.status(500).json({ message: 'Cleanup failed', error });
  }
});

// Single image upload
router.post('/single', protect, upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  try {
    if (isCloudinaryConfigured()) {
      const url = await uploadToCloudinary(req.file.path);
      fs.unlinkSync(req.file.path);
      await recordUpload(url, req);
      res.json({ url });
    } else {
      const url = `${getBaseUrl(req)}/uploads/${req.file.filename}`;
      await recordUpload(url, req);
      res.json({ url });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error });
  }
});

// Multiple images upload (max 5)
router.post('/multiple', protect, upload.array('files', 5), async (req, res) => {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) {
    res.status(400).json({ message: 'No files uploaded' });
    return;
  }

  try {
    if (isCloudinaryConfigured()) {
      const urls = await Promise.all(files.map(async (file) => {
        const url = await uploadToCloudinary(file.path);
        fs.unlinkSync(file.path);
        return url;
      }));
      await Promise.all(urls.map((url) => recordUpload(url, req)));
      res.json({ urls });
    } else {
      const urls = files.map(f => `${getBaseUrl(req)}/uploads/${f.filename}`);
      await Promise.all(urls.map((url) => recordUpload(url, req)));
      res.json({ urls });
    }
  } catch (error) {
    console.error('Multi-upload error:', error);
    res.status(500).json({ message: 'Upload failed', error });
  }
});

// Event video upload (4MB limit, with aspect ratio warning)
const videoUpload = multer({
  storage,
  fileFilter: (_req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!file.mimetype.startsWith('video/')) {
      cb(new Error('Only video files are allowed'));
    } else {
      cb(null, true);
    }
  },
  limits: { fileSize: 4 * 1024 * 1024 } // 4MB limit
});

router.post('/event-video', protect, videoUpload.single('video'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'No video uploaded' });
    return;
  }

  try {
    if (isCloudinaryConfigured()) {
      const url = await uploadToCloudinary(req.file.path, 'event-sphere/videos');
      fs.unlinkSync(req.file.path);
      await recordUpload(url, req);
      res.json({
        url,
        warning: 'Video should be in Instagram photo aspect ratio (4:5 portrait). Videos in other aspect ratios will be cropped.'
      });
    } else {
      const url = `${getBaseUrl(req)}/uploads/${req.file.filename}`;
      await recordUpload(url, req);
      res.json({
        url,
        warning: 'Video should be in Instagram photo aspect ratio (4:5 portrait). Videos in other aspect ratios will be cropped.'
      });
    }
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ message: 'Video upload failed', error });
  }
});

export default router;
