import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, ImageIcon, Calendar, Phone, Eye } from "lucide-react";
import { Event } from "@/types/event";
import SafeImage from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: Event;
  index?: number;
  imageRatio?: string;
  mobile?: boolean;
}

const formatViews = (viewCount?: number) => {
  const baseViews = 10000 + (viewCount || 0);
  if (baseViews >= 1000) {
    return `${(baseViews / 1000).toFixed(1)} K`;
  }
  return baseViews.toString();
};

const EventCard = ({ event, index = 0, imageRatio = "4/5", mobile = false }: EventCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatDate = (dateString: string, nextOccurrence?: string) => {
    const dateToUse = nextOccurrence || dateString;
    const date = new Date(dateToUse);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const totalCapacity =
    event.ticketTypes?.reduce((acc, t) => acc + t.capacity, 0) || 0;
  const totalSold =
    event.ticketTypes?.reduce((acc, t) => acc + t.sold, 0) || 0;
  const availableTickets = totalCapacity - totalSold;

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

  const isSoldOut =
    totalCapacity > 0 &&
    (availableTickets <= 0 || event.ticketTypes?.every((t) => t.isSoldOut));
  const isAlmostSoldOut =
    availableTickets <= totalCapacity * 0.1 && availableTickets > 0;

  const soldPercentage = totalCapacity > 0 ? (totalSold / totalCapacity) * 100 : 0;
  const isPast = event.isActive === false || event.status === 'past';
  const imageSrc = event.image || getCategoryImage(event.category);

  return (
    <div
      className="group h-full transition-transform duration-300 ease-out md:hover:scale-105"
      style={{
        animationDelay: `${index * 60}ms`,
      }}
    >
      <Link
        to={`/events/${event._id}`}
        className={cn(
          "block h-full transition-all duration-300 ease-out-expo relative",
          mobile
            ? "rounded-xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
            : "rounded-xl md:rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-lg"
        )}
      >
        <article className="h-full flex flex-col">
          <div
            className="relative overflow-hidden flex-shrink-0 bg-zinc-900 rounded-t-2xl"
            style={{ aspectRatio: imageRatio }}
          >
            {/* Blurred backdrop — fills empty space for any aspect ratio */}
            <img
              src={imageSrc}
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-40 pointer-events-none"
            />

            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-white/20" />
              </div>
            )}

            <SafeImage
              src={imageSrc}
              alt={event.title}
              className={`relative w-full h-full object-contain transition-all duration-500 ease-out-expo md:group-hover:scale-[1.04] ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/10 transition-colors duration-300" />

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
              {isAlmostSoldOut && !isSoldOut && (
                <span className="bg-red-500/90 text-white px-2.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider">
                  Almost Gone
                </span>
              )}
            </div>

            {/* Views Badge */}
            <div className="absolute top-3 right-3 z-20">
              <span className="inline-flex items-center text-[7px] md:text-[8px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full bg-white text-black shadow-sm">
                <Eye className="h-3 w-3 mr-1" />
                {formatViews(event.viewCount)} Views
              </span>
            </div>
          </div>

          <div className="p-3.5 flex flex-col gap-2 flex-1">
            {/* Title + Date row */}
            <div className="flex items-start justify-between gap-2">
              <h3 className={cn(
                "font-extrabold tracking-tight leading-snug text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 flex-1",
                mobile ? "text-[16px]" : "text-[13px]"
              )}>
                {event.title}
              </h3>
              <div className={cn(
                "flex items-center gap-1 text-primary font-bold whitespace-nowrap",
                mobile ? "text-[12px]" : "text-[10px]"
              )}>
                <Calendar className={cn("shrink-0", mobile ? "h-3 w-3" : "h-2.5 w-2.5")} />
                <span className="uppercase tracking-wider">
                  {formatDate(event.date, event.nextOccurrence)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 mt-0.5">
              <p className={cn(
                "text-muted-foreground font-bold flex items-center gap-1",
                mobile ? "text-[14px]" : "text-[10px] uppercase tracking-[0.1em]"
              )}>
                {mobile ? null : <MapPin className="h-3 w-3 text-primary/60" />}
                {typeof event.location === "string"
                  ? event.location
                  : event.location?.venueName ||
                    event.location?.address?.split(",")[0] || "Nagpur"}
              </p>
              <div className="flex flex-col items-end">
                <span className={cn(
                  "font-black tracking-tight leading-none",
                  mobile ? "text-[#2E7D32] text-[18px]" : "text-foreground text-[14px]"
                )}>
                  {"₹" + (event.ticketTypes?.length
                    ? Math.min(...event.ticketTypes.map(t => t.price))
                    : 0)}
                </span>
                {event.ticketTypes?.length && (
                  <span className={cn(
                    "font-bold uppercase tracking-wider leading-none",
                    mobile ? "text-[#2E7D32] text-[8px]" : "text-muted-foreground text-[7px]"
                  )}>
                    onwards
                  </span>
                )}
              </div>
            </div>

            {!mobile && event.coordinator?.phone && (
              <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                <Phone className="h-2.5 w-2.5 shrink-0" />
                <p className="text-[10px] font-medium">
                  {event.coordinator.phone}
                </p>
              </div>
            )}

            {!mobile && soldPercentage > 50 && !isSoldOut && (
              <div className="mt-1">
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground/70 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(soldPercentage, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </article>
      </Link>
    </div>
  );
};

export default EventCard;
