import mongoose from 'mongoose';
import { Request, Response, RequestHandler } from 'express';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import { AuthRequest } from '../middleware/auth.js';
import { deleteEventAssets } from '../utils/cloudinaryService.js';
import razorpay from '../utils/razorpay.js';
import Payout from '../models/Payout.js';
import RefundRequest from '../models/RefundRequest.js';

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

function getNextOccurrence(event: any): Date | null {
  const now = new Date();
  const eventDate = new Date(event.date);
  const eventTime = event.time || '00:00';
  const [startHours, startMinutes] = eventTime.split(':').map(Number);

  const createUTCDate = (date: Date, hours: number, minutes: number) => {
    return new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      hours,
      minutes,
      0,
      0
    ));
  };

  if (event.scheduleType === 'single') {
    return createUTCDate(eventDate, startHours, startMinutes);
  }

  if (event.scheduleType === 'multi_slot' && event.slots && event.slots.length > 0) {
    let earliestSlotEnd: Date | null = null;
    event.slots.forEach((slot: any) => {
      if (slot.endTime) {
        const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
        const slotEnd = createUTCDate(eventDate, endHours, endMinutes);
        if (!earliestSlotEnd || slotEnd < earliestSlotEnd) {
          earliestSlotEnd = slotEnd;
        }
      }
    });
    return earliestSlotEnd;
  }

  if (event.scheduleType === 'multi_day' && event.days && event.days.length > 0) {
    const lastDay = event.days[event.days.length - 1];
    const lastDayDate = new Date(lastDay.date);
    if (lastDay.endTime) {
      const [endHours, endMinutes] = lastDay.endTime.split(':').map(Number);
      return createUTCDate(lastDayDate, endHours, endMinutes);
    }
    return lastDayDate;
  }

  if (event.scheduleType === 'recurring' && event.recurrence && event.recurrence.isActive) {
    if (event.recurrence.endDate && new Date(event.recurrence.endDate) < now) {
      return null;
    }

    const daysOfWeek = event.recurrence.daysOfWeek || [];
    if (daysOfWeek.length === 0) return null;

    const currentDay = now.getUTCDay();
    const today = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

    let daysUntilNext = null;

    const sortedDays = [...daysOfWeek].sort((a, b) => a - b);

    for (const day of sortedDays) {
      if (day > currentDay) {
        daysUntilNext = day - currentDay;
        break;
      }
    }

    if (daysUntilNext === null) {
      const smallestDay = sortedDays[0];
      if (smallestDay !== undefined) {
        daysUntilNext = 7 - currentDay + smallestDay;
      }
    }

    if (daysUntilNext !== null && daysUntilNext >= 0) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysUntilNext);
      const result = createUTCDate(nextDate, startHours, startMinutes);
      return result;
    }

    return null;
  }

  return null;
}

function isEventActive(event: any): boolean {
  const now = new Date();
  const nextOccurrence = getNextOccurrence(event);
  if (!nextOccurrence) return false;

  const endTime = event.endTime || event.time || '23:59';
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const endDateTime = new Date(Date.UTC(
    nextOccurrence.getUTCFullYear(),
    nextOccurrence.getUTCMonth(),
    nextOccurrence.getUTCDate(),
    endHours,
    endMinutes,
    0,
    0
  ));

  return endDateTime > now;
}

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { q, category, location, city, date, sort, limit } = req.query;

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

    const additionalFilters: any = {};
    if (q) {
      additionalFilters.$or = [
        { title: { $regex: q as string, $options: 'i' } },
        { description: { $regex: q as string, $options: 'i' } },
      ];
    }
    if (category) additionalFilters.category = category;
    if (location) {
      additionalFilters['location.address'] = { $regex: location as string, $options: 'i' };
    } else if (location === '') {
      delete additionalFilters['location.address'];
    }
    if (city) {
      additionalFilters.city = { $regex: city as string, $options: 'i' };
    } else if (city === '') {
      delete additionalFilters.city;
    }

    const baseQuery = {
      status: 'published',
      isApproved: true,
      ...additionalFilters
    };

    let events = await Event.find(baseQuery)
      .populate('creator', 'name email')
      .sort(sortOption)
      .limit(limitOption || 1000);

    events = events.filter(event => isEventActive(event));

    const eventsWithStatus = events.map(event => {
      const eventObj: any = event.toObject();
      eventObj.isActive = isEventActive(event);
      const nextOccurrence = getNextOccurrence(event);
      eventObj.nextOccurrence = nextOccurrence;
      return eventObj;
    });

    res.json(eventsWithStatus);
  } catch (error: any) {
    console.error('Error in getEvents:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
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
    if (bookingCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete event with active bookings. Please cancel the event instead to initiate refunds.', 
        hasBookings: true, 
        bookingCount 
      });
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

/**
 * PATCH /events/:id/cancel
 * Cancels an event, refunds all confirmed bookings, and invalidates tickets.
 */
export const cancelEvent = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const event = await Event.findById(req.params.id).session(session);
    if (!event) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creator.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({ message: 'User not authorized' });
    }

    if (event.status === 'cancelled') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Event is already cancelled' });
    }

    if (event.status === 'past') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Cannot cancel a past event' });
    }

    // 1. Update event status
    event.status = 'cancelled';
    await event.save({ session });

    // 2. Find all confirmed bookings for this event
    const bookings = await Booking.find({ 
      event: event._id, 
      status: 'confirmed' 
    }).session(session);

    const refundResults = [];

    // 3. Process refunds
    for (const booking of bookings) {
      if (booking.paymentId) {
        try {
          // Trigger Razorpay refund
          // Note: In production, you might want to handle this asynchronously 
          // or with a queue to avoid long-running transactions
          await razorpay.payments.refund(booking.paymentId, {
            amount: booking.totalAmount * 100, // Razorpay expects amount in paise
            notes: {
              reason: `Event "${event.title}" cancelled by organizer`,
              bookingId: booking._id.toString()
            }
          });

          booking.status = 'refunded';
          await booking.save({ session });
          refundResults.push({ bookingId: booking._id, status: 'refunded' });
        } catch (refundError: any) {
          console.error(`Refund failed for booking ${booking._id}:`, refundError);
          
          // Create a RefundRequest for admin review
          await RefundRequest.create([{
            booking: booking._id,
            event: event._id,
            user: booking.user,
            paymentId: booking.paymentId,
            amount: booking.totalAmount,
            reason: `Automatic refund failed: ${refundError.message}`,
            status: 'pending',
            failureReason: refundError.message
          }], { session });

          // If refund fails, we still mark it as cancelled but maybe add a note
          booking.status = 'cancelled';
          await booking.save({ session });
          refundResults.push({ bookingId: booking._id, status: 'cancelled', error: refundError.message });
        }
      } else {
        // No payment ID (maybe free event or manual payment)
        booking.status = 'cancelled';
        await booking.save({ session });
        refundResults.push({ bookingId: booking._id, status: 'cancelled' });
      }
    }

    // 4. Cancel pending payouts for this event
    await Payout.updateMany(
      { event: event._id, status: 'pending' },
      { status: 'failed', notes: 'Event cancelled' }
    ).session(session);

    await session.commitTransaction();
    session.endSession();

    res.json({ 
      message: 'Event cancelled and refunds initiated', 
      refundCount: bookings.length,
      results: refundResults 
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Cancel event error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
