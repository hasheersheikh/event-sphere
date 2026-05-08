import express from 'express';
import { 
  getInfluencers, 
  adminGetInfluencers, 
  createInfluencer, 
  updateInfluencer, 
  deleteInfluencer 
} from '../controllers/influencerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/', getInfluencers);

// Admin only routes
router.get('/admin', protect, authorize('admin'), adminGetInfluencers);
router.post('/', protect, authorize('admin'), createInfluencer);
router.patch('/:id', protect, authorize('admin'), updateInfluencer);
router.delete('/:id', protect, authorize('admin'), deleteInfluencer);

export default router;
