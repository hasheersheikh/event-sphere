import express from 'express';
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus } from '../controllers/storeOrderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', createOrder); // public — guest or logged-in
router.get('/my', protect, getMyOrders); // logged-in user
router.get('/admin', protect, authorize('admin'), getAllOrders); // admin
router.patch('/:id/status', protect, authorize('admin'), updateOrderStatus); // admin

export default router;
