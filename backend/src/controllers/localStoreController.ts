import { Request, Response } from 'express';
import LocalStore from '../models/LocalStore.js';
import { AuthRequest } from '../middleware/auth.js';

export const getLocalStores = async (_req: Request, res: Response) => {
  try {
    const stores = await LocalStore.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(stores);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLocalStore = async (req: Request, res: Response) => {
  try {
    const store = await LocalStore.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Store not found' });
    res.json(store);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createLocalStore = async (req: Request, res: Response) => {
  try {
    const store = await LocalStore.create(req.body);
    res.status(201).json(store);
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Server error' });
  }
};

export const updateLocalStore = async (req: Request, res: Response) => {
  try {
    const store = await LocalStore.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!store) return res.status(404).json({ message: 'Store not found' });
    res.json(store);
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Server error' });
  }
};

export const deleteLocalStore = async (req: Request, res: Response) => {
  try {
    const store = await LocalStore.findByIdAndDelete(req.params.id);
    if (!store) return res.status(404).json({ message: 'Store not found' });
    res.json({ message: 'Store deleted successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addProduct = async (req: Request, res: Response) => {
  try {
    const store = await LocalStore.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Store not found' });
    store.products.push(req.body);
    await store.save();
    res.json(store);
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Server error' });
  }
};

export const removeProduct = async (req: Request, res: Response) => {
  try {
    const store = await LocalStore.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Store not found' });
    store.products = store.products.filter(
      (p: any) => p._id?.toString() !== req.params.productId
    );
    await store.save();
    res.json(store);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllLocalStores = async (_req: Request, res: Response) => {
  try {
    const stores = await LocalStore.find().sort({ createdAt: -1 });
    res.json(stores);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleStoreStatus = async (req: Request, res: Response) => {
  try {
    const store = await LocalStore.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Store not found' });
    store.isActive = !store.isActive;
    await store.save();
    res.json(store);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// Store owner: get their own store
export const getMyStore = async (req: AuthRequest, res: Response) => {
  try {
    const store = await LocalStore.findById(req.user?.storeId);
    if (!store) return res.status(404).json({ message: 'Store not found' });
    res.json(store);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// Store owner: update allowed fields of their own store
export const updateMyStore = async (req: AuthRequest, res: Response) => {
  try {
    const ALLOWED = [
      'description', 'photos', 'contactPhone', 'contactEmail',
      'whatsapp', 'openingHours', 'paymentMethods', 'upiId',
      'bankDetails', 'instagram', 'facebook', 'website',
    ];
    const update: Record<string, any> = {};
    for (const key of ALLOWED) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    const store = await LocalStore.findByIdAndUpdate(req.user?.storeId, update, { new: true });
    if (!store) return res.status(404).json({ message: 'Store not found' });
    res.json(store);
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Server error' });
  }
};
