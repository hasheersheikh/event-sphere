import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, ImageIcon, Calendar } from "lucide-react";
import { Event, ITicketType } from "@/types/event";
import SafeImage from "@/components/ui/SafeImage";

interface EventCardProps {
  event: Event;
  index?: number;
  imageRatio?: string;
}

const EventCard = ({ event, index = 0, imageRatio = "3/4" }: EventCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (ticketTypes: ITicketType[]) => {
    if (!ticketTypes || ticketTypes.length === 0) return "Free";
    const minPrice = Math.min(...ticketTypes.map((t) => t.price));
    if (minPrice === 0) return "Free";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(minPrice);
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

  const priceLabel = formatPrice(event.ticketTypes || []);

  const soldPercentage = totalCapacity > 0 ? (totalSold / totalCapacity) * 100 : 0;

  return (
    <div
      className="group h-full"
      style={{
        animationDelay: `${index * 60}ms`,
      }}
    >
      <Link
        to={`/events/${event._id}`}
        className="block h-full rounded-2xl overflow-hidden bg-card border border-border/30 hover:border-border hover:shadow-lg transition-all duration-300 ease-out-expo"
      >
        <article className="h-full flex flex-col">
          <div
            className="relative overflow-hidden flex-shrink-0"
            style={{ aspectRatio: imageRatio }}
          >
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
              </div>
            )}

            <SafeImage
              src={event.image || getCategoryImage(event.category)}
              alt={event.title}
              className={`w-full h-full object-cover transition-all duration-500 ease-out-expo group-hover:scale-[1.06] ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {event.isSponsored && (
                <span className="bg-white text-black px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider">
                  Promoted
                </span>
              )}
              {isSoldOut && (
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

            <div className="absolute bottom-3 right-3">
              <span className="inline-block px-3 py-1.5 bg-white text-black rounded-lg font-black text-[11px] tracking-tight shadow-sm">
                {priceLabel}
              </span>
            </div>

            <div className="absolute bottom-3 left-3 right-16">
              <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(event.date)}
              </p>
            </div>
          </div>

          <div className="p-3.5 flex flex-col gap-1.5 flex-1">
            <h3 className="text-[13px] font-extrabold tracking-tight leading-snug text-foreground group-hover:text-foreground/80 transition-colors duration-200 line-clamp-2">
              {event.title}
            </h3>
            <div className="flex items-center gap-1 text-muted-foreground mt-auto">
              <MapPin className="h-3 w-3 shrink-0" />
              <p className="text-[11px] font-medium line-clamp-1">
                {typeof event.location === "string"
                  ? event.location
                  : event.location?.venueName ||
                    event.location?.address?.split(",")[0]}
              </p>
            </div>

            {soldPercentage > 50 && !isSoldOut && (
              <div className="mt-1.5">
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
