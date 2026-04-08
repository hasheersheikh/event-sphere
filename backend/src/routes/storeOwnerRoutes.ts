import express from 'express';
import { createStoreOwner, loginStoreOwner, getStoreOwners, deleteStoreOwner } from '../controllers/storeOwnerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginStoreOwner);
router.post('/create', protect, authorize('admin'), createStoreOwner);
router.get('/store/:storeId', protect, authorize('admin'), getStoreOwners);
router.delete('/:id', protect, authorize('admin'), deleteStoreOwner);

export default router;
