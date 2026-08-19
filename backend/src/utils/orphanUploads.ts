import path from 'path';
import fs from 'fs';
import Upload, { IUpload } from '../models/Upload.js';
import Event from '../models/Event.js';
import LocalStore from '../models/LocalStore.js';
import StoreOrder from '../models/StoreOrder.js';
import TrendingVenue from '../models/TrendingVenue.js';
import HeroAsset from '../models/HeroAsset.js';
import Influencer from '../models/Influencer.js';
import Blog from '../models/Blog.js';
import User from '../models/User.js';
import { deleteAsset } from './cloudinaryService.js';

/**
 * Orphaned-upload management.
 *
 * An "orphan" is a file stored via /api/upload that no document references
 * — typically a banner/event-video uploaded at step 1 of the event wizard
 * for an event that was never submitted.
 *
 * Every collection that persists upload URLs is listed in MEDIA_FIELDS.
 * A file is only ever deleted when its key appears in NONE of them, so the
 * failure mode of a missed entry here is "file kept", never "live asset
 * deleted".
 */

/** How long an unreferenced upload is kept before the sweep may delete it. */
export const ORPHAN_GRACE_HOURS = 24;
/** Legacy disk files (uploaded before the Upload ledger existed) must be
 *  older than this before reconciliation may remove them. */
const LEGACY_FILE_GRACE_DAYS = 7;

export const uploadKeyFromUrl = (url: string): string | null => {
  if (!url) return null;
  if (url.includes('res.cloudinary.com')) {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
    return match ? match[1] : null;
  }
  if (url.includes('/uploads/')) {
    // basename() strips any path components — keys are plain filenames
    return path.basename(url.split('/uploads/').pop() || '');
  }
  return null;
};

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Every model that stores upload URLs. Keep in sync when a new media-bearing
// collection is added — see the header comment for why completeness matters.
const MEDIA_FIELDS: { model: any; fields: string[] }[] = [
  { model: Event, fields: ['image', 'eventVideo', 'videoUrl', 'reels', 'artist.profileImage', 'lineup.image'] },
  // LocalStore has no top-level image field — its media lives in bannerPhoto,
  // listingPhoto, photos, and each product's image (all uploaded via /api/upload).
  // StoreOrder snapshots the product image per item at purchase time, so an
  // ordered product's file must survive even if the store later deletes it.
  { model: LocalStore, fields: ['bannerPhoto', 'listingPhoto', 'photos', 'products.image'] },
  { model: StoreOrder, fields: ['items.image'] },
  { model: TrendingVenue, fields: ['image', 'images'] },
  { model: HeroAsset, fields: ['url'] },
  { model: Influencer, fields: ['image'] },
  { model: Blog, fields: ['coverImage'] },
  { model: User, fields: ['avatar'] },
];

/** Whether any document in any media-bearing collection references this key. */
export const isUploadKeyReferenced = async (key: string): Promise<boolean> => {
  const re = new RegExp(escapeRegExp(key));
  for (const { model, fields } of MEDIA_FIELDS) {
    // eslint-disable-next-line no-await-in-loop
    if (await model.exists({ $or: fields.map((f) => ({ [f]: re })) })) {
      return true;
    }
  }
  return false;
};

/**
 * Delete a caller's own uploads that ended up unused. Used by the wizard's
 * abandon/replace cleanup. Only files with an Upload ledger row owned by
 * `userId` are considered — an unknown URL is skipped (fail-safe: direct
 * Cloudinary uploads or files uploaded before the ledger existed are never
 * deleted through this path).
 */
export const deleteUnusedUploads = async (urls: string[], userId: string): Promise<number> => {
  let deleted = 0;
  for (const url of urls) {
    const key = uploadKeyFromUrl(url);
    if (!key) continue;

    // eslint-disable-next-line no-await-in-loop
    const doc: IUpload | null = await Upload.findOne({ key, uploader: userId });
    if (!doc) continue; // not the caller's upload (or pre-ledger) — leave it

    // eslint-disable-next-line no-await-in-loop
    if (await isUploadKeyReferenced(key)) {
      // Something references it now (e.g. the event was just created from
      // another tab) — drop the ledger row's candidacy but keep everything.
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    await deleteAsset(url);
    // eslint-disable-next-line no-await-in-loop
    await doc.deleteOne();
    deleted++;
  }
  return deleted;
};

/**
 * Sweep for uploads past the grace window that nothing references.
 * Scheduled by cronJobs; also reconciles legacy files that predate the
 * Upload ledger (local-storage mode only).
 */
export const cleanupOrphanUploads = async (logger: { info: (m: string) => void; error: (m: string) => void }): Promise<void> => {
  const cutoff = new Date(Date.now() - ORPHAN_GRACE_HOURS * 60 * 60 * 1000);

  const candidates = await Upload.find({ createdAt: { $lt: cutoff } }).limit(500);
  let deleted = 0;
  for (const doc of candidates) {
    // eslint-disable-next-line no-await-in-loop
    if (await isUploadKeyReferenced(doc.key)) continue;
    // eslint-disable-next-line no-await-in-loop
    await deleteAsset(doc.url);
    // eslint-disable-next-line no-await-in-loop
    await doc.deleteOne();
    deleted++;
  }
  if (deleted > 0) {
    logger.info(`Orphan upload sweep: deleted ${deleted} unreferenced upload(s) older than ${ORPHAN_GRACE_HOURS}h`);
  }

  await reconcileLegacyFiles(logger);
};

/**
 * Files uploaded before the Upload ledger existed have no DB row and would
 * never be swept. Any file on disk older than LEGACY_FILE_GRACE_DAYS with no
 * ledger row and no reference anywhere is leftover garbage from abandoned
 * flows — reclaim it. Local-storage mode only (Cloudinary mode keeps no
 * local files).
 */
const reconcileLegacyFiles = async (logger: { info: (m: string) => void; error: (m: string) => void }): Promise<void> => {
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) return;

  const legacyCutoff = Date.now() - LEGACY_FILE_GRACE_DAYS * 24 * 60 * 60 * 1000;
  let deleted = 0;

  for (const name of fs.readdirSync(uploadsDir)) {
    const filePath = path.join(uploadsDir, name);
    try {
      // eslint-disable-next-line no-await-in-loop
      const stat = fs.statSync(filePath);
      if (!stat.isFile() || stat.mtimeMs > legacyCutoff) continue;

      // Skip anything the ledger knows about — the main sweep owns those.
      // eslint-disable-next-line no-await-in-loop
      if (await Upload.exists({ key: name })) continue;

      // eslint-disable-next-line no-await-in-loop
      if (await isUploadKeyReferenced(name)) continue;

      fs.unlinkSync(filePath);
      deleted++;
    } catch (err) {
      logger.error(`Legacy upload reconciliation failed for ${name}: ${err}`);
    }
  }
  if (deleted > 0) {
    logger.info(`Orphan upload sweep: reclaimed ${deleted} legacy file(s) with no ledger row and no references`);
  }
};
