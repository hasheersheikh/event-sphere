import express from 'express';
import {
  getAllUsers,
  getAdminStats,
  getAnalytics,
  getAttendees,
  deleteAttendee,
  getManagers, 
  getManagerDetail,
  getPendingEvents,
  approveEvent,
  declineEvent,
  getAllAdminEvents,
  getEventInsights,
  processEventPayout,
  processPayout,
  deleteManager,
  updateManagerCommission,
  deleteEvent,
  toggleSponsoredEvent,
  getAllVolunteers,
  adminAddVolunteer,
  adminRemoveVolunteer,
  getSystemSettings,
  updateSystemSettings
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.get('/attendees', getAttendees);
router.delete('/attendees/:id', deleteAttendee);
router.get('/managers', getManagers);
router.get('/managers/:id', getManagerDetail);
router.post('/managers/:id/payout', processPayout);
router.post('/payout/events/:eventId', processEventPayout);
router.patch('/managers/:id/commission', updateManagerCommission);
router.delete('/managers/:id', deleteManager);
router.get('/events/all', getAllAdminEvents);
router.get('/events/pending', getPendingEvents);
router.get('/events/:id/insights', getEventInsights);
router.patch('/events/:id/approve', approveEvent);
router.patch('/events/:id/decline', declineEvent);
router.patch('/events/:id/toggle-sponsored', toggleSponsoredEvent);
router.delete('/events/:id', deleteEvent);
router.get('/stats', getAdminStats);
router.get('/analytics', getAnalytics);

// Platform Global Settings
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

// Volunteer Management (Global)
router.get('/volunteers', getAllVolunteers);
router.post('/volunteers', adminAddVolunteer);
router.delete('/volunteers/:id', adminRemoveVolunteer);

export default router;
