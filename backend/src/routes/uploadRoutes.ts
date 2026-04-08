import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/auth.js';

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
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 4 * 1024 * 1024 } });

const getBaseUrl = () => process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`;

// Single image upload
router.post('/single', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }
  res.json({ url: `${getBaseUrl()}/uploads/${req.file.filename}` });
});

// Multiple images upload (max 5)
router.post('/multiple', protect, upload.array('files', 5), (req, res) => {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) {
    res.status(400).json({ message: 'No files uploaded' });
    return;
  }
  res.json({ urls: files.map(f => `${getBaseUrl()}/uploads/${f.filename}`) });
});

export default router;
