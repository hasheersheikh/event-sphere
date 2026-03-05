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
      ticketTypes 
    } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      time,
      endTime,
      location,
      category,
      image,
      ticketTypes,
      creator: req.user?._id,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { q, category, location, date } = req.query;
    let query: any = { status: 'published' };

    if (q) {
      query.$or = [
        { title: { $regex: q as string, $options: 'i' } },
        { description: { $regex: q as string, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (location) query['location.address'] = { $regex: location as string, $options: 'i' };
    if (date) query.date = { $gte: new Date(date as string) };

    const events = await Event.find(query).populate('creator', 'name email').sort({ date: 1 });
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
    const event = await Event.findById(req.params.id as string).populate('creator', 'name email');
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

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
