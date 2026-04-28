import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HERO_ASSETS = [
  {
    type: "image",
    src: "/hero/From KlickPin CF Bright kindness reminders with charm and useful ideas for creative people that feel calm and clear 🌿 - Pin-1065453224404265030.jpg",
    duration: 2000,
  },
  {
    type: "image",
    src: "/hero/From KlickPin CF Discover Stunning minimalist bedroom decor that make your next project look polished and expensive for ideas worth saving right now - Pin-921338036281486033.jpg",
    duration: 2000,
  },
  {
    type: "image",
    src: "/hero/From KlickPin CF Steal these elegant rainy day activity ideas you’ll want to recreate this weekend with aesthetic touches that photograph beautifully — save these - Pin-985936543440402367.jpg",
    duration: 2000,
  },
  {
    type: "video",
    src: "/hero/capped-1080p.mp4",
  },
];

const HeroGallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % HERO_ASSETS.length);
  };

  useEffect(() => {
    const currentAsset = HERO_ASSETS[currentIndex];

    if (currentAsset.type === "image") {
      timeoutRef.current = setTimeout(() => {
        nextSlide();
      }, currentAsset.duration || 2000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex]);

  const handleVideoEnded = () => {
    nextSlide();
  };

  return (
    <div className="relative w-full aspect-[4/5] overflow-hidden rounded-3xl border border-border shadow-2xl bg-black rotate-2 hover:rotate-0 transition-transform duration-500">
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
              src={HERO_ASSETS[currentIndex].src}
              alt="Hero gallery"
              className="w-full h-full object-cover opacity-90"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnded}
              className="w-full h-full object-cover opacity-90"
            >
              <source src={HERO_ASSETS[currentIndex].src} type="video/mp4" />
            </video>
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* subtle bottom gradient for readability if text overlaps */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      
      {/* Progress indicators (optional, but adds to "premium" feel) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {HERO_ASSETS.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === currentIndex ? "w-8 bg-white" : "w-2 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroGallery;
