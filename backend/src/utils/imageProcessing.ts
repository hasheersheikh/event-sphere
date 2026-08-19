import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Raster formats that get re-encoded to JPEG. SVG is vector (rasterizing would
// blur when scaled), and animated GIF/WebP would lose their animation in a
// JPEG re-encode — both pass through untouched.
const CONVERTIBLE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.tif']);

// Longest edge kept after downscaling — retina-friendly for full-width hero
// images, and beyond what any UI in the app renders.
const MAX_DIMENSION = 1920;
// 80-85 is the sweet spot for photos: visually indistinguishable from the
// original at display sizes while cutting file size 5-10x vs PNG.
const JPEG_QUALITY = 82;

/**
 * Compress an uploaded image in place. Auto-orients from EXIF, downscales to
 * MAX_DIMENSION on the longest edge, flattens transparency onto white, strips
 * EXIF/GPS metadata, and re-encodes as progressive JPEG.
 *
 * Mutates `file` (filename/path/size) when the file was rewritten; leaves the
 * original untouched when conversion doesn't apply (video, vector, animated)
 * or wouldn't help (JPEG already smaller than the re-encode).
 */
export async function compressUpload(file: Express.Multer.File): Promise<void> {
  const ext = path.extname(file.filename).toLowerCase();
  if (!CONVERTIBLE_EXTS.has(ext)) return;

  let tmpPath: string | null = null;
  try {
    const meta = await sharp(file.path).metadata();
    // pages > 1 means animated (GIF/WebP) — re-encoding would drop frames.
    if ((meta.pages ?? 1) > 1) return;

    const outPath = path.join(path.dirname(file.path), `${path.basename(file.filename, ext)}.jpg`);
    // sharp refuses to write to its own input path (JPEG inputs), so encode to
    // a sibling temp file and rename over the target once it's confirmed smaller.
    tmpPath = `${outPath}.tmp`;

    await sharp(file.path)
      .rotate() // applies EXIF orientation, then strips the tag
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .flatten({ background: '#ffffff' }) // JPEG has no alpha channel
      .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
      .toFile(tmpPath);

    const newSize = fs.statSync(tmpPath).size;
    if (newSize >= file.size) {
      // Already optimal (rare) — keep the original bytes.
      fs.unlinkSync(tmpPath);
      return;
    }

    const originalSize = file.size;
    if (outPath !== file.path) fs.unlinkSync(file.path);
    fs.renameSync(tmpPath, outPath);
    file.filename = path.basename(outPath);
    file.path = outPath;
    file.size = newSize;

    console.log(
      `Image compressed: ${file.filename} ${meta.width ?? '?'}x${meta.height ?? '?'} ` +
        `${(originalSize / 1024).toFixed(0)}KB ${(meta.format ?? ext).toUpperCase()} -> ${(newSize / 1024).toFixed(0)}KB JPEG`
    );
  } catch (err) {
    // Undecodable image or processing failure: keep the original rather than
    // failing the upload (matches pre-compression behavior).
    if (tmpPath) fs.rmSync(tmpPath, { force: true });
    console.warn(`Image compression skipped for ${file.filename}:`, err instanceof Error ? err.message : err);
  }
}
