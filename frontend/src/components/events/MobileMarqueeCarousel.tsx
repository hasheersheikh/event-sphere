import { useRef, useState, useEffect, useLayoutEffect, Children, ReactNode, isValidElement } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const AUTOPLAY_INTERVAL_MS = 3200;
const RESUME_AFTER_INTERACTION_MS = 4000;

interface MobileMarqueeCarouselProps {
  children: ReactNode;
  itemClassName?: string;
  className?: string;
  showDots?: boolean;
  onActiveIndexChange?: (index: number) => void;
}

// Mobile-only snap carousel: one centered "active" card at full scale/opacity,
// neighbors scaled down and blurred, autoplay advances one card at a time,
// and dot indicators track position. This is the same engine Upcoming Events
// uses on mobile — every carousel section should compose it identically.
const MobileMarqueeCarousel = ({
  children,
  itemClassName = "w-[86vw] max-w-[20.4rem]",
  className = "",
  showDots = true,
  onActiveIndexChange,
}: MobileMarqueeCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduce = useReducedMotion();
  const isInteractingRef = useRef(false);
  const isVisibleRef = useRef(true);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const items = Children.toArray(children);

  useLayoutEffect(() => {
    onActiveIndexChange?.(activeIndex);
  }, [activeIndex, onActiveIndexChange]);

  // Pause autoplay while the carousel is off-screen so it never advances
  // (or smooth-scrolls) invisibly while the user is scrolling fast.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const cards = el.querySelectorAll<HTMLElement>("[data-card-index]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const idx = parseInt(entry.target.getAttribute("data-card-index") ?? "0");
            setActiveIndex(idx);
          }
        });
      },
      { root: el, threshold: 0.5 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [items.length]);

  // Autoplay: advance to the next card unless the user is currently interacting
  useEffect(() => {
    if (shouldReduce || items.length <= 1) return;
    const timer = setInterval(() => {
      if (isInteractingRef.current || !isVisibleRef.current) return;
      const el = scrollRef.current;
      if (!el) return;
      const nextIndex = (activeIndex + 1) % items.length;
      const nextCard = el.querySelector<HTMLElement>(`[data-card-index="${nextIndex}"]`);
      if (!nextCard) return;
      // Scroll the carousel's own horizontal axis only — scrollIntoView can
      // still nudge the whole page vertically even with block: "nearest".
      const targetLeft =
        nextCard.offsetLeft - (el.clientWidth - nextCard.clientWidth) / 2;
      el.scrollTo({ left: targetLeft, behavior: "smooth" });
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [activeIndex, items.length, shouldReduce]);

  const pauseAutoplay = () => {
    isInteractingRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };
  const resumeAutoplaySoon = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, RESUME_AFTER_INTERACTION_MS);
  };

  return (
    <div className={className}>
      <div
        ref={scrollRef}
        onTouchStart={pauseAutoplay}
        onTouchEnd={resumeAutoplaySoon}
        onPointerDown={pauseAutoplay}
        onPointerUp={resumeAutoplaySoon}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3"
        style={{
          paddingLeft: "9vw",
          paddingRight: "9vw",
          WebkitOverflowScrolling: "touch",
          scrollBehavior: "auto",
        }}
      >
        {items.map((child, i) => (
          <div
            key={isValidElement(child) ? child.key ?? i : i}
            data-card-index={i}
            className={cn("flex-shrink-0 snap-center", itemClassName)}
          >
            <div
              className={cn(
                "transition-all duration-500 ease-out",
                i === activeIndex
                  ? "scale-100 opacity-100 blur-none"
                  : "scale-[0.86] opacity-40 blur-[1.5px]"
              )}
            >
              {child}
            </div>
          </div>
        ))}
      </div>

      {showDots && items.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {items.map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-full transition-all duration-300",
                i === activeIndex
                  ? "w-4 h-1.5 bg-foreground"
                  : "w-1.5 h-1.5 bg-muted-foreground/25"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileMarqueeCarousel;
