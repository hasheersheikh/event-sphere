import { Response, RequestHandler } from 'express';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import EventManager from '../models/EventManager.js';
import { AuthRequest } from '../middleware/auth.js';
import Volunteer from '../models/Volunteer.js';
import Payout from '../models/Payout.js';
import bcrypt from 'bcrypt';

export const getManagerStats: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const myEvents = await Event.find({ creator: userId });
    const eventIds = myEvents.map(e => e._id);

    const totalEvents = myEvents.length;
    const myBookings = await Booking.find({ event: { $in: eventIds }, status: 'confirmed' });
    const totalBookings = myBookings.length;
    const totalCapacity = myEvents.reduce((acc, e) => {
      return acc + e.ticketTypes.reduce((sum, tt) => sum + tt.capacity, 0);
    }, 0);

    const totalTicketsSold = myBookings.reduce((acc, b) => {
      return acc + b.tickets.reduce((sum, t) => sum + t.quantity, 0);
    }, 0);

    const totalCheckedIn = myBookings.reduce((acc, b) => {
      return acc + b.tickets.reduce((sum, t) => sum + (t.checkedInCount || 0), 0);
    }, 0);

    const totalRevenue = myBookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    const totalAttendees = new Set(myBookings.map(b => b.user.toString())).size;

    const sellThroughRate = totalCapacity > 0 ? Math.round((totalTicketsSold / totalCapacity) * 100) : 0;
    const attendanceRate = totalTicketsSold > 0 ? Math.round((totalCheckedIn / totalTicketsSold) * 100) : 0;

    const recentActivity = await Booking.find({ event: { $in: eventIds }, status: 'confirmed' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name')
      .populate('event', 'title');

    const manager = await EventManager.findById(userId);
    const commissionType = manager?.commissionType || 'percentage';
    let totalCommission = 0;

    if (commissionType === 'percentage') {
      totalCommission = (totalRevenue * (manager?.commissionValue ?? 10)) / 100;
    } else {
      totalCommission = (manager?.commissionValue ?? 10) * totalTicketsSold;
    }

    const payouts = await Payout.find({ manager: userId, status: { $in: ['completed', 'processing'] } });
    const totalSettled = payouts.reduce((acc, p) => acc + p.amount, 0);

    const netDue = totalRevenue - totalCommission;
    const pendingPayout = netDue - totalSettled;

    const totalViews = myEvents.reduce((acc, e) => acc + (e.viewCount || 0), 0);

    res.json({
      totalEvents,
      totalBookings,
      totalRevenue,
      totalViews,
      netDue,
      pendingPayout,
      totalSettled,
      totalAttendees,
      sellThroughRate,
      attendanceRate,
      recentActivity: recentActivity.map(b => ({
        user: (b.user as any)?.name || 'Guest',
        action: `Booked ${b.tickets.reduce((sum, t) => sum + t.quantity, 0)} Tickets`,
        event: (b.event as any)?.title || 'Event',
        time: b.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getManagerEventAnalytics: RequestHandler = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?._id;

  try {
    const event = await Event.findById(id);
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    if (event.creator.toString() !== userId?.toString()) {
      res.status(401).json({ message: 'Unauthorized access to this production.' });
      return;
    }

    const manager = await EventManager.findById(userId);
    if (!manager) {
      res.status(404).json({ message: 'Manager profile not found' });
      return;
    }

    const bookings = await Booking.find({ event: id, status: 'confirmed' }).populate('user', 'name email');
    
    const grossRevenue = bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    const totalTicketsSold = bookings.reduce((acc, b) => {
      return acc + b.tickets.reduce((sum, t) => sum + t.quantity, 0);
    }, 0);

    // Commission Calculation
    let platformCommission = 0;
    if (manager.commissionType === 'percentage') {
      platformCommission = (grossRevenue * manager.commissionValue) / 100;
    } else {
      // For flat fee, we might want it per event or total. 
      // Based on previous plan, let's treat it as a per-event flat fee for the deal if it's 'flat'.
      platformCommission = manager.commissionValue;
    }

    const netRevenue = Math.max(0, grossRevenue - platformCommission);

    // Group sales by ticket type with accurate revenue tracking
    const ticketStats = event.ticketTypes.map(tt => {
      const typeBookings = bookings.flatMap(b => b.tickets.filter(t => t.type === tt.name));
      const soldForType = typeBookings.reduce((sum, t) => sum + t.quantity, 0);
      const revenueForType = typeBookings.reduce((sum, t) => sum + (t.price * t.quantity), 0);

      return {
        name: tt.name,
        price: tt.price,
        capacity: tt.capacity,
        sold: soldForType,
        revenue: revenueForType
      };
    });

    // Daily Sales (Last 7 Days)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const day = d.toISOString().split('T')[0];
      const amount = bookings
        .filter(b => b.createdAt.toISOString().split('T')[0] === day)
        .reduce((acc, b) => acc + (b.totalAmount || 0), 0);
      return { date: day.slice(5), amount };
    }).reverse();

    const volunteers = await Volunteer.find({ event: id }).select('-password');

    res.json({
      event,
      stats: {
        grossRevenue,
        platformCommission,
        netRevenue,
        totalTicketsSold,
        capacity: event.ticketTypes.reduce((acc, tt) => acc + tt.capacity, 0),
        commissionInfo: {
          type: manager.commissionType,
          value: manager.commissionValue
        }
      },
      ticketStats,
      salesHistory: last7Days,
      volunteers,
      recentBookings: bookings.slice(-5).map(b => ({
        _id: b._id,
        userName: (b.user as any)?.name || 'Anonymous',
        userEmail: (b.user as any)?.email || '',
        totalAmount: b.totalAmount,
        tickets: b.tickets,
        createdAt: b.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getManagerAnalytics: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const myEvents = await Event.find({ creator: userId });
    const eventIds = myEvents.map(e => e._id);
    
    const bookings = await Booking.find({ event: { $in: eventIds }, status: 'confirmed' }).populate('event');
    
    // Aggregate Revenue
    const totalRevenue = bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    
    // Aggregate Tickets
    const totalTickets = bookings.reduce((acc, b) => {
      return acc + b.tickets.reduce((sum, t) => sum + t.quantity, 0);
    }, 0);

    // Unique Attendees
    const activeUsers = new Set(bookings.map(b => b.user.toString())).size;

    // Revenue history (last 7 days)
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

export const updatePayoutDetails: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { bankDetails, upiId } = req.body;
    const manager = await EventManager.findById(req.user?._id);
    
    if (!manager) {
      res.status(404).json({ message: 'Manager not found' });
      return;
    }

    if (bankDetails) manager.bankDetails = bankDetails;
    if (upiId !== undefined) manager.upiId = upiId;

    await manager.save();
    res.json({ message: 'Payout details updated', manager });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getPayoutDetails: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const manager = await EventManager.findById(req.user?._id).select('bankDetails upiId commissionType commissionValue payoutCycle');
    if (!manager) {
      res.status(404).json({ message: 'Manager not found' });
      return;
    }
    res.json(manager);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const addVolunteer: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, eventId, gate } = req.body;
    const managerId = req.user?._id;

    const event = await Event.findById(eventId);
    if (!event || event.creator.toString() !== managerId.toString()) {
      res.status(403).json({ message: 'Not authorized to add volunteers for this event.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const volunteer = await Volunteer.create({
      name,
      email,
      password: hashedPassword,
      event: eventId,
      manager: managerId,
      gate,
      role: 'volunteer'
    });

    res.status(201).json(volunteer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getVolunteersByEvent: RequestHandler = async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  try {
    const { eventId } = req.params;
    const managerId = req.user?._id;

    const total = await Volunteer.countDocuments({ event: eventId, manager: managerId });
    const volunteers = await Volunteer.find({ event: eventId, manager: managerId })
      .select('-password')
      .skip(skip)
      .limit(limit);

    res.json({
      data: volunteers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const removeVolunteer: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const managerId = req.user?._id;

    const volunteer = await Volunteer.findOneAndDelete({ _id: id, manager: managerId });
    if (!volunteer) {
      res.status(404).json({ message: 'Volunteer not found or not managed by you.' });
      return;
    }

    res.json({ message: 'Volunteer removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getManagerPayouts: RequestHandler = async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  try {
    const total = await Payout.countDocuments({ manager: req.user?._id });
    const payouts = await Payout.find({ manager: req.user?._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: payouts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
