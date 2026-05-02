import { Response } from 'express';
import RefundRequest from '../models/RefundRequest.js';
import Booking from '../models/Booking.js';
import razorpay from '../utils/razorpay.js';
import { AuthRequest } from '../middleware/auth.js';

export const getRefundRequests = async (req: AuthRequest, res: Response) => {
  try {
    const requests = await RefundRequest.find()
      .populate('booking')
      .populate('event', 'title')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const processManualRefund = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const request = await RefundRequest.findById(id);

    if (!request) return res.status(404).json({ message: 'Refund request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    try {
      // Attempt Razorpay refund again
      await razorpay.payments.refund(request.paymentId, {
        amount: request.amount * 100,
        notes: {
          reason: 'Manual refund processed by admin',
          refundRequestId: request._id.toString()
        }
      });

      request.status = 'completed';
      request.adminNotes = adminNotes;
      await request.save();

      // Update booking status
      await Booking.findByIdAndUpdate(request.booking, { status: 'refunded' });

      res.json({ message: 'Manual refund processed successfully', request });
    } catch (razorpayError: any) {
      request.adminNotes = `Manual attempt failed: ${razorpayError.message}. ${adminNotes || ''}`;
      await request.save();
      res.status(400).json({ message: 'Razorpay refund failed again', error: razorpayError.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateRefundRequestStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    
    const request = await RefundRequest.findByIdAndUpdate(
      id,
      { status, adminNotes },
      { new: true }
    );

    if (!request) return res.status(404).json({ message: 'Refund request not found' });
    
    if (status === 'completed') {
        await Booking.findByIdAndUpdate(request.booking, { status: 'refunded' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
