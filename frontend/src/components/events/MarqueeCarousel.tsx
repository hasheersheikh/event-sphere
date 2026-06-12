import { Event } from "@/types/event";
import EventCard from "@/components/events/EventCard";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MarqueeCarouselProps {
  events: Event[];
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
}

const SPEED = 35; // px/s

const MarqueeCarousel = ({ events, pauseOnHover = true }: MarqueeCarouselProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);
  const animRef = useRef<number>();
  const posRef = useRef(0);
  const lastTimeRef = useRef(0);
  const [isStatic, setIsStatic] = useState(false);

  // dragging
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartPos = useRef(0);
  const hasMoved = useRef(false);
  const [grabbing, setGrabbing] = useState(false);

  // check if content fits — if so, no animation
  useEffect(() => {
    const check = () => {
      const wrapper = wrapperRef.current;
      const inner = innerRef.current;
      if (!wrapper || !inner) return;
      setIsStatic(inner.scrollWidth <= wrapper.clientWidth + 1);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [events.length]);

  // auto-scroll animation
  useEffect(() => {
    if (isStatic) return;

    const animate = (ts: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = ts;
      const delta = ts - lastTimeRef.current;

      if (!isPaused.current && !isDragging.current && delta > 0) {
        const wrapper = wrapperRef.current;
        const inner = innerRef.current;
        if (wrapper && inner) {
          const maxScroll = inner.scrollWidth - wrapper.clientWidth;
          posRef.current -= (delta / 1000) * SPEED;
          if (posRef.current < -maxScroll) posRef.current = 0;
          inner.style.transform = `translateX(${posRef.current}px)`;
        }
      }

      lastTimeRef.current = ts;
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      lastTimeRef.current = 0;
    };
  }, [isStatic]);

  // mouse drag
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    hasMoved.current = false;
    dragStartX.current = e.clientX;
    dragStartPos.current = posRef.current;
    setGrabbing(true);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current || !innerRef.current || !wrapperRef.current) return;
      const walk = e.clientX - dragStartX.current;
      if (Math.abs(walk) > 4) hasMoved.current = true;
      const maxScroll = innerRef.current.scrollWidth - wrapperRef.current.clientWidth;
      let newPos = dragStartPos.current + walk;
      newPos = Math.min(0, Math.max(-maxScroll, newPos));
      posRef.current = newPos;
      innerRef.current.style.transform = `translateX(${newPos}px)`;
    };
    const onUp = () => {
      isDragging.current = false;
      lastTimeRef.current = 0;
      setGrabbing(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // touch drag
  const onTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    hasMoved.current = false;
    dragStartX.current = e.touches[0].clientX;
    dragStartPos.current = posRef.current;
    isPaused.current = true;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !innerRef.current || !wrapperRef.current) return;
    const walk = e.touches[0].clientX - dragStartX.current;
    if (Math.abs(walk) > 4) hasMoved.current = true;
    const maxScroll = innerRef.current.scrollWidth - wrapperRef.current.clientWidth;
    let newPos = dragStartPos.current + walk;
    newPos = Math.min(0, Math.max(-maxScroll, newPos));
    posRef.current = newPos;
    innerRef.current.style.transform = `translateX(${newPos}px)`;
  };
  const onTouchEnd = () => {
    isDragging.current = false;
    isPaused.current = false;
    lastTimeRef.current = 0;
  };

  return (
    <div
      ref={wrapperRef}
      className="overflow-hidden"
      onMouseEnter={() => { if (pauseOnHover) isPaused.current = true; }}
      onMouseLeave={() => {
        if (pauseOnHover && !isDragging.current) {
          isPaused.current = false;
          lastTimeRef.current = 0;
        }
      }}
    >
      <div
        ref={innerRef}
        className={cn(
          "flex gap-3 will-change-transform",
          isStatic ? "justify-start" : (grabbing ? "cursor-grabbing" : "cursor-grab")
        )}
        style={{ transform: "translateX(0)" }}
        onMouseDown={isStatic ? undefined : onMouseDown}
        onTouchStart={isStatic ? undefined : onTouchStart}
        onTouchMove={isStatic ? undefined : onTouchMove}
        onTouchEnd={isStatic ? undefined : onTouchEnd}
      >
        {events.map((event, index) => (
          <div
            key={event._id}
            className={cn(
              "flex-shrink-0 w-[75vw] sm:w-64 md:w-72",
              !isStatic && hasMoved.current && "pointer-events-none"
            )}
          >
            <EventCard event={event} index={index} imageRatio="3/4" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarqueeCarousel;
