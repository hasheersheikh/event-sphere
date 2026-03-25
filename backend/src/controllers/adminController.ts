import { Response, RequestHandler } from 'express';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import EventManager from '../models/EventManager.js';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import { AuthRequest } from '../middleware/auth.js';
import Payout from '../models/Payout.js';
import Volunteer from '../models/Volunteer.js';
import Settlement from '../models/Payout.js'; // Assuming Payout and Settlement were used interchangeably or checking models

export const getAttendees: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getManagers: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const managers = await EventManager.find().select('-password').sort({ createdAt: -1 });
    res.json(managers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getManagerDetail: RequestHandler = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const manager = await EventManager.findById(id).select('-password');
    if (!manager) {
      res.status(404).json({ message: 'Manager not found' });
      return;
    }

    const events = await Event.find({ creator: id }).sort({ date: -1 });
    const eventIds = events.map(e => e._id);
    
    const bookings = await Booking.find({ 
      event: { $in: eventIds },
      status: 'confirmed'
    });

    const payouts = await Payout.find({ manager: id }).sort({ createdAt: -1 });

    const totalRevenue = bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    const totalTicketsSold = bookings.reduce((acc, b) => {
      return acc + b.tickets.reduce((sum, t) => sum + t.quantity, 0);
    }, 0);

    // Group stats by event
    const eventStats = events.map(event => {
      const eventBookings = bookings.filter(b => b.event.toString() === event._id.toString());
      const revenue = eventBookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
      const tickets = eventBookings.reduce((acc, b) => acc + b.tickets.reduce((sum, t) => sum + t.quantity, 0), 0);
      return {
        _id: event._id,
        title: event.title,
        date: event.date,
        status: event.status,
        isApproved: event.isApproved,
        revenue,
        ticketsSold: tickets
      };
    });

    const commissionType = manager.commissionType || 'percentage';
    const commissionValue = manager.commissionValue ?? 10;
    let totalCommission = 0;

    if (commissionType === 'percentage') {
      totalCommission = (totalRevenue * commissionValue) / 100;
    } else {
      // Flat fee - this is tricky if we don't know per event or total
      // User said "can be flat fee or percentage whise based on deal made"
      // Assuming flat fee is per manager total for now, or we might need it per event.
      // Usually flat fee per event is better, but let's stick to simple flat fee for the "deal" for now.
      totalCommission = commissionValue;
    }

    const netPayable = Math.max(0, totalRevenue - totalCommission - (manager.totalPaid || 0));

    res.json({
      manager,
      stats: {
        totalEvents: events.length,
        totalRevenue,
        totalTicketsSold,
        totalPaid: manager.totalPaid || 0,
        totalCommission,
        netDue: totalRevenue - totalCommission,
        pendingPayout: netPayable
      },
      events: eventStats,
      payouts,
      volunteers: await Volunteer.find({ manager: id }).populate('event', 'title')
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const approveEvent: RequestHandler = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id).populate('creator', 'name email');
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    event.isApproved = true;
    event.status = 'published';
    await event.save();

    // Notify Manager (Non-blocking)
    (async () => {
      try {
        const creator: any = event.creator;
        await sendEventApprovalEmail(creator.email, creator.name, event.title);
      } catch (err) {
        console.error('Failed to send event approval email:', err);
      }
    })();

    res.json({ message: 'Event approved and published', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const declineEvent: RequestHandler = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  if (!reason) {
    res.status(400).json({ message: 'A reason for decline is required.' });
    return;
  }

  try {
    const event = await Event.findById(id).populate('creator', 'name email');
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    event.isApproved = false;
    event.status = 'blocked';
    await event.save();

    // Notify Manager (Non-blocking)
    (async () => {
      try {
        const creator: any = event.creator;
        await sendEventDeclineEmail(creator.email, creator.name, event.title, reason);
      } catch (err) {
        console.error('Failed to send event decline email:', err);
      }
    })();

    res.json({ message: 'Event declined and manager notified.', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const processPayout: RequestHandler = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { amount, notes, referenceId } = req.body;
  try {
    const manager = await EventManager.findById(id);
    if (!manager) {
      res.status(404).json({ message: 'Manager not found' });
      return;
    }

    // Initialize settlement record
    const payout = await Payout.create({
      manager: id,
      amount,
      notes,
      referenceId,
      status: 'completed'
    });

    manager.totalPaid = (manager.totalPaid || 0) + amount;
    await manager.save();

    res.json({ message: 'Payout processed successfully', payout, totalPaid: manager.totalPaid });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAllAdminEvents: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const events = await Event.find().populate('creator', 'name email').sort({ createdAt: -1 });
    const eventIds = events.map(e => e._id);
    
    const bookings = await Booking.find({ 
      event: { $in: eventIds },
      status: 'confirmed'
    });

    const eventsWithStats = events.map(event => {
      const eventBookings = bookings.filter(b => b.event.toString() === event._id.toString());
      const revenue = eventBookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
      const ticketsSold = eventBookings.reduce((acc, b) => {
        return acc + b.tickets.reduce((sum, t) => sum + t.quantity, 0);
      }, 0);

      return {
        ...event.toObject(),
        revenue,
        ticketsSold
      };
    });

    res.json(eventsWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getPendingEvents: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const events = await Event.find({ isApproved: false }).populate('creator', 'name email').sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAllUsers: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password');
    const managers = await EventManager.find().select('-password');
    res.json([...users, ...managers]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

import { 
  sendManagerApprovalEmail, 
  sendEventApprovalEmail, 
  sendEventDeclineEmail 
} from '../utils/emailService.js';

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

export const deleteManager: RequestHandler = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const manager = await EventManager.findById(id);
    if (!manager) {
      res.status(404).json({ message: 'Manager not found' });
      return;
    }

    // Check for active events or bookings
    const events = await Event.find({ creator: id });
    const eventIds = events.map(e => e._id);
    const bookingCount = await Booking.countDocuments({ 
      event: { $in: eventIds },
      status: 'confirmed'
    });

    if (bookingCount > 0 && req.query.force !== 'true') {
      res.status(400).json({ 
        message: 'Manager has active bookings. Cannot delete without force authorization.',
        hasBookings: true,
        bookingCount
      });
      return;
    }

    // Delete events first or keep them? Usually delete.
    await Event.deleteMany({ creator: id });
    await manager.deleteOne();

    res.json({ message: 'Manager and associated productions removed from platform.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateManagerCommission: RequestHandler = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { commissionType, commissionValue, payoutCycle } = req.body;
  try {
    const manager = await EventManager.findById(id);
    if (!manager) {
      res.status(404).json({ message: 'Manager not found' });
      return;
    }

    if (commissionType) manager.commissionType = commissionType;
    if (commissionValue !== undefined) manager.commissionValue = commissionValue;
    if (payoutCycle) manager.payoutCycle = payoutCycle;

    await manager.save();
    res.json({ message: 'Commission protocol updated.', manager });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteEvent: RequestHandler = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    // Delete all associated bookings
    await Booking.deleteMany({ event: id });
    
    // Delete the event
    await event.deleteOne();

    res.json({ message: 'Event and all associated ticket data permanently removed.' });
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
    
    const bookings = await Booking.find({ status: 'confirmed' });
    const totalRevenue = bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);

    // Get Top 5 Managers by Revenue
    const topManagers = await EventManager.find({})
      .select('name email totalRevenue')
      .sort({ totalRevenue: -1 })
      .limit(5);

    // Get Recent Events
    const recentEvents = await Event.find({})
      .populate('creator', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get Recent User Registrations (Attendee + Manager)
    const recentUsers = await User.find({})
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentStaff = await EventManager.find({})
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const combinedRecentUsers = [...recentUsers, ...recentStaff]
      .sort((a, b) => (b.createdAt as any) - (a.createdAt as any))
      .slice(0, 5);

    res.json({
      totalUsers,
      totalEvents,
      totalBookings,
      totalRevenue,
      topManagers,
      recentEvents,
      recentUsers: combinedRecentUsers
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
export const getEventInsights: RequestHandler = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id).populate('creator', 'name email');
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    const passengers = await Booking.find({ event: id, status: 'confirmed' }).populate('user', 'name email');
    const volunteers = await Volunteer.find({ event: id }).select('-password');
    
    const totalRevenue = passengers.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    const totalTicketsSold = passengers.reduce((acc, b) => {
      return acc + b.tickets.reduce((sum, t) => sum + t.quantity, 0);
    }, 0);

    // Group sales by ticket type
    const ticketStats = event.ticketTypes.map(tt => {
      const soldForType = passengers.reduce((acc, b) => {
        return acc + b.tickets
          .filter(t => t.type === tt.name)
          .reduce((sum, t) => sum + t.quantity, 0);
      }, 0);
      return {
        name: tt.name,
        price: tt.price,
        capacity: tt.capacity,
        sold: soldForType,
        revenue: soldForType * tt.price
      };
    });

    res.json({
      event,
      stats: {
        totalRevenue,
        totalTicketsSold,
        capacity: event.ticketTypes.reduce((acc, tt) => acc + tt.capacity, 0),
      },
      ticketStats,
      volunteers,
      attendees: passengers.map(b => {
        const attendee: any = b.user;
        return {
          _id: attendee?._id,
          name: attendee?.name,
          email: attendee?.email,
          tickets: b.tickets,
          bookedAt: b.createdAt,
          totalAmount: b.totalAmount
        };
      })
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

import bcrypt from 'bcrypt';

export const getAllVolunteers: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const volunteers = await Volunteer.find()
      .populate('event', 'title')
      .populate('manager', 'name email')
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const adminAddVolunteer: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, eventId, gate, managerId } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const volunteer = await Volunteer.create({
      name,
      email,
      password: hashedPassword,
      event: eventId,
      manager: managerId,
      gate
    });

    res.status(201).json(volunteer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const adminRemoveVolunteer: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Volunteer.findByIdAndDelete(id);
    res.json({ message: 'Volunteer removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
