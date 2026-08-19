// One-off backfill: compress images already sitting in the uploads volume from
// before server-side compression existed (compressUpload in utils/imageProcessing).
//
// Unlike the upload pipeline, this NEVER changes a file's name — the database
// is full of /uploads/<filename> URLs we'd otherwise have to rewrite — so each
// file is re-encoded in its own format:
//   .png  -> palette-quantized PNG (posters/graphics crush 4-5x, no visible loss)
//   .jpg  -> mozjpeg q82 progressive
//   .webp -> webp q82
// All variants downscale to at most 1920px on the longest edge and strip
// EXIF/GPS metadata. Files <= 1MB, videos, SVGs, and animated images are
// left untouched, and a file is only replaced when the re-encode is smaller.
//
// Usage:
//   node dist/scripts/compressExistingUploads.js          # dry-run (default)
//   node dist/scripts/compressExistingUploads.js --apply  # rewrite files

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '../../uploads');

// Per client request: only bother with files over 1MB — smaller ones cost
// more in re-encode risk than they save in disk.
const MIN_SIZE = 1 * 1024 * 1024;
const MAX_DIMENSION = 1920;

const APPLY = process.argv.includes('--apply');

type Encoder = 'png' | 'jpeg' | 'webp';
const ENCODERS: Record<string, Encoder> = {
  '.png': 'png',
  '.jpg': 'jpeg',
  '.jpeg': 'jpeg',
  '.webp': 'webp',
};

const resize = { width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside' as const, withoutEnlargement: true };

const encodeWith = (input: string, encoder: Encoder, out: string) => {
  let pipeline = sharp(input).rotate() // applies EXIF orientation, then strips the tag
    .resize(resize);
  if (encoder === 'png') {
    // palette: true is pngquant-style quantization — ideal for the poster-style
    // graphics this site's uploads turn out to be; photographic content would
    // band slightly, but the "only if smaller" check plus q95 keeps it sane.
    pipeline = pipeline.png({ compressionLevel: 9, palette: true, quality: 95 });
  } else if (encoder === 'jpeg') {
    pipeline = pipeline.jpeg({ quality: 82, progressive: true, mozjpeg: true });
  } else {
    pipeline = pipeline.webp({ quality: 82 });
  }
  return pipeline.toFile(out);
};

const formatKB = (bytes: number) => `${(bytes / 1024).toFixed(0)}KB`;

const main = async () => {
  const names = fs.readdirSync(uploadsDir).filter((n) => fs.statSync(path.join(uploadsDir, n)).isFile());
  let totalBefore = 0;
  let totalAfter = 0;
  let processed = 0;
  let skipped = 0;

  for (const name of names) {
    const filePath = path.join(uploadsDir, name);
    const ext = path.extname(name).toLowerCase();
    const encoder = ENCODERS[ext];
    const size = fs.statSync(filePath).size;

    if (!encoder || size <= MIN_SIZE) {
      continue; // video, svg, animated ext, small file — not our business
    }

    try {
      const meta = await sharp(filePath).metadata();
      if ((meta.pages ?? 1) > 1) {
        skipped++;
        console.log(`SKIP (animated): ${name}`);
        continue;
      }

      const tmpPath = `${filePath}.tmp`;
      await encodeWith(filePath, encoder, tmpPath);
      const newSize = fs.statSync(tmpPath).size;

      if (newSize >= size) {
        fs.unlinkSync(tmpPath);
        skipped++;
        console.log(`SKIP (already optimal): ${name} ${formatKB(size)} -> ${formatKB(newSize)}`);
        continue;
      }

      if (APPLY) fs.renameSync(tmpPath, filePath);
      else fs.unlinkSync(tmpPath);

      processed++;
      totalBefore += size;
      totalAfter += newSize;
      console.log(
        `${APPLY ? 'COMPRESSED' : 'would compress'}: ${name} ` +
          `${meta.width ?? '?'}x${meta.height ?? '?'} ${formatKB(size)} -> ${formatKB(newSize)} ` +
          `(${((1 - newSize / size) * 100).toFixed(0)}% saved)`
      );
    } catch (err) {
      skipped++;
      console.warn(`SKIP (error, left untouched): ${name}:`, err instanceof Error ? err.message : err);
      fs.rmSync(`${filePath}.tmp`, { force: true });
    }
  }

  console.log(
    `\n${APPLY ? 'Applied' : 'Dry-run (use --apply to execute)'}: ${processed} files ` +
      `${formatKB(totalBefore)} -> ${formatKB(totalAfter)} (${formatKB(totalBefore - totalAfter)} saved), ` +
      `${skipped} skipped, ${names.length} files scanned.`
  );
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
