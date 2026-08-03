import { useEffect, useRef, useState, type ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  /** Optional minimum height (Tailwind class) to reserve while loading */
  minHeight?: string;
  className?: string;
}

/**
 * Defers rendering its children until the section scrolls near the viewport.
 * Reduces upfront cost and makes fast scrolls feel smoother since content
 * is mounted progressively instead of all at once.
 */
export default function LazySection({
  children,
  minHeight = "min-h-64",
  className = "",
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setMounted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          observer.unobserve(el);
        }
      },
      // Load well before the section enters the viewport so scrolling is seamless.
      { rootMargin: "600px 0px 600px 0px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${minHeight} ${className}`}
      style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.3s ease-out" }}
    >
      {mounted ? children : null}
    </div>
  );
}
