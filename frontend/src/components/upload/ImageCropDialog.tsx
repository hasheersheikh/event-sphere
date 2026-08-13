import { useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn } from "lucide-react";
import { subscribeToImageCrop, settleImageCrop, type CropRequest } from "@/lib/imageCropController";
import { getCroppedFile } from "@/lib/cropImage";

// Mounted once at the app root. Every upload site opens this via
// requestImageCrop(file, aspect) instead of rendering its own cropper.
const ImageCropDialog = () => {
  const [request, setRequest] = useState<CropRequest | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => subscribeToImageCrop(setRequest), []);

  // Reset crop/zoom state whenever a new file comes in for cropping.
  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
  }, [request?.imageSrc]);

  const handleCancel = () => {
    if (isProcessing) return;
    settleImageCrop(null);
  };

  const handleApply = async () => {
    if (!request || !croppedArea) return;
    setIsProcessing(true);
    try {
      const cropped = await getCroppedFile(
        request.imageSrc,
        croppedArea,
        request.file.name,
        request.file.type,
        request.file.size
      );
      settleImageCrop(cropped);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={!!request} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>

        {request && (
          <div className="space-y-4">
            <div className="relative h-80 w-full overflow-hidden rounded-xl bg-muted">
              <Cropper
                image={request.imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={request.aspect}
                cropShape={request.cropShape}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, area) => setCroppedArea(area)}
              />
            </div>

            <div className="flex items-center gap-3 px-1">
              <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.05}
                onValueChange={([v]) => setZoom(v)}
                className="flex-1"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" onClick={handleCancel} className="flex-1" disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={handleApply} className="flex-1" disabled={isProcessing || !croppedArea}>
                {isProcessing ? "Applying…" : "Apply Crop"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropDialog;
