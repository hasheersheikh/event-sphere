import { useRef, useState, useEffect, ReactNode, Children, cloneElement, isValidElement } from "react";
import { useReducedMotion } from "framer-motion";

const DEFAULT_SPEED = 40; // px per second
const TOUCH_RESUME_DELAY_MS = 2500;
// Below this, a handful of cards typically already fit the viewport without
// overflowing — looping/duplicating them just shows repeats for no benefit.
const MIN_ITEMS_TO_SCROLL = 4;

interface MarqueeCarouselProps {
  children: ReactNode;
  className?: string;
  speed?: number;
}

const MarqueeCarousel = ({ children, className = "", speed = DEFAULT_SPEED }: MarqueeCarouselProps) => {
  const childCount = Children.count(children);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>();
  const lastTsRef = useRef(0);
  const isDragging = useRef(false);
  const isPaused = useRef(false);
  const isVisibleRef = useRef(true);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const hasMoved = useRef(false);
  const [grabbing, setGrabbing] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Pause the drift animation while the strip is off-screen so fast page
  // scrolling doesn't keep N marquees burning the main thread.
  useEffect(() => {
    const el = wrapperRef.current;
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

  // Auto-scroll drifts the strip continuously; content is duplicated once so the
  // loop-back point is visually identical and never shows as a jump-cut.
  useEffect(() => {
    if (shouldReduceMotion || childCount < MIN_ITEMS_TO_SCROLL) return;

    const tick = (ts: number) => {
      const wrapper = wrapperRef.current;
      if (wrapper && !isDragging.current && !isPaused.current && isVisibleRef.current) {
        const delta = lastTsRef.current ? ts - lastTsRef.current : 0;
        const loopWidth = wrapper.scrollWidth / 2;
        wrapper.scrollLeft += (speed * delta) / 1000;
        if (loopWidth > 0 && wrapper.scrollLeft >= loopWidth) {
          wrapper.scrollLeft -= loopWidth;
        }
      }
      lastTsRef.current = ts;
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      lastTsRef.current = 0;
    };
  }, [speed, shouldReduceMotion, childCount]);

  const pause = () => {
    isPaused.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };
  const resumeSoon = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      isPaused.current = false;
      lastTsRef.current = 0;
    }, TOUCH_RESUME_DELAY_MS);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    hasMoved.current = false;
    pause();
    startX.current = e.pageX - (wrapperRef.current?.getBoundingClientRect().left || 0);
    scrollStart.current = wrapperRef.current?.scrollLeft ?? 0;
    setGrabbing(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !wrapperRef.current) return;
    const x = e.pageX - (wrapperRef.current?.getBoundingClientRect().left || 0);
    const delta = x - startX.current;
    if (Math.abs(delta) > 4) hasMoved.current = true;
    wrapperRef.current.scrollLeft = scrollStart.current - delta;
  };

  const onMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    lastTsRef.current = 0; // reset so next tick delta starts at 0, no jump
    setGrabbing(false);
    resumeSoon();
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (hasMoved.current) e.preventDefault();
  };

  // Touch scrolling is native (no onMouseDown equivalent), so without this the
  // rAF auto-scroll keeps nudging the strip while a finger is dragging it —
  // that fight between the two scroll sources is what reads as "glitchy".
  const onTouchStart = () => pause();
  const onTouchEnd = () => resumeSoon();

  const duplicate = shouldReduceMotion || childCount < MIN_ITEMS_TO_SCROLL
    ? null
    : Children.map(children, (child, i) =>
        isValidElement(child)
          ? cloneElement(child, { key: `dup-${child.key ?? i}`, "aria-hidden": true })
          : child
      );

  return (
    <div
      ref={wrapperRef}
      className={`overflow-x-auto scrollbar-hide select-none ${className}`}
      style={{ cursor: grabbing ? "grabbing" : "grab", scrollBehavior: "auto" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClickCapture={onClickCapture}
    >
      <div className="flex gap-6 py-8 w-max">
        {children}
        {duplicate}
      </div>
    </div>
  );
};

export default MarqueeCarousel;
