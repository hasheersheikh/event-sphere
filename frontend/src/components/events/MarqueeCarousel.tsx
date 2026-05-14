import { Event } from "@/types/event";
import EventCard from "@/components/events/EventCard";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MarqueeCarouselProps {
  events: Event[];
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
}

const MarqueeCarousel = ({
  events,
  speed = 60,
  direction = "left",
  pauseOnHover = true,
}: MarqueeCarouselProps) => {
  const duplicatedEvents = [...events, ...events, ...events];
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>();
  const positionRef = useRef(0);
  const lastTimeRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const totalWidthRef = useRef(0);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    const cardWidth = isMobile ? 260 : 320;
    const gap = 12;
    const totalItemWidth = cardWidth + gap;
    const totalWidth = events.length * totalItemWidth;
    totalWidthRef.current = totalWidth;
    const pixelsPerSecond = totalWidth / speed;

    const animate = (timestamp: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = timestamp - lastTimeRef.current;

      if (!isPaused && deltaTime > 0) {
        const pixelsToMove = (deltaTime / 1000) * pixelsPerSecond;

        if (direction === "left") {
          positionRef.current -= pixelsToMove;
          if (positionRef.current <= -totalWidth) {
            positionRef.current = 0;
          }
        } else {
          positionRef.current += pixelsToMove;
          if (positionRef.current >= 0) {
            positionRef.current = -totalWidth;
          }
        }

        inner.style.transform = `translateX(${positionRef.current}px)`;
      }

      lastTimeRef.current = timestamp;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastTimeRef.current = 0;
    };
  }, [events.length, speed, direction, isPaused, isMobile]);

  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startPos = useRef(0);
  const hasMoved = useRef(false);

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const x = e.pageX;
      const walk = x - startX.current;

      if (Math.abs(walk) > 5 && !isDragging) {
        setIsDragging(true);
      }

      if (isDragging || Math.abs(walk) > 5) {
        hasMoved.current = true;
        let newPos = startPos.current + walk;
        const totalWidth = totalWidthRef.current;

        // Loop logic for manual drag
        if (newPos <= -totalWidth) newPos += totalWidth;
        if (newPos > 0) newPos -= totalWidth;

        positionRef.current = newPos;
        if (innerRef.current) {
          innerRef.current.style.transform = `translateX(${newPos}px)`;
        }
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (hasMoved.current) {
        e.preventDefault();
        e.stopPropagation();
      }
      setIsDragging(false);
      setIsPaused(false);
      lastTimeRef.current = 0;
      hasMoved.current = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  const handleDragStart = (x: number) => {
    setIsPaused(true);
    startX.current = x;
    startPos.current = positionRef.current;
    hasMoved.current = false;
    // Don't set isDragging to true yet, wait for move threshold
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const x = e.touches[0].pageX;
    const walk = x - startX.current;

    if (Math.abs(walk) > 5 && !isDragging) {
      setIsDragging(true);
    }

    if (isDragging || Math.abs(walk) > 5) {
      hasMoved.current = true;
      let newPos = startPos.current + walk;
      const totalWidth = totalWidthRef.current;

      if (newPos <= -totalWidth) newPos += totalWidth;
      if (newPos > 0) newPos -= totalWidth;

      positionRef.current = newPos;
      if (innerRef.current) {
        innerRef.current.style.transform = `translateX(${newPos}px)`;
      }
    }
  };

  const handleMouseEnter = () => {
    if (pauseOnHover && !isDragging) {
      setIsPaused(true);
      lastTimeRef.current = 0;
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover && !isDragging) {
      setIsPaused(false);
      lastTimeRef.current = 0;
    }
  };

  const doJump = (newPos: number) => {
    if (!innerRef.current) return;
    setIsPaused(true);
    if (isMobile) {
      innerRef.current.style.transition = "transform 0.18s ease-out";
      positionRef.current = newPos;
      innerRef.current.style.transform = `translateX(${newPos}px)`;
      setTimeout(() => {
        if (innerRef.current) innerRef.current.style.transition = "";
        lastTimeRef.current = 0;
        setIsPaused(false);
      }, 190);
    } else {
      innerRef.current.style.transition = "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)";
      positionRef.current = newPos;
      innerRef.current.style.transform = `translateX(${newPos}px)`;
      setTimeout(() => {
        if (innerRef.current) innerRef.current.style.transition = "";
        lastTimeRef.current = 0;
        setIsPaused(false);
      }, 460);
    }
  };

  return (
    <div className="relative select-none">
      {/* Left arrow — snap to previous card boundary */}
      <button
        onClick={() => {
          const itemWidth = (isMobile ? 260 : 320) + 12;
          const absPos = -positionRef.current;
          const prevIndex = Math.ceil(absPos / itemWidth) - 1;
          let newPos = -(prevIndex * itemWidth);
          if (newPos > 0) newPos -= totalWidthRef.current;
          doJump(newPos);
        }}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full border border-border/60 bg-background/80 backdrop-blur-sm flex items-center justify-center hover:border-neon-lime/60 hover:text-neon-lime transition-all shadow-md"
        aria-label="Previous"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Right arrow — snap to next card boundary */}
      <button
        onClick={() => {
          const itemWidth = (isMobile ? 260 : 320) + 12;
          const absPos = -positionRef.current;
          const nextIndex = Math.floor(absPos / itemWidth) + 1;
          let newPos = -(nextIndex * itemWidth);
          if (newPos <= -totalWidthRef.current) newPos += totalWidthRef.current;
          doJump(newPos);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full border border-border/60 bg-background/80 backdrop-blur-sm flex items-center justify-center hover:border-neon-lime/60 hover:text-neon-lime transition-all shadow-md"
        aria-label="Next"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div
        className="overflow-hidden cursor-grab active:cursor-grabbing"
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={(e) => handleDragStart(e.pageX)}
        onTouchStart={(e) => handleDragStart(e.touches[0].pageX)}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => {
          setIsDragging(false);
          setIsPaused(false);
          lastTimeRef.current = 0;
          hasMoved.current = false;
        }}
      >
        <div
          ref={innerRef}
          className="flex gap-3"
          style={{ willChange: "transform", transform: "translateX(0)" }}
        >
          {duplicatedEvents.map((event, index) => (
            <div
              key={`${event._id}-${index}`}
              className={cn(
                "flex-shrink-0 w-[260px] md:w-80",
                isDragging && "pointer-events-none"
              )}
            >
              <EventCard event={event} index={index} imageRatio="3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarqueeCarousel;
