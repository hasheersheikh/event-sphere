import express from 'express';
import { getAllUsers, approveManager, getAdminStats, getAnalytics } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.patch('/users/:id/approve', approveManager);
router.get('/stats', getAdminStats);
router.get('/analytics', getAnalytics);

export default router;
