import { Response } from 'express';
import crypto from 'crypto';
import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import { AuthRequest } from '../middleware/auth.js';
import { generateTicketPDF } from '../utils/pdfGenerator.js';
import { sendTicketEmail, sendAccountSetupEmail } from '../utils/emailService.js';
import User from '../models/User.js';

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, tickets, email, phoneNumber, voucherCode, contactName } = req.body;

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

      let price = ticketType.price;

      if (ticketItem.isFullPass && ticketType.isFullPass) {
        price = ticketType.fullPassPrice || ticketType.price;
      } else if (ticketItem.selectedDays && ticketItem.selectedDays.length > 0) {
        price = 0;
        for (const dayIdx of ticketItem.selectedDays) {
          const dayPrice = ticketType.dayWisePrices?.find(dp => dp.dayIndex === dayIdx)?.price || ticketType.price;
          price += dayPrice;
        }
      }

      totalAmount += price * ticketItem.quantity;
      ticketType.sold += ticketItem.quantity;

      enrichedTickets.push({
        type: ticketItem.type,
        quantity: ticketItem.quantity,
        price: price,
        selectedDays: ticketItem.selectedDays || [],
        isFullPass: !!ticketItem.isFullPass,
      });
    }

    // Apply voucher discount if provided
    if (voucherCode && totalAmount > 0) {
      const voucher = event.vouchers?.find(
        (v: any) => v.code.toUpperCase() === voucherCode.toUpperCase() && v.isActive
      );
      if (voucher) {
        if (voucher.discountType === 'percentage') {
          totalAmount = Math.round(totalAmount * (1 - voucher.discountAmount / 100));
        } else {
          totalAmount = Math.max(0, totalAmount - voucher.discountAmount);
        }
      }
    }

    // Find or create user if not logged in
    let userId = req.user?._id;
    let userName = req.user?.name || contactName || 'Guest';

    if (!userId && email) {
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        userId = existingUser._id;
        userName = existingUser.name;
        // Update phone if missing
        if (!existingUser.phoneNumber && phoneNumber) {
          existingUser.phoneNumber = phoneNumber;
          await existingUser.save();
        }
      } else {
        // Create new user (no password — they'll set it via the email link)
        const newUser = await User.create({
          name: contactName || email.split('@')[0],
          email,
          phoneNumber,
        });
        userId = newUser._id;
        userName = newUser.name;
        // Generate a password-reset token so the user can set their password
        const resetToken = crypto.randomBytes(20).toString('hex');
        newUser.resetPasswordToken = resetToken;
        newUser.resetPasswordExpires = new Date(Date.now() + 3600000);
        await newUser.save();
        const setupUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}`;
        sendAccountSetupEmail(email, userName, setupUrl).catch(() => {});
      }
    }

    const booking = await Booking.create({
      user: userId,
      event: eventId,
      tickets: enrichedTickets,
      totalAmount,
      email,
      phoneNumber,
      contactName: contactName || undefined,
      status: req.body.status || (totalAmount === 0 ? 'confirmed' : 'pending'),
    });

    await event.save();

    // Trigger Email & WhatsApp Journey (Non-blocking)
    (async () => {
      try {
        const pdfBuffer = await generateTicketPDF(booking, event as any);
        // Use guest details first, fallback to user details
        const recipientEmail = booking.email || (req.user as any)?.email;
        const recipientName = (req.user as any)?.name || 'Guest';
        const recipientPhone = booking.phoneNumber || (req.user as any)?.phoneNumber;

        if (recipientEmail) {
          await sendTicketEmail(recipientEmail, recipientName, event, pdfBuffer);
        }
        
        if (recipientPhone) {
          const { sendTicketWhatsApp } = await import('../utils/whatsappService.js');
          await sendTicketWhatsApp(recipientPhone, recipientName, event, pdfBuffer);
        }
      } catch (err) {
        console.error('Failed to send confirmation journey:', err);
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

export const issueOfflineTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, tickets, contactName, email, phoneNumber, note } = req.body;

    if (!eventId || !tickets || !Array.isArray(tickets) || tickets.length === 0) {
      return res.status(400).json({ message: 'eventId and tickets are required' });
    }
    if (!contactName) {
      return res.status(400).json({ message: 'Attendee name is required' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Only the event creator or an admin may issue offline tickets
    const isCreator = event.creator.toString() === req.user?._id.toString();
    const isAdmin = req.user?.role === 'admin';
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to issue offline tickets for this event' });
    }

    const enrichedTickets = [];
    let totalAmount = 0;

    for (const item of tickets) {
      const ticketType = event.ticketTypes.find((t) => t.name === item.type);
      if (!ticketType) {
        return res.status(400).json({ message: `Ticket type "${item.type}" not found` });
      }
      const available = ticketType.capacity - ticketType.sold;
      if (available < item.quantity) {
        return res.status(400).json({ message: `Only ${available} tickets available for "${item.type}"` });
      }

      ticketType.sold += item.quantity;
      const price = ticketType.price;
      totalAmount += price * item.quantity;

      enrichedTickets.push({
        type: item.type,
        quantity: item.quantity,
        price,
        selectedDays: [],
        isFullPass: false,
      });
    }

    // Find or create user record so booking has a valid user reference
    let userId = req.user?._id;
    if (!userId && email) {
      let existingUser = await User.findOne({ email });
      if (!existingUser) {
        existingUser = await User.create({ name: contactName, email, phoneNumber: phoneNumber || '' });
      }
      userId = existingUser._id;
    }
    if (!userId) {
      // Fall back to the issuing manager's ID as placeholder
      userId = req.user?._id;
    }

    const booking = await Booking.create({
      user: userId,
      event: eventId,
      tickets: enrichedTickets,
      totalAmount,
      email: email || '',
      phoneNumber: phoneNumber || '',
      contactName,
      status: 'confirmed',
      paymentId: 'OFFLINE',
      isOffline: true,
      offlineNote: note || '',
    });

    await event.save();

    // Send ticket via email / WhatsApp if contact details provided (non-blocking)
    if (email || phoneNumber) {
      (async () => {
        try {
          const pdfBuffer = await generateTicketPDF(booking, event as any);
          if (email) await sendTicketEmail(email, contactName, event, pdfBuffer);
          if (phoneNumber) {
            const { sendTicketWhatsApp } = await import('../utils/whatsappService.js');
            await sendTicketWhatsApp(phoneNumber, contactName, event, pdfBuffer);
          }
        } catch (err) {
          console.error('Offline ticket delivery failed:', err);
        }
      })();
    }

    res.status(201).json(booking);
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

    if (booking.status !== 'confirmed') {
      return res.status(403).json({ message: `Cannot check in. Booking status is ${booking.status}. Only confirmed bookings can be checked in.` });
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
