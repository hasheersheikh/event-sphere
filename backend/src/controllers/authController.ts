import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import EventManager from '../models/EventManager.js';

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

const getModelByRole = (role: string): any => {
  if (role === 'admin') return Admin;
  if (role === 'event_manager') return EventManager;
  return User;
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const userRole = role || 'user';
  const Model = getModelByRole(userRole);

  try {
    const userExists = await Model.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists in this category' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await Model.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      ...(userRole === 'event_manager' && { isApproved: false }),
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: (user as any).isApproved ?? true,
        token: generateToken(user._id.toString(), user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  const userRole = role || 'user';
  const Model = getModelByRole(userRole);

  try {
    const user = await Model.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password || ''))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: (user as any).isApproved ?? true,
        token: generateToken(user._id.toString(), user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getMe = async (req: any, res: Response) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
