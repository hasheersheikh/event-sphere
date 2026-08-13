// Singleton bridge between "a page wants a file cropped" and the single
// <ImageCropDialog /> mounted once at the app root — mirrors how sonner's
// toast() call works without every page mounting its own <Toaster />.

export interface CropRequest {
  file: File;
  imageSrc: string;
  aspect: number;
  cropShape: "rect" | "round";
  resolve: (file: File | null) => void;
}

type Listener = (request: CropRequest | null) => void;

let currentRequest: CropRequest | null = null;
const listeners = new Set<Listener>();

const notify = () => {
  listeners.forEach((listener) => listener(currentRequest));
};

export const subscribeToImageCrop = (listener: Listener): (() => void) => {
  listeners.add(listener);
  listener(currentRequest);
  return () => listeners.delete(listener);
};

/**
 * Opens the shared crop dialog for `file` at the given aspect ratio (width / height).
 * Resolves with the cropped File, or null if the user cancels.
 */
export const requestImageCrop = (
  file: File,
  aspect: number,
  cropShape: "rect" | "round" = "rect"
): Promise<File | null> => {
  // Only one crop can be in flight — cancel any stale request first.
  if (currentRequest) {
    settleImageCrop(null);
  }

  return new Promise((resolve) => {
    currentRequest = { file, aspect, cropShape, imageSrc: URL.createObjectURL(file), resolve };
    notify();
  });
};

export const settleImageCrop = (result: File | null) => {
  if (!currentRequest) return;
  const { resolve, imageSrc } = currentRequest;
  currentRequest = null;
  notify();
  resolve(result);
  URL.revokeObjectURL(imageSrc);
};
