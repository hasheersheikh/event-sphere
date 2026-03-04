import { Response, RequestHandler } from 'express';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import EventManager from '../models/EventManager.js';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAllUsers: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password');
    const managers = await EventManager.find().select('-password');
    res.json([...users, ...managers]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const approveManager: RequestHandler = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const user = await EventManager.findById(id);
    if (!user) {
      res.status(404).json({ message: 'Manager not found' });
      return;
    }
    user.isApproved = true;
    await user.save();
    res.json({ message: 'Manager approved successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAdminStats: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const customerCount = await User.countDocuments({});
    const managerCount = await EventManager.countDocuments({});
    const adminCount = await Admin.countDocuments({});
    const totalUsers = customerCount + managerCount + adminCount;
    const totalEvents = await Event.countDocuments({});
    const totalBookings = await Booking.countDocuments({});
    
    const bookings = await Booking.find({});
    const totalRevenue = bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);

    res.json({
      totalUsers,
      totalEvents,
      totalBookings,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
