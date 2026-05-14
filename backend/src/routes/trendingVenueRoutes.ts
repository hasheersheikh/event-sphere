import express from 'express';
import { 
  getTrendingVenues, 
  getAllTrendingVenues, 
  createTrendingVenue, 
  updateTrendingVenue, 
  deleteTrendingVenue 
} from '../controllers/trendingVenueController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route to fetch active trending venues
router.get('/', getTrendingVenues);

// Admin only routes for management
router.get('/all', protect, authorize('admin'), getAllTrendingVenues);
router.post('/', protect, authorize('admin'), createTrendingVenue);
router.put('/:id', protect, authorize('admin'), updateTrendingVenue);
router.delete('/:id', protect, authorize('admin'), deleteTrendingVenue);

export default router;
