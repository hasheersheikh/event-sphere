/**
 * Cloudinary Image Optimization Helper
 * Automatically applies optimal transformations for performance
 */

export interface CloudinaryImageOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-100, default: auto
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  crop?: 'scale' | 'fit' | 'crop' | 'fill' | 'limit';
  gravity?: 'auto' | 'center' | 'face' | 'faces';
  fetchFormat?: boolean;
}

/**
 * Generate optimized Cloudinary URL with automatic quality and format
 */
export function getOptimizedCloudinaryUrl(
  baseUrl: string,
  options: CloudinaryImageOptions = {}
): string {
  if (!baseUrl || !baseUrl.includes('cloudinary.com')) {
    return baseUrl; // Return as-is if not a Cloudinary URL
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
    gravity = 'auto',
    fetchFormat = true,
  } = options;

  // Extract the base URL before transformations
  const uploadIndex = baseUrl.indexOf('/upload/');
  if (uploadIndex === -1) return baseUrl;

  const beforeUpload = baseUrl.substring(0, uploadIndex + 8); // +8 for '/upload/'
  const afterUpload = baseUrl.substring(uploadIndex + 8);

  // Build transformations array
  const transformations: string[] = [];

  // Add quality
  if (typeof quality === 'number') {
    transformations.push(`q_${quality}`);
  } else {
    transformations.push('q_auto');
  }

  // Add format
  if (fetchFormat || format === 'auto') {
    transformations.push('f_auto');
  } else if (format !== 'auto') {
    transformations.push(`f_${format}`);
  }

  // Add dimensions
  if (width || height) {
    if (width && height) {
      transformations.push(`${crop}_${width}_${height}`);
    } else if (width) {
      transformations.push(`w_${width}`);
    } else if (height) {
      transformations.push(`h_${height}`);
    }
  }

  // Add gravity if crop needs it
  if (gravity && crop === 'fill') {
    transformations.push(`g_${gravity}`);
  }

  // Add dpr for responsive images
  transformations.push('dpr_auto');

  // Combine transformations
  const transformationString = transformations.length > 0
    ? transformations.join(',') + '/'
    : '';

  return `${beforeUpload}${transformationString}${afterUpload}`;
}

/**
 * Generate responsive srcset for Cloudinary images
 */
export function getCloudinarySrcset(
  baseUrl: string,
  baseWidth: number,
  options: Omit<CloudinaryImageOptions, 'width'> = {}
): string {
  const sizes = [400, 800, 1200, 1600];
  const widths = sizes.filter(w => w <= baseWidth * 2); // Up to 2x for retina

  return widths
    .map(w => `${getOptimizedCloudinaryUrl(baseUrl, { ...options, width: w })} ${w}w`)
    .join(', ');
}

/**
 * Generate blur placeholder for Cloudinary images
 */
export function getCloudinaryBlurPlaceholder(baseUrl: string, width = 50): string {
  return getOptimizedCloudinaryUrl(baseUrl, {
    width,
    quality: 1,
    format: 'jpg',
    crop: 'scale',
  });
}
