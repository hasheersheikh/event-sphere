import express from 'express';
import { register, login, getMe, forgotPassword, resetPassword, updateProfile, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

console.log('Loading Auth Routes...');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);

export default router;
