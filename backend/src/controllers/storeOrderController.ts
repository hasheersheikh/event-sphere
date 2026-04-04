import { Request, Response } from 'express';
import StoreOrder from '../models/StoreOrder.js';
import LocalStore from '../models/LocalStore.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendStoreOrderEmail, sendCustomerOrderEmail } from '../utils/emailService.js';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { storeId, items, customer, paymentMethod, notes } = req.body;

    const store = await LocalStore.findById(storeId);
    if (!store || !store.isActive) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const totalAmount = items.reduce((sum: number, item: any) => {
      const discounted = item.price * (1 - (item.discountPercent || 0) / 100);
      return sum + discounted * item.quantity;
    }, 0);

    const userId = (req as AuthRequest).user?._id;

    const order = await StoreOrder.create({
      storeId,
      storeName: store.name,
      storeEmail: store.contactEmail,
      customer,
      userId,
      items,
      totalAmount,
      paymentMethod: paymentMethod || 'cash',
      notes,
    });

    // Non-blocking emails
    (async () => {
      try {
        if (store.contactEmail) {
          await sendStoreOrderEmail(store.contactEmail, store.name, order);
        }
        await sendCustomerOrderEmail(customer.email, customer.name, store.name, order);
      } catch (err) {
        console.error('Order email failed:', err);
      }
    })();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await StoreOrder.find({ userId: req.user?._id })
      .populate('storeId', 'name photos address')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status, storeId } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (storeId) filter.storeId = storeId;

    const orders = await StoreOrder.find(filter)
      .populate('storeId', 'name photos')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await StoreOrder.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Store owners can only update orders for their own store
    if (req.user?.role === 'store_owner') {
      if (String(order.storeId) !== String(req.user.storeId)) {
        return res.status(403).json({ message: 'Not authorized to update this order' });
      }
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getStoreOwnerOrders = async (req: AuthRequest, res: Response) => {
  try {
    const storeId = req.user?.storeId;
    const { status } = req.query;
    const filter: any = { storeId };
    if (status) filter.status = status;

    const orders = await StoreOrder.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
