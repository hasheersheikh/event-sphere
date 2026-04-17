import mongoose from 'mongoose';
import { Request, Response, RequestHandler } from 'express';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import { AuthRequest } from '../middleware/auth.js';

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      date,
      time,
      endTime,
      location,
      category,
      image,
      videoUrl,
      reels,
      ticketTypes,
      vouchers,
      days,
      isMultiDay
    } = req.body;

    if (req.user?.role === 'event_manager' && !req.user?.isApproved) {
      return res.status(403).json({
        message: 'Your manager account is currently under review. You cannot broadcast events until authorized by the Pulse Council.'
      });
    }

    const event = await Event.create({
      title,
      description,
      date,
      time,
      endTime,
      location,
      category,
      image,
      videoUrl: videoUrl || undefined,
      reels: Array.isArray(reels) ? reels.filter((r: string) => r && r.trim()) : [],
      ticketTypes,
      vouchers,
      days,
      isMultiDay,
      creator: req.user?._id,
      status: 'under_review',
      isApproved: false
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { q, category, location, date, sort, limit } = req.query;
    let query: any = { 
      status: 'published',
      isApproved: true
    };

    if (q) {
      query.$or = [
        { title: { $regex: q as string, $options: 'i' } },
        { description: { $regex: q as string, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (location) query['location.address'] = { $regex: location as string, $options: 'i' };
    if (date) query.date = { $gte: new Date(date as string) };

    const sortOption: any = sort ? (sort as string).split(',').join(' ') : { date: 1 };
    const limitOption = limit ? parseInt(limit as string) : 0;

    const events = await Event.find(query)
      .populate('creator', 'name email')
      .sort(sortOption)
      .limit(limitOption);

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }
    const event = await Event.findByIdAndUpdate(
      req.params.id as string,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate('creator', 'name email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creator.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updateData = { ...req.body };
    if (Array.isArray(updateData.reels)) {
      updateData.reels = updateData.reels.filter((r: string) => r && r.trim());
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creator.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const bookingCount = await Booking.countDocuments({ event: req.params.id, status: 'confirmed' });
    if (bookingCount > 0 && req.query.force !== 'true') {
      return res.status(400).json({ 
        message: 'Cannot delete event with active bookings.', 
        hasBookings: true,
        bookingCount 
      });
    }

    await event.deleteOne();
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getMyEvents: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const events = await Event.find({ creator: req.user?._id }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const applyVoucher = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const voucher = event.vouchers?.find(
      (v: any) => v.code.toUpperCase() === code.toUpperCase() && v.isActive
    );
    if (!voucher) {
      return res.status(400).json({ message: 'Invalid or inactive voucher code' });
    }

    res.json({
      message: 'Voucher applied successfully',
      code: voucher.code,
      discountType: voucher.discountType,
      discountAmount: voucher.discountAmount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const toggleTicketSoldOut = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const ticketIndex = req.params.ticketIndex as string;
    const event = await Event.findById(id as string);

    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.creator.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const index = parseInt(ticketIndex);
    if (isNaN(index) || index < 0 || index >= event.ticketTypes.length) {
      return res.status(400).json({ message: 'Invalid ticket index' });
    }

    event.ticketTypes[index].isSoldOut = !event.ticketTypes[index].isSoldOut;
    // @ts-ignore - isSoldOut might not be in the document type yet if using old types
    event.markModified(`ticketTypes.${index}.isSoldOut`);
    await event.save();

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
