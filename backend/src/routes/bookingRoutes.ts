import express from 'express';
import {
  createBooking,
  getMyBookings,
  getEventBookings,
  checkInBooking,
  issueOfflineTicket,
  cancelBooking,
  selfCancelBooking,
  getTaxRate,
  downloadTicket,
} from '../controllers/bookingController.js';
import { protect, authorize, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').post(optionalProtect, createBooking).get(protect, getMyBookings);

router.route('/tax-rate').get(getTaxRate);

router.route('/offline').post(protect, authorize('event_manager', 'admin'), issueOfflineTicket);

router.route('/:id/check-in').patch(protect, authorize('event_manager', 'admin'), checkInBooking);
router.route('/:id/cancel').patch(protect, authorize('event_manager', 'admin'), cancelBooking);
// User self-service cancellation (ownership + time-window rules enforced in controller)
router.route('/:id/self-cancel').patch(protect, selfCancelBooking);

// Ticket PDF download — booking owner, event manager, admin, or holder of the
// booking's signed download token (guest buyers). optionalProtect: guests
// authenticate via ?token= instead of a session.
router.route('/:id/ticket').get(optionalProtect, downloadTicket);

router.route('/event/:eventId').get(protect, authorize('event_manager', 'admin'), getEventBookings);

export default router;
