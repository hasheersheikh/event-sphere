import { useState } from "react";
import { Link } from "react-router-dom";
import { Event } from "@/types/event";
import SafeImage from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import MobileMarqueeCarousel from "@/components/events/MobileMarqueeCarousel";

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
  const baseViews = 10000 + (viewCount || 0);
  if (baseViews >= 1000) {
    return `${(baseViews / 1000).toFixed(1)} K`;
  }
  return baseViews.toString();
};

const MobileEventCarousel = ({ events }: MobileEventCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

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
      <MobileMarqueeCarousel onActiveIndexChange={setActiveIndex} showDots={false}>
        {events.map((event) => {
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

          return (
            <Link key={event._id} to={`/events/${event._id}`} className="block">
              <div
                className="relative rounded-lg overflow-hidden bg-zinc-900 transition-shadow duration-500 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.55)]"
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
          );
        })}
      </MobileMarqueeCarousel>

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
