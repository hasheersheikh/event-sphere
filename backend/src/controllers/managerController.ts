import { Response, RequestHandler } from 'express';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import { AuthRequest } from '../middleware/auth.js';

export const getManagerStats: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const myEvents = await Event.find({ creator: userId });
    const eventIds = myEvents.map(e => (e as any)._id);

    const totalEvents = myEvents.length;
    const totalBookings = await Booking.countDocuments({ eventId: { $in: eventIds } });
    
    const myBookings = await Booking.find({ eventId: { $in: eventIds } });
    const totalRevenue = myBookings.reduce((acc, b) => acc + ((b as any).totalAmount || 0), 0);

    res.json({
      totalEvents,
      totalBookings,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
