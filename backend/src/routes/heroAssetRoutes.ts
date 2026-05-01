import express from 'express';
import { 
  getHeroAssets, 
  getAllHeroAssets, 
  createHeroAsset, 
  updateHeroAsset, 
  deleteHeroAsset 
} from '../controllers/heroAssetController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route to fetch active assets for the home page
router.get('/', getHeroAssets);

// Admin only routes for managing assets
router.get('/all', protect, authorize('admin'), getAllHeroAssets);
router.post('/', protect, authorize('admin'), createHeroAsset);
router.put('/:id', protect, authorize('admin'), updateHeroAsset);
router.delete('/:id', protect, authorize('admin'), deleteHeroAsset);

export default router;
