import express from 'express';
import {
  getRefundRequests,
  processManualRefund,
  updateRefundRequestStatus,
} from '../controllers/refundController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/', getRefundRequests);
router.post('/:id/process', processManualRefund);
router.patch('/:id/status', updateRefundRequestStatus);

export default router;
