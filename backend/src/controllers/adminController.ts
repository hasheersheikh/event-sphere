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

import { sendManagerApprovalEmail } from '../utils/emailService.js';

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

    // Trigger Approval Email (Non-blocking)
    (async () => {
      try {
        await sendManagerApprovalEmail(user.email, user.name);
      } catch (err) {
        console.error('Failed to send manager approval email:', err);
      }
    })();

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

export const getAnalytics: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const totalTransactions = await Booking.countDocuments({});
    const bookings = await Booking.find({}).populate('event');
    
    // Aggregate Revenue
    const totalRevenue = bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    
    // Aggregate Tickets
    const totalTickets = bookings.reduce((acc, b) => {
      return acc + b.tickets.reduce((sum, t) => sum + t.quantity, 0);
    }, 0);

    const activeUsers = await User.countDocuments({});

    // Simple revenue history (last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const day = d.toISOString().split('T')[0];
      const amount = bookings
        .filter(b => b.createdAt.toISOString().split('T')[0] === day)
        .reduce((acc, b) => acc + (b.totalAmount || 0), 0);
      return { date: day.slice(5), amount };
    }).reverse();

    // Ticket distribution by category
    const categoryMap: { [key: string]: number } = {};
    bookings.forEach(b => {
      const event: any = b.event;
      if (event && event.category) {
        const count = b.tickets.reduce((sum, t) => sum + t.quantity, 0);
        categoryMap[event.category] = (categoryMap[event.category] || 0) + count;
      }
    });

    const ticketDistribution = Object.keys(categoryMap).map(name => ({
      name,
      count: categoryMap[name]
    }));

    res.json({
      totalRevenue,
      totalTickets,
      activeUsers,
      revenueHistory: last7Days,
      ticketDistribution
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
