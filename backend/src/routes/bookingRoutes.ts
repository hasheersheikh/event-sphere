import express from 'express';
import {
  createBooking,
  getMyBookings,
  getEventBookings,
  checkInBooking,
  issueOfflineTicket,
} from '../controllers/bookingController.js';
import { protect, authorize, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').post(optionalProtect, createBooking).get(protect, getMyBookings);

router.route('/offline').post(protect, authorize('event_manager', 'admin'), issueOfflineTicket);

router.route('/:id/check-in').patch(protect, authorize('event_manager', 'admin'), checkInBooking);

router.route('/event/:eventId').get(protect, authorize('event_manager', 'admin'), getEventBookings);

export default router;
