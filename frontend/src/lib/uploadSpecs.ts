// Central catalog of "what am I allowed to upload here" per upload site.
// Local-storage mode has no Cloudinary widget to crop/constrain uploads client-side,
// so every upload site enforces its own file type + size limit and shows the
// recommended dimensions up front instead of silently accepting anything.

export interface UploadSpec {
  /** Value for the <input accept> attribute — narrows the OS file picker. */
  accept: string;
  /** Explicit allowlist checked against file.type — accept alone is not enforced by browsers. */
  allowedMimeTypes: string[];
  maxSizeMB: number;
  /** Human-readable guidance shown next to the upload control. */
  hint: string;
  /** width/height ratio enforced by the crop step. Omitted for video specs — video isn't cropped. */
  aspect?: number;
  /** Crop overlay shape. Defaults to a rectangle when omitted. */
  cropShape?: "rect" | "round";
}

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_ACCEPT = IMAGE_MIME_TYPES.join(",");
const VIDEO_MIME_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const VIDEO_ACCEPT = VIDEO_MIME_TYPES.join(",");

export const UPLOAD_SPECS = {
  eventBanner: {
    accept: IMAGE_ACCEPT,
    allowedMimeTypes: IMAGE_MIME_TYPES,
    maxSizeMB: 1,
    hint: "JPG, PNG or WebP · 1080×1350px (4:5 portrait) recommended · max 1MB",
    aspect: 4 / 5,
  },
  eventVideo: {
    accept: VIDEO_ACCEPT,
    allowedMimeTypes: VIDEO_MIME_TYPES,
    maxSizeMB: 4,
    hint: "MP4, MOV or WebM · Instagram-style 4:5 portrait recommended · max 4MB",
  },
  productImage: {
    accept: IMAGE_ACCEPT,
    allowedMimeTypes: IMAGE_MIME_TYPES,
    maxSizeMB: 1,
    hint: "JPG, PNG or WebP · square, 800×800px recommended · max 1MB",
    aspect: 1,
  },
  storeBanner: {
    accept: IMAGE_ACCEPT,
    allowedMimeTypes: IMAGE_MIME_TYPES,
    maxSizeMB: 1,
    hint: "JPG, PNG or WebP · 1600×600px wide banner recommended · max 1MB",
    aspect: 1600 / 600,
  },
  storeListingPhoto: {
    accept: IMAGE_ACCEPT,
    allowedMimeTypes: IMAGE_MIME_TYPES,
    maxSizeMB: 1,
    hint: "JPG, PNG or WebP · 1200×1200px recommended · max 1MB",
    aspect: 1,
  },
  blogCover: {
    accept: IMAGE_ACCEPT,
    allowedMimeTypes: IMAGE_MIME_TYPES,
    maxSizeMB: 1,
    hint: "JPG, PNG or WebP · 1600×900px (16:9) recommended · max 1MB",
    aspect: 16 / 9,
  },
  influencerPhoto: {
    accept: IMAGE_ACCEPT,
    allowedMimeTypes: IMAGE_MIME_TYPES,
    maxSizeMB: 1,
    hint: "JPG, PNG or WebP · square, 600×600px recommended · max 1MB",
    aspect: 1,
  },
  artistPhoto: {
    accept: IMAGE_ACCEPT,
    allowedMimeTypes: IMAGE_MIME_TYPES,
    maxSizeMB: 0.5,
    hint: "JPG, PNG or WebP · square, 400×400px recommended · max 500KB",
    aspect: 1,
    cropShape: "round",
  },
  venueImage: {
    accept: IMAGE_ACCEPT,
    allowedMimeTypes: IMAGE_MIME_TYPES,
    maxSizeMB: 1,
    // Must match the 4:5 aspect the venue cards render at (TrendingVenueManagementPage
    // grid + public TrendingVenues.tsx) — a mismatch here crops images that then get
    // letterboxed/center-cropped again on display.
    hint: "JPG, PNG or WebP · 1080×1350px (4:5 portrait) recommended · max 1MB",
    aspect: 4 / 5,
  },
  heroImage: {
    accept: IMAGE_ACCEPT,
    allowedMimeTypes: IMAGE_MIME_TYPES,
    maxSizeMB: 1,
    hint: "JPG, PNG or WebP · max 1MB",
    // No fixed aspect — HeroManagementPage picks 2:1 / 4:5 / 1:1 based on target device.
  },
  heroVideo: {
    accept: VIDEO_ACCEPT,
    allowedMimeTypes: VIDEO_MIME_TYPES,
    maxSizeMB: 5,
    hint: "MP4, MOV or WebM · max 5MB",
  },
} as const satisfies Record<string, UploadSpec>;

export type UploadSpecKey = keyof typeof UPLOAD_SPECS;

const formatLabel = (mime: string) => mime.split("/")[1].toUpperCase().replace("QUICKTIME", "MOV");

/** Returns an error message if the file fails the spec's type/size rules, otherwise null. */
export const validateUploadFile = (file: File, spec: UploadSpec): string | null => {
  if (!spec.allowedMimeTypes.includes(file.type)) {
    const allowed = spec.allowedMimeTypes.map(formatLabel).join(", ");
    return `Unsupported file type. Please upload: ${allowed}.`;
  }
  const maxBytes = spec.maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `File is too large (max ${spec.maxSizeMB}MB).`;
  }
  return null;
};
