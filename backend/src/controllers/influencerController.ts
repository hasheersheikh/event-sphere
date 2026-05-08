import { Response, RequestHandler } from 'express';
import Influencer from '../models/Influencer.js';
import { AuthRequest } from '../middleware/auth.js';

export const getInfluencers: RequestHandler = async (req, res) => {
  try {
    const influencers = await Influencer.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(influencers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const adminGetInfluencers: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const influencers = await Influencer.find().sort({ createdAt: -1 });
    res.json(influencers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createInfluencer: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const influencer = await Influencer.create(req.body);
    res.status(201).json(influencer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateInfluencer: RequestHandler = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const influencer = await Influencer.findByIdAndUpdate(id, req.body, { new: true });
    if (!influencer) {
      res.status(404).json({ message: 'Influencer not found' });
      return;
    }
    res.json(influencer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteInfluencer: RequestHandler = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const influencer = await Influencer.findByIdAndDelete(id);
    if (!influencer) {
      res.status(404).json({ message: 'Influencer not found' });
      return;
    }
    res.json({ message: 'Influencer removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
