import { Response, RequestHandler } from 'express';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import EventManager from '../models/EventManager.js';
import { AuthRequest } from '../middleware/auth.js';

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
