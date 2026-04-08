import { Response } from 'express';
import StorePayout from '../models/StorePayout.js';
import StoreOrder from '../models/StoreOrder.js';
import LocalStore from '../models/LocalStore.js';
import { AuthRequest } from '../middleware/auth.js';

const PLATFORM_FEE_PERCENT = 2; // 2% platform fee

// Store owner: request a payout
export const requestPayout = async (req: AuthRequest, res: Response) => {
  try {
    const storeId = req.user?.storeId;
    const { payoutMethod, upiId, bankDetails } = req.body;

    if (!payoutMethod) return res.status(400).json({ message: 'Payout method is required' });
    if (payoutMethod === 'upi' && !upiId) return res.status(400).json({ message: 'UPI ID is required' });
    if (payoutMethod === 'bank_transfer' && !bankDetails?.accountNumber) {
      return res.status(400).json({ message: 'Bank account number is required' });
    }

    // Total delivered revenue for this store
    const deliveredOrders = await StoreOrder.find({ storeId, status: 'delivered' });
    const grossRevenue = deliveredOrders.reduce((s, o) => s + o.totalAmount, 0);

    // Total already paid/processing payouts
    const settledPayouts = await StorePayout.find({
      storeId,
      status: { $in: ['paid', 'processing'] },
    });
    const settledAmount = settledPayouts.reduce((s, p) => s + p.requestedAmount, 0);

    const availableGross = grossRevenue - settledAmount;
    if (availableGross <= 0) {
      return res.status(400).json({ message: 'No earnings available for payout' });
    }

    const platformFee = parseFloat((availableGross * PLATFORM_FEE_PERCENT / 100).toFixed(2));
    const netAmount = parseFloat((availableGross - platformFee).toFixed(2));

    const store = await LocalStore.findById(storeId);

    const payout = await StorePayout.create({
      storeId,
      storeName: store?.name || 'Unknown Store',
      requestedAmount: availableGross,
      platformFee,
      netAmount,
      status: 'pending',
      payoutMethod,
      upiId: payoutMethod === 'upi' ? upiId : undefined,
      bankDetails: payoutMethod === 'bank_transfer' ? bankDetails : undefined,
    });

    res.status(201).json(payout);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Store owner: get their payout history + earnings summary
export const getMyPayouts = async (req: AuthRequest, res: Response) => {
  try {
    const storeId = req.user?.storeId;

    const [deliveredOrders, allPayouts] = await Promise.all([
      StoreOrder.find({ storeId, status: 'delivered' }),
      StorePayout.find({ storeId }).sort({ createdAt: -1 }),
    ]);

    const grossRevenue = deliveredOrders.reduce((s, o) => s + o.totalAmount, 0);
    const totalOrders = await StoreOrder.countDocuments({ storeId });

    const settledAmount = allPayouts
      .filter(p => ['paid', 'processing'].includes(p.status))
      .reduce((s, p) => s + p.requestedAmount, 0);

    const availableGross = Math.max(0, grossRevenue - settledAmount);
    const platformFee = parseFloat((availableGross * PLATFORM_FEE_PERCENT / 100).toFixed(2));
    const availableNet = parseFloat((availableGross - platformFee).toFixed(2));

    const paidOut = allPayouts
      .filter(p => p.status === 'paid')
      .reduce((s, p) => s + p.netAmount, 0);

    res.json({
      summary: {
        totalOrders,
        grossRevenue: parseFloat(grossRevenue.toFixed(2)),
        platformFeePercent: PLATFORM_FEE_PERCENT,
        availableGross: parseFloat(availableGross.toFixed(2)),
        platformFee,
        availableNet,
        paidOut: parseFloat(paidOut.toFixed(2)),
      },
      payouts: allPayouts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Admin: get all payout requests (optionally filtered by storeId or status)
export const getAllPayouts = async (req: AuthRequest, res: Response) => {
  try {
    const { status, storeId } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (storeId) filter.storeId = storeId;
    const payouts = await StorePayout.find(filter)
      .populate('storeId', 'name')
      .sort({ createdAt: -1 });
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Admin: get earnings summary for a specific store
export const getStoreEarnings = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;
    const PLATFORM_FEE_PERCENT = 2;

    const [allOrders, deliveredOrders, allPayouts] = await Promise.all([
      StoreOrder.countDocuments({ storeId }),
      StoreOrder.find({ storeId, status: 'delivered' }),
      StorePayout.find({ storeId }).sort({ createdAt: -1 }),
    ]);

    const grossRevenue = deliveredOrders.reduce((s, o) => s + o.totalAmount, 0);
    const settledAmount = allPayouts
      .filter(p => ['paid', 'processing'].includes(p.status))
      .reduce((s, p) => s + p.requestedAmount, 0);

    const availableGross = Math.max(0, grossRevenue - settledAmount);
    const platformFee = parseFloat((availableGross * PLATFORM_FEE_PERCENT / 100).toFixed(2));
    const availableNet = parseFloat((availableGross - platformFee).toFixed(2));
    const totalPlatformEarned = parseFloat((grossRevenue * PLATFORM_FEE_PERCENT / 100).toFixed(2));
    const paidOut = allPayouts
      .filter(p => p.status === 'paid')
      .reduce((s, p) => s + p.netAmount, 0);

    res.json({
      summary: {
        totalOrders: allOrders,
        deliveredOrders: deliveredOrders.length,
        grossRevenue: parseFloat(grossRevenue.toFixed(2)),
        platformFeePercent: PLATFORM_FEE_PERCENT,
        totalPlatformEarned: parseFloat(totalPlatformEarned.toFixed(2)),
        availableGross: parseFloat(availableGross.toFixed(2)),
        platformFee,
        availableNet,
        paidOut: parseFloat(paidOut.toFixed(2)),
      },
      payouts: allPayouts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Admin: update payout status
export const updatePayoutStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const payout = await StorePayout.findById(id);
    if (!payout) return res.status(404).json({ message: 'Payout not found' });

    payout.status = status;
    if (adminNote) payout.adminNote = adminNote;
    if (['paid', 'rejected'].includes(status)) payout.processedAt = new Date();
    await payout.save();

    res.json(payout);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
