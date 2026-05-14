import { LocalStore } from "@/components/home/GoLocalSection";
import StoreCard from "@/components/stores/StoreCard";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StoreSliderProps {
  stores: LocalStore[];
  showProducts?: boolean;
}

const StoreSlider = ({
  stores,
  showProducts = false,
}: StoreSliderProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const checkScroll = () => {
      const container = scrollContainerRef.current;
      if (container) {
        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(
          container.scrollLeft < container.scrollWidth - container.clientWidth
        );
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      checkScroll();
      container.addEventListener("scroll", checkScroll);
      return () => container.removeEventListener("scroll", checkScroll);
    }
  }, [stores]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = isMobile ? 280 : 340;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!stores || stores.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
      >
        {stores.map((store) => (
          <div
            key={store._id}
            className="flex-shrink-0 w-72 md:w-80"
          >
            <StoreCard store={store} showProducts={showProducts} />
          </div>
        ))}
      </div>

      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-background border border-border/50 shadow-lg flex items-center justify-center hover:border-neon-lime/50 hover:text-neon-lime transition-all z-10"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-10 w-10 rounded-full bg-background border border-border/50 shadow-lg flex items-center justify-center hover:border-neon-lime/50 hover:text-neon-lime transition-all z-10"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default StoreSlider;
