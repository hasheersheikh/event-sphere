import express from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  applyVoucher,
  toggleTicketSoldOut,
  stopRecurrence,
  addRecurrenceException,
} from '../controllers/eventController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getEvents).post(protect, authorize('event_manager', 'admin'), createEvent);
router.route('/my').get(protect, authorize('event_manager', 'admin'), getMyEvents);

router
  .route('/:id')
  .get(getEventById)
  .put(protect, authorize('event_manager', 'admin'), updateEvent)
  .delete(protect, authorize('event_manager', 'admin'), deleteEvent);

router.post('/:id/vouchers/apply', applyVoucher);
router.patch('/:id/ticket-types/:ticketIndex/toggle-sold-out', protect, authorize('event_manager', 'admin'), toggleTicketSoldOut);

// Recurrence management
router.patch('/:id/recurrence/stop', protect, authorize('event_manager', 'admin'), stopRecurrence);
router.post('/:id/recurrence/exceptions', protect, authorize('event_manager', 'admin'), addRecurrenceException);

export default router;
