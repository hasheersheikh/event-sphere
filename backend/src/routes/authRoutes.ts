import express from 'express';
import { register, login, getMe, forgotPassword, resetPassword, updateProfile, changePassword, googleAuth } from '../controllers/authController.js';
import { sendOtp, verifyOtp, sendRegistrationOtp, verifyRegistrationOtp } from '../controllers/otpController.js';
import { protect } from '../middleware/auth.js';

console.log('Loading Auth Routes...');

const router = express.Router();

router.post('/register', register);
router.post('/register/send-otp', sendRegistrationOtp);
router.post('/register/verify-otp', verifyRegistrationOtp);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);

export default router;
