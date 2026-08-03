import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCurrentIndex((prev) => (prev + 1) % HERO_ASSETS.length);
  };

  const prevSlide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCurrentIndex((prev) => (prev - 1 + HERO_ASSETS.length) % HERO_ASSETS.length);
  };

  useEffect(() => {
    if (HERO_ASSETS.length === 0) return;

    const currentAsset = HERO_ASSETS[currentIndex];

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
  }, [currentIndex, HERO_ASSETS]);

  const handleVideoEnded = () => {
    nextSlide();
  };

  if (HERO_ASSETS.length === 0) return null;

  const currentAsset = HERO_ASSETS[currentIndex];
  const hasTargetUrl = currentAsset?.targetUrl;

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
          {HERO_ASSETS[currentIndex].type === "image" ? (
            <img
              src={HERO_ASSETS[currentIndex].url}
              alt="Hero gallery"
              className="w-full h-full object-cover pointer-events-none"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnded}
              className="w-full h-full object-cover pointer-events-none"
            >
              <source src={HERO_ASSETS[currentIndex].url} type="video/mp4" />
            </video>
          )}
        </a>
      ) : (
        <div className="absolute inset-0 w-full h-full">
          {HERO_ASSETS[currentIndex].type === "image" ? (
            <img
              src={HERO_ASSETS[currentIndex].url}
              alt="Hero gallery"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnded}
              className="w-full h-full object-cover"
            >
              <source src={HERO_ASSETS[currentIndex].url} type="video/mp4" />
            </video>
          )}
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
