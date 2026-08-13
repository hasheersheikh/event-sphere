// Canvas-based crop extraction used by the shared image crop dialog.
// Caps output resolution so a crop from a huge source photo doesn't produce
// an oversized file, and backs off JPEG/WebP quality if it's still too big.

const MAX_OUTPUT_DIMENSION = 2400;

export interface CropPixelArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for cropping"));
    img.src = src;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode cropped image"))),
      mimeType,
      quality
    );
  });

/** Crops `area` (in source-image pixel space) out of `imageSrc` and returns it as a File. */
export const getCroppedFile = async (
  imageSrc: string,
  area: CropPixelArea,
  fileName: string,
  mimeType: string,
  maxSizeBytes?: number
): Promise<File> => {
  const image = await loadImage(imageSrc);

  const scale = Math.min(1, MAX_OUTPUT_DIMENSION / Math.max(area.width, area.height));
  const outputWidth = Math.max(1, Math.round(area.width * scale));
  const outputHeight = Math.max(1, Math.round(area.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser");

  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, outputWidth, outputHeight);

  const isCompressible = mimeType === "image/jpeg" || mimeType === "image/webp";
  let quality = 0.92;
  let blob = await canvasToBlob(canvas, mimeType, isCompressible ? quality : undefined);

  if (isCompressible && maxSizeBytes) {
    while (blob.size > maxSizeBytes && quality > 0.5) {
      quality -= 0.1;
      blob = await canvasToBlob(canvas, mimeType, quality);
    }
  }

  return new File([blob], fileName, { type: mimeType });
};
