import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import EventManager from '../models/EventManager.js';
import Volunteer from '../models/Volunteer.js';

import crypto from 'crypto';
import { sendPasswordResetEmail, sendWelcomeEmail, sendManagerSignUpNotificationToAdmin } from '../utils/emailService.js';

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

const getModelByRole = (role: string): any => {
  if (role === 'admin') return Admin;
  if (role === 'event_manager') return EventManager;
  if (role === 'volunteer') return Volunteer;
  return User;
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  
  try {
    // Search in all models since we don't know the role yet
    const models = [User, Admin, EventManager];
    let userFound: any = null;
    let userModel: any = null;

    for (const Model of models) {
      userFound = await (Model as any).findOne({ email });
      if (userFound) {
        userModel = Model;
        break;
      }
    }

    if (!userFound) {
      return res.status(404).json({ message: 'No account with that email address exists.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    userFound.resetPasswordToken = resetToken;
    userFound.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await userFound.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}`;
    
    await sendPasswordResetEmail(userFound.email, userFound.name, resetUrl);

    res.json({ success: true, message: 'Reset link sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  try {
    const models = [User, Admin, EventManager];
    let userFound: any = null;

    for (const Model of models) {
      userFound = await (Model as any).findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });
      if (userFound) break;
    }

    if (!userFound) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    userFound.password = await bcrypt.hash(password, salt);
    userFound.resetPasswordToken = undefined;
    userFound.resetPasswordExpires = undefined;

    await userFound.save();

    res.json({ success: true, message: 'Password has been updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const register = async (req: Request, res: Response) => {
  const { name, password, role } = req.body;
  const email = req.body.email?.toLowerCase();
  const userRole = role || 'user';
  const Model = getModelByRole(userRole);

  try {
    // Check all collections for email uniqueness across the platform
    const models = [User, Admin, EventManager];
    for (const M of models) {
      const existing = await (M as any).findOne({ email });
      if (existing) {
        return res.status(400).json({ message: 'Identity already exists in platform frequency' });
      }
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
      // Trigger Welcome Email (Non-blocking)
      (async () => {
        try {
          await sendWelcomeEmail(user.email, user.name);
          if (userRole === 'event_manager') {
            await sendManagerSignUpNotificationToAdmin(user.name, user.email);
          }
        } catch (err) {
          console.error('Failed to send registration emails:', err);
        }
      })();

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
  const { password, role } = req.body;
  const email = req.body.email?.toLowerCase();
  const userRole = role || 'user';
  
  try {
    // Attempt to find user in all relevant models to handle cross-portal login
    const models = [User, Admin, EventManager, Volunteer];
    let user: any = null;

    // First try the suggested role for efficiency
    const PrimaryModel = getModelByRole(userRole);
    user = await (PrimaryModel as any).findOne({ email });

    // Fallback: search other models if not found in primary
    if (!user) {
      for (const M of models) {
        if (M === PrimaryModel) continue;
        user = await (M as any).findOne({ email });
        if (user) break;
      }
    }

    if (user && (await bcrypt.compare(password, user.password || ''))) {
      if (user.role === 'event_manager' && !user.isApproved) {
        return res.status(403).json({ 
          message: 'Your account is pending administrative approval.',
          isApproved: false 
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: (user as any).isApproved ?? true,
        token: generateToken(user._id.toString(), user.role),
        eventId: user.eventId,
        gate: user.gate,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const { name } = req.body;
  const userRole = (req as any).user?.role || 'user';
  const Model = getModelByRole(userRole);

  try {
    const user = await Model.findById((req as any).user?._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userRole = (req as any).user?.role || 'user';
  const Model = getModelByRole(userRole);

  try {
    const user = await Model.findById((req as any).user?._id);
    if (!user || !(await bcrypt.compare(currentPassword, user.password || ''))) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getMe = async (req: any, res: Response) => {
  const userRole = req.user?.role || 'user';
  const Model = getModelByRole(userRole);
  const user = await Model.findById(req.user._id).select('-password');
  
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
