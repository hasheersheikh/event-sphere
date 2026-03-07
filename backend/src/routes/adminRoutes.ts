import express from 'express';
import { 
  getAllUsers, 
  approveManager, 
  getAdminStats, 
  getAnalytics, 
  getAttendees, 
  getManagers, 
  getManagerDetail,
  getPendingEvents,
  approveEvent,
  declineEvent,
  getAllAdminEvents,
  getEventInsights,
  processPayout,
  deleteManager,
  updateManagerCommission,
  deleteEvent,
  getAllVolunteers,
  adminAddVolunteer,
  adminRemoveVolunteer
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.get('/attendees', getAttendees);
router.get('/managers', getManagers);
router.get('/managers/:id', getManagerDetail);
router.post('/managers/:id/payout', processPayout);
router.patch('/managers/:id/commission', updateManagerCommission);
router.delete('/managers/:id', deleteManager);
router.get('/events/all', getAllAdminEvents);
router.get('/events/pending', getPendingEvents);
router.get('/events/:id/insights', getEventInsights);
router.patch('/events/:id/approve', approveEvent);
router.patch('/events/:id/decline', declineEvent);
router.delete('/events/:id', deleteEvent);
router.patch('/users/:id/approve', approveManager);
router.get('/stats', getAdminStats);
router.get('/analytics', getAnalytics);

// Volunteer Management (Global)
router.get('/volunteers', getAllVolunteers);
router.post('/volunteers', adminAddVolunteer);
router.delete('/volunteers/:id', adminRemoveVolunteer);

export default router;
