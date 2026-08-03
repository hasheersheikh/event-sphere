import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Event } from "@/types/event";
import SafeImage from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const AUTOPLAY_INTERVAL_MS = 3200;
const RESUME_AFTER_INTERACTION_MS = 4000;

interface MobileEventCarouselProps {
  events: Event[];
}

const getCategoryImage = (category: string = "other") => {
  const cats: Record<string, string> = {
    music: "/images/categories/music.jpg",
    comedy: "/images/categories/entertainment.jpg",
    technology: "/images/categories/technology.jpg",
    business: "/images/categories/business.jpg",
    entertainment: "/images/categories/entertainment.jpg",
    health: "/images/categories/health.jpg",
    sports: "/images/categories/sports.jpg",
    education: "/images/categories/education.jpg",
    workshop: "/images/categories/technology.jpg",
    "food & drink": "/images/categories/other.jpg",
    arts: "/images/categories/entertainment.jpg",
    meetups: "/images/categories/business.jpg",
    tech: "/images/categories/technology.jpg",
    other: "/images/categories/other.jpg",
  };
  return cats[category.toLowerCase()] || cats.other;
};

const formatViews = (viewCount?: number) => {
  const baseViews = 200 + (viewCount || 0);
  if (baseViews >= 1000) {
    return `${(baseViews / 1000).toFixed(1)} K`;
  }
  return baseViews.toString();
};

const MobileEventCarousel = ({ events }: MobileEventCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduce = useReducedMotion();
  const isInteractingRef = useRef(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const cards = el.querySelectorAll<HTMLElement>("[data-card-index]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const idx = parseInt(
              entry.target.getAttribute("data-card-index") ?? "0"
            );
            setActiveIndex(idx);
          }
        });
      },
      { root: el, threshold: 0.5 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [events.length]);

  // Autoplay: advance to the next card unless the user is currently interacting
  useEffect(() => {
    if (shouldReduce || events.length <= 1) return;
    const timer = setInterval(() => {
      if (isInteractingRef.current) return;
      const el = scrollRef.current;
      if (!el) return;
      const nextIndex = (activeIndex + 1) % events.length;
      const nextCard = el.querySelector<HTMLElement>(`[data-card-index="${nextIndex}"]`);
      if (!nextCard) return;
      // Scroll the carousel's own horizontal axis only — scrollIntoView can
      // still nudge the whole page vertically even with block: "nearest".
      const targetLeft =
        nextCard.offsetLeft - (el.clientWidth - nextCard.clientWidth) / 2;
      el.scrollTo({ left: targetLeft, behavior: "smooth" });
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [activeIndex, events.length, shouldReduce]);

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

  const formatDate = (dateString: string, nextOccurrence?: string) => {
    const dateToUse = nextOccurrence || dateString;
    const date = new Date(dateToUse);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const activeEvent = events[activeIndex];
  const activeMinPrice = activeEvent?.ticketTypes?.length
    ? Math.min(...activeEvent.ticketTypes.map((t) => t.price))
    : null;

  return (
    <div>
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
        }}
      >
        {events.map((event, i) => {
          const isPast =
            event.isActive === false || event.status === "past";
          const totalCapacity =
            event.ticketTypes?.reduce((a, t) => a + t.capacity, 0) ?? 0;
          const totalSold =
            event.ticketTypes?.reduce((a, t) => a + t.sold, 0) ?? 0;
          const isSoldOut =
            totalCapacity > 0 &&
            (totalCapacity - totalSold <= 0 ||
              event.ticketTypes?.every((t) => t.isSoldOut));

          const isActive = i === activeIndex;

          return (
            <div
              key={event._id}
              data-card-index={i}
              className="flex-shrink-0 snap-center w-[86vw] max-w-[20.4rem]"
            >
              <Link
                to={`/events/${event._id}`}
                className={cn(
                  "block transition-all duration-500 ease-out",
                  isActive
                    ? "scale-100 opacity-100 blur-none"
                    : "scale-[0.86] opacity-40 blur-[1.5px]"
                )}
              >
              <div
                className={cn(
                  "relative rounded-lg overflow-hidden bg-zinc-900 transition-shadow duration-500",
                  isActive
                    ? "shadow-[0_24px_48px_-16px_rgba(0,0,0,0.55)]"
                    : "shadow-none"
                )}
                style={{ aspectRatio: "4/5" }}
              >
                {/* Blurred backdrop */}
                <img
                  src={event.image || getCategoryImage(event.category)}
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-40 pointer-events-none"
                />
                <SafeImage
                  src={event.image || getCategoryImage(event.category)}
                  alt={event.title}
                  className="relative w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {event.isSponsored && (
                    <span className="bg-white text-black px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider">
                      Promoted
                    </span>
                  )}
                  {isPast && (
                    <span className="bg-rose-500 text-white px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider">
                      Ended
                    </span>
                  )}
                  {isSoldOut && !isPast && (
                    <span className="bg-black/60 text-white backdrop-blur-sm px-2.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider">
                      Sold Out
                    </span>
                  )}
                </div>

                {/* Views Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/65 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider text-white border border-white/10 shadow-sm z-20">
                  <Eye className="h-3 w-3 text-neon-lime" />
                  <span>{formatViews(event.viewCount)} Views</span>
                </div>
              </div>
            </Link>
            </div>
          );
        })}
      </div>

      {/* Active card title — lives outside the strip, crossfades as the card changes */}
      {activeEvent && (
        <div className="px-8 mt-5 min-h-[4.5rem] text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeEvent._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <h3 className="font-black text-xl tracking-tight leading-snug line-clamp-1 text-foreground">
                {activeEvent.title}
              </h3>
              <p className="text-[11px] text-muted-foreground font-medium mt-1 line-clamp-1">
                {formatDate(activeEvent.date, activeEvent.nextOccurrence)}
                {activeMinPrice !== null && ` • ₹${activeMinPrice} onwards`}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Dot indicators */}
      {events.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {events.map((_, i) => (
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

export default MobileEventCarousel;
