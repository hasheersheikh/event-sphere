import { Request, Response } from 'express';
import ShowcaseVideo from '../models/ShowcaseVideo.js';
import { AuthRequest } from '../middleware/auth.js';

// Public — active videos ordered for display
export const getShowcaseVideos = async (_req: Request, res: Response) => {
  try {
    const videos = await ShowcaseVideo.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(videos);
  } catch {
    res.status(500).json({ message: 'Failed to fetch showcase videos' });
  }
};

// Admin — all videos
export const getAllShowcaseVideos = async (_req: AuthRequest, res: Response) => {
  try {
    const videos = await ShowcaseVideo.find().sort({ order: 1, createdAt: -1 });
    res.json(videos);
  } catch {
    res.status(500).json({ message: 'Failed to fetch showcase videos' });
  }
};

// Admin — create
export const createShowcaseVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { platform, videoId, label, isActive, order } = req.body;
    if (!platform || !videoId) {
      res.status(400).json({ message: 'platform and videoId are required' });
      return;
    }
    const video = await ShowcaseVideo.create({
      platform,
      videoId,
      label: label || '',
      isActive: isActive ?? true,
      order: order ?? 0,
    });
    res.status(201).json(video);
  } catch {
    res.status(500).json({ message: 'Failed to create showcase video' });
  }
};

// Admin — toggle active
export const updateShowcaseVideo = async (req: AuthRequest, res: Response) => {
  try {
    const video = await ShowcaseVideo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!video) { res.status(404).json({ message: 'Video not found' }); return; }
    res.json(video);
  } catch {
    res.status(500).json({ message: 'Failed to update showcase video' });
  }
};

// Admin — delete
export const deleteShowcaseVideo = async (req: AuthRequest, res: Response) => {
  try {
    const video = await ShowcaseVideo.findByIdAndDelete(req.params.id);
    if (!video) { res.status(404).json({ message: 'Video not found' }); return; }
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete showcase video' });
  }
};
