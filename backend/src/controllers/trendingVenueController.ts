import { Request, Response } from 'express';
import TrendingVenue from '../models/TrendingVenue.js';
import { AuthRequest } from '../middleware/auth.js';

// Public — only active venues, ordered
export const getTrendingVenues = async (_req: Request, res: Response) => {
  try {
    const venues = await TrendingVenue.find({ isActive: true }).sort({ order: 1 });
    res.json(venues);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trending venues' });
  }
};

// Admin — all venues
export const getAllTrendingVenues = async (_req: AuthRequest, res: Response) => {
  try {
    const venues = await TrendingVenue.find().sort({ order: 1 });
    res.json(venues);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trending venues' });
  }
};

// Admin — create a new trending venue
export const createTrendingVenue = async (req: AuthRequest, res: Response) => {
  try {
    const { name, location, description, image, order, isActive } = req.body;

    if (!name || !location) {
      res.status(400).json({ message: 'name and location are required' });
      return;
    }

    const venue = await TrendingVenue.create({
      name,
      location,
      description,
      image,
      order: order ?? 0,
      isActive: isActive ?? true,
    });

    res.status(201).json(venue);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create trending venue' });
  }
};

// Admin — update an existing trending venue
export const updateTrendingVenue = async (req: AuthRequest, res: Response) => {
  try {
    const venue = await TrendingVenue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!venue) {
      res.status(404).json({ message: 'Venue not found' });
      return;
    }

    res.json(venue);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update trending venue' });
  }
};

// Admin — delete a trending venue
export const deleteTrendingVenue = async (req: AuthRequest, res: Response) => {
  try {
    const venue = await TrendingVenue.findByIdAndDelete(req.params.id);

    if (!venue) {
      res.status(404).json({ message: 'Venue not found' });
      return;
    }

    res.json({ message: 'Venue deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete trending venue' });
  }
};
