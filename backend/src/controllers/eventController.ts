import mongoose from 'mongoose';
import { Request, Response, RequestHandler } from 'express';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import { AuthRequest } from '../middleware/auth.js';
import { deleteEventAssets } from '../utils/cloudinaryService.js';

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title, description, date, time, endTime,
      scheduleType, slots, recurrence,
      location, city, category, image, videoUrl, reels,
      ticketTypes, vouchers, days, isMultiDay,
    } = req.body;

    if (req.user?.role === 'event_manager' && !req.user?.isApproved) {
      return res.status(403).json({
        message: 'Your manager account is currently under review.',
      });
    }

    // Derive date from first day for multi-day events when date not provided
    const resolvedDate = date || (days?.[0]?.date) || new Date();
    const resolvedScheduleType = scheduleType || (isMultiDay ? 'multi_day' : 'single');

    const event = await Event.create({
      title, description,
      date: resolvedDate,
      time: time || (slots?.[0]?.startTime) || '00:00',
      endTime,
      scheduleType: resolvedScheduleType,
      slots: ['multi_slot', 'recurring'].includes(resolvedScheduleType) ? (slots || []) : [],
      recurrence: resolvedScheduleType === 'recurring' ? {
        frequency: recurrence?.frequency || 'daily',
        daysOfWeek: recurrence?.daysOfWeek || [],
        endDate: recurrence?.endDate || null,
        isActive: true,
        exceptions: [],
      } : undefined,
      days: resolvedScheduleType === 'multi_day' ? (days || []) : [],
      isMultiDay: resolvedScheduleType === 'multi_day',
      location, city, category, image,
      videoUrl: videoUrl || undefined,
      reels: Array.isArray(reels) ? reels.filter((r: string) => r?.trim()) : [],
      ticketTypes,
      vouchers,
      creator: req.user?._id,
      status: 'under_review',
      isApproved: false,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { q, category, location, city, date, sort, limit } = req.query;

    // Build query with $and so we can stack multiple $or conditions safely
    const andConditions: any[] = [{ status: 'published', isApproved: true }];

    if (q) {
      andConditions.push({
        $or: [
          { title: { $regex: q as string, $options: 'i' } },
          { description: { $regex: q as string, $options: 'i' } },
        ],
      });
    }
    if (category) andConditions.push({ category });
    if (location) andConditions.push({ 'location.address': { $regex: location as string, $options: 'i' } });
    if (city) andConditions.push({ city: { $regex: city as string, $options: 'i' } });

    // Always filter out past events for public view
    const dateFilter = date ? new Date(date as string) : new Date();
    dateFilter.setHours(0, 0, 0, 0);

    andConditions.push({
      $or: [
        { scheduleType: { $ne: 'recurring' }, date: { $gte: dateFilter } },
        {
          scheduleType: 'recurring',
          'recurrence.isActive': true,
          $or: [
            { 'recurrence.endDate': { $exists: false } },
            { 'recurrence.endDate': null },
            { 'recurrence.endDate': { $gte: dateFilter } },
          ],
        },
      ],
    });

    const query = andConditions.length === 1 ? andConditions[0] : { $and: andConditions };

    const secondarySort = sort ? (sort as string).split(',').join(' ') : '';
    const sortOption: any = { isSponsored: -1 };
    if (secondarySort) {
      secondarySort.split(' ').forEach((s: string) => {
        const dir = s.startsWith('-') ? -1 : 1;
        const key = s.replace('-', '');
        sortOption[key] = dir;
      });
    } else {
      sortOption.date = 1;
    }

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
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true },
    ).populate('creator', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.creator.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updateData: any = { ...req.body };

    // Normalize schedule-type-specific fields so stale data is never persisted
    const st: string = updateData.scheduleType || event.scheduleType;
    if (st === 'single') {
      updateData.slots = [];
      updateData.days = [];
      updateData.isMultiDay = false;
      delete updateData.recurrence;
    } else if (st === 'multi_slot') {
      updateData.days = [];
      updateData.isMultiDay = false;
      delete updateData.recurrence;
    } else if (st === 'recurring') {
      updateData.days = [];
      updateData.isMultiDay = false;
      if (updateData.recurrence) {
        updateData.recurrence = {
          frequency: updateData.recurrence.frequency || 'daily',
          daysOfWeek: updateData.recurrence.daysOfWeek || [],
          endDate: updateData.recurrence.endDate || null,
          isActive: updateData.recurrence.isActive ?? event.recurrence?.isActive ?? true,
          exceptions: updateData.recurrence.exceptions ?? event.recurrence?.exceptions ?? [],
        };
      }
    } else if (st === 'multi_day') {
      updateData.slots = [];
      updateData.isMultiDay = true;
      delete updateData.recurrence;
    }

    if (Array.isArray(updateData.reels)) {
      updateData.reels = updateData.reels.filter((r: string) => r?.trim());
    }

    // If event was 'past' but date is moved to future, reset status to 'published'
    if (event.status === 'past') {
      const newDate = updateData.date ? new Date(updateData.date) : event.date;
      if (newDate > new Date()) {
        updateData.status = 'published';
      }
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
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.creator.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const bookingCount = await Booking.countDocuments({ event: req.params.id, status: 'confirmed' });
    if (bookingCount > 0 && req.query.force !== 'true') {
      return res.status(400).json({ message: 'Cannot delete event with active bookings.', hasBookings: true, bookingCount });
    }

    deleteEventAssets(event.image, event.reels).catch(() => {});
    await event.deleteOne();
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getMyEvents: RequestHandler = async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  try {
    const total = await Event.countDocuments({ creator: req.user?._id });
    const events = await Event.find({ creator: req.user?._id }).sort({ date: 1 }).skip(skip).limit(limit);
    res.json({ data: events, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const applyVoucher = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const voucher = event.vouchers?.find((v: any) => v.code.toUpperCase() === code.toUpperCase() && v.isActive);
    if (!voucher) return res.status(400).json({ message: 'Invalid or inactive voucher code' });

    res.json({ message: 'Voucher applied successfully', code: voucher.code, discountType: voucher.discountType, discountAmount: voucher.discountAmount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const toggleTicketSoldOut = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.creator.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const index = parseInt(req.params.ticketIndex as string);
    if (isNaN(index) || index < 0 || index >= event.ticketTypes.length) {
      return res.status(400).json({ message: 'Invalid ticket index' });
    }

    event.ticketTypes[index].isSoldOut = !event.ticketTypes[index].isSoldOut;
    event.markModified(`ticketTypes.${index}.isSoldOut`);
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * PATCH /events/:id/recurrence/stop
 * Deactivates the recurrence rule so the event stops repeating.
 */
export const stopRecurrence = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.creator.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }
    if (event.scheduleType !== 'recurring') {
      return res.status(400).json({ message: 'Event is not a recurring event' });
    }

    event.recurrence!.isActive = false;
    event.markModified('recurrence');
    await event.save();
    res.json({ message: 'Recurrence stopped', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * POST /events/:id/recurrence/exceptions
 * Body: { date: "YYYY-MM-DD" }
 * Adds a specific date to the exceptions list — that occurrence will be skipped.
 */
export const addRecurrenceException = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.creator.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }
    if (event.scheduleType !== 'recurring') {
      return res.status(400).json({ message: 'Event is not a recurring event' });
    }

    const exceptionDate = new Date(req.body.date);
    if (isNaN(exceptionDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date' });
    }

    event.recurrence!.exceptions = event.recurrence!.exceptions || [];
    // Avoid duplicates (compare date-only)
    const alreadyExists = event.recurrence!.exceptions.some(
      (d) => new Date(d).toDateString() === exceptionDate.toDateString()
    );
    if (!alreadyExists) {
      event.recurrence!.exceptions.push(exceptionDate);
      event.markModified('recurrence');
      await event.save();
    }

    res.json({ message: 'Exception added', exceptions: event.recurrence!.exceptions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
