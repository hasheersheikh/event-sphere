import express from 'express';
import {
  getPublicPosts, getPublicPost,
  adminGetAllPosts, adminGetPost, createPost, updatePost, deletePost,
} from '../controllers/blogController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public
router.get('/', getPublicPosts);
router.get('/:slug', getPublicPost);

// Admin
router.get('/admin/all', protect, authorize('admin'), adminGetAllPosts);
router.get('/admin/:id', protect, authorize('admin'), adminGetPost);
router.post('/', protect, authorize('admin'), createPost);
router.put('/:id', protect, authorize('admin'), updatePost);
router.delete('/:id', protect, authorize('admin'), deletePost);

export default router;
