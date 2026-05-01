import { Request, Response } from 'express';
import HeroAsset from '../models/HeroAsset.js';
import { AuthRequest } from '../middleware/auth.js';

// Public — only active assets, ordered for the home page carousel
export const getHeroAssets = async (_req: Request, res: Response) => {
  try {
    const assets = await HeroAsset.find({ isActive: true }).sort({ order: 1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch hero assets' });
  }
};

// Admin — all assets regardless of active state
export const getAllHeroAssets = async (_req: AuthRequest, res: Response) => {
  try {
    const assets = await HeroAsset.find().sort({ order: 1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch hero assets' });
  }
};

// Admin — create a new hero asset
export const createHeroAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { type, url, duration, order, targetDevice, isActive } = req.body;

    if (!type || !url) {
      res.status(400).json({ message: 'type and url are required' });
      return;
    }

    const asset = await HeroAsset.create({
      type,
      url,
      duration: duration ?? 5000,
      order: order ?? 0,
      targetDevice: targetDevice ?? 'all',
      isActive: isActive ?? true,
    });

    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create hero asset' });
  }
};

// Admin — update an existing hero asset
export const updateHeroAsset = async (req: AuthRequest, res: Response) => {
  try {
    const asset = await HeroAsset.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!asset) {
      res.status(404).json({ message: 'Asset not found' });
      return;
    }

    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update hero asset' });
  }
};

// Admin — delete a hero asset
export const deleteHeroAsset = async (req: AuthRequest, res: Response) => {
  try {
    const asset = await HeroAsset.findByIdAndDelete(req.params.id);

    if (!asset) {
      res.status(404).json({ message: 'Asset not found' });
      return;
    }

    res.json({ message: 'Asset deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete hero asset' });
  }
};
