import api from './api';

// CLOUDINARY_ENABLED defaults to false — every upload falls back to the
// backend's local VPS disk storage unless Cloudinary is deliberately turned on.
export const CLOUDINARY_ENABLED = import.meta.env.VITE_CLOUDINARY_ENABLED === 'true';
export const USE_LOCAL_STORAGE = !CLOUDINARY_ENABLED;

export const uploadImageToBackend = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/upload/single', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url as string;
};

export const uploadImagesToBackend = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach(f => formData.append('files', f));
  const { data } = await api.post('/upload/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.urls as string[];
};

// Backend's /upload/single accepts image/* or video/* (50MB limit), so it
// doubles as the local-storage video path too — no dedicated video endpoint needed.
export const uploadVideoToBackend = uploadImageToBackend;
