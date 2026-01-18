import express from 'express';
import {
  createBooking,
  getMyBookings,
  getEventBookings,
  checkInBooking,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/').post(protect, createBooking).get(protect, getMyBookings);

router.route('/:id/check-in').patch(protect, authorize('event_manager', 'admin'), checkInBooking);

router.route('/event/:eventId').get(protect, authorize('event_manager', 'admin'), getEventBookings);

export default router;
