import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface HeroGalleryProps {
  assets: any[];
}

const HeroGallery = ({ assets }: HeroGalleryProps) => {
  const HERO_ASSETS = assets;

  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % HERO_ASSETS.length);
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
  }, [currentIndex, HERO_ASSETS]);

  const handleVideoEnded = () => {
    nextSlide();
  };

  if (HERO_ASSETS.length === 0) return null;

  return (
    <div className="relative w-full aspect-video lg:aspect-[4/5] overflow-hidden rounded-2xl lg:rounded-3xl border border-border shadow-lg lg:shadow-2xl bg-muted rotate-0 lg:rotate-2 lg:hover:rotate-0 transition-transform duration-500">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full"
        >
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
        </motion.div>
      </AnimatePresence>
      
      {/* subtle bottom gradient for readability if text overlaps */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      
      {/* Progress indicators (optional, but adds to "premium" feel) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {HERO_ASSETS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
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
