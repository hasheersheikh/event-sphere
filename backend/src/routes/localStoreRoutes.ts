import express from 'express';
import {
  getLocalStores,
  getLocalStore,
  createLocalStore,
  updateLocalStore,
  deleteLocalStore,
  addProduct,
  removeProduct,
  getAllLocalStores,
  toggleStoreStatus,
} from '../controllers/localStoreController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getLocalStores);

// Admin-only: GET /admin/all must be before /:id to avoid conflict
router.get('/admin/all', protect, authorize('admin'), getAllLocalStores);

// Public: single store by id
router.get('/:id', getLocalStore);

// Admin-only mutation routes
router.post('/', protect, authorize('admin'), createLocalStore);
router.put('/:id', protect, authorize('admin'), updateLocalStore);
router.delete('/:id', protect, authorize('admin'), deleteLocalStore);
router.patch('/:id/toggle', protect, authorize('admin'), toggleStoreStatus);
router.post('/:id/products', protect, authorize('admin'), addProduct);
router.delete('/:id/products/:productId', protect, authorize('admin'), removeProduct);

export default router;
