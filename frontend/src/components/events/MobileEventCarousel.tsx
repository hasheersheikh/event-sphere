import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Event } from "@/types/event";
import SafeImage from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

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

const MobileEventCarousel = ({ events }: MobileEventCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

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

  const formatDate = (dateString: string, nextOccurrence?: string) => {
    const dateToUse = nextOccurrence || dateString;
    const date = new Date(dateToUse);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-2"
        style={{
          paddingLeft: "5vw",
          paddingRight: "5vw",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {events.map((event, i) => {
          const minPrice = event.ticketTypes?.length
            ? Math.min(...event.ticketTypes.map((t) => t.price))
            : null;
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
              className="flex-shrink-0 snap-center"
              style={{ width: "72vw" }}
            >
              <Link
                to={`/events/${event._id}`}
                className={cn(
                  "block transition-all duration-300 ease-out",
                  isActive ? "scale-[0.93] opacity-100" : "scale-[0.84] opacity-50"
                )}
              >
              <div className="rounded-2xl overflow-hidden bg-card border border-border/30 shadow-sm">
                {/* Poster */}
                <div className="relative" style={{ aspectRatio: "3/4" }}>
                  <SafeImage
                    src={event.image || getCategoryImage(event.category)}
                    alt={event.title}
                    className="w-full h-full object-cover"
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
                </div>

                {/* Info */}
                <div className="px-4 py-3.5">
                  <h3 className="font-black text-[14px] tracking-tight leading-snug line-clamp-2 text-foreground mb-1">
                    {event.title}
                  </h3>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {formatDate(event.date, event.nextOccurrence)}
                    </p>
                    {minPrice !== null && (
                      <p className="text-[12px] font-black text-foreground">
                        ₹{minPrice} onwards
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
            </div>
          );
        })}
      </div>

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
