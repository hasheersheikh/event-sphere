import { Event } from "@/types/event";
import EventCard from "@/components/events/EventCard";
import { useRef, useState, useEffect } from "react";

const SPEED = 40; // px per second

interface MarqueeCarouselProps {
  events: Event[];
}

const MarqueeCarousel = ({ events }: MarqueeCarouselProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>();
  const lastTsRef = useRef(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const hasMoved = useRef(false);
  const [grabbing, setGrabbing] = useState(false);

  useEffect(() => {
    const tick = (ts: number) => {
      if (!isDragging.current) {
        const wrapper = wrapperRef.current;
        if (wrapper) {
          const delta = lastTsRef.current ? ts - lastTsRef.current : 0;
          wrapper.scrollLeft += (SPEED * delta) / 1000;
          // Loop back seamlessly when reaching the end
          if (wrapper.scrollLeft >= wrapper.scrollWidth - wrapper.clientWidth - 1) {
            wrapper.scrollLeft = 0;
          }
        }
      }
      lastTsRef.current = ts;
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX;
    scrollStart.current = wrapperRef.current?.scrollLeft ?? 0;
    setGrabbing(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !wrapperRef.current) return;
    const delta = e.pageX - startX.current;
    if (Math.abs(delta) > 4) hasMoved.current = true;
    wrapperRef.current.scrollLeft = scrollStart.current - delta;
  };

  const onMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    lastTsRef.current = 0; // reset so next tick delta starts at 0, no jump
    setGrabbing(false);
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (hasMoved.current) e.preventDefault();
  };

  return (
    <div
      ref={wrapperRef}
      className="overflow-x-auto scrollbar-hide select-none"
      style={{ cursor: grabbing ? "grabbing" : "grab" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onClickCapture={onClickCapture}
    >
      <div className="flex gap-6 py-8 w-max">
        {events.map((event, index) => (
          <div key={event._id} className="w-72 flex-shrink-0">
            <EventCard event={event} index={index} imageRatio="4/5" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarqueeCarousel;
