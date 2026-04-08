import express from 'express';
import {
  requestPayout,
  getMyPayouts,
  getAllPayouts,
  getStoreEarnings,
  updatePayoutStatus,
} from '../controllers/storePayoutController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('store_owner'), requestPayout);
router.get('/my', protect, authorize('store_owner'), getMyPayouts);
router.get('/admin', protect, authorize('admin'), getAllPayouts);
router.get('/admin/store/:storeId', protect, authorize('admin'), getStoreEarnings);
router.patch('/:id/status', protect, authorize('admin'), updatePayoutStatus);

export default router;
