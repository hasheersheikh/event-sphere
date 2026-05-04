import express from 'express';
import { 
  getManagerStats, 
  getManagerAnalytics,
  getManagerEventAnalytics,
  updatePayoutDetails,
  getPayoutDetails,
  addVolunteer,
  getVolunteersByEvent,
  removeVolunteer,
  getManagerPayouts,
  requestMarketingBoost
} from '../controllers/managerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('event_manager', 'admin'));

router.get('/stats', getManagerStats);
router.get('/analytics', getManagerAnalytics);
router.get('/events/:id/analytics', getManagerEventAnalytics);

// Payout Details
router.get('/payout-details', getPayoutDetails);
router.patch('/payout-details', updatePayoutDetails);

// Volunteer Management
router.post('/volunteers', addVolunteer);
router.get('/events/:eventId/volunteers', getVolunteersByEvent);
router.delete('/volunteers/:id', removeVolunteer);
router.get('/payouts', getManagerPayouts);
router.post('/marketing-boost', requestMarketingBoost);

export default router;
