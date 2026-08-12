import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";

interface Asset {
  type: "image" | "video";
  url: string;
}

interface EventHeroGalleryProps {
  imageUrl?: string;
  videoUrl?: string;
  aspectRatio?: "square" | "portrait" | "video";
}

export const EventHeroGallery = ({
  imageUrl,
  videoUrl,
  aspectRatio = "portrait",
}: EventHeroGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pointerStartX = useRef(0);
  const pointerStartY = useRef(0);
  const isPointerDown = useRef(false);
  const didDrag = useRef(false);

  const assets: Asset[] = [
    ...(videoUrl ? [{ type: "video" as const, url: videoUrl }] : []),
    ...(imageUrl ? [{ type: "image" as const, url: imageUrl }] : []),
  ];

  const hasMultiple = assets.length > 1;
  const hasBoth = !!imageUrl && !!videoUrl;

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(assets.length - 1, index));
    if (timerRef.current) clearTimeout(timerRef.current);
    if (videoRef.current) videoRef.current.pause();
    setCurrentIndex(next);
    setDragOffset(0);
    setIsDragging(false);
  };

  // Auto-advance image → video after 5s
  useEffect(() => {
    if (!hasBoth || currentIndex !== 0) return;
    timerRef.current = setTimeout(() => setCurrentIndex(1), 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex, hasBoth]);

  // Play video when its slide is active
  useEffect(() => {
    if (assets[currentIndex]?.type !== "video" || !videoRef.current) return;
    const video = videoRef.current;
    video.currentTime = 0;
    video.muted = isMuted;
    video.play().catch(() => {
      // Browser blocked autoplay with sound — fall back to muted playback
      video.muted = true;
      setIsMuted(true);
      video.play().catch(() => {
        timerRef.current = setTimeout(() => setCurrentIndex(0), 5000);
      });
    });
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex]);

  // Loop when only video
  useEffect(() => {
    if (!imageUrl && videoUrl && videoRef.current) {
      const video = videoRef.current;
      video.muted = isMuted;
      video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {});
      });
    }
  }, [imageUrl, videoUrl]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isMuted;
    setIsMuted(next);
    if (videoRef.current) videoRef.current.muted = next;
  };

  const handleVideoEnded = () => {
    if (hasBoth) setCurrentIndex(0);
    else if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  // ── Pointer helpers ────────────────────────────────────────────

  const startDrag = (clientX: number, clientY: number) => {
    isPointerDown.current = true;
    didDrag.current = false;
    pointerStartX.current = clientX;
    pointerStartY.current = clientY;
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const moveDrag = (clientX: number, clientY: number) => {
    if (!isPointerDown.current || !hasMultiple) return;
    const dx = clientX - pointerStartX.current;
    const dy = clientY - pointerStartY.current;
    if (!didDrag.current && Math.abs(dx) < Math.abs(dy)) {
      // Vertical scroll intent — abort
      isPointerDown.current = false;
      return;
    }
    if (Math.abs(dx) > 4) {
      didDrag.current = true;
      setIsDragging(true);
    }
    // Resist at edges
    const clamped =
      (currentIndex === 0 && dx > 0) || (currentIndex === assets.length - 1 && dx < 0)
        ? dx * 0.25
        : dx;
    setDragOffset(clamped);
  };

  const endDrag = (clientX: number) => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;
    const dx = clientX - pointerStartX.current;
    const threshold = (containerRef.current?.offsetWidth ?? 200) * 0.25;
    if (dx < -threshold && currentIndex < assets.length - 1) {
      goTo(currentIndex + 1);
    } else if (dx > threshold && currentIndex > 0) {
      goTo(currentIndex - 1);
    } else {
      setDragOffset(0);
      setIsDragging(false);
    }
  };

  // ── Touch events ───────────────────────────────────────────────

  const onTouchStart = (e: React.TouchEvent) => {
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    moveDrag(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    endDrag(e.changedTouches[0].clientX);
  };

  // ── Mouse events (desktop drag) ────────────────────────────────

  const onMouseDown = (e: React.MouseEvent) => {
    startDrag(e.clientX, e.clientY);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    moveDrag(e.clientX, e.clientY);
  };
  const onMouseUp = (e: React.MouseEvent) => {
    endDrag(e.clientX);
  };
  const onMouseLeave = () => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;
    setDragOffset(0);
    setIsDragging(false);
  };

  // ── Empty state ─────────────────────────────────────────────────

  if (assets.length === 0) {
    return (
      <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-muted border border-border/30">
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <span className="text-sm font-medium">No media available</span>
        </div>
      </div>
    );
  }

  const aspectClasses = {
    square: "aspect-square",
    portrait: "aspect-[4/5]",
    video: "aspect-video",
  }[aspectRatio];

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${aspectClasses} rounded-2xl overflow-hidden bg-zinc-900 shadow-xl border border-border/50 select-none ${hasMultiple ? "cursor-grab active:cursor-grabbing" : ""}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      {/* Slide track */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateX(calc(${-currentIndex * 100}% + ${dragOffset}px))`,
          transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)",
          willChange: "transform",
        }}
      >
        {assets.map((asset, i) => (
          <div
            key={i}
            className="absolute top-0 h-full w-full"
            style={{ left: `${i * 100}%` }}
          >
            {asset.type === "image" ? (
              <img
                src={asset.url}
                alt="Event banner"
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <video
                ref={videoRef}
                muted={isMuted}
                playsInline
                onEnded={handleVideoEnded}
                className="w-full h-full object-cover"
                draggable={false}
              >
                <source src={asset.url} type="video/mp4" />
              </video>
            )}
          </div>
        ))}
      </div>

      {/* Left arrow */}
      {hasMultiple && currentIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); goTo(currentIndex - 1); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-all duration-150 active:scale-90"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Right arrow */}
      {hasMultiple && currentIndex < assets.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goTo(currentIndex + 1); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-all duration-150 active:scale-90"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Mute toggle */}
      {assets[currentIndex]?.type === "video" && (
        <button
          onClick={toggleMute}
          className="absolute bottom-4 left-3 z-20 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-all duration-150 active:scale-90"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      )}

      {/* Dot indicators */}
      {hasMultiple && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {assets.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); if (!didDrag.current) goTo(i); }}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentIndex ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventHeroGallery;
