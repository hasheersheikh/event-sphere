import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import EventManager from '../models/EventManager.js';
import Volunteer from '../models/Volunteer.js';

export interface AuthRequest extends Request {
  user?: any;
}

const getModelByRole = (role: string) => {
  if (role === 'admin') return Admin;
  if (role === 'event_manager') return EventManager;
  if (role === 'volunteer') return Volunteer;
  return User;
};

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string, role: string };

      const Model = getModelByRole(decoded.role) as any;
      req.user = await Model.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    if (res.headersSent) return;
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const optionalProtect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string, role: string };

      const Model = getModelByRole(decoded.role) as any;
      req.user = await Model.findById(decoded.id).select('-password');
    } catch (error) {
      console.error('Optional auth failed:', error);
      // Don't fail the request, just don't set req.user
    }
  }
  next();
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role ${req.user?.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
