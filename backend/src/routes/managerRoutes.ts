import express from 'express';
import { getManagerStats, getManagerEventAnalytics } from '../controllers/managerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('event_manager', 'admin'));

router.get('/stats', getManagerStats);
router.get('/events/:id/analytics', getManagerEventAnalytics);

export default router;
