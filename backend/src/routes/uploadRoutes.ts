import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/auth.js';
import { uploadToCloudinary } from '../utils/cloudinaryService.js';

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
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (_req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'));
  }
};

const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

const getBaseUrl = () => process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`;

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
      res.json({ url });
    } else {
      res.json({ url: `${getBaseUrl()}/uploads/${req.file.filename}` });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error });
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
      res.json({ url });
    } else {
      res.json({ url: `${getBaseUrl()}/uploads/${req.file.filename}` });
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
      res.json({ urls });
    } else {
      res.json({ urls: files.map(f => `${getBaseUrl()}/uploads/${f.filename}`) });
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
      res.json({
        url,
        warning: 'Video should be in Instagram photo aspect ratio (4:5 portrait). Videos in other aspect ratios will be cropped.'
      });
    } else {
      res.json({
        url: `${getBaseUrl()}/uploads/${req.file.filename}`,
        warning: 'Video should be in Instagram photo aspect ratio (4:5 portrait). Videos in other aspect ratios will be cropped.'
      });
    }
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ message: 'Video upload failed', error });
  }
});

export default router;
