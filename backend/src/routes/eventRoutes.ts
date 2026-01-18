import express from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
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

export default router;
