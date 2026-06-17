import express from 'express';
import {
  getShowcaseVideos,
  getAllShowcaseVideos,
  createShowcaseVideo,
  updateShowcaseVideo,
  deleteShowcaseVideo,
} from '../controllers/showcaseVideoController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getShowcaseVideos);
router.get('/all', protect, authorize('admin'), getAllShowcaseVideos);
router.post('/', protect, authorize('admin'), createShowcaseVideo);
router.put('/:id', protect, authorize('admin'), updateShowcaseVideo);
router.delete('/:id', protect, authorize('admin'), deleteShowcaseVideo);

export default router;
