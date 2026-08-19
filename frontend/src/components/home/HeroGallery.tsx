import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import RevealImage from "@/components/ui/RevealImage";
import { cn } from "@/lib/utils";

interface HeroAsset {
  _id: string;
  type: "image" | "video";
  url: string;
  targetUrl?: string;
  isActive: boolean;
  targetDevice: "all" | "mobile" | "desktop";
  duration?: number;
}

interface HeroGalleryProps {
  assets: HeroAsset[];
}

const HeroGallery = ({ assets }: HeroGalleryProps) => {
  const HERO_ASSETS = assets;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const preloadedUrls = useRef<Set<string>>(new Set());

  // Preload every image slide up front so each slide reveals fully loaded
  // instead of painting progressively as its bytes arrive
  useEffect(() => {
    HERO_ASSETS.forEach((asset) => {
      if (asset.type !== "image" || preloadedUrls.current.has(asset.url)) return;
      preloadedUrls.current.add(asset.url);
      const img = new Image();
      img.onload = () =>
        setLoadedImages((prev) =>
          prev.has(asset.url) ? prev : new Set(prev).add(asset.url)
        );
      img.src = asset.url;
    });
  }, [HERO_ASSETS]);

  const nextSlide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCurrentIndex((prev) => (prev + 1) % HERO_ASSETS.length);
  };

  const prevSlide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCurrentIndex((prev) => (prev - 1 + HERO_ASSETS.length) % HERO_ASSETS.length);
  };

  const currentAsset = HERO_ASSETS[currentIndex];
  const currentImageReady =
    !currentAsset || currentAsset.type !== "image" || loadedImages.has(currentAsset.url);

  useEffect(() => {
    if (HERO_ASSETS.length === 0 || !currentAsset) return;

    // Hold auto-advance until the current image has finished loading
    if (currentAsset.type === "image" && !currentImageReady) return;

    if (currentAsset.type === "image") {
      timeoutRef.current = setTimeout(() => {
        nextSlide();
      }, currentAsset.duration || 5000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, HERO_ASSETS, currentImageReady]);

  const handleVideoEnded = () => {
    nextSlide();
  };

  if (HERO_ASSETS.length === 0 || !currentAsset) return null;

  const hasTargetUrl = currentAsset?.targetUrl;

  const renderMedia = (interactive: boolean) => {
    const asset = HERO_ASSETS[currentIndex];
    const mediaClassName = cn(
      "w-full h-full object-cover",
      interactive && "pointer-events-none"
    );

    if (asset.type === "image") {
      return (
        <RevealImage
          key={asset.url}
          src={asset.url}
          alt="Hero gallery"
          spinner
          className={mediaClassName}
        />
      );
    }

    return (
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnded}
        className={mediaClassName}
      >
        <source src={asset.url} type="video/mp4" />
      </video>
    );
  };

  return (
    <div className="relative w-full aspect-[2/1] lg:aspect-[4/5] overflow-hidden rounded-lg border border-border bg-muted group">
      {/* Main content wrapper - clickable if targetUrl exists */}
      {hasTargetUrl ? (
        <a
          href={currentAsset.targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 w-full h-full block z-10 cursor-pointer"
          aria-label={`View ${currentAsset.type === 'image' ? 'image' : 'video'} details`}
        >
          {renderMedia(true)}
        </a>
      ) : (
        <div className="absolute inset-0 w-full h-full">
          {renderMedia(false)}
        </div>
      )}

      {/* subtle bottom gradient for readability if text overlaps */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* Navigation arrows - show on all devices */}
      {HERO_ASSETS.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prevSlide();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-40 p-1.5 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 opacity-80"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              nextSlide();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-40 p-1.5 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 opacity-80"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </>
      )}

      {/* Progress indicators (optional, but adds to "premium" feel) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {HERO_ASSETS.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              setCurrentIndex(i);
            }}
            className={`h-1.5 rounded-full transition-all duration-500 hover:bg-white ${
              i === currentIndex ? "w-8 bg-white" : "w-2 bg-white/30"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroGallery;
