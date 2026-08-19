import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { CLOUDINARY_ENABLED, uploadImageToBackend } from "@/lib/localUpload";
import { UPLOAD_SPECS, validateUploadFile } from "@/lib/uploadSpecs";
import { requestImageCrop } from "@/lib/imageCropController";
import { trackSessionUpload } from "@/lib/uploadSession";
import type { EventFormValues } from "@/lib/eventFormSchema";

// Shared banner/event-video/artist-photo upload logic for CreateEventPage and
// EditEventPage — identical on both pages. Must be called from a component
// rendered under <Form {...form}> (a FormProvider), since it reads the form
// via context rather than taking it as a parameter.
export const useEventMediaUpload = () => {
  const form = useFormContext<EventFormValues>();

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const artistPhotoInputRef = useRef<HTMLInputElement>(null);
  const [artistPhotoUploading, setArtistPhotoUploading] = useState(false);

  // Direct Cloudinary REST upload — no widget/popup
  const uploadToCloudinary = async (file: File, resourceType: "image" | "video" = "image"): Promise<string> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (CLOUDINARY_ENABLED && cloudName && uploadPreset) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", uploadPreset);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        { method: "POST", body: fd }
      );
      const data = await res.json();
      if (!data.secure_url) throw new Error("Cloudinary upload failed");
      // Direct-to-Cloudinary uploads have no backend ledger row, but tracking
      // them here is harmless — the backend skips unknown URLs on cleanup.
      trackSessionUpload(data.secure_url as string);
      return data.secure_url as string;
    }
    const url = await uploadImageToBackend(file);
    trackSessionUpload(url);
    return url;
  };

  const handleUpload = () => { bannerInputRef.current?.click(); };

  const handleLocalBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateUploadFile(file, UPLOAD_SPECS.eventBanner);
    if (validationError) {
      toast.error(validationError);
      e.target.value = "";
      return;
    }
    const cropped = await requestImageCrop(file, UPLOAD_SPECS.eventBanner.aspect!);
    if (!cropped) { e.target.value = ""; return; }
    try {
      const url = await uploadToCloudinary(cropped, "image");
      form.setValue("image", url);
      toast.success("Banner uploaded.");
    } catch { toast.error("Upload failed."); }
    e.target.value = "";
  };

  const handleArtistPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const validationError = validateUploadFile(file, UPLOAD_SPECS.artistPhoto);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    const cropped = await requestImageCrop(file, UPLOAD_SPECS.artistPhoto.aspect!, UPLOAD_SPECS.artistPhoto.cropShape);
    if (!cropped) return;
    setArtistPhotoUploading(true);
    try {
      const url = await uploadToCloudinary(cropped, "image");
      form.setValue("artist.profileImage", url);
      toast.success("Artist photo uploaded.");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setArtistPhotoUploading(false);
    }
  };

  const handleVideoUpload = () => { videoInputRef.current?.click(); };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateUploadFile(file, UPLOAD_SPECS.eventVideo);
    if (validationError) {
      toast.error(validationError);
      e.target.value = "";
      return;
    }

    try {
      const url = await uploadToCloudinary(file, "video");
      form.setValue("eventVideo", url);
      toast.success("Event video uploaded. This will be displayed in a gallery with your banner image.", {
        description: "Video should be in Instagram photo aspect ratio (4:5 portrait). Other aspect ratios will be cropped.",
        duration: 5000,
      });
    } catch { toast.error("Video upload failed."); }
    e.target.value = "";
  };

  return {
    bannerInputRef,
    videoInputRef,
    artistPhotoInputRef,
    artistPhotoUploading,
    uploadToCloudinary,
    handleUpload,
    handleLocalBannerUpload,
    handleArtistPhotoUpload,
    handleVideoUpload,
    handleVideoFileUpload,
  };
};
