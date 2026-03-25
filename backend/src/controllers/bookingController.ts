import { Response } from 'express';
import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import { AuthRequest } from '../middleware/auth.js';
import { generateTicketPDF } from '../utils/pdfGenerator.js';
import { sendTicketEmail } from '../utils/emailService.js';
import User from '../models/User.js';

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, tickets } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check availability and calculate total
    let totalAmount = 0;
    const enrichedTickets = [];

    for (const ticketItem of tickets) {
      const ticketType = event.ticketTypes.find((t) => t.name === ticketItem.type);
      if (!ticketType) {
        return res.status(400).json({ message: `Ticket type ${ticketItem.type} not found` });
      }
      if (ticketType.isSoldOut || (ticketType.capacity - ticketType.sold < ticketItem.quantity)) {
        return res.status(400).json({ message: `Tickets for ${ticketItem.type} are sold out or unavailable` });
      }
      
      const price = ticketType.price;
      totalAmount += price * ticketItem.quantity;
      ticketType.sold += ticketItem.quantity;
      
      enrichedTickets.push({
        type: ticketItem.type,
        quantity: ticketItem.quantity,
        price: price
      });
    }

    const booking = await Booking.create({
      user: req.user?._id,
      event: eventId,
      tickets: enrichedTickets,
      totalAmount,
      status: req.body.status || (totalAmount === 0 ? 'confirmed' : 'pending'),
    });

    await event.save();

    // Trigger Email Journey (Non-blocking)
    (async () => {
      try {
        const user = await User.findById(req.user?._id);
        if (user) {
          const pdfBuffer = await generateTicketPDF(booking, event as any);
          await sendTicketEmail(user.email, user.name, event, pdfBuffer);
        }
      } catch (err) {
        console.error('Failed to send confirmation email journey:', err);
      }
    })();

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await Booking.find({ user: req.user?._id }).populate('event');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getEventBookings = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creator.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const bookings = await Booking.find({ event: req.params.eventId }).populate('user', 'name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const checkInBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { ticketType } = req.body;

    const booking = await Booking.findById(id).populate('event');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const event: any = booking.event;
    
    // Check if the user is authorized: Creator, Admin, or Assigned Volunteer
    const isCreator = event.creator.toString() === req.user?._id.toString();
    const isAdmin = req.user?.role === 'admin';
    const isAssignedVolunteer = req.user?.role === 'volunteer' && req.user?.eventId?.toString() === event._id.toString();

    if (!isCreator && !isAdmin && !isAssignedVolunteer) {
      return res.status(403).json({ message: 'Not authorized to check-in for this event' });
    }

    const ticket = booking.tickets.find(t => t.type === ticketType);
    if (!ticket) {
      return res.status(400).json({ message: 'Ticket type not found in this booking' });
    }

    const currentCheckedIn = ticket.checkedInCount || 0;

    if (currentCheckedIn >= ticket.quantity) {
      return res.status(400).json({ message: 'All tickets of this type are already checked-in' });
    }

    ticket.checkedInCount = currentCheckedIn + 1;
    await booking.save();

    res.json({ 
      message: 'Check-in successful!', 
      booking: {
        userName: (booking as any).user?.name || 'Guest',
        ticketType: ticket.type,
        checkedInCount: ticket.checkedInCount,
        totalQuantity: ticket.quantity
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
