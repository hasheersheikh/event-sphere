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
    const totalBookings = await Booking.countDocuments({ event: { $in: eventIds }, status: 'confirmed' });
    
    const myBookings = await Booking.find({ event: { $in: eventIds }, status: 'confirmed' });
    const totalRevenue = myBookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);

    res.json({
      totalEvents,
      totalBookings,
      totalRevenue
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

    // Group sales by ticket type
    const ticketStats = event.ticketTypes.map(tt => {
      const soldForType = bookings.reduce((acc, b) => {
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
    const manager = await EventManager.findById(req.user?._id).select('bankDetails upiId');
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
      gate
    });

    res.status(201).json(volunteer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getVolunteersByEvent: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const managerId = req.user?._id;

    const volunteers = await Volunteer.find({ event: eventId, manager: managerId }).select('-password');
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
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
  try {
    const payouts = await Payout.find({ manager: req.user?._id }).sort({ createdAt: -1 });
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
