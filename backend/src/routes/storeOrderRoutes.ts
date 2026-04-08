import express from 'express';
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus, getStoreOwnerOrders } from '../controllers/storeOrderController.js';
import { protect, optionalProtect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', optionalProtect, createOrder); // guest or logged-in — userId attached if logged in
router.get('/my', protect, getMyOrders); // logged-in user (customer)
router.get('/admin', protect, authorize('admin'), getAllOrders); // admin
router.get('/owner', protect, authorize('store_owner'), getStoreOwnerOrders); // store owner
router.patch('/:id/status', protect, authorize('admin', 'store_owner'), updateOrderStatus);

export default router;
