import { Event } from "@/types/event";
import EventCard from "@/components/events/EventCard";
import { useEffect, useRef, useState } from "react";

interface MarqueeCarouselProps {
  events: Event[];
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
}

const MarqueeCarousel = ({
  events,
  speed = 30,
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

  useEffect(() => {
    const inner = innerRef.current;
    
    if (!inner) return;

    const cardWidth = 192; // w-48 = 12rem = 192px
    const gap = 12; // gap-3 = 12px
    const totalItemWidth = cardWidth + gap;
    const totalWidth = events.length * totalItemWidth;
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
  }, [events.length, speed, direction, isPaused]);

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsPaused(true);
      lastTimeRef.current = 0;
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPaused(false);
      lastTimeRef.current = 0;
    }
  };

  return (
    <div 
      className="relative overflow-hidden" 
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={innerRef}
        className="flex gap-3"
        style={{
          willChange: "transform",
          transform: "translateX(0)",
        }}
      >
        {duplicatedEvents.map((event, index) => (
          <div
            key={`${event._id}-${index}`}
            className="flex-shrink-0 w-48"
          >
            <EventCard event={event} index={index} imageRatio="3/4" />
          </div>
        ))}
      </div>
      
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none z-10" />
    </div>
  );
};

export default MarqueeCarousel;
