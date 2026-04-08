import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import StoreOwner from '../models/StoreOwner.js';
import LocalStore from '../models/LocalStore.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendStoreOwnerWelcomeEmail } from '../utils/emailService.js';

const generateToken = (id: string, role: string) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });

// Admin creates a store owner account
export const createStoreOwner = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, storeId } = req.body;

    const store = await LocalStore.findById(storeId);
    if (!store) return res.status(404).json({ message: 'Store not found' });

    const exists = await StoreOwner.findOne({ email });
    if (exists) return res.status(400).json({ message: 'An owner with this email already exists' });

    // Generate and hash a temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const owner = await StoreOwner.create({ name, email, password: hashedPassword, storeId });

    // Send welcome email with temporary password
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/store-owner/login`;
    try {
      await sendStoreOwnerWelcomeEmail(email, name, store.name, loginUrl, tempPassword);
    } catch (emailErr) {
      console.error('Failed to send store owner email:', emailErr);
    }

    res.status(201).json({
      _id: owner._id,
      name: owner.name,
      email: owner.email,
      storeId: owner.storeId,
      tempPassword, // Return it once so admin can share it manually if email fails
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Store owner login
export const loginStoreOwner = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const owner = await StoreOwner.findOne({ email }).populate('storeId', 'name category photos isActive');
    if (!owner) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      _id: owner._id,
      name: owner.name,
      email: owner.email,
      role: 'store_owner',
      storeId: (owner.storeId as any)?._id || owner.storeId,
      storeName: (owner.storeId as any)?.name,
      token: generateToken(String(owner._id), 'store_owner'),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get store owners for a given store (admin)
export const getStoreOwners = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;
    const owners = await StoreOwner.find({ storeId }).select('-password');
    res.json(owners);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Delete store owner (admin)
export const deleteStoreOwner = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await StoreOwner.findByIdAndDelete(id);
    res.json({ message: 'Owner removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
